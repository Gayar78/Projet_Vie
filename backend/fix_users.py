# backend/seed_full_ranks.py
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import random
import math

# ─── CONFIGURATION FIREBASE ───
try:
    ROOT_DIR = Path(__file__).resolve().parent.parent
    SERVICE_KEY = ROOT_DIR / "firebase_service_account.json"
    cred = credentials.Certificate(SERVICE_KEY)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✓ Connexion Firebase établie.")
except Exception as e:
    print(f"❌ Erreur config: {e}")
    exit(1)

# ─── CONSTANTES DU MOTEUR DE JEU ───
MAX_PTS_PER_EXO = 650
TOTAL_EXERCISES = 16 # 8 muscu + 5 street + 3 cardio

# Les bornes de points pour chaque rang (basé sur tes règles)
RANK_TARGETS = [
    ("Fer",          500,  1400),
    ("Bronze",      1600, 3400),
    ("Argent",      3600, 5400),
    ("Or",          5600, 7400),
    ("Platine",     7600, 8600),
    ("Émeraude",    8800, 9200),
    ("Diamant",     9400, 9600),
    ("Maître",      9750, 9840),
    ("Grand Maître",9860, 9940),
    ("Challenger",  9960, 10000) # Proche de la perfection
]

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

# ─── FONCTIONS DE "REVERSE ENGINEERING" ───
# On part du score voulu pour trouver la perf (l'inverse du main.py)

def get_perf_from_score(target_score_exo, standard):
    """
    Score = (Ratio ^ 1.8) * 650
    Donc Ratio = (Score / 650) ^ (1/1.8)
    Perf = Ratio * Standard
    """
    if target_score_exo <= 0: return 0
    
    # On limite pour ne pas casser les maths
    safe_score = min(target_score_exo, MAX_PTS_PER_EXO * 1.2)
    
    ratio = (safe_score / MAX_PTS_PER_EXO) ** (1 / 1.8)
    perf = ratio * standard
    
    # Ajout d'un peu de bruit aléatoire (+/- 5%) pour faire naturel
    noise = random.uniform(0.95, 1.05)
    return perf * noise

def calculate_score_check(perf, standard):
    """Recalcule le score exact pour l'écriture en base (vérification)"""
    if standard == 0: return 0
    ratio = perf / standard
    score = (ratio ** 1.8) * MAX_PTS_PER_EXO
    return int(score)

# ─── SCRIPT PRINCIPAL ───
def force_rank_distribution():
    print("\n🎨 Démarrage de la génération FULL SPECTRUM (Fer -> Challenger)...")
    
    users = list(db.collection("users").stream())
    if not users:
        print("❌ Aucun utilisateur trouvé. Créez des comptes d'abord !")
        return

    print(f"👥 {len(users)} utilisateurs trouvés.")
    
    batch = db.batch()
    count = 0
    
    # On boucle sur les utilisateurs
    for i, user_doc in enumerate(users):
        user_data = user_doc.to_dict()
        gender = user_data.get("gender", "M")
        
        # On sélectionne un rang cible de manière cyclique
        # User 1 -> Fer, User 2 -> Bronze ... User 10 -> Challenger, User 11 -> Fer...
        rank_name, min_pts, max_pts = RANK_TARGETS[i % len(RANK_TARGETS)]
        
        # On définit un score cible global pour cet utilisateur
        target_total = random.randint(min_pts, max_pts)
        
        # Score moyen par exercice pour atteindre ce total
        # (On suppose qu'il pratique environ 12 exos sur les 16)
        active_exos = 12
        avg_score_per_exo = target_total / active_exos
        
        print(f"   → {user_data.get('displayName', 'Inconnu')[:15]:<15} : Objectif {rank_name:<12} (~{target_total} pts)")

        # Nettoyage
        old_scores = user_doc.reference.collection("scores").stream()
        for s in old_scores:
            batch.delete(s.reference)

        real_total_general = 0

        for cat, metrics in CATEGORIES.items():
            cat_data = {"gender": gender}
            cat_total = 0
            
            for exo in metrics:
                # Pour atteindre le rang, on génère une perf basée sur le score moyen requis
                # On ajoute de la variance : certains exos forts, d'autres faibles
                variance = random.uniform(0.5, 1.5) 
                target_exo_score = avg_score_per_exo * variance
                
                # Calcul de la performance (kg, sec, km/h)
                std = STANDARDS[exo][gender]
                perf_val = get_perf_from_score(target_exo_score, std)
                
                # On arrondit joli
                if perf_val > 10: perf_val = int(perf_val)
                else: perf_val = round(perf_val, 1)
                
                # On recalcul le score exact (car on a arrondi la perf)
                final_score = calculate_score_check(perf_val, std)
                
                cat_data[exo] = final_score
                cat_total += final_score
            
            cat_data["total"] = cat_total
            real_total_general += cat_total
            
            batch.set(user_doc.reference.collection("scores").document(cat), cat_data)
            count += 1

        # Total général
        batch.set(user_doc.reference.collection("scores").document("general"), {"general": real_total_general})
        
        if count >= 400:
            batch.commit()
            batch = db.batch()
            count = 0

    if count > 0:
        batch.commit()

    print("\n✨ Terminé ! Le Leaderboard devrait maintenant afficher un arc-en-ciel de grades.")

if __name__ == "__main__":
    force_rank_distribution()