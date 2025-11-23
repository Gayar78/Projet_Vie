# backend/reset_and_seed.py
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import random

# ─── CONFIGURATION ───
try:
    ROOT_DIR = Path(__file__).resolve().parent.parent
    SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"
    cred = credentials.Certificate(SERVICE_KEY)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connexion établie.")
except Exception as e:
    print(f"❌ Erreur config: {e}")
    exit(1)

# ─── CONSTANTES DU JEU ───
MAX_PTS_PER_EXO = 650 

# Standards Elite (pour le calcul des points) - Objectif à atteindre pour avoir 650pts
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

CATEGORIES = {
    "muscu": ["bench", "overhead_press", "dumbbell_press", "squat", "deadlift", "pull_vertical", "pull_horizontal", "curls"],
    "street": ["weighted_pullup", "weighted_dip", "front_lever", "full_planche", "human_flag"],
    "cardio": ["run", "bike", "rope"]
}

# --- CALCUL DES POINTS (Exponentiel) ---
def calculate_points(perf, standard):
    if standard == 0: return 0
    ratio = perf / standard
    if ratio < 0: ratio = 0
    # Courbe : (ratio ^ 1.8) * MAX
    score = (ratio ** 1.8) * MAX_PTS_PER_EXO
    return int(min(score, MAX_PTS_PER_EXO * 1.5))

# --- NETTOYAGE ---
def wipe_user_scores(user_ref):
    scores = user_ref.collection("scores").stream()
    for s in scores:
        s.reference.delete()

# ─── MAIN SCRIPT ───
def seed_database():
    print("\n🎲 Démarrage de la RANDOMISATION TOTALE (Sexe & Scores)...\n")
    
    users = list(db.collection("users").stream())
    print(f"👥 {len(users)} utilisateurs trouvés.")
    
    batch = db.batch()
    batch_count = 0
    updated_users = 0

    for user_doc in users:
        user_id = user_doc.id
        user_data = user_doc.to_dict()
        
        # 1. RANDOMISATION DU GENRE
        # On force un changement aléatoire pour bien tester les filtres
        new_gender = random.choice(["M", "F"])
        
        updates = {"gender": new_gender}
        
        # On s'assure qu'il a un pseudo
        if "displayName" not in user_data or not user_data["displayName"]:
            updates["displayName"] = f"Athlète {user_id[:4]}"
            updates["displayName_lowercase"] = f"athlète {user_id[:4]}"
        
        batch.set(user_doc.reference, updates, merge=True)
        batch_count += 1

        # 2. SUPPRESSION ANCIENS SCORES
        wipe_user_scores(user_doc.reference)

        # 3. GÉNÉRATION SCORE (Logique 2k - 10k)
        # On définit un "Potentiel Athlétique" pour cet utilisateur entre 0.35 (Débutant) et 1.1 (Champion)
        # Cela permet d'avoir des scores cohérents : un mec fort sera fort partout (à peu près)
        athlete_potential = random.uniform(0.35, 1.10) 

        total_general = 0
        
        for cat_name, exercises in CATEGORIES.items():
            cat_doc_data = {"gender": new_gender, "total": 0}
            cat_total = 0
            
            # On décide si l'utilisateur pratique cette catégorie (95% de chance pour remplir le leaderboard)
            if random.random() < 0.95:
                for exo in exercises:
                    # On applique le potentiel global + une variation locale par exercice (+/- 20%)
                    # Cela permet d'avoir des points forts et des points faibles
                    local_variance = random.uniform(0.8, 1.2)
                    
                    # Performance simulée
                    standard = STANDARDS[exo][new_gender]
                    perf = standard * athlete_potential * local_variance
                    
                    # Arrondi propre
                    perf_display = int(perf) if perf > 10 else round(perf, 1)
                    
                    # Calcul points
                    pts = calculate_points(perf_display, standard)
                    
                    # Ajout au doc
                    cat_doc_data[exo] = pts
                    cat_total += pts
            
            cat_doc_data["total"] = cat_total
            total_general += cat_total
            
            # Ajout Batch
            cat_ref = user_doc.reference.collection("scores").document(cat_name)
            batch.set(cat_ref, cat_doc_data)
            batch_count += 1

        # 4. SCORE GÉNÉRAL AVEC GENRE (CRUCIAL)
        gen_ref = user_doc.reference.collection("scores").document("general")
        batch.set(gen_ref, {
            "general": total_general,
            "gender": new_gender  # Indispensable pour l'index composite
        })
        batch_count += 1
        
        updated_users += 1
        # Affichage pour suivi
        rank_txt = "Challenger" if total_general > 9500 else "Moyen"
        print(f"   🎲 {user_data.get('displayName', user_id)[:15]:<15} | {new_gender} | Potentiel: {int(athlete_potential*100)}% | Score: {total_general}")

        if batch_count >= 400:
            print("   💾 Sauvegarde intermédiaire...")
            batch.commit()
            batch = db.batch()
            batch_count = 0

    if batch_count > 0:
        batch.commit()

    print(f"\n✨ SUCCÈS : {updated_users} profils randomisés.")
    print("👉 Genres mélangés et scores répartis sur toute l'échelle.")

if __name__ == "__main__":
    seed_database()