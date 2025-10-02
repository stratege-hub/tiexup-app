import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - TiexUp (Pour Expo Go)
// Clés directement dans le code pour éviter les problèmes avec les variables d'environnement
const firebaseConfig = {
  apiKey: "AIzaSyBtr8FW4BjNdEY6k3ZjVckU9eZz_TSgWQw",
  authDomain: "qg-social-e80aa.firebaseapp.com",
  projectId: "qg-social-e80aa",
  storageBucket: "qg-social-e80aa.firebasestorage.app",
  messagingSenderId: "684361370655",
  appId: "1:684361370655:web:63012528c980227914192a",
  measurementId: "G-4M6DJBS289"
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
