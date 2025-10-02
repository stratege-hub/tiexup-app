import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../firebase';
import { soundManager } from '../components/SoundManager';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    
    // Configuration spéciale pour les alertes
    if (data?.type === 'alert') {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };
    }
    
    // Configuration par défaut pour les autres notifications
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export const registerForPushNotifications = async () => {
  // Configuration des canaux de notification pour Android
  if (Platform.OS === 'android') {
    // Canal par défaut
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // Canal spécial pour les alertes avec son d'urgence
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alertes d\'urgence',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      lightColor: '#FF0000',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });
  }

  // Demander les permissions pour les notifications locales
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Permissions de notification non accordées');
      return null;
    }
    
    console.log('✅ Permissions de notification accordées');
    return 'local-notifications-enabled';
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    return null;
  }
};

export const saveFCMToken = async (userId, token) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      lastTokenUpdate: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token FCM:', error);
  }
};

export const sendAlertNotification = async (alertData, userTokens) => {
  try {
    // Notification locale avec son d'urgence et vibration
    await scheduleAlertNotification(
      `🚨 ALERTE ${alertData.category.toUpperCase()}`,
      alertData.message || `Alerte de sécurité dans votre quartier`,
      {
        type: 'alert',
        alertId: alertData.id,
        category: alertData.category,
        quartier: alertData.quartier,
        priority: 'high',
        urgent: true
      }
    );

    // Jouer le son d'alerte immédiatement
    await soundManager.playAlertSoundByCategory(alertData.category);

    console.log('🚨 Notification d\'alerte locale envoyée pour:', alertData.category);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications d\'alerte:', error);
    throw error;
  }
};

export const setupNotificationListeners = () => {
  // Écouter les notifications reçues quand l'app est ouverte
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue:', notification);
  });

  // Écouter les interactions avec les notifications
  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Interaction avec notification:', response);
    
    const data = response.notification.request.content.data;
    if (data?.type === 'alert') {
      // Navigation vers l'écran des alertes ou l'alerte spécifique
      console.log('Navigation vers alerte:', data.alertId);
    }
  });
};

export const scheduleLocalNotification = (title, body, data = {}) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Immédiat
  });
};

// Fonction spéciale pour les notifications d'alerte avec son d'urgence
export const scheduleAlertNotification = (title, body, data = {}) => {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default', // Son par défaut du système
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Immédiat
    channelId: 'alerts', // Utiliser le canal spécial pour les alertes
  });
};

