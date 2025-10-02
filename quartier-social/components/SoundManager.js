// SoundManager simplifié pour les notifications d'alerte
export class SoundManager {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.isInitialized = true;
      console.log('🔊 SoundManager initialisé (mode simplifié)');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du SoundManager:', error);
    }
  }

  async playAlertSound() {
    try {
      await this.initialize();
      
      // Pour l'instant, on se contente des notifications système
      // Les sons seront gérés par les notifications push
      console.log('🚨 Son d\'alerte déclenché (géré par les notifications système)');
      
    } catch (error) {
      console.error('Erreur lors de la lecture du son d\'alerte:', error);
    }
  }

  async playNotificationSound() {
    try {
      await this.initialize();
      
      console.log('🔔 Son de notification déclenché (géré par les notifications système)');
      
    } catch (error) {
      console.error('Erreur lors de la lecture du son de notification:', error);
    }
  }

  async playSuccessSound() {
    try {
      await this.initialize();
      
      console.log('✅ Son de succès déclenché (géré par les notifications système)');
      
    } catch (error) {
      console.error('Erreur lors de la lecture du son de succès:', error);
    }
  }

  // Méthode pour jouer différents sons selon le type d'alerte
  async playAlertSoundByCategory(category) {
    const soundMap = {
      'Sécurité': 'alert',
      'Incendie': 'alert',
      'Accident': 'alert',
      'Vol': 'alert',
      'Autre': 'notification'
    };

    const soundType = soundMap[category] || 'notification';
    
    if (soundType === 'alert') {
      await this.playAlertSound();
    } else {
      await this.playNotificationSound();
    }
  }

  // Nettoyer les ressources
  async cleanup() {
    try {
      console.log('🧹 SoundManager nettoyé');
    } catch (error) {
      console.error('Erreur lors du nettoyage du SoundManager:', error);
    }
  }
}

// Instance globale du SoundManager
export const soundManager = new SoundManager();
