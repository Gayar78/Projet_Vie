from flask import Flask, render_template, request, redirect, session, url_for
import pyrebase
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("firebase_service_account.json")  # ce fichier vient de Firebase
firebase_admin.initialize_app(cred)
db = firestore.client()


def is_authenticated():
    return 'user' in session


app = Flask(__name__)
app.secret_key = 'secret'  # à changer pour la prod

# Charger la configuration Firebase
import json
with open("firebase_config.json") as f:
    firebase_config = json.load(f)

firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            # Création du compte utilisateur dans Firebase Auth
            user = auth.create_user_with_email_and_password(email, password)
            uid = user['localId']

            # Ajouter l'utilisateur dans Firestore avec points = 0
            db.collection("users").document(uid).set({
                "email": email,
                "points": 0,
                "username": "",         # à compléter plus tard
                "objectif": "",         # à compléter plus tard
                "instagram": ""         # à compléter plus tard
            })

            return redirect(url_for('login'))

        except Exception as e:
            print("Erreur Firebase:", e)
            return "Erreur lors de l'inscription"
    
    return render_template('register.html')



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.sign_in_with_email_and_password(email, password)
            session['user'] = user['idToken']
            return redirect(url_for('index'))
        except:
            return "Identifiants incorrects"
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))


@app.route('/profile')
def profile():
    if not is_authenticated():
        return redirect(url_for('login'))

    user_info = auth.get_account_info(session['user'])
    uid = user_info['users'][0]['localId']
    email = user_info['users'][0]['email']

    # Récupérer les données Firestore
    user_doc = db.collection("users").document(uid).get()
    profile_data = user_doc.to_dict() if user_doc.exists else {}

    return render_template(
        'profile.html',
        email=email,
        username=profile_data.get('username', ''),
        sport=profile_data.get('sport', ''),
        instagram=profile_data.get('instagram', ''),
        objectif=profile_data.get('objectif', '')
    )



@app.route('/update_profile', methods=['POST'])
def update_profile():
    if not is_authenticated():
        return redirect(url_for('login'))

    user_info = auth.get_account_info(session['user'])
    uid = user_info['users'][0]['localId']

    profile_data = {
        "username": request.form['username'],
        "sport": request.form['sport'],
        "instagram": request.form['instagram'],
        "objectif": request.form['objectif']
    }

    db.collection("users").document(uid).set(profile_data, merge=True)
    return redirect(url_for('profile'))

@app.route('/submit_performance', methods=['GET', 'POST'])
def submit_performance():
    if not is_authenticated():
        return redirect(url_for('login'))

    user_info = auth.get_account_info(session['user'])
    uid = user_info['users'][0]['localId']

    if request.method == 'POST':
        performance_data = {
            "description": request.form['description'],
            "date": firestore.SERVER_TIMESTAMP,
            "status": "en attente"  # admin changera ça après validation
        }

        db.collection("users").document(uid).collection("performances").add(performance_data)
        return "Performance envoyée avec succès !"

    return render_template('submit_performance.html')


@app.route('/classement')
def classement():
    users_ref = db.collection("users")
    users = users_ref.order_by("points", direction=firestore.Query.DESCENDING).stream()

    classement_data = []
    for user in users:
        data = user.to_dict()
        classement_data.append({
            "username": data.get("username", "Anonyme"),
            "points": data.get("points", 0)
        })

    return render_template('classement.html', classement=classement_data)


if __name__ == '__main__':
    app.run(debug=True)

