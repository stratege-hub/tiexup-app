import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

// Configuration Firebase - TiexUp (Variables d'environnement sécurisées)
// Utilisé pour les builds de production avec EAS
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Debug : Vérifier la configuration
// console.log('🔥 Configuration Firebase:', {
//   projectId: firebaseConfig.projectId,
//   authDomain: firebaseConfig.authDomain,
//   apiKey: firebaseConfig.apiKey ? '✅ Présent' : '❌ Manquant'
// });

// Initialiser Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  // console.log('✅ Firebase initialisé avec succès');

  // Initialiser les services
  auth = getAuth(app);
  db = getFirestore(app);

  // console.log('✅ Services Firebase initialisés:', {
  //   auth: auth ? '✅' : '❌',
  //   db: db ? '✅' : '❌'
  // });

} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation Firebase:', error);
  throw error;
}

// Ne pas initialiser messaging sur mobile pour éviter les erreurs
// Les notifications seront gérées par Expo Notifications
export const messaging = null;

export { auth, db };
export default app;
