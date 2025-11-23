# backend/audit_db.py
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from collections import Counter

# 1. Connexion
try:
    ROOT_DIR = Path(__file__).resolve().parent.parent
    SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"
    cred = credentials.Certificate(SERVICE_KEY)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connexion réussie.\n")
except Exception as e:
    print(f"❌ Erreur de connexion : {e}")
    exit(1)

def audit():
    print("🔍 --- AUDIT DE LA BASE DE DONNÉES ---\n")

    # A. ANALYSE DES UTILISATEURS
    users = list(db.collection("users").stream())
    print(f"👤 UTILISATEURS : {len(users)} trouvés")
    
    missing_gender = 0
    missing_lowercase = 0
    
    for u in users:
        d = u.to_dict()
        if "gender" not in d: missing_gender += 1
        if "displayName_lowercase" not in d: missing_lowercase += 1
    
    if missing_gender > 0: print(f"   ⚠️ ALERTE: {missing_gender} utilisateurs n'ont pas de genre défini !")
    else: print("   ✅ Tous les utilisateurs ont un genre.")

    # B. ANALYSE DES SCORES (Le cœur du problème)
    print("\n🏆 SCORES (Sous-collections)")
    
    # On regarde tous les docs dans les sous-collections 'scores'
    all_scores = list(db.collection_group("scores").stream())
    
    stats = {
        "general": {"count": 0, "missing_gender": 0},
        "muscu":   {"count": 0, "missing_gender": 0},
        "street":  {"count": 0, "missing_gender": 0},
        "cardio":  {"count": 0, "missing_gender": 0},
        "autre":   {"count": 0}
    }

    for s in all_scores:
        d = s.to_dict()
        doc_id = s.id
        
        if doc_id in stats:
            stats[doc_id]["count"] += 1
            if "gender" not in d:
                stats[doc_id]["missing_gender"] += 1
        else:
            stats["autre"]["count"] += 1

    # RAPPORT
    print(f"   Total documents de score trouvés : {len(all_scores)}")
    
    for cat, data in stats.items():
        if cat == "autre" and data["count"] == 0: continue
        
        print(f"   👉 Catégorie '{cat}': {data['count']} docs")
        if "missing_gender" in data and data["missing_gender"] > 0:
            print(f"      ❌ CRITIQUE : {data['missing_gender']} documents n'ont pas le champ 'gender' !")
            print(f"      -> Cela casse le filtre Homme/Femme du leaderboard pour '{cat}'.")
        elif "missing_gender" in data:
            print(f"      ✅ Structure OK.")

    print("\n🏁 Fin de l'audit.")

if __name__ == "__main__":
    audit()