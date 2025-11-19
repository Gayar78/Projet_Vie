# backend/fix_users.py
import sys
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

# --- 1. Configuration ---
try:
    ROOT_DIR = Path(__file__).resolve().parent.parent 
    SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"
    cred = credentials.Certificate(SERVICE_KEY)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✓ Connexion à Firebase réussie.")
except Exception as e:
    print(f"❌ Erreur de connexion à Firebase: {e}")
    print("Vérifiez que votre fichier 'firebase_service_account.json' est bien à la racine.")
    sys.exit(1)


# --- 2. Le script de migration (Version Améliorée) ---
def migrate_users():
    print("\nLancement de la migration des utilisateurs...")
    try:
        all_users = list(db.collection("users").stream()) # Récupère tous les utilisateurs d'un coup
        batch = db.batch()
        users_to_update_count = 0

        print(f"Analyse de {len(all_users)} utilisateurs...")

        for user_doc in all_users:
            user_data = user_doc.to_dict()
            user_ref = user_doc.reference # La référence au document principal de l'utilisateur
            
            # On stocke les mises à jour à faire pour cet utilisateur
            updates_for_this_user = False

            # 1. Vérifie le document principal de l'utilisateur
            if "gender" not in user_data:
                updates_for_this_user = True
                batch.set(user_ref, {"gender": "M"}, merge=True)

            # 2. Vérifie tous les documents de la sous-collection "scores"
            scores_docs = user_ref.collection("scores").stream()
            for score_doc in scores_docs:
                if "gender" not in score_doc.to_dict():
                    updates_for_this_user = True
                    batch.set(score_doc.reference, {"gender": "M"}, merge=True)
            
            if updates_for_this_user:
                users_to_update_count += 1

        # 3. Exécute toutes les mises à jour en une seule fois
        if users_to_update_count > 0:
            batch.commit()
            print(f"\n✓ Succès ! {users_to_update_count} utilisateurs ont été mis à jour.")
        else:
            print("\n✓ Tous les utilisateurs étaient déjà à jour.")

    except Exception as e:
        print(f"❌ Erreur durant la migration: {e}")


# --- 3. Lancement du script ---
if __name__ == "__main__":
    migrate_users()