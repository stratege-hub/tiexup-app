import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { checkUserAlertCooldown } from '../services/adminService';
import { createAlert, RADIUS_OPTIONS } from '../services/firebaseService';

const ALERT_CATEGORIES = [
  'Intrusion',
  'Braquage', 
  'Incendie',
  'Agression',
  'Autre'
];

// Numéros d'urgence par catégorie
const EMERGENCY_NUMBERS = {
  'Intrusion': { number: '17', service: 'Police' },
  'Braquage': { number: '17', service: 'Police' },
  'Incendie': { number: '18', service: 'Pompiers' },
  'Agression': { number: '17', service: 'Police' },
  'Autre': { number: '15', service: 'SAMU' }
};

export default function CreateAlertScreen({ navigation, route }) {
  const { userData } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [shareLocation, setShareLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertCooldown, setAlertCooldown] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState('quartier');
  
  const notifications = useNotifications();

  // Charger le délai d'alerte quand l'écran s'ouvre
  React.useEffect(() => {
    if (userData) {
      loadAlertCooldown();
    }
  }, [userData]);

  const loadAlertCooldown = async () => {
    try {
      const cooldown = await checkUserAlertCooldown(userData.uid);
      setAlertCooldown(cooldown);
    } catch (error) {
      console.error('Erreur lors du chargement du délai:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedCategory) {
      notifications.showError('Veuillez sélectionner un type d\'alerte', 3000);
      return;
    }

    if (alertCooldown && !alertCooldown.canCreateAlert) {
      notifications.showError('Vous devez attendre avant de créer une nouvelle alerte', 3000);
      return;
    }

    setLoading(true);

    try {
      let location = null;
      if (shareLocation) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const locationResult = await Location.getCurrentPositionAsync({});
            location = {
              latitude: locationResult.coords.latitude,
              longitude: locationResult.coords.longitude,
              timestamp: new Date()
            };
          } else {
            notifications.showWarning(
              'Impossible d\'obtenir votre position. L\'alerte sera créée sans localisation.'
            );
          }
        } catch (locationError) {
          console.error('Erreur de localisation:', locationError);
          notifications.showWarning(
            'Impossible d\'obtenir votre position. L\'alerte sera créée sans localisation.'
          );
        }
      }

      await createAlert(
        userData.uid,
        userData.displayName,
        userData.quartier,
        selectedCategory,
        message.trim() || null,
        location,
        selectedRadius
      );

      // Afficher une notification de succès
      notifications.showSuccess(`🚨 Alerte ${selectedCategory} envoyée à tous les résidents !`, 4000);

      // Retourner à l'écran précédent
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      notifications.showError('Impossible de créer l\'alerte', 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>🚨 Alerte de Sécurité</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Type d'alerte */}
        <Text style={styles.sectionTitle}>Type d'alerte :</Text>
        <View style={styles.categoriesContainer}>
          {ALERT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message et Rayon sur la même ligne */}
        <View style={styles.rowContainer}>
          <View style={styles.messageContainer}>
            <Text style={styles.sectionTitle}>Message :</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Décrivez brièvement..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={2}
              maxLength={150}
            />
          </View>
          
          <View style={styles.radiusContainer}>
            <Text style={styles.sectionTitle}>Rayon :</Text>
            <View style={styles.radiusOptions}>
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusOption,
                    selectedRadius === option.value && styles.radiusOptionSelected
                  ]}
                  onPress={() => setSelectedRadius(option.value)}
                >
                  <Text style={[
                    styles.radiusOptionText,
                    selectedRadius === option.value && styles.radiusOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Localisation et avertissements */}
        <View style={styles.locationContainer}>
          <View style={styles.locationInfo}>
            <Text style={styles.sectionTitle}>📍 Partager localisation</Text>
            <Text style={styles.locationDescription}>
              Position approximative aux voisins
            </Text>
          </View>
          <Switch
            value={shareLocation}
            onValueChange={setShareLocation}
            trackColor={{ false: '#767577', true: '#1976d2' }}
            thumbColor={shareLocation ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Messages d'alerte compacts */}
        <View style={styles.alertsContainer}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={14} color="#ff9800" />
            <Text style={styles.warningText}>
              Urgence uniquement - Envoyé à tout le quartier
            </Text>
          </View>

          {alertCooldown && !alertCooldown.canCreateAlert && (
            <View style={styles.cooldownContainer}>
              <Ionicons name="time" size={14} color="#f44336" />
              <Text style={styles.cooldownText}>
                Délai: {alertCooldown.timeRemaining} min restante(s)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleCreateAlert}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? 'Envoi...' : 'Confirmer l\'alerte'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 5,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonSelected: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  messageContainer: {
    flex: 1,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 60,
    maxHeight: 80,
  },
  radiusContainer: {
    flex: 1,
  },
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  radiusOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: '48%',
    alignItems: 'center',
  },
  radiusOptionSelected: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  radiusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  radiusOptionTextSelected: {
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  locationInfo: {
    flex: 1,
    marginRight: 10,
  },
  locationDescription: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  alertsContainer: {
    marginBottom: 10,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  warningText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
    flex: 1,
  },
  cooldownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 6,
  },
  cooldownText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#721c24',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
