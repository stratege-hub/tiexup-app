import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationsSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    newPosts: true,
    newAlerts: true,
    alertConfirmations: true,
    comments: false,
    likes: false,
    emergencyAlerts: true,
  });
  const notifications = useNotifications();

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    // Afficher une notification de confirmation
    notifications.showSuccess(
      `${settings[key] ? 'Désactivé' : 'Activé'} : ${getSettingLabel(key)}`,
      2000
    );
  };

  const getSettingLabel = (key) => {
    const labels = {
      newPosts: 'Nouvelles publications',
      newAlerts: 'Nouvelles alertes',
      alertConfirmations: 'Confirmations d\'alertes',
      comments: 'Commentaires',
      likes: 'Réactions',
      emergencyAlerts: 'Alertes d\'urgence',
    };
    return labels[key] || key;
  };

  const getSettingDescription = (key) => {
    const descriptions = {
      newPosts: 'Recevoir des notifications pour les nouvelles publications de votre quartier',
      newAlerts: 'Recevoir des notifications pour les nouvelles alertes de sécurité',
      alertConfirmations: 'Recevoir des notifications quand vos alertes sont confirmées ou signalées',
      comments: 'Recevoir des notifications pour les nouveaux commentaires sur vos publications',
      likes: 'Recevoir des notifications quand quelqu\'un aime vos publications',
      emergencyAlerts: 'Recevoir des notifications prioritaires pour les alertes d\'urgence',
    };
    return descriptions[key] || '';
  };

  const SettingItem = ({ settingKey, icon, title, description }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#1976d2" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#e0e0e0', true: '#90caf9' }}
        thumbColor={settings[settingKey] ? '#1976d2' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications et Alertes</Text>
        
        <SettingItem
          settingKey="newPosts"
          icon="document-text"
          title="Nouvelles publications"
          description="Recevoir des notifications pour les nouvelles publications de votre quartier"
        />

        <SettingItem
          settingKey="newAlerts"
          icon="warning"
          title="Nouvelles alertes"
          description="Recevoir des notifications pour les nouvelles alertes de sécurité"
        />

        <SettingItem
          settingKey="emergencyAlerts"
          icon="alert-circle"
          title="Alertes d'urgence"
          description="Recevoir des notifications prioritaires pour les alertes d'urgence"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interactions</Text>
        
        <SettingItem
          settingKey="alertConfirmations"
          icon="checkmark-circle"
          title="Confirmations d'alertes"
          description="Recevoir des notifications quand vos alertes sont confirmées ou signalées"
        />

        <SettingItem
          settingKey="comments"
          icon="chatbubbles"
          title="Commentaires"
          description="Recevoir des notifications pour les nouveaux commentaires sur vos publications"
        />

        <SettingItem
          settingKey="likes"
          icon="heart"
          title="Réactions"
          description="Recevoir des notifications quand quelqu'un aime vos publications"
        />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoIcon}>
          <Ionicons name="information-circle" size={24} color="#1976d2" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>À propos des notifications</Text>
          <Text style={styles.infoText}>
            Les notifications vous permettent de rester informé des activités importantes dans votre quartier. 
            Vous pouvez les personnaliser selon vos préférences.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Les paramètres sont sauvegardés automatiquement
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
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  infoIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
