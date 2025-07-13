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
P_MAX = 80_000            # plafond global (tous exos niveau 10 cumulés)


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
        "bench", "squat", "deadlift",
        "weighted-pullup", "overhead-press", "vertical-row"
    ],
    "street": [
        "weighted-pullup", "weighted-dip", "front-lever",
        "full-planche", "human-flag"
    ],
    "cardio": ["run", "bike", "rope"],
    "general": ["general"],
}
TOTAL_EX = total_exercises(CATEGORIES)

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
        pts = (db.collection("users")
                 .document(uid)
                 .collection("scores")
                 .document("general")
                 .get()
                 .get("general", 0))
    except gexc.GoogleAPICallError:
        pts = 0
    data["points"] = pts
    data["uid"] = uid
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
async def leaderboard(cat: str = "general", metric: str = "general", limit: int = 100):
    if cat not in CATEGORIES or (metric not in CATEGORIES[cat] and metric != "total"):
        raise HTTPException(400, "Invalid category/metric")

    # points maxi dans ce tableau — même logique que le front
    if cat == "general":
        cat_max = P_MAX
    elif cat == "muscu":
        cat_max = P_MAX / 14 * 6
    elif cat == "street":
        cat_max = P_MAX / 14 * 5
    else:  # cardio
        cat_max = P_MAX / 14 * 3

    cg = (db.collection_group("scores")
            .order_by(metric, direction=firestore.Query.DESCENDING)
            .limit(limit).stream())

    out = []
    for d in cg:
        uid = d.reference.parent.parent.id
        score = d.get(metric) or 0
        prof = db.collection("users").document(uid).get().to_dict() or {}
        out.append({
            "id": uid,
            "points": score,
            "displayName": prof.get("displayName", ""),
            "email": prof.get("email", ""),
        })

    return {"list": out, "catMax": cat_max}
