// static/js/auth.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp = initializeApp({
  apiKey:        import.meta.env.VITE_FB_API_KEY,
  authDomain:    import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:     import.meta.env.VITE_FB_PROJECT_ID,
});

const auth = getAuth(firebaseApp);

export async function getIdToken (forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilisateur non connecté');
  return user.getIdToken(forceRefresh);
}
