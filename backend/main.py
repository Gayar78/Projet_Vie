from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin, json, requests
from firebase_admin import credentials, auth, firestore

# ── Firebase Admin ──────────────────────────────────────────────────────
cred = credentials.Certificate("firebase_service_account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ── Web-apiKey (signInWithPassword) ─────────────────────────────────────
with open("firebase_config.json") as f:
    FIREBASE_KEY = json.load(f)["apiKey"]

# ── FastAPI + CORS ──────────────────────────────────────────────────────
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# ── Schemas ─────────────────────────────────────────────────────────────
class UserIn(BaseModel):
    email: str
    password: str

class PerformanceIn(BaseModel):
    description: str

# ── Register ────────────────────────────────────────────────────────────
@app.post("/register")
async def register(u: UserIn):
    try:
        user = auth.create_user(email=u.email, password=u.password)
        db.collection("users").document(user.uid).set({
            "email":      u.email,
            "points":     0,
            "username":   "",
            "instagram":  False,
            "meta":       False,
            "youtube":    False
        })
        return {"uid": user.uid}
    except Exception as e:
        raise HTTPException(400, f"Register failed: {e}")

# ── Login (REST) ────────────────────────────────────────────────────────
@app.post("/login")
async def login(u: UserIn):
    url = ("https://identitytoolkit.googleapis.com/v1/"
           f"accounts:signInWithPassword?key={FIREBASE_KEY}")
    r = requests.post(url, json={
        "email": u.email, "password": u.password, "returnSecureToken": True
    })
    if r.status_code != 200:
        raise HTTPException(400, "Invalid credentials")
    return r.json()

# ── Auth helper ─────────────────────────────────────────────────────────
def get_uid(request: Request):
    token = request.headers.get("authorization")
    decoded = auth.verify_id_token(token) if token else None
    if not decoded:
        raise HTTPException(401)
    return decoded["uid"]

# ── Profile (GET / POST) ────────────────────────────────────────────────
@app.get("/profile")
async def profile(uid: str = Depends(get_uid)):
    doc = db.collection("users").document(uid).get()
    data = doc.to_dict() or {}
    data["uid"] = uid
    return data

@app.post("/profile")
async def update_profile(data: dict, uid: str = Depends(get_uid)):
    db.collection("users").document(uid).set(data, merge=True)
    return {"ok": True}

# ── Performance submit ─────────────────────────────────────────────────
@app.post("/performance")
async def submit_performance(p: PerformanceIn, uid: str = Depends(get_uid)):
    db.collection("users").document(uid).collection("performances").add({
        "description": p.description,
        "status":      "pending"
    })
    return {"ok": True}

# ── Leaderboard ─────────────────────────────────────────────────────────
@app.get("/leaderboard")
async def leaderboard():
    q = db.collection("users") \
          .order_by("points", direction=firestore.Query.DESCENDING) \
          .stream()
    return [{**d.to_dict(), "uid": d.id} for d in q]





