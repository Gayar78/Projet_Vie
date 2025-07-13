# backend/main.py  –  FastAPI backend (rang calculé à la volée)
# -----------------------------------------------------------------------------
#  users/{uid}                    → profil & méta
#  users/{uid}/scores/{category}  → cardio, muscu, street, general
#                                   champs = sous-cat + total
# -----------------------------------------------------------------------------
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin, json, requests
from firebase_admin import credentials, auth, firestore
from google.api_core import exceptions as gexc   # utile pour try/except

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
firebase_admin.initialize_app(cred)
db = firestore.client()

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
            "photoURL": "",
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
@app.get("/profile")
async def profile(uid: str = Depends(get_uid)):
    doc = db.collection("users").document(uid).get()
    data = doc.to_dict() or {}

    # total points (doc scores/general)
    try:
        snap = (db.collection("users")
                  .document(uid)
                  .collection("scores")
                  .document("general")
                  .get())                 # DocumentSnapshot
        pts = snap.get("general") or 0    # 1 seul argument
    except (gexc.GoogleAPICallError, KeyError):
        pts = 0

    data["points"] = pts
    data["uid"]    = uid
    return data


@app.post("/profile")
async def update_profile(data: dict, uid: str = Depends(get_uid)):
    db.collection("users").document(uid).set(data, merge=True)
    return {"ok": True}


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