import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import os

# ─── 1. CONFIGURATION ───
print("--- 🔄 DÉMARRAGE DU RECALCUL DES SCORES ---")

current_dir = Path(os.getcwd())
possible_keys = [
    current_dir.parent / "firebase_service_account.json",
    current_dir / "firebase_service_account.json",
    Path("firebase_service_account.json")
]

cred_path = None
for p in possible_keys:
    if p.exists():
        cred_path = p
        break

if not cred_path:
    print("❌ Clé Firebase introuvable.")
    exit(1)

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connexion réussie.")
except Exception as e:
    print(f"❌ Erreur connexion: {e}")
    exit(1)

# ─── 2. TES NOUVEAUX STANDARDS ───
MAX_PTS_PER_EXO = 650 

STANDARDS = {
    "bench":           {"M": 140, "F": 75},
    "overhead_press":  {"M": 110,  "F": 55},
    "dumbbell_press":  {"M": 100,  "F": 40},
    "squat":           {"M": 250, "F": 160},
    "deadlift":        {"M": 300, "F": 200},
    "pull_vertical":   {"M": 150, "F": 90},
    "pull_horizontal": {"M": 150, "F": 90},
    "curls":           {"M": 30,  "F": 20},
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

# ─── 3. FONCTIONS DE CALCUL (Copiées du Backend) ───

def calculate_1rm(weight: float, reps: int) -> float:
    effective_reps = min(reps, 12)
    if effective_reps <= 1:
        return weight
    return weight * (1 + effective_reps / 30)

def apply_difficulty_curve(ratio: float) -> int:
    if ratio < 0: ratio = 0
    score = (ratio ** 1.8) * MAX_PTS_PER_EXO
    return int(min(score, MAX_PTS_PER_EXO * 1.5))

def calculate_points(category, exercise, gender, perf_data):
    """Recalcule les points pour une perf donnée"""
    try:
        # MUSCU
        if category == "muscu" or (category == "street" and exercise in ["weighted_pullup", "weighted_dip"]):
            weight = float(perf_data.get("weight") or 0)
            reps = int(perf_data.get("reps") or 0)
            std = STANDARDS.get(exercise, {}).get(gender, 100)
            one_rm = calculate_1rm(weight, reps)
            return apply_difficulty_curve(one_rm / std)
        
        # STATIC (Street)
        elif category == "street":
            t_str = perf_data.get("time") or "0"
            sec = 0
            if ":" in str(t_str):
                p = str(t_str).split(":")
                sec = int(p[0])*60 + int(p[1])
            else:
                sec = int(t_str)
            if sec < 5: return 0
            std = STANDARDS.get(exercise, {}).get(gender, 30)
            return apply_difficulty_curve(min(sec, 60) / std)

        # CARDIO
        elif category == "cardio":
            dist = float(perf_data.get("distance") or 0)
            t_str = perf_data.get("time") or "0"
            reps = int(perf_data.get("reps") or 0)
            
            duration_sec = 0
            if ":" in str(t_str):
                p = str(t_str).split(":")
                duration_sec = int(p[0])*60 + int(p[1])
            else:
                duration_sec = float(t_str)
            
            if duration_sec <= 0: return 0
            
            std_speed = STANDARDS.get(exercise, {}).get(gender, 15)
            perf_val = 0
            if exercise == "rope":
                perf_val = (reps / duration_sec) * 60
            else:
                hours = duration_sec / 3600
                if hours > 0: perf_val = dist / hours
            
            return apply_difficulty_curve(perf_val / std_speed)
            
    except Exception as e:
        print(f"⚠️ Erreur calcul {exercise}: {e}")
        return 0
    return 0

# ─── 4. LOGIQUE PRINCIPALE ───

def run_update():
    print("⏳ Récupération des utilisateurs...")
    # On a besoin du genre de chaque user
    users_ref = db.collection("users").stream()
    users_gender = {u.id: u.to_dict().get("gender", "M") for u in users_ref}
    print(f"👤 {len(users_gender)} utilisateurs trouvés.")

    print("⏳ Récupération des contributions validées...")
    # On ne prend que les contributions validées
    contribs = db.collection("contributions").where(filter=firestore.FieldFilter("status", "==", "approved")).stream()
    
    # Structure temporaire : user_scores[uid][category][exercise] = max_points
    user_scores = {}

    count_contribs = 0
    for c in contribs:
        count_contribs += 1
        data = c.to_dict()
        uid = data.get("author_uid")
        cat = data.get("category")
        exo = data.get("exercise")
        
        if not uid or uid not in users_gender: continue # User supprimé ou inconnu
        if not cat or not exo: continue

        gender = users_gender[uid]
        
        # Recalcul des points avec les NOUVEAUX standards
        new_pts = calculate_points(cat, exo, gender, data.get("performance", {}))
        
        # On met à jour si c'est mieux que ce qu'on a déjà vu dans ce script
        if uid not in user_scores: user_scores[uid] = {}
        if cat not in user_scores[uid]: user_scores[uid][cat] = {}
        
        current_best = user_scores[uid][cat].get(exo, 0)
        if new_pts > current_best:
            user_scores[uid][cat][exo] = new_pts

    print(f"✅ {count_contribs} contributions analysées.")
    print("💾 Sauvegarde des nouveaux scores...")

    batch = db.batch()
    batch_count = 0
    updated_users = 0

    # Pour chaque utilisateur qui a des contributions
    for uid, cats_data in user_scores.items():
        gender = users_gender.get(uid, "M")
        total_general = 0
        
        # Pour chaque catégorie (muscu, street, cardio)
        for cat_name, exercises_scores in cats_data.items():
            # On prépare le document complet (avec les 0 pour les exos non faits)
            # On s'assure d'avoir la structure propre
            doc_data = {
                "gender": gender,
                "category": cat_name, # IMPORTANT pour le fix précédent
                "total": sum(exercises_scores.values())
            }
            
            # On remplit les exos (ceux faits + ceux à 0)
            # On regarde la liste officielle pour ne rien oublier
            if cat_name in CATEGORIES:
                for ex_def in CATEGORIES[cat_name]:
                    doc_data[ex_def] = exercises_scores.get(ex_def, 0)
            
            total_general += doc_data["total"]
            
            # Update Score Category
            ref = db.collection("users").document(uid).collection("scores").document(cat_name)
            batch.set(ref, doc_data)
            batch_count += 1

        # Update Score General
        gen_ref = db.collection("users").document(uid).collection("scores").document("general")
        batch.set(gen_ref, {
            "general": total_general,
            "gender": gender,
            "category": "general"
        })
        batch_count += 1
        updated_users += 1

        if batch_count >= 400:
            batch.commit()
            batch = db.batch()
            batch_count = 0
            print(f"   ... {updated_users} utilisateurs mis à jour.")

    if batch_count > 0:
        batch.commit()

    print(f"\n🎉 TERMINÉ ! {updated_users} profils mis à jour avec les nouveaux standards.")
    print("ℹ️ Note : Les utilisateurs 'randomisés' (sans contributions réelles) ne sont pas mis à jour par ce script.")
    print("   -> Relance 'fix_users.py' si tu veux aussi reset les bots.")

if __name__ == "__main__":
    run_update()