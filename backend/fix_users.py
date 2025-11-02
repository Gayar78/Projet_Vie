# backend/fix_users.py
import sys
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

# --- 1. Configuration (copiée de main.py) ---
try:
    # On remonte de deux niveaux pour trouver la racine (backend/ -> project-root/)
    ROOT_DIR = Path(__file__).resolve().parent.parent 
    SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"

    cred = credentials.Certificate(SERVICE_KEY)

    # On vérifie si l'app est déjà initialisée
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    print("✓ Connexion à Firebase réussie.")

except Exception as e:
    print(f"❌ Erreur de connexion à Firebase: {e}")
    print("Vérifiez que votre fichier 'firebase_service_account.json' est bien à la racine.")
    sys.exit(1)


# --- 2. Le script de migration ---
def migrate_users():
    print("\nLancement de la migration des utilisateurs...")
    try:
        users_ref = db.collection("users").stream()
        batch = db.batch() # On crée un "lot" pour tout envoyer d'un coup
        count = 0

        print("Lecture de tous les utilisateurs...")
        for user in users_ref:
            data = user.to_dict()
            updates = {} # Ce qu'on doit changer

            # 1. On force 'isPublic' à True pour tous les utilisateurs
            if data.get("isPublic") is not True: # Si ce n'est pas DEJA True
                updates["isPublic"] = True

            # 2. Vérifie et ajoute 'displayName_lowercase'
            display_name = data.get("displayName", "")
            lowercase_name = display_name.lower()

            if data.get("displayName_lowercase") != lowercase_name:
                updates["displayName_lowercase"] = lowercase_name

            # S'il y a au moins un champ à mettre à jour...
            if updates:
                doc_ref = db.collection("users").document(user.id)
                batch.set(doc_ref, updates, merge=True) # merge=True ajoute sans écraser
                count += 1

        # 3. Envoie toutes les modifications à Firebase
        if count > 0:
            batch.commit()
            print(f"\n✓ Succès ! {count} utilisateurs ont été mis à jour.")
        else:
            print("\n✓ Tous les utilisateurs étaient déjà à jour.")

    except Exception as e:
        print(f"❌ Erreur durant la migration: {e}")

# --- 3. Lancement du script ---
if __name__ == "__main__":
    migrate_users()