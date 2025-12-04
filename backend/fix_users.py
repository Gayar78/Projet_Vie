# backend/force_fix.py
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import os

print("--- DÉMARRAGE DU SCRIPT DE CORRECTION ---")

# 1. CONFIGURATION DU CHEMIN (ROBUSTE)
# On cherche la clé dans le dossier parent (project-root) ou le dossier courant (backend)
current_dir = Path(os.getcwd())
possible_keys = [
    current_dir.parent / "firebase_service_account.json", # Si lancé depuis backend/
    current_dir / "firebase_service_account.json",        # Si lancé depuis root/
    Path("firebase_service_account.json")                 # Juste le nom
]

cred_path = None
for p in possible_keys:
    if p.exists():
        cred_path = p
        print(f"✅ Clé trouvée : {p}")
        break

if not cred_path:
    print("❌ ERREUR FATALE : Impossible de trouver 'firebase_service_account.json'.")
    print(f"   Cherché dans : {[str(p) for p in possible_keys]}")
    exit(1)

# 2. CONNEXION
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connexion Firebase établie.")
except Exception as e:
    print(f"❌ Erreur de connexion : {e}")
    exit(1)

# 3. CORRECTION DES DONNÉES
def fix():
    print("\n🔍 Scan de la collection group 'scores'...")
    
    try:
        # On récupère tous les docs "scores"
        all_scores = list(db.collection_group("scores").stream())
        
        if len(all_scores) == 0:
            print("⚠️ AUCUN DOCUMENT TROUVÉ ! La base semble vide ou la requête échoue.")
            return

        print(f"📦 {len(all_scores)} documents de score trouvés.")
        
        batch = db.batch()
        count = 0
        updated_count = 0
        
        for doc in all_scores:
            data = doc.to_dict()
            doc_id = doc.id  # ex: 'muscu', 'street', 'general'
            
            # Vérifie si le champ manque ou est incorrect
            if "category" not in data or data["category"] != doc_id:
                # On ajoute/corrige le champ category
                batch.update(doc.reference, {"category": doc_id})
                updated_count += 1
                count += 1
            
            # Commit par lot de 400
            if count >= 400:
                batch.commit()
                print(f"   💾 Sauvegarde intermédiaire ({updated_count} maj)...")
                batch = db.batch()
                count = 0
        
        if count > 0:
            batch.commit()
            
        print(f"\n✨ SUCCÈS : {updated_count} documents mis à jour sur {len(all_scores)}.")
        print("👉 Chaque document contient maintenant {'category': 'muscu'} (ou street/cardio/general).")

    except Exception as e:
        print(f"❌ Erreur durant le traitement : {e}")

if __name__ == "__main__":
    fix()