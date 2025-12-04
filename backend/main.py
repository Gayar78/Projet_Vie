# backend/main.py
from fastapi import FastAPI, HTTPException, Request, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin, json, time, io, math, os
from firebase_admin import credentials, auth, firestore, storage
from PIL import Image
import enum
import requests
from pathlib import Path
import os

# ─── INITIALISATION FIREBASE ROBUSTE ─────────────────────────────────────
try:
    # 1. Définir les chemins possibles pour la clé
    possible_paths = [
        "firebase_service_account.json",              # Chemin pour ton PC (Local)
        "/etc/secrets/firebase_service_account.json"  # Chemin standard pour Render
    ]
    
    # 2. Trouver le bon chemin
    certificate_path = None
    for path in possible_paths:
        if os.path.exists(path):
            certificate_path = path
            print(f"✅ Clé trouvée ici : {path}")
            break
    
    if not certificate_path:
        # Si on ne trouve pas, on liste les dossiers pour le debug dans les logs Render
        print(f"❌ Clé introuvable. Dossier actuel : {os.getcwd()}")
        print(f"❌ Contenu : {os.listdir('.')}")
        if os.path.exists("/etc/secrets"):
            print(f"❌ Contenu de /etc/secrets : {os.listdir('/etc/secrets')}")
        raise FileNotFoundError("Impossible de trouver firebase_service_account.json")

    # 3. Initialiser Firebase
    cred = credentials.Certificate(certificate_path)
    app_options = {'storageBucket': 'projetvie-212e4.firebasestorage.app'}
    firebase_admin.initialize_app(cred, app_options)
    
    db = firestore.client()
    bucket = storage.bucket()
    print("🚀 Firebase connecté avec succès.")

except Exception as e:
    print(f"⚠️ CRITICAL ERROR Firebase Init: {e}")

app = FastAPI()

origins = [
    "http://localhost:5173",                # Pour tes tests locaux
    "https://draftprime.fr",    # REMPLACE PAR TON VRAI DOMAINE HOSTINGER
    "https://www.ton-domaine.com"           # Si tu as un nom de domaine perso
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Utilise la liste spécifique
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── CONSTANTES & CONFIGURATION ──────────────────────────────────────────

GLOBAL_MAX_SCORE = 10_000 
MAX_PTS_PER_EXO = 650 

CATEGORIES = {
    "muscu": [
        "bench", "overhead_press", "dumbbell_press", 
        "squat", "deadlift", 
        "pull_vertical", "pull_horizontal", 
        "curls"
    ],
    "street": [
        "weighted_pullup", "weighted_dip", 
        "front_lever", "full_planche", "human_flag"
    ],
    "cardio": [
        "run", "bike", "rope"
    ],
    "general": ["general"]
}

# ─── 1. SYSTÈME DE RANGS (League of Legends EUW Style) ───
def get_rank_label(points: int) -> str:
    if points < 1500: return "Fer"
    if points < 3500: return "Bronze"
    if points < 5500: return "Argent"
    if points < 7500: return "Or"
    if points < 8700: return "Platine"
    if points < 9300: return "Émeraude"
    if points < 9700: return "Diamant"
    if points < 9850: return "Maître"
    if points < 9950: return "Grand Maître"
    return "Challenger"

# ─── 2. CALIBRAGE DES EXERCICES (STANDARDS ELITE) ───
STANDARDS = {
    "bench":           {"M": 140, "F": 75},
    "overhead_press":  {"M": 90,  "F": 50},
    "dumbbell_press":  {"M": 50,  "F": 28},
    "squat":           {"M": 180, "F": 110},
    "deadlift":        {"M": 220, "F": 130},
    "pull_vertical":   {"M": 110, "F": 65},
    "pull_horizontal": {"M": 100, "F": 60},
    "curls":           {"M": 60,  "F": 35},
    "weighted_pullup": {"M": 60,  "F": 25},
    "weighted_dip":    {"M": 80,  "F": 35},
    "front_lever":     {"M": 30, "F": 15},    
    "full_planche":    {"M": 15, "F": 5},
    "human_flag":      {"M": 20, "F": 10},
    "run":             {"M": 18.0, "F": 15.0},
    "bike":            {"M": 35.0, "F": 28.0},
    "rope":            {"M": 120,  "F": 120},
}

# ─── 3. MOTEUR DE CALCUL ───

def calculate_1rm(weight: float, reps: int) -> float:
    effective_reps = min(reps, 12)
    if effective_reps <= 1:
        return weight
    return weight * (1 + effective_reps / 30)

def apply_difficulty_curve(ratio: float) -> int:
    if ratio < 0: ratio = 0
    score = (ratio ** 1.8) * MAX_PTS_PER_EXO
    return int(min(score, MAX_PTS_PER_EXO * 1.5))

def calculate_score_muscu(exercise, gender, weight, reps):
    std = STANDARDS.get(exercise, {}).get(gender, 100)
    one_rm = calculate_1rm(weight, reps)
    ratio = one_rm / std
    return apply_difficulty_curve(ratio), one_rm

def calculate_score_static(exercise, gender, time_sec):
    if time_sec < 5: return 0, 0
    std = STANDARDS.get(exercise, {}).get(gender, 30)
    effective_time = min(time_sec, 60)
    ratio = effective_time / std
    return apply_difficulty_curve(ratio), effective_time

def calculate_score_cardio(exercise, gender, distance, time_str, reps=0):
    std_speed = STANDARDS.get(exercise, {}).get(gender, 15)
    
    duration_sec = 0
    if ":" in str(time_str):
        parts = str(time_str).split(":")
        duration_sec = int(parts[0]) * 60 + int(parts[1])
    else:
        duration_sec = float(time_str)

    if duration_sec <= 0: return 0, 0

    perf_value = 0
    if exercise == "rope":
        perf_value = (reps / duration_sec) * 60
    else:
        hours = duration_sec / 3600
        if hours > 0:
            perf_value = distance / hours # km/h

    ratio = perf_value / std_speed
    return apply_difficulty_curve(ratio), perf_value


# --- MODÈLES GROUPES ---
class GroupCreate(BaseModel):
    name: str
    members: list[str] # Liste des UIDs des amis invités

class GroupAction(BaseModel):
    group_id: str

class GroupRename(BaseModel):
    new_name: str

class GroupAddMembers(BaseModel):
    members: list[str]

class GroupKickMember(BaseModel):
    member_uid: str

# ─── AUTH & UTILS ───
class GenderEnum(str, enum.Enum):
    male = "M"
    female = "F"

class UserRegisterIn(BaseModel):
    email: str; password: str; gender: GenderEnum

class UserLoginIn(BaseModel):
    email: str; password: str

ADMIN_EMAIL = "remi.thibault@outlook.fr" 

def get_uid(request: Request):
    token = request.headers.get("authorization")
    if not token: raise HTTPException(401, "No token")
    try: return auth.verify_id_token(token)["uid"]
    except: raise HTTPException(401, "Invalid token")

def get_admin_uid(uid: str = Depends(get_uid)):
    u = auth.get_user(uid)
    if u.email != ADMIN_EMAIL: raise HTTPException(403, "Admin only")
    return uid

async def get_optional_uid(request: Request) -> str | None:
    token = request.headers.get("authorization")
    if not token: return None
    try: return auth.verify_id_token(token)["uid"]
    except: return None


# ─── ENDPOINTS AUTH ───
@app.post("/register")
async def register(u: UserRegisterIn):
    try:
        user = auth.create_user(email=u.email, password=u.password)
        db.collection("users").document(user.uid).set({
            "email": u.email, "displayName": "", "displayName_lowercase": "",
            "photoURL": "", "isPublic": False, "gender": u.gender.value
        })
        batch = db.batch()
        for cat in CATEGORIES:
            if cat == "general": continue
            batch.set(db.collection("users").document(user.uid).collection("scores").document(cat), 
                     {m: 0 for m in CATEGORIES[cat]} | {"total": 0, "gender": u.gender.value})
        batch.commit()
        return {"uid": user.uid}
    except Exception as e: raise HTTPException(400, f"Error: {e}")

@app.post("/login")
async def login(u: UserLoginIn):

    FIREBASE_KEY = os.getenv("FIREBASE_KEY")

    if not FIREBASE_KEY:
        raise HTTPException(status_code=500, detail="La clé API Firebase est manquante sur le serveur.")
    
    # Utilisation de requests.post (Librairie Python) et non Request.post (FastAPI)
    url = ("https://identitytoolkit.googleapis.com/v1/"
           f"accounts:signInWithPassword?key={FIREBASE_KEY}")
    
    # CORRECTION ICI : requests.post
    r = requests.post(url, json={
        "email": u.email, "password": u.password,
        "returnSecureToken": True
    })
    
    if r.status_code != 200:
        print(f"Login Error: {r.text}") # Debug
        raise HTTPException(400, "Invalid credentials")
        
    return r.json()


# ─── ENDPOINTS PROFILE ───
@app.get("/profile")
async def profile(uid: str = Depends(get_uid)):
    doc = db.collection("users").document(uid).get()
    data = doc.to_dict() or {}
    
    # AJOUT DE L'ID DANS LA RÉPONSE
    data["id"] = uid 
    data["uid"] = uid # Sécurité doublon
    
    scores = {s.id: s.to_dict() for s in db.collection("users").document(uid).collection("scores").stream()}
    data["scores"] = scores
    data["points"] = scores.get("general", {}).get("general", 0)
    data["rankLabel"] = get_rank_label(data["points"])
    return data

@app.post("/profile")
async def update_profile(data: dict, uid: str = Depends(get_uid)):
    updates = {}
    
    # --- AJOUT : Gestion du changement de pseudo ---
    if "displayName" in data:
        new_name = data["displayName"].strip()
        if new_name:
            updates["displayName"] = new_name
            updates["displayName_lowercase"] = new_name.lower()
    # -----------------------------------------------

    if "instagram" in data:
        updates["instagram"] = data["instagram"].lstrip("@").strip()
        # Si l'utilisateur n'avait pas de nom, on met l'insta par défaut (fallback)
        prof = db.collection("users").document(uid).get().to_dict() or {}
        if not prof.get("displayName") and "displayName" not in updates:
            updates["displayName"] = updates["instagram"]
            updates["displayName_lowercase"] = updates["instagram"].lower()
            
    if "isPublic" in data: updates["isPublic"] = data["isPublic"]
    if "bio" in data: updates["bio"] = data["bio"]
    
    if updates: db.collection("users").document(uid).set(updates, merge=True)
    return {"ok": True}

@app.post("/upload_avatar")
async def upload_avatar(file: UploadFile = File(...), uid: str = Depends(get_uid)):
    # 1. Vérifier le type
    if not file.content_type.startswith("image/"): 
        raise HTTPException(400, "Le fichier doit être une image")

    try:
        # 2. Lire et traiter l'image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # --- CORRECTION CRITIQUE : Gérer la transparence (PNG -> JPEG) ---
        # Si l'image est en RGBA (transparence), on la passe en RGB fond blanc
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # -----------------------------------------------------------------

        img.thumbnail((512, 512))
        
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        
        # 3. Upload vers Firebase Storage
        blob = bucket.blob(f"avatars/{uid}.jpg")
        blob.upload_from_string(buf.getvalue(), content_type="image/jpeg")
        
        # 4. Tenter de rendre public (Peut échouer selon les réglages du Bucket)
        try:
            blob.make_public()
        except Exception as e:
            print(f"⚠️ Warning make_public: {e}")
            # On continue même si ça échoue, pour ne pas planter le serveur
        
        # 5. URL avec timestamp pour éviter le cache navigateur
        url = f"{blob.public_url}?t={int(time.time())}"
        
        # 6. Mise à jour Firestore
        db.collection("users").document(uid).update({"photoURL": url})
        
        return {"ok": True, "photoURL": url}

    except Exception as e:
        # C'est ici qu'on attrape l'erreur pour comprendre ce qui se passe
        print(f"❌ ERREUR UPLOAD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")



# ─── ENDPOINTS CONTRIBUTION (User) ───
@app.post("/contribution")
async def contribution(
    exercise: str = Form(...), category: str = Form(...), consent: bool = Form(False),
    file: UploadFile = File(...), uid: str = Depends(get_uid),
    weight: float = Form(None), reps: int = Form(None),
    distance: float = Form(None), perf_time: str = Form(None), message: str = Form(None)
):
    user_doc = db.collection("users").document(uid).get().to_dict() or {}
    
    ext = file.filename.split('.')[-1]
    blob = bucket.blob(f"contributions/{uid}/{category}_{exercise}_{int(time.time())}.{ext}")
    blob.upload_from_file(file.file, content_type=file.content_type)
    blob.make_public()

    db.collection("contributions").add({
        "status": "pending",
        "author_uid": uid,
        "author_name": user_doc.get("displayName", "Inconnu"),
        "category": category,
        "exercise": exercise,
        "consent": consent,
        "video_url": blob.public_url,
        "storage_path": blob.name,
        "submitted_at": firestore.SERVER_TIMESTAMP,
        "performance": {
            "weight": weight, "reps": reps, "distance": distance, "time": perf_time, "message": message
        }
    })
    return {"ok": True}


# ─── ENDPOINTS ADMIN (Validation & Calcul Score) ───

@app.get("/admin/pending_contributions")
async def get_pending_contributions(uid: str = Depends(get_admin_uid)):
    docs = db.collection("contributions").where(filter=firestore.FieldFilter("status", "==", "pending")).stream()
    return [{"id": d.id, **d.to_dict()} for d in docs]

@app.post("/admin/approve_contribution/{contrib_id}")
async def approve_contribution(contrib_id: str, uid: str = Depends(get_admin_uid)):
    ref = db.collection("contributions").document(contrib_id)
    data = ref.get().to_dict()
    if not data or data['status'] != 'pending': raise HTTPException(400, "Invalid contribution")

    target_uid = data['author_uid']
    cat = data['category']
    exo = data['exercise']
    perf = data['performance']

    user_ref = db.collection("users").document(target_uid)
    user_data = user_ref.get().to_dict()
    gender = user_data.get("gender", "M")

    new_points = 0
    perf_value = 0 

    if cat == "muscu" or (cat == "street" and exo in ["weighted_pullup", "weighted_dip"]):
        w = float(perf.get("weight") or 0)
        r = int(perf.get("reps") or 0)
        new_points, perf_value = calculate_score_muscu(exo, gender, w, r)
    
    elif cat == "street": 
        t_str = perf.get("time") or "0"
        sec = 0
        if ":" in str(t_str):
            p = str(t_str).split(":")
            sec = int(p[0])*60 + int(p[1])
        else:
            sec = int(t_str)
        new_points, perf_value = calculate_score_static(exo, gender, sec)

    elif cat == "cardio":
        dist = float(perf.get("distance") or 0)
        t_str = perf.get("time") or "0"
        r = int(perf.get("reps") or 0)
        new_points, perf_value = calculate_score_cardio(exo, gender, dist, t_str, r)

    score_doc_ref = user_ref.collection("scores").document(cat)
    
    @firestore.transactional
    def update_if_pr(transaction, score_ref, general_ref, contrib_ref, new_pts):
        snapshot = score_ref.get(transaction=transaction)
        current_scores = snapshot.to_dict() if snapshot.exists else {}
        
        old_pts = current_scores.get(exo, 0)
        is_pr = new_pts > old_pts
        points_diff = new_pts - old_pts if is_pr else 0

        if is_pr:
            transaction.set(score_ref, {exo: new_pts}, merge=True)
            transaction.set(score_ref, {"total": firestore.Increment(points_diff)}, merge=True)
            transaction.set(general_ref, {"general": firestore.Increment(points_diff)}, merge=True)

        transaction.update(contrib_ref, {
            "status": "approved",
            "approved_at": firestore.SERVER_TIMESTAMP,
            "approved_by": uid,
            "points_awarded": new_pts,
            "is_personal_record": is_pr,
            "points_added_to_total": points_diff,
            "calculated_performance": perf_value
        })
        return is_pr, points_diff

    general_ref = user_ref.collection("scores").document("general")
    transaction = db.transaction()
    is_pr, pts_added = update_if_pr(transaction, score_doc_ref, general_ref, ref, new_points)

    return {"ok": True, "is_pr": is_pr, "points": new_points, "added": pts_added}

@app.post("/admin/reject_contribution/{contrib_id}")
async def reject_contribution(
    contrib_id: str, 
    uid: str = Depends(get_admin_uid),
    reason: str = Form("Non respect des standards") # Nouveau paramètre optionnel
):
    ref = db.collection("contributions").document(contrib_id)
    data = ref.get().to_dict()
    
    # On supprime la vidéo du stockage pour économiser de la place
    if data and data.get("storage_path"):
        try: bucket.blob(data["storage_path"]).delete()
        except: pass

    # On enregistre le statut ET la raison
    ref.update({
        "status": "rejected", 
        "rejected_by": uid,
        "rejection_reason": reason,
        "rejected_at": firestore.SERVER_TIMESTAMP
    })
    return {"ok": True}


# ─── ENDPOINTS PUBLIC / SOCIAL ───

@app.get("/public_profile/{user_id}")
async def public_profile(user_id: str, req_uid: str | None = Depends(get_optional_uid)):
    u_doc = db.collection("users").document(user_id).get()
    if not u_doc.exists: raise HTTPException(404, "User not found")
    u_data = u_doc.to_dict()

    is_friend = False
    if req_uid and req_uid != user_id:
        f_doc = db.collection("users").document(user_id).collection("friends").document(req_uid).get()
        if f_doc.exists and f_doc.to_dict().get("status") == "accepted": is_friend = True

    if u_data.get("isPublic") or is_friend or req_uid == user_id:
        scores = {s.id: s.to_dict() for s in db.collection("users").document(user_id).collection("scores").stream()}
        return {
            "is_private": False,
            "displayName": u_data.get("displayName"),
            "photoURL": u_data.get("photoURL"),
            "bio": u_data.get("bio"),
            "instagram": u_data.get("instagram"),
            "gender": u_data.get("gender", "M"),
            "scores": scores,
            "points": scores.get("general", {}).get("general", 0)
        }
    else:
        return {
            "is_private": True,
            "displayName": u_data.get("displayName"),
            "photoURL": u_data.get("photoURL"),
            "gender": u_data.get("gender", "M")
        }

@app.get("/feed")
async def get_feed():
    docs = (db.collection("contributions")
            .where(filter=firestore.FieldFilter("status", "==", "approved"))
            .order_by("approved_at", direction=firestore.Query.DESCENDING)
            .limit(20).stream())
    return [d.to_dict() for d in docs]

@app.get("/leaderboard")
async def leaderboard(gender: str="all", cat: str="general", metric: str="general", limit: int=50, group_id: str = None):
    """
    Si group_id est fourni, on ne récupère que les scores des membres de ce groupe.
    Sinon, comportement standard (Global).
    """
    # 1. LOGIQUE DE GROUPE
    target_uids = []
    if group_id:
        group_doc = db.collection("groups").document(group_id).get()
        if not group_doc.exists:
            return {"list": []}
        target_uids = group_doc.to_dict().get("members", [])
        if not target_uids:
            return {"list": []}

    # 2. REQUÊTE
    if group_id:
        # Stratégie Groupe : On récupère les scores spécifiques des membres par leur ID
        docs = []
        for uid in target_uids:
            # On cherche le doc de score spécifique (ici pas de risque de doublon car on cible l'ID du doc "cat")
            score_ref = db.collection("users").document(uid).collection("scores").document(cat)
            s_doc = score_ref.get()
            if s_doc.exists:
                d = s_doc.to_dict()
                # Filtre genre manuel si besoin
                if gender == "all" or d.get("gender") == gender:
                    d["_uid"] = uid # On attache l'ID pour la suite
                    docs.append(d)
    else:
        # Stratégie Globale (C'est ici qu'on corrige les doublons)
        coll = db.collection_group("scores")
        
        # --- CORRECTIF : FILTRE OBLIGATOIRE SUR LA CATEGORIE ---
        # Cela empêche de récupérer les documents "street" quand on demande "muscu"
        coll = coll.where(filter=firestore.FieldFilter("category", "==", cat))
        # -------------------------------------------------------

        if gender in ["M", "F"]:
            coll = coll.where(filter=firestore.FieldFilter("gender", "==", gender))
        try:
            # Le tri se fait ici via l'index
            stream = coll.order_by(metric, direction=firestore.Query.DESCENDING).limit(limit).stream()
            docs = []
            for d in stream:
                dic = d.to_dict()
                # L'ID du user parent se trouve deux niveaux au-dessus (users/{uid}/scores/{doc})
                dic["_uid"] = d.reference.parent.parent.id
                docs.append(dic)
        except Exception as e:
            # IMPORTANT : Si tu vois cette erreur dans les logs, clique sur le lien fourni par Firebase
            print(f"Index Error (Clique sur le lien dans les logs si présent): {e}")
            return {"list": []}

    # 3. FORMATAGE
    out = []
    
    # Si mode groupe, on doit trier manuellement car on a fetch par ID sans tri DB
    if group_id:
        docs.sort(key=lambda x: x.get(metric, 0), reverse=True)

    for d in docs:
        score = d.get(metric) or 0
        if score == 0: continue
        
        uid = d["_uid"]
        
        # On récupère le profil utilisateur pour l'affichage (Nom, Photo)
        u_data = db.collection("users").document(uid).get().to_dict() or {}
        
        out.append({
            "id": uid,
            "points": score,
            "displayName": u_data.get("displayName", "Athlète"),
            "photoURL": u_data.get("photoURL"),
        })
        
        if len(out) >= limit: break
    
    return {"list": out}

# --- ENDPOINTS GROUPES (NOUVEAU) ---

@app.get("/groups")
async def get_my_groups(uid: str = Depends(get_uid)):
    """Récupère les groupes où je suis membre et ceux où je suis invité."""
    # Groupes où je suis membre
    member_of = db.collection("groups").where(filter=firestore.FieldFilter("members", "array_contains", uid)).stream()
    # Groupes où je suis invité
    invited_to = db.collection("groups").where(filter=firestore.FieldFilter("invited", "array_contains", uid)).stream()
    
    res = {"member": [], "invited": []}
    for g in member_of:
        d = g.to_dict()
        d["id"] = g.id
        res["member"].append(d)
    for g in invited_to:
        d = g.to_dict()
        d["id"] = g.id
        # On ajoute le nom du créateur pour l'invit
        admin_u = db.collection("users").document(d["admin_uid"]).get().to_dict()
        d["admin_name"] = admin_u.get("displayName", "Inconnu")
        res["invited"].append(d)
        
    return res

@app.post("/groups/create")
async def create_group(data: GroupCreate, uid: str = Depends(get_uid)):
    new_group = {
        "name": data.name,
        "admin_uid": uid,
        "members": [uid], # Le créateur est membre direct
        "invited": data.members, # Les amis sélectionnés sont invités
        "created_at": firestore.SERVER_TIMESTAMP
    }
    db.collection("groups").add(new_group)
    return {"ok": True}

@app.post("/groups/join/{group_id}")
async def join_group(group_id: str, uid: str = Depends(get_uid)):
    ref = db.collection("groups").document(group_id)
    doc = ref.get()
    if not doc.exists: raise HTTPException(404)
    
    # On retire de invited et on ajoute à members
    ref.update({
        "invited": firestore.ArrayRemove([uid]),
        "members": firestore.ArrayUnion([uid])
    })
    return {"ok": True}

@app.post("/groups/leave/{group_id}")
async def leave_group(group_id: str, uid: str = Depends(get_uid)):
    ref = db.collection("groups").document(group_id)
    # On retire de tout
    ref.update({
        "invited": firestore.ArrayRemove([uid]),
        "members": firestore.ArrayRemove([uid])
    })
    # Si plus de membres, supprimer le groupe ? (Optionnel)
    return {"ok": True}

@app.post("/groups/delete/{group_id}")
async def delete_group(group_id: str, uid: str = Depends(get_uid)):
    ref = db.collection("groups").document(group_id)
    doc = ref.get()
    if not doc.exists: return {"ok": False}
    if doc.to_dict()["admin_uid"] != uid: raise HTTPException(403, "Seul l'admin peut supprimer")
    
    ref.delete()
    return {"ok": True}

@app.post("/groups/rename/{group_id}")
async def rename_group(group_id: str, data: GroupRename, uid: str = Depends(get_uid)):
    ref = db.collection("groups").document(group_id)
    doc = ref.get()
    if not doc.exists: raise HTTPException(404)
    if doc.to_dict()["admin_uid"] != uid: raise HTTPException(403, "Not admin")
    
    ref.update({"name": data.new_name})
    return {"ok": True}

@app.post("/groups/add_members/{group_id}")
async def add_group_members(group_id: str, data: GroupAddMembers, uid: str = Depends(get_uid)):
    ref = db.collection("groups").document(group_id)
    doc = ref.get()
    if not doc.exists: raise HTTPException(404)
    # On permet aux membres d'inviter ou seulement admin ? Disons Admin pour l'instant
    if doc.to_dict()["admin_uid"] != uid: raise HTTPException(403, "Not admin")
    
    # On ajoute aux "invited"
    ref.update({
        "invited": firestore.ArrayUnion(data.members)
    })
    return {"ok": True}

@app.post("/groups/kick/{group_id}")
async def kick_group_member(group_id: str, data: GroupKickMember, uid: str = Depends(get_uid)):
    ref = db.collection("groups").document(group_id)
    doc = ref.get()
    if not doc.exists: raise HTTPException(404, "Groupe introuvable")
    
    # Vérif Admin
    if doc.to_dict()["admin_uid"] != uid: 
        raise HTTPException(403, "Seul l'admin peut exclure un membre")
    
    # On retire le membre
    ref.update({
        "members": firestore.ArrayRemove([data.member_uid])
    })
    return {"ok": True}

@app.get("/friends/status/{target}")
async def friend_status(target: str, uid: str = Depends(get_uid)):
    if target == uid: return {"status": "self"}
    d = db.collection("users").document(uid).collection("friends").document(target).get()
    return {"status": d.to_dict().get("status", "not_friends") if d.exists else "not_friends"}

@app.post("/friends/request/{target}")
async def friend_req(target: str, uid: str = Depends(get_uid)):
    db.collection("users").document(uid).collection("friends").document(target).set({"status": "pending_sent"})
    db.collection("users").document(target).collection("friends").document(uid).set({"status": "pending_received"})
    return {"ok": True}

@app.post("/friends/accept/{target}")
async def friend_accept(target: str, uid: str = Depends(get_uid)):
    db.collection("users").document(uid).collection("friends").document(target).update({"status": "accepted"})
    db.collection("users").document(target).collection("friends").document(uid).update({"status": "accepted"})
    return {"ok": True}

@app.post("/friends/cancel/{target}")
async def friend_cancel(target: str, uid: str = Depends(get_uid)):
    db.collection("users").document(uid).collection("friends").document(target).delete()
    db.collection("users").document(target).collection("friends").document(uid).delete()
    return {"ok": True}

@app.get("/profile/friends")
async def my_friends(uid: str = Depends(get_uid)):
    docs = db.collection("users").document(uid).collection("friends").stream()
    res = {"accepted": [], "pending_sent": [], "pending_received": []}
    for d in docs:
        data = d.to_dict()
        prof = db.collection("users").document(d.id).get().to_dict() or {}
        item = {"id": d.id, "displayName": prof.get("displayName"), "photoURL": prof.get("photoURL")}
        if data["status"] in res: res[data["status"]].append(item)
    return res

@app.get("/search_users")
async def search(term: str):
    if not term: return []
    t = term.lower()
    docs = db.collection("users").order_by("displayName_lowercase").start_at([t]).end_at([t + "\uf8ff"]).limit(20).stream()
    return [{"id": d.id, **d.to_dict()} for d in docs]


@app.get("/profile/activity")
async def get_profile_activity(uid: str = Depends(get_uid)):
    """
    Récupère l'historique complet (Validé, Rejeté, En attente)
    """
    # On trie par 'submitted_at' pour avoir l'ordre chronologique réel
    # On enlève le filtre 'status=approved' pour voir les rejets et les attentes
    activity_ref = (
        db.collection("contributions")
        .where(filter=firestore.FieldFilter("author_uid", "==", uid))
        .order_by("submitted_at", direction=firestore.Query.DESCENDING)
        .limit(50)
    ).stream()

    activities = []
    for doc in activity_ref:
        d = doc.to_dict()
        # On s'assure que l'ID est présent si besoin
        d['id'] = doc.id
        activities.append(d)

    return activities


# --- ROUTE DE TEST (À SUPPRIMER PLUS TARD) ---
@app.get("/debug/firebase")
async def debug_firebase():
    """
    Vérifie la présence de la clé et la connexion au Bucket.
    """
    status = {
        "step_1_key_file": "Inconnu",
        "step_2_bucket_name": app_options.get('storageBucket'),
        "step_3_write_test": "En attente",
        "error": None
    }

    # 1. Vérifier si le fichier existe sur le disque
    file_path = "firebase_service_account.json"
    if os.path.exists(file_path):
        status["step_1_key_file"] = "✅ PRÉSENT (Fichier trouvé)"
    else:
        # On liste les fichiers pour voir où on est
        files_here = os.listdir('.')
        status["step_1_key_file"] = f"❌ ABSENT. Fichiers présents ici : {files_here}"
        return status

    # 2. Tester l'écriture dans le Bucket
    try:
        test_blob = bucket.blob("debug_test.txt")
        test_blob.upload_from_string("Ceci est un test de connexion depuis Render.")
        # On essaie de le rendre public pour être sûr que les droits sont OK
        test_blob.make_public()
        
        status["step_3_write_test"] = f"✅ SUCCÈS ! Fichier écrit. URL : {test_blob.public_url}"
    
    except Exception as e:
        status["step_3_write_test"] = "❌ ÉCHEC"
        status["error"] = str(e)

    return status