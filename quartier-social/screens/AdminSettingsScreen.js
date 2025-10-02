import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import {
    getSystemSettings,
    listenToSystemSettings,
    resetSystemSettings,
    updateSystemSettings
} from '../services/adminService';

export default function AdminSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    alertNotifications: true,
    autoModeration: false,
    emailNotifications: true,
    pushNotifications: true,
    dataRetention: 365, // jours
    maxFileSize: 10, // MB
    maxPostsPerDay: 50,
    alertCooldown: 30 // minutes
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    loadSettings();
    
    // Écouter les changements en temps réel
    const unsubscribe = listenToSystemSettings((newSettings) => {
      setSettings(newSettings);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const systemSettings = await getSystemSettings();
      setSettings(systemSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      notifications.showError('Impossible de charger les paramètres', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSystemSettings(settings);
      notifications.showSuccess('Paramètres sauvegardés avec succès', 2000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      notifications.showError('Impossible de sauvegarder les paramètres', 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Réinitialiser les paramètres',
      'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const defaultSettings = await resetSystemSettings();
              setSettings(defaultSettings);
              notifications.showSuccess('Paramètres réinitialisés', 2000);
            } catch (error) {
              console.error('Erreur lors de la réinitialisation:', error);
              notifications.showError('Impossible de réinitialiser les paramètres', 3000);
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };


  const SettingItem = ({ title, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.settingControl}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e0e0e0', true: '#1976d2' }}
            thumbColor={value ? '#fff' : '#f4f3f4'}
          />
        ) : type === 'number' ? (
          <View style={styles.numberInputContainer}>
            <TextInput
              style={styles.numberInput}
              value={value ? value.toString() : '0'}
              onChangeText={onValueChange}
              keyboardType="numeric"
              placeholder="0"
              selectTextOnFocus
            />
            <Text style={styles.numberUnit}>
              {title.includes('Rétention') ? 'jours' : 
               title.includes('Taille') ? 'MB' : 
               title.includes('Publications') ? 'posts' : 
               title.includes('Délai') ? 'min' : ''}
            </Text>
          </View>
        ) : (
          <Text style={styles.settingValue}>{value}</Text>
        )}
      </View>
    </View>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuration Système</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          <Ionicons 
            name={saving ? "hourglass" : "checkmark"} 
            size={24} 
            color={saving ? "#ccc" : "#1976d2"} 
          />
        </TouchableOpacity>
      </View>

      <SettingSection title="Mode Maintenance">
        <SettingItem
          title="Mode Maintenance"
          description="Désactive l'accès public à l'application"
          value={settings.maintenanceMode}
          onValueChange={(value) => handleSettingChange('maintenanceMode', value)}
        />
      </SettingSection>

      <SettingSection title="Inscription Utilisateurs">
        <SettingItem
          title="Nouvelles Inscriptions"
          description="Autoriser l'inscription de nouveaux utilisateurs"
          value={settings.newUserRegistration}
          onValueChange={(value) => handleSettingChange('newUserRegistration', value)}
        />
      </SettingSection>

      <SettingSection title="Notifications">
        <SettingItem
          title="Notifications d'Alertes"
          description="Envoyer des notifications pour les alertes de sécurité"
          value={settings.alertNotifications}
          onValueChange={(value) => handleSettingChange('alertNotifications', value)}
        />
        <SettingItem
          title="Notifications Email"
          description="Activer les notifications par email"
          value={settings.emailNotifications}
          onValueChange={(value) => handleSettingChange('emailNotifications', value)}
        />
        <SettingItem
          title="Notifications Push"
          description="Activer les notifications push"
          value={settings.pushNotifications}
          onValueChange={(value) => handleSettingChange('pushNotifications', value)}
        />
      </SettingSection>

      <SettingSection title="Modération">
        <SettingItem
          title="Modération Automatique"
          description="Modération automatique des contenus"
          value={settings.autoModeration}
          onValueChange={(value) => handleSettingChange('autoModeration', value)}
        />
      </SettingSection>

      <SettingSection title="Limites Système">
        <SettingItem
          title="Rétention des Données"
          description="Durée de conservation des données (jours)"
          value={settings.dataRetention || 365}
          type="number"
          onValueChange={(value) => handleSettingChange('dataRetention', parseInt(value) || 365)}
        />
        <SettingItem
          title="Taille Max des Fichiers"
          description="Taille maximale des fichiers (MB)"
          value={settings.maxFileSize || 10}
          type="number"
          onValueChange={(value) => handleSettingChange('maxFileSize', parseInt(value) || 10)}
        />
        <SettingItem
          title="Publications par Jour"
          description="Nombre maximum de publications par utilisateur"
          value={settings.maxPostsPerDay || 50}
          type="number"
          onValueChange={(value) => handleSettingChange('maxPostsPerDay', parseInt(value) || 50)}
        />
        <SettingItem
          title="Délai entre Alertes"
          description="Délai minimum entre deux alertes (minutes)"
          value={settings.alertCooldown || 30}
          type="number"
          onValueChange={(value) => handleSettingChange('alertCooldown', parseInt(value) || 30)}
        />
      </SettingSection>

              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetSettings}
                >
                  <Ionicons name="refresh" size={20} color="#d32f2f" />
                  <Text style={styles.resetButtonText}>Réinitialiser les Paramètres</Text>
                </TouchableOpacity>
              </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des paramètres...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {saving ? 'Sauvegarde en cours...' : 'Cliquez sur ✓ pour sauvegarder'}
        </Text>
        <Text style={styles.footerSubtext}>
          Dernière modification: {settings.lastModified ? 
            new Date(settings.lastModified).toLocaleDateString('fr-FR') : 
            'Non disponible'
          }
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  loadingText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingControl: {
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  numberInput: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    backgroundColor: '#fff',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
          actionsSection: {
            margin: 20,
          },
          resetButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 15,
            borderWidth: 1,
            borderColor: '#d32f2f',
          },
          resetButtonText: {
            fontSize: 16,
            color: '#d32f2f',
            fontWeight: '600',
            marginLeft: 8,
          },
  footer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});
