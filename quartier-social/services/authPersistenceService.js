import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

const AUTH_STORAGE_KEY = '@tiexup_auth_state';
const USER_DATA_KEY = '@tiexup_user_data';

class AuthPersistenceService {
  /**
   * Sauvegarder l'état d'authentification
   */
  async saveAuthState(user) {
    try {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          lastLoginTime: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        
        console.log('✅ État d\'authentification sauvegardé');
      } else {
        await this.clearAuthState();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'état d\'authentification:', error);
    }
  }

  /**
   * Récupérer l'état d'authentification sauvegardé
   */
  async getStoredAuthState() {
    try {
      const isAuthenticated = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (isAuthenticated === 'true' && userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('✅ État d\'authentification récupéré depuis le stockage');
        return parsedUserData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'état d\'authentification:', error);
      return null;
    }
  }

  /**
   * Effacer l'état d'authentification
   */
  async clearAuthState() {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      console.log('✅ État d\'authentification effacé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'effacement de l\'état d\'authentification:', error);
    }
  }

  /**
   * Vérifier si l'utilisateur était connecté lors de la dernière session
   */
  async wasUserLoggedIn() {
    try {
      const isAuthenticated = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      return isAuthenticated === 'true';
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'état de connexion:', error);
      return false;
    }
  }

  /**
   * Obtenir les informations utilisateur stockées
   */
  async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Mettre à jour les données utilisateur stockées
   */
  async updateStoredUserData(updates) {
    try {
      const currentData = await this.getStoredUserData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
        console.log('✅ Données utilisateur mises à jour');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des données utilisateur:', error);
    }
  }
}

export const authPersistenceService = new AuthPersistenceService();
