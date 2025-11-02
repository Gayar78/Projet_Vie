# backend/main.py  –  FastAPI backend (rang calculé à la volée)
# -----------------------------------------------------------------------------
#  users/{uid}                    → profil & méta
#  users/{uid}/scores/{category}  → cardio, muscu, street, general
#                                   champs = sous-cat + total
# -----------------------------------------------------------------------------
from fastapi import FastAPI, HTTPException, Request, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin, json, requests
from google.api_core import exceptions as gexc   # utile pour try/except
import os, smtplib, tempfile, mimetypes
from email.message import EmailMessage
from firebase_admin import credentials, auth, firestore, storage  # Ajoute storage
import time
import io
from PIL import Image


# ---------------------------------------------------------------------------
#  Fonctions utilitaires
# ---------------------------------------------------------------------------
P_MAX = 10_000            # plafond global (tous exos niveau 10 cumulés)


def total_exercises(categories: dict) -> int:
    """Nombre total d’exercices toutes disciplines."""
    return sum(len(v) for v in categories.values())


def points_for_exercise(level: int, total_ex: int) -> int:
    """
    Barème universel : points pour un exercice selon le niveau 1-10
    et le nombre total d’exercices.
    """
    if not 1 <= level <= 10:
        raise ValueError("level must be 1…10")
    unit = P_MAX / (10 * total_ex)          # pas de points d’un niveau
    return int(level * unit)


# ─── Firebase Admin ──────────────────────────────────────────────────────
cred = credentials.Certificate("firebase_service_account.json")
app_options = {'storageBucket': 'projetvie-212e4.firebasestorage.app'}
firebase_admin.initialize_app(cred, app_options)
db = firestore.client()
bucket = storage.bucket()

# ─── Web-apiKey (signInWithPassword) ─────────────────────────────────────
with open("firebase_config.json") as f:
    FIREBASE_KEY = json.load(f)["apiKey"]

# ─── FastAPI + CORS ──────────────────────────────────────────────────────
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# ─── Mapping cat/metrics (doit rester cohérent avec le front) ───────────
CATEGORIES = {
    "muscu": [
        "bench", "squat", "deadlift", "overhead_press", "vertical_row"
    ],
    "street": [
        "weighted_pullup", "weighted_dip", "front_lever",
        "full_planche", "human_flag"
    ],
    "cardio": ["run", "bike", "rope"],
    "general": ["general"],
}
TOTAL_EX = total_exercises(CATEGORIES)

# ─── NEW : bornes (0 → 714) par exercice ──────────────────────
# Rang 1 = Fer, Rang 10 = Challenger
RANK_INTERVALS = {
    "exercice": [(0,71), (71,143), (143,214), (214,286), (286,357),
                (357,429), (429,500), (500,571), (571,643), (643,714)],
    "muscu": [(0,428),(428,857),(857,1286),(1286,1714),(1714,2143),
              (2143,2571),(2571,3000),(3000,3428),(3428,3857),(3857,4280)],
    "street":[(0,357),(357,714),(714,1071),(1071,1428),(1428,1785),
              (1785,2142),(2142,2500),(2500,2857),(2857,3214),(3214,3570)],
    "cardio":[(0,214),(214,429),(429,643),(643,857),(857,1071),
              (1071,1286),(1286,1500),(1500,1714),(1714,1928),(1928,2140)],
    "general":[(0,928),(928,1857),(1857,2786),(2786,3714),(3714,4643),
               (4643,5571),(5571,6500),(6500,7428),(7428,8357),(8357,10000)],
}

# --------------------------------------------------------------------------
# NOUVEAU : LE BARÈME "MOTEUR DE CALCUL"
# --------------------------------------------------------------------------
# On définit le score max pour un exercice (Niveau 10)
# (P_MAX / TOTAL_EX) = (10000 / 14) = 714.28
MAX_EXERCISE_POINTS = 714

# Formule 1-Rep Max (Epley)
def calculate_1rm(weight, reps):
    if reps == 1:
        return weight
    if reps < 1 or weight <= 0:
        return 0
    return weight * (1 + (reps / 30))

# Formule de points (plus c'est haut, mieux c'est)
# ex: Poids, Répétitions
def calculate_points_linear(perf, min_perf, max_perf):
    if perf <= min_perf:
        return 0
    if perf >= max_perf:
        return MAX_EXERCISE_POINTS
    
    # Interpolation linéaire
    points = ((perf - min_perf) / (max_perf - min_perf)) * MAX_EXERCISE_POINTS
    return int(points)

# Formule de points (plus c'est bas, mieux c'est)
# ex: Temps de course
def calculate_points_inverted(perf_time, min_time, max_time):
    if perf_time >= min_time: # Trop lent
        return 0
    if perf_time <= max_time: # Record du monde
        return MAX_EXERCISE_POINTS
    
    # Interpolation linéaire (inversée)
    points = ((min_time - perf_time) / (min_time - max_time)) * MAX_EXERCISE_POINTS
    return int(points)

# Conversion "MM:SS" ou "SSs" en secondes
def parse_time_to_seconds(time_str):
    if "s" in time_str:
        return int(time_str.replace("s", ""))
    elif ":" in time_str:
        parts = time_str.split(":")
        minutes = int(parts[0])
        seconds = int(parts[1])
        return (minutes * 60) + seconds
    return int(time_str) # On suppose que c'est déjà en secondes

PERFORMANCE_BAREME = {
    # type: '1RM' -> min/max se base sur le 1RM calculé
    # type: 'REPS' -> min/max se base sur le nombre de reps
    # type: 'TIME' -> min/max se base sur le temps en secondes
    
    # === MUSCU ===
    "bench": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 50, "max_perf": 140 },
    "squat": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 60, "max_perf": 180 },
    "deadlift": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 80, "max_perf": 215 },
    "overhead_press": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 30, "max_perf": 70 },
    "vertical_row": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 40, "max_perf": 110 },

    # === STREET (Muscu) ===
    "weighted_pullup": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 0, "max_perf": 40 }, # Poids ajouté
    "weighted_dip": { "type": "1RM", "inputs": ["weight", "reps"], "min_perf": 0, "max_perf": 60 }, # Poids ajouté

    # === STREET (Statique) ===
    "front_lever": { "type": "TIME", "inputs": ["time"], "min_perf": 1, "max_perf": 12 }, # Secondes
    "full_planche": { "type": "TIME", "inputs": ["time"], "min_perf": 1, "max_perf": 6 }, # Secondes
    "human_flag": { "type": "TIME", "inputs": ["time"], "min_perf": 1, "max_perf": 10 }, # Secondes
    
    # === CARDIO ===
    "run": { "type": "TIME", "inputs": ["distance", "time"], "min_perf": 1800, "max_perf": 1200 }, # 30:00 -> 20:00 (pour 5km)
    "bike": { "type": "TIME", "inputs": ["distance", "time"], "min_perf": 2700, "max_perf": 1770 }, # 45:00 -> 29:30 (pour 20km)
    "rope": { "type": "REPS", "inputs": ["reps"], "min_perf": 5, "max_perf": 120 }, # Double Unders
    
    # --- Par défaut ---
    "default": { "type": "REPS", "inputs": ["message"], "min_perf": 0, "max_perf": 0 }
}

def rank_level(metric: str, pts: int | float) -> int | None:
    """Calcule un rang 1‒10 proportionnellement au plafond de points.

    * metric == "exercice"  → plafond = P_MAX / TOTAL_EX  (un seul exo)
    * metric dans CATEGORIES → plafond = cat_max_points(metric)
    * sinon                  → None
    """
    if metric == "exercice":
        max_pts = P_MAX / TOTAL_EX
    elif metric in CATEGORIES:
        max_pts = cat_max_points(metric)
    else:
        return None

    step = max_pts / 10       # 10 intervalles égaux
    # rang = 1 si 0 ≤ pts < step, …, 10 si pts ≥ 9*step
    return min(10, int(pts // step) + 1)

# ─── Schémas Pydantic ───────────────────────────────────────────────────
class UserIn(BaseModel):
    email: str
    password: str


class PerformanceIn(BaseModel):
    category: str
    metric: str
    level: int                # 1 … 10
    description: str | None = None


# ─── Auth helper ─────────────────────────────────────────────────────────
def get_uid(request: Request):
    token = request.headers.get("authorization")
    decoded = auth.verify_id_token(token) if token else None
    if not decoded:
        raise HTTPException(401)
    return decoded["uid"]

ADMIN_EMAIL = "remi.thibault@outlook.fr" 

def get_admin_uid(uid: str = Depends(get_uid)):
    """
    Vérifie que l'UID authentifié correspond à l'email de l'admin.
    """
    try:
        user = auth.get_user(uid)
        if user.email != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Accès admin requis")
        return uid
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Accès admin requis: {e}")
# --------------------------------------------------------------------------
#   Register / Login
# --------------------------------------------------------------------------
@app.post("/register")
async def register(u: UserIn):
    try:
        user = auth.create_user(email=u.email, password=u.password)

        # profil minimal (plus de champ « rank »)
        db.collection("users").document(user.uid).set({
            "email": u.email,
            "displayName": "",
            "displayName_lowercase": "",
            "photoURL": "",
            "isPublic": False,
        })

        # scores init
        batch = db.batch()
        for cat, metrics in CATEGORIES.items():
            data = {m: 0 for m in metrics}
            batch.set(db.collection("users").document(user.uid)
                             .collection("scores").document(cat), data)
        batch.commit()
        return {"uid": user.uid}
    except Exception as e:
        raise HTTPException(400, f"Register failed: {e}")


@app.post("/login")
async def login(u: UserIn):
    url = ("https://identitytoolkit.googleapis.com/v1/"
           f"accounts:signInWithPassword?key={FIREBASE_KEY}")
    r = requests.post(url, json={
        "email": u.email, "password": u.password,
        "returnSecureToken": True
    })
    if r.status_code != 200:
        raise HTTPException(400, "Invalid credentials")
    return r.json()


# --------------------------------------------------------------------------
#   Profile GET / POST
# --------------------------------------------------------------------------
# backend/main.py

@app.get("/profile")
async def profile(uid: str = Depends(get_uid)):
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()
    data = doc.to_dict() or {}

    # NOUVELLE PARTIE : Récupérer tous les scores
    scores_data = {}
    scores_query = user_ref.collection("scores").stream()
    for s_doc in scores_query:
        scores_data[s_doc.id] = s_doc.to_dict()

    # On remplace l'ancienne logique de points
    data["points"] = scores_data.get("general", {}).get("general", 0)
    data["scores"] = scores_data  # <-- ON AJOUTE LES SCORES DÉTAILLÉS
    data["uid"] = uid

    # On s'assure que isPublic est présent, même s'il n'est pas encore défini
    if "isPublic" not in data:
        data["isPublic"] = False

    return data


# backend/main.py

@app.post("/profile")
async def update_profile(data: dict, uid: str = Depends(get_uid)):

    # On prépare un dictionnaire pour les mises à jour
    updates = {}

    # Logique Instagram
    if "instagram" in data:
        handle = data["instagram"].lstrip("@").strip()
        updates["instagram"] = handle

        prof = db.collection("users").document(uid).get().to_dict() or {}
        if not prof.get("displayName"):
            # Si on met à jour le displayName, on met aussi à jour la version lowercase
            updates["displayName"] = handle
            updates["displayName_lowercase"] = handle.lower()

    # Logique Public/Privé
    if "isPublic" in data and isinstance(data["isPublic"], bool):
        updates["isPublic"] = data["isPublic"]

    # S'il y a d'autres champs dans data (non gérés ici), on les ajoute
    # par sécurité, mais on écrase les champs déjà gérés
    data.update(updates)

    if not data:
         raise HTTPException(400, "Aucune donnée à mettre à jour")

    # On applique toutes les mises à jour en une fois
    db.collection("users").document(uid).set(data, merge=True)

    return {"ok": True, "message": "Profil mis à jour."}


# --------------------------------------------------------------------------
#   Upload Avatar 
# --------------------------------------------------------------------------
@app.post("/upload_avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    uid: str = Depends(get_uid)
):
    if not file.content_type or file.content_type.split("/")[0] != "image":
        raise HTTPException(400, "Seuls les fichiers image sont autorisés")

    try:
        # 1. Lire l'image en mémoire
        contents = await file.read()

        # 2. Compresser l'image avec Pillow
        # On la redimensionne (max 512x512) et on la convertit en JPEG
        img = Image.open(io.BytesIO(contents))
        img.thumbnail((512, 512)) # Redimensionne en gardant l'aspect

        # On sauvegarde l'image compressée dans un buffer en mémoire
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="JPEG", quality=85)
        output_contents = output_buffer.getvalue()

        # 3. Uploader sur Firebase Storage
        # On utilise un nom de fichier fixe pour écraser l'ancien avatar
        destination_blob_name = f"avatars/{uid}.jpg"
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_string(
            output_contents,
            content_type="image/jpeg"
        )

        # 4. Rendre public et obtenir l'URL
        blob.make_public()
        # On ajoute un "cache buster" pour forcer le navigateur
        # à recharger la nouvelle image
        public_url = f"{blob.public_url}?t={int(time.time())}" 

        # 5. Mettre à jour le profil utilisateur
        db.collection("users").document(uid).set({
            "photoURL": public_url
        }, merge=True)

        return {"ok": True, "photoURL": public_url}

    except Exception as e:
        print(f"Erreur lors de l'upload d'avatar: {e}")
        raise HTTPException(500, f"Upload échoué : {e}")

# --------------------------------------------------------------------------
#   Flux d'activité
#   Renvoie l'historique des contributions approuvées pour l'utilisateur connecté
# --------------------------------------------------------------------------
@app.get("/profile/activity")
async def get_profile_activity(uid: str = Depends(get_uid)):

    activity_ref = (
        db.collection("contributions")
        .where(filter=firestore.FieldFilter("author_uid", "==", uid))
        .where(filter=firestore.FieldFilter("status", "==", "approved"))
        .order_by("approved_at", direction=firestore.Query.DESCENDING)
        .limit(50) # On affiche les 50 dernières
    ).stream()

    activities = []
    for doc in activity_ref:
        activities.append(doc.to_dict())

    return activities


@app.get("/public_profile/{user_id}")
async def get_public_profile(user_id: str):
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(404, "Utilisateur non trouvé")

    user_data = user_doc.to_dict()

    # C'EST LA VÉRIFICATION CLÉ
    if not user_data.get("isPublic", False):
        raise HTTPException(403, "Ce profil est privé")

    # 1. On récupère les scores de la sous-collection
    scores_data = {}
    scores_query = user_ref.collection("scores").stream()
    for doc in scores_query:
        scores_data[doc.id] = doc.to_dict()

    # 2. On prépare la réponse publique (SANS EMAIL, SANS UID)
    public_data = {
        "displayName": user_data.get("displayName", "Athlète"),
        "bio": user_data.get("bio"),
        "instagram": user_data.get("instagram"),
        "photoURL": user_data.get("photoURL"),
        "points": scores_data.get("general", {}).get("general", 0),
        "scores": scores_data, 
    }
    
    return public_data

# --------------------------------------------------------------------------
#   Submit performance
# --------------------------------------------------------------------------
@app.post("/performance")
async def submit_performance(p: PerformanceIn, uid: str = Depends(get_uid)):
    if p.category not in CATEGORIES or p.metric not in CATEGORIES[p.category]:
        raise HTTPException(400, "Invalid category/metric")

    pts = points_for_exercise(p.level, TOTAL_EX)

    user_ref  = db.collection("users").document(uid)
    score_ref = user_ref.collection("scores").document(p.category)
    general_ref = user_ref.collection("scores").document("general")

    inc = firestore.Increment(pts)

    batch = db.batch()
    batch.update(score_ref, {p.metric: inc, "total": inc} if p.metric != "total" else {p.metric: inc})
    batch.update(general_ref, {"general": inc})
    batch.commit()

    user_ref.collection("performances").add({
        "category": p.category,
        "metric": p.metric,
        "level": p.level,
        "points": pts,
        "description": p.description or "",
    })
    return {"ok": True}


# --------------------------------------------------------------------------
#   Leaderboard
# --------------------------------------------------------------------------

@app.get("/leaderboard")
async def leaderboard(
    cat: str = "general",
    metric: str = "general",
    limit: int = 100,
):
    """Renvoie le classement + rang (1‑10) pour la combinaison demandée."""

    # 1) validation ------------------------------------------------------
    if cat not in CATEGORIES or (
        metric not in CATEGORIES[cat] and metric != "total"
    ):
        raise HTTPException(400, "Invalid category/metric")

    # 2) échappe le champ Firestore si jamais il contenait un tiret -------
    escape = lambda f: f if f.isidentifier() else f"`{f}`"

    # 3) interroge collection_group triée sur <metric> -------------------
    docs = (
        db.collection_group("scores")
        .order_by(escape(metric), direction=firestore.Query.DESCENDING)
        .limit(limit * 2)  # sur‑échantillonne puis filtre
        .stream()
    )

    out = []
    for d in docs:
        if d.id != cat:
            continue  # ne garde que la discipline requise

        uid   = d.reference.parent.parent.id
        score = d.get(metric) or 0
        if score == 0:
            continue  # masque ceux à 0 pt

        # 4) Choix du barème : total → barème de la discipline ;
        #    sinon → barème "exercice" universel
        rank_metric = cat if metric in ('total', 'general') else 'exercice'
        rank = rank_level(rank_metric, score)

        prof = db.collection("users").document(uid).get().to_dict() or {}

        out.append({
            "id":          uid,
            "points":      score,
            "rank":        rank,
            "photoURL": prof.get("photoURL"),
            "displayName": prof.get("displayName", ""),
            "email":       prof.get("email", ""),
        })

        if len(out) >= limit:
            break

    return {
        "list":   out,
        "catMax": cat_max_points(cat),  # garde pour le front si besoin
    }


# ──────────── NEW helper (en haut du fichier si vous voulez) ──────────────
def cat_max_points(cat: str) -> int:
    """Plafond de points pour chaque discipline (rang Challenger)."""
    if cat == "general":
        return P_MAX
    nb_ex = len(CATEGORIES[cat])          # nb de métriques de la discipline
    return int(P_MAX / TOTAL_EX * nb_ex)  # même logique que le front

# --------------------------------------------------------------------------
#   Contributions
# --------------------------------------------------------------------------
@app.post("/contribution")
async def contribution(
    # Champs principaux
    exercise: str = Form(...),
    category: str = Form(...),
    consent: bool = Form(False),
    file: UploadFile = File(...),
    uid: str = Depends(get_uid),

    # Nouveaux champs de performance (optionnels)
    weight: float = Form(None),
    reps: int = Form(None),
    distance: float = Form(None),
    perf_time: str = Form(None),
    message: str = Form(None), # L'ancien champ message est maintenant optionnel
):
    # 1) Validation (inchangée)
    if category not in CATEGORIES or exercise not in CATEGORIES[category]:
        raise HTTPException(400, "Catégorie / exercice invalide")

    if not file.content_type or file.content_type.split("/")[0] != "video":
        raise HTTPException(400, "Seuls les fichiers vidéo sont autorisés")

    # 2) Récupérer le profil (inchangé)
    user_doc = db.collection("users").document(uid).get().to_dict() or {}
    author = user_doc.get("displayName") or user_doc.get("email", "inconnu")

    try:
        # 3) UPLOAD SUR FIREBASE STORAGE
        # On crée un nom de fichier unique
        file_extension = file.filename.split('.')[-1]
        timestamp = int(time.time())
        destination_blob_name = f"contributions/{uid}/{category}_{exercise}_{timestamp}.{file_extension}"

        # On "pipe" le fichier directement vers le cloud
        blob = bucket.blob(destination_blob_name)
        
        # On utilise .upload_from_file() qui gère les gros fichiers
        # On doit lire le fichier de FastAPI (await file.read()) et le mettre dans un objet "file-like"
        contents = await file.read()
        blob.upload_from_string(
            contents,
            content_type=file.content_type
        )

        # Rendre le fichier publiquement lisible (si tu veux le voir facilement dans ton panel admin)
        # Note: Pour plus de sécurité, on utiliserait des "signed URLs", mais c'est plus simple pour démarrer.
        blob.make_public()
        public_url = blob.public_url

        # 4) ÉCRIRE DANS FIRESTORE (pour le panel admin)
        # On crée un dictionnaire propre
        contrib_data = {
            "status": "pending",
            "author_uid": uid,
            "author_name": author,
            "category": category,
            "exercise": exercise,
            "consent": consent,
            "video_url": public_url,
            "storage_path": destination_blob_name,
            "submitted_at": firestore.SERVER_TIMESTAMP,

            # On ajoute les champs de performance s'ils existent
            "performance": {
                "weight": weight,
                "reps": reps,
                "distance": distance,
                "time": perf_time,
                "message": message
            }
        }

        # On enlève les clés "None" pour garder la base de données propre
        contrib_data["performance"] = {
            k: v for k, v in contrib_data["performance"].items() if v is not None
        }

        db.collection("contributions").add(contrib_data)

        return {"ok": True, "message": "Contribution soumise pour validation."}

    except Exception as e:
        print(f"Erreur lors de l'upload: {e}")
        raise HTTPException(500, f"Upload échoué : {e}")
    
# --------------------------------------------------------------------------
#   Profil Public (Nouveau)
#   Cet endpoint ne requiert PAS d'authentification
# --------------------------------------------------------------------------
@app.get("/public_profile/{user_id}")
async def get_public_profile(user_id: str):
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(404, "Utilisateur non trouvé")

    user_data = user_doc.to_dict()

    # C'EST LA VÉRIFICATION CLÉ
    if not user_data.get("isPublic", False):
        # On renvoie 404 (non trouvé) pour ne pas révéler que le profil existe mais est privé
        raise HTTPException(404, "Profil non trouvé ou privé") 

    # 1. On récupère les scores de la sous-collection
    scores_data = {}
    scores_query = user_ref.collection("scores").stream()
    for doc in scores_query:
        scores_data[doc.id] = doc.to_dict()

    # 2. On prépare la réponse publique (SANS EMAIL, SANS UID)
    public_data = {
        "displayName": user_data.get("displayName", "Athlète"),
        "instagram": user_data.get("instagram"),
        "bio": user_data.get("bio"),
        "photoURL": user_data.get("photoURL"), # On ajoute la photo
        "points": scores_data.get("general", {}).get("general", 0),
        "scores": scores_data,  # <-- On inclut tous les scores détaillés
    }

    return public_data

# --------------------------------------------------------------------------
#   Recherche d'utilisateurs (Nouveau)
# --------------------------------------------------------------------------
@app.get("/search_users")
async def search_users(term: str = ""):
    if not term:
        return []

    # On nettoie le terme de recherche (en minuscules)
    search_term = term.lower()

    # C'est la "magie" de Firestore pour faire une recherche "commence par"
    # On cherche les noms qui commencent par le terme de recherche
    # et qui sont publics
    users_ref = (
        db.collection("users")
        .where(filter=firestore.FieldFilter("isPublic", "==", True))
        .order_by("displayName_lowercase")
        .start_at([search_term])
        .end_at([search_term + "\uf8ff"])
        .limit(10)
    ).stream()

    results = []
    for user in users_ref:
        data = user.to_dict()
        results.append({
            "id": user.id, # C'est le UID
            "displayName": data.get("displayName", "Athlète"),
        })

    return results

# --------------------------------------------------------------------------
#   Endpoints Admin (Nouveau)
# --------------------------------------------------------------------------

@app.get("/admin/pending_contributions")
async def get_pending_contributions(admin_uid: str = Depends(get_admin_uid)):
    """
    Renvoie la liste de toutes les contributions en attente.
    """
    contrib_ref = (
        db.collection("contributions")
        .where(filter=firestore.FieldFilter("status", "==", "pending"))
        .order_by("submitted_at", direction=firestore.Query.ASCENDING)
        .limit(50) # On traite les 50 plus anciennes
    ).stream()

    pending_list = []
    for contrib in contrib_ref:
        data = contrib.to_dict()
        data["id"] = contrib.id # On ajoute l'ID du document
        pending_list.append(data)

    return pending_list


class AdminApproval(BaseModel):
    level: int # L'admin doit fournir un niveau de 1 à 10

@app.post("/admin/approve_contribution/{contrib_id}")
async def approve_contribution(
    contrib_id: str,
    admin_uid: str = Depends(get_admin_uid)
):
    """
    Approuve une contribution.
    Calcule les points, vérifie si c'est un record personnel,
    et met à jour les scores avec la *différence*.
    """

    contrib_ref = db.collection("contributions").document(contrib_id)
    contrib_doc = contrib_ref.get()

    if not contrib_doc.exists:
        raise HTTPException(404, "Contribution non trouvée")

    data = contrib_doc.to_dict()
    if data.get("status") != "pending":
        raise HTTPException(400, "Cette contribution a déjà été traitée")

    # 1. Récupérer les infos
    user_uid = data["author_uid"]
    category = data["category"]
    exercise = data["exercise"]
    perf_data = data.get("performance", {})

    # 2. Récupérer le barème
    bareme = PERFORMANCE_BAREME.get(exercise, PERFORMANCE_BAREME["default"])

    # 3. CALCULER LES POINTS pour la NOUVELLE performance
    new_pts = 0
    perf_value = 0

    try:
        if bareme["type"] == "1RM":
            weight = float(perf_data.get("weight", 0))
            reps = int(perf_data.get("reps", 0))
            perf_value = calculate_1rm(weight, reps)
            new_pts = calculate_points_linear(perf_value, bareme["min_perf"], bareme["max_perf"])
        elif bareme["type"] == "TIME":
            time_str = str(perf_data.get("time", "0"))
            perf_value = parse_time_to_seconds(time_str)
            new_pts = calculate_points_inverted(perf_value, bareme["min_perf"], bareme["max_perf"])
        elif bareme["type"] == "REPS":
            perf_value = int(perf_data.get("reps", 0))
            new_pts = calculate_points_linear(perf_value, bareme["min_perf"], bareme["max_perf"])
    except Exception as e:
        raise HTTPException(400, f"Erreur de calcul: {e}. Données: {perf_data}")

    # 4. Calculer le niveau équivalent
    level_equivalent = min(10, int(new_pts // (MAX_EXERCISE_POINTS / 10)) + 1)
    if new_pts == 0: level_equivalent = 1

    # 5. Préparer les références
    user_ref = db.collection("users").document(user_uid)
    score_ref = user_ref.collection("scores").document(category)
    general_ref = user_ref.collection("scores").document("general")

    # 6. Transaction pour vérifier le record
    @firestore.transactional
    def update_in_transaction(transaction, contrib_ref, score_ref, general_ref, exercise_name, new_pts):
        # 6a. Lire le score ACTUEL de l'exercice
        score_doc = score_ref.get(transaction=transaction)
        current_exercise_score = 0
        if score_doc.exists:
            current_exercise_score = score_doc.to_dict().get(exercise_name, 0)

        points_to_add = 0 # Points à AJOUTER au total
        is_pr = False # Est-ce un record personnel ?

        # 6b. VÉRIFIER SI C'EST UN NOUVEAU RECORD
        if new_pts > current_exercise_score:
            is_pr = True
            points_to_add = new_pts - current_exercise_score # On ajoute que la différence
            inc = firestore.Increment(points_to_add)

            # Mettre à jour le score de l'exercice au nouveau record
            transaction.set(score_ref, {exercise_name: new_pts}, merge=True)
            # Incrémenter les totaux de la *différence*
            transaction.set(score_ref, {"total": inc}, merge=True)
            transaction.set(general_ref, {"general": inc}, merge=True)

        # 6c. Mettre à jour la contribution (on la marque "approved" dans tous les cas)
        transaction.update(contrib_ref, {
            "status": "approved",
            "approved_at": firestore.SERVER_TIMESTAMP,
            "approved_by": admin_uid,
            "level_equivalent": level_equivalent,
            "points_awarded": new_pts, # Points de la perf (pas les points ajoutés)
            "is_personal_record": is_pr,
            "points_added_to_total": points_to_add,
            "calculated_performance": perf_value
        })

        return points_to_add, is_pr

    transaction = db.transaction()
    # On passe le nom de l'exercice ('bench') et les points calculés ('428')
    points_added, is_pr = update_in_transaction(transaction, contrib_ref, score_ref, general_ref, exercise, new_pts)

    return {
        "ok": True, 
        "points_awarded": new_pts, # Points de la performance
        "points_added_to_total": points_added, # Points *réellement* ajoutés au total
        "level_equivalent": level_equivalent, 
        "is_personal_record": is_pr,
        "user": user_uid
    }


# backend/main.py

@app.post("/admin/reject_contribution/{contrib_id}")
async def reject_contribution(
    contrib_id: str, 
    admin_uid: str = Depends(get_admin_uid)
):
    """
    Rejette une contribution ET supprime la vidéo associée.
    """
    contrib_ref = db.collection("contributions").document(contrib_id)
    contrib_doc = contrib_ref.get()

    if not contrib_doc.exists:
         raise HTTPException(404, "Contribution non trouvée")

    data = contrib_doc.to_dict()

    if data.get("status") != "pending":
        raise HTTPException(400, "Cette contribution a déjà été traitée")

    video_deleted = False
    try:
        # --- NOUVELLE PARTIE : Suppression de la vidéo ---
        storage_path = data.get("storage_path")
        if storage_path:
            blob = bucket.blob(storage_path) # "bucket" est ta variable globale de Storage
            if blob.exists():
                blob.delete()
                video_deleted = True
            else:
                # Le fichier n'existe déjà plus, c'est pas grave
                print(f"Avertissement: Fichier {storage_path} non trouvé dans Storage, suppression ignorée.")
                video_deleted = True # On considère que c'est "nettoyé"
        # --- Fin de la nouvelle partie ---
    except Exception as e:
         print(f"ERREUR lors de la suppression du blob {storage_path}: {e}")
         # On continue même si la suppression échoue, le plus important est de rejeter.

    # Mise à jour du statut (comme avant)
    contrib_ref.update({
        "status": "rejected",
        "video_deleted_at": firestore.SERVER_TIMESTAMP
    })

    return {"ok": True, "status": "rejected", "video_deleted": video_deleted}