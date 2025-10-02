import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - TiexUp (Variables d'environnement EAS)
// Utilise process.env directement pour la compatibilité EAS Build
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBtr8FW4BjNdEY6k3ZjVckU9eZz_TSgWQw",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "qg-social-e80aa.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "qg-social-e80aa",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "qg-social-e80aa.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "684361370655",
  appId: process.env.FIREBASE_APP_ID || "1:684361370655:web:63012528c980227914192a",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-4M6DJBS289"
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
