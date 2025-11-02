#!/usr/bin/env python3
# backend/commande_firebase.py
# ---------------------------------------------------------------
"""
Script one-shot : peupler Firestore avec 20 comptes démo
– 5 femmes, 15 hommes
– toutes les disciplines remplies (0-572 pts / exo)

import random
import string
from pathlib import Path

from firebase_admin import auth, credentials, firestore, initialize_app

# ---------------------------------------------------------------------------
# 0) Chemin vers la clé de service (adapté à la structure du projet)
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent
SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"

cred = credentials.Certificate(SERVICE_KEY)
initialize_app(cred)
db = firestore.client()

# ---------------------------------------------------------------------------
# 1) Données de base
# ---------------------------------------------------------------------------
FEMALE_NAMES = ["Alice", "Emma", "Inès", "Julie", "Léa"]
MALE_NAMES   = ["Lucas", "Nathan", "Hugo", "Noah", "Louis",
                "Gabriel", "Arthur", "Léo", "Raphaël", "Adam",
                "Paul", "Évan", "Victor", "Enzo", "Maxime"]

DOMAINS = ["gmail.com", "outlook.com"]

CATEGORIES = {
    "muscu": [
        "bench", "squat", "deadlift",
        "weighted_pullup", "overhead_press", "vertical_row"
    ],
    "street": [
        "weighted_pullup", "weighted_dip", "front_lever",
        "full_planche", "human_flag"
    ],
    "cardio": ["run", "bike", "rope"],
}

# ---------------------------------------------------------------------------
# 2) Helpers
# ---------------------------------------------------------------------------
def random_email(name: str) -> str:
    suffix = str(random.randint(1, 99)) if random.random() < .4 else ""
    return f"{name.lower()}{suffix}@{random.choice(DOMAINS)}"

def random_password(n: int = 10) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))

def rand_score() -> int:
    return random.randint(0, 572)

# ---------------------------------------------------------------------------
# 3) Boucle création
# ---------------------------------------------------------------------------
users_to_create = [(n, "F") for n in FEMALE_NAMES] + [(n, "M") for n in MALE_NAMES]
random.shuffle(users_to_create)               # ordre aléatoire d’insertion

for name, _gender in users_to_create:
    email    = random_email(name)
    password = random_password()

    # 3-A  Création compte Auth
    user = auth.create_user(email=email, password=password)
    print(f"✓ {email:<25}  |  password: {password}")

    # 3-B  Scores aléatoires
    scores_docs = {}
    general_total = 0

    for cat, metrics in CATEGORIES.items():
        doc = {}
        cat_total = 0
        for m in metrics:
            s = rand_score()
            doc[m] = s
            cat_total += s
        doc["total"] = cat_total
        scores_docs[cat] = doc
        general_total   += cat_total

    # 3-C  Écriture Firestore
    user_ref = db.collection("users").document(user.uid)
    user_ref.set({
        "email":       email,
        "displayName": name,        # déjà capitalisé
        "photoURL":    "",
    })

    batch = db.batch()
    for cat, data in scores_docs.items():
        batch.set(user_ref.collection("scores").document(cat), data)
    # doc « general » = somme de tous les totaux
    batch.set(user_ref.collection("scores").document("general"),
              {"general": general_total})
    batch.commit()
"""

from pathlib import Path
import firebase_admin
from firebase_admin import credentials, auth, firestore

# ---------------------------------------------------------------------------
# 1) Config Firebase (même logique que main.py / commande_firebase.py)
# ---------------------------------------------------------------------------
ROOT_DIR     = Path(__file__).resolve().parent.parent          # /project-root
SERVICE_KEY  = ROOT_DIR / "firebase_service_account.json"      # chemin absolu
cred         = credentials.Certificate(SERVICE_KEY)
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------------------------------------------------------------------------
# 2) Constantes projet
# ---------------------------------------------------------------------------
TARGET_MAIL = "clement.thibault@outlook.fr"
GOLD_PTS    = 250                     # 214-286 → rang « Gold »

CATEGORIES = {
    "muscu": [
        "bench", "squat", "deadlift",
        "weighted_pullup", "overhead_press", "vertical_row",
    ],
    "street": [
        "weighted_pullup", "weighted_dip", "front_lever",
        "full_planche", "human_flag",
    ],
    "cardio": ["run", "bike", "rope"],
}

# ---------------------------------------------------------------------------
# 3) Récupération de l’utilisateur
# ---------------------------------------------------------------------------
try:
    user = auth.get_user_by_email(TARGET_MAIL)
except auth.UserNotFoundError:
    print("⨂  Utilisateur non trouvé !")
    exit(1)

print(f"→ Mise à jour de {TARGET_MAIL}  (uid : {user.uid})")

user_ref = db.collection("users").document(user.uid)

# ---------------------------------------------------------------------------
# 4) Construction des nouveaux scores
# ---------------------------------------------------------------------------
scores_docs   = {}
general_total = 0

for cat, metrics in CATEGORIES.items():
    data       = {m: GOLD_PTS for m in metrics}
    cat_total  = GOLD_PTS * len(metrics)
    data["total"] = cat_total
    scores_docs[cat] = data
    general_total   += cat_total

# ---------------------------------------------------------------------------
# 5) Écriture Firestore (batch = 1 seule requête)
# ---------------------------------------------------------------------------
batch = db.batch()

for cat, data in scores_docs.items():
    batch.set(
        user_ref.collection("scores").document(cat),
        data,
        merge=True           # crée ou écrase les champs existants
    )

# doc « general »
batch.set(
    user_ref.collection("scores").document("general"),
    {"general": general_total},
    merge=True
)

batch.commit()
print("✓  Statistiques mises à jour au rang Or.")