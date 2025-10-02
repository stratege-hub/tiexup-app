import { initializeApp } from 'firebase/app'; 
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
 
// Configuration Firebase - TiexUp (EAS Build Compatible) 
const firebaseConfig = { 
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBtr8FW4BjNdEY6k3ZjVckU9eZz_TSgWQw", 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "qg-social-e80aa.firebaseapp.com", 
  projectId: process.env.FIREBASE_PROJECT_ID || "qg-social-e80aa", 
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "qg-social-e80aa.firebasestorage.app", 
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "684361370655", 
  appId: process.env.FIREBASE_APP_ID || "1:684361370655:web:63012528c980227914192a", 
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-4M6DJBS289" 
}; 
 
let app; 
let auth; 
let db; 
 
try { 
  app = initializeApp(firebaseConfig); 
  
  // Initialiser Auth avec persistance AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  db = getFirestore(app);
  
  console.log('✅ Firebase initialisé avec persistance AsyncStorage');
} catch (error) { 
  console.error('❌ Erreur lors de l\'initialisation Firebase:', error); 
  throw error; 
} 
 
export const messaging = null; 
export { auth, db }; 
export default app; 
