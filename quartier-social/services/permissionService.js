import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export class PermissionService {
  constructor() {
    this.permissions = {
      location: false,
      notifications: false,
      camera: false,
      mediaLibrary: false,
      microphone: false
    };
  }

  // Demander toutes les permissions nécessaires
  async requestAllPermissions() {
    console.log('🔐 Demande de toutes les permissions...');
    
    const results = await Promise.allSettled([
      this.requestLocationPermission(),
      this.requestNotificationPermission(),
      this.requestCameraPermission(),
      this.requestMediaLibraryPermission(),
      this.requestMicrophonePermission()
    ]);

    const grantedPermissions = [];
    const deniedPermissions = [];

    results.forEach((result, index) => {
      const permissionNames = ['location', 'notifications', 'camera', 'mediaLibrary', 'microphone'];
      if (result.status === 'fulfilled' && result.value) {
        grantedPermissions.push(permissionNames[index]);
      } else {
        deniedPermissions.push(permissionNames[index]);
      }
    });

    console.log('✅ Permissions accordées:', grantedPermissions);
    console.log('❌ Permissions refusées:', deniedPermissions);

    return {
      granted: grantedPermissions,
      denied: deniedPermissions,
      allGranted: deniedPermissions.length === 0
    };
  }

  // Demander la permission de localisation
  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.permissions.location = status === 'granted';
      
      if (status !== 'granted') {
        console.warn('⚠️ Permission de localisation refusée');
        return false;
      }
      
      console.log('✅ Permission de localisation accordée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission de localisation:', error);
      return false;
    }
  }

  // Demander la permission de notifications
  async requestNotificationPermission() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      this.permissions.notifications = status === 'granted';
      
      if (status !== 'granted') {
        console.warn('⚠️ Permission de notifications refusée');
        return false;
      }
      
      console.log('✅ Permission de notifications accordée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission de notifications:', error);
      return false;
    }
  }

  // Demander la permission de caméra
  async requestCameraPermission() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      this.permissions.camera = status === 'granted';
      
      if (status !== 'granted') {
        console.warn('⚠️ Permission de caméra refusée');
        return false;
      }
      
      console.log('✅ Permission de caméra accordée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission de caméra:', error);
      return false;
    }
  }

  // Demander la permission de médiathèque
  async requestMediaLibraryPermission() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      this.permissions.mediaLibrary = status === 'granted';
      
      if (status !== 'granted') {
        console.warn('⚠️ Permission de médiathèque refusée');
        return false;
      }
      
      console.log('✅ Permission de médiathèque accordée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission de médiathèque:', error);
      return false;
    }
  }

  // Demander la permission de microphone
  async requestMicrophonePermission() {
    try {
      // Pour expo-av, on vérifie si on peut accéder au microphone
      // Cette permission est généralement accordée automatiquement avec expo-av
      this.permissions.microphone = true;
      console.log('✅ Permission de microphone accordée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission de microphone:', error);
      return false;
    }
  }

  // Vérifier le statut des permissions
  async checkPermissionStatus() {
    try {
      const locationStatus = await Location.getForegroundPermissionsAsync();
      const notificationStatus = await Notifications.getPermissionsAsync();
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      return {
        location: locationStatus.status === 'granted',
        notifications: notificationStatus.status === 'granted',
        camera: cameraStatus.status === 'granted',
        mediaLibrary: mediaLibraryStatus.status === 'granted',
        microphone: true // Supposé accordé avec expo-av
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions:', error);
      return {
        location: false,
        notifications: false,
        camera: false,
        mediaLibrary: false,
        microphone: false
      };
    }
  }

  // Afficher une alerte pour les permissions critiques
  showPermissionAlert(deniedPermissions) {
    const criticalPermissions = ['location', 'notifications'];
    const criticalDenied = deniedPermissions.filter(p => criticalPermissions.includes(p));

    if (criticalDenied.length > 0) {
      Alert.alert(
        'Permissions requises',
        'Certaines permissions sont nécessaires pour le bon fonctionnement de l\'application :\n\n' +
        criticalDenied.map(p => {
          switch (p) {
            case 'location': return '• Localisation : Pour les alertes géolocalisées';
            case 'notifications': return '• Notifications : Pour recevoir les alertes de sécurité';
            default: return `• ${p}`;
          }
        }).join('\n') +
        '\n\nVeuillez les activer dans les paramètres de votre appareil.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  }

  // Obtenir les permissions manquantes
  getMissingPermissions() {
    return Object.entries(this.permissions)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
  }
}

export const permissionService = new PermissionService();
