#!/usr/bin/env python3
# backend/commande_firebase.py
# ---------------------------------------------------------------
import random                         # ← indispensable pour random.choice
import string
from pathlib import Path

from firebase_admin import auth, credentials, firestore, initialize_app

# 1) Chemin vers la clé de service
ROOT_DIR = Path(__file__).resolve().parent.parent
SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"

cred = credentials.Certificate(SERVICE_KEY)
initialize_app(cred)
db = firestore.client()

# 2) utilitaires ----------------------------------------------------------------
DOMAINS = ["example.com", "mail.com", "demo.net"]

def random_email(login: str) -> str:
    return f"{login.lower()}@{random.choice(DOMAINS)}"

def random_password(n: int = 10) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))

# 3) création de 10 comptes ------------------------------------------------------
for i in range(10):
    login = f"testuser{i+1}"
    email = random_email(login)
    password = random_password()

    user = auth.create_user(email=email, password=password)
    print(f"✓ Créé : {email} / {password}")

    # points factices — ici 6 exos muscu à 300 pts chacun (exemple)
    muscu_scores = {
        "bench": 300, "squat": 300, "deadlift": 300,
        "weighted_pullup": 300, "overhead_press": 300, "vertical_row": 300,
        "total": 1800
    }
    db.collection("users").document(user.uid).set({
        "email": email,
        "displayName": login.capitalize(),
        "photoURL": "",
    })
    db.collection("users").document(user.uid)\
      .collection("scores").document("muscu").set(muscu_scores)
