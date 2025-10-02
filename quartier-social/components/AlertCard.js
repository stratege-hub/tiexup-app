import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { confirmAlert, reportFalseAlert, deleteAlert, RADIUS_OPTIONS } from '../services/firebaseService';
import { auth } from '../firebase';

export default function AlertCard({ alert, userData, isOwnAlert = false }) {
  // Fonction pour obtenir le label du rayon
  const getRadiusLabel = (radiusValue) => {
    const option = RADIUS_OPTIONS.find(opt => opt.value === radiusValue);
    return option ? option.label : 'Tout le quartier';
  };

  const formatDate = (date) => {
    const now = new Date();
    const alertDate = date?.toDate ? date.toDate() : new Date(date);
    const diffInHours = Math.floor((now - alertDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return alertDate.toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return '#ff9800';
      case 'CONFIRME': return '#d32f2f';
      case 'SUSPECT': return '#757575';
      default: return '#ff9800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return 'EN ATTENTE';
      case 'CONFIRME': return 'CONFIRMÉ';
      case 'SUSPECT': return 'SUSPECT';
      default: return 'EN ATTENTE';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Intrusion': return 'home-outline';
      case 'Braquage': return 'shield-outline';
      case 'Incendie': return 'flame-outline';
      case 'Agression': return 'warning-outline';
      default: return 'warning-outline';
    }
  };

  const handleConfirm = () => {
    Alert.alert(
      'Confirmer l\'alerte',
      'Êtes-vous sûr de vouloir confirmer cette alerte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => confirmAlert(alert.id, userData.uid),
          style: 'destructive'
        }
      ]
    );
  };

  const handleReportFalse = () => {
    Alert.alert(
      'Signaler comme fausse alerte',
      'Êtes-vous sûr de vouloir signaler cette alerte comme fausse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Signaler', 
          onPress: () => reportFalseAlert(alert.id, userData.uid),
          style: 'destructive'
        }
      ]
    );
  };

  const hasUserReacted = () => {
    return alert.confirmedBy?.includes(userData.uid) || alert.falseBy?.includes(userData.uid);
  };

  const handleLocationPress = () => {
    if (alert.location && alert.location.latitude && alert.location.longitude) {
      const { latitude, longitude, address } = alert.location;
      
      Alert.alert(
        'Localisation de l\'alerte',
        `${address || 'Position approximative'}\n\nCoordonnées: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        [
          { text: 'Fermer', style: 'cancel' },
          { 
            text: 'Ouvrir dans Maps', 
            onPress: () => {
              const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
              Linking.openURL(url).catch(() => {
                Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de cartes');
              });
            }
          },
          { 
            text: 'Copier les coordonnées', 
            onPress: () => {
              // Ici vous pourriez utiliser le Clipboard API
              Alert.alert('Coordonnées copiées', `${latitude}, ${longitude}`);
            }
          }
        ]
      );
    }
  };

  const handleDeleteAlert = () => {
    Alert.alert(
      'Supprimer l\'alerte',
      'Êtes-vous sûr de vouloir supprimer cette alerte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: deleteAlertWithConfirmation
        }
      ]
    );
  };

  const deleteAlertWithConfirmation = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Erreur', 'Vous devez être connecté pour supprimer');
        return;
      }
      await deleteAlert(alert.id, currentUser.uid, currentUser.displayName || 'Anonyme');
      Alert.alert('Succès', 'Alerte supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'alerte');
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        borderLeftColor: getStatusColor(alert.status),
        backgroundColor: isOwnAlert ? '#f8f9fa' : '#fff',
        opacity: isOwnAlert ? 0.8 : 1
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.alertInfo}>
          <Ionicons 
            name={getCategoryIcon(alert.category)} 
            size={24} 
            color={getStatusColor(alert.status)} 
          />
          <View style={styles.alertDetails}>
            <Text style={styles.category}>
              {alert.category}
              {isOwnAlert && <Text style={styles.ownAlertText}> (Votre alerte)</Text>}
            </Text>
            <Text style={styles.author}>Par {alert.authorName}</Text>
            <Text style={styles.date}>{formatDate(alert.createdAt)}</Text>
            <Text style={styles.radiusInfo}>📡 {getRadiusLabel(alert.radius)}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(alert.status) }]}>
            <Text style={styles.statusText}>{getStatusText(alert.status)}</Text>
          </View>
          
          {/* Bouton de suppression - seulement pour les alertes de l'utilisateur */}
          {isOwnAlert && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAlert}>
              <Ionicons name="trash-outline" size={18} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {alert.message && (
        <Text style={styles.message}>{alert.message}</Text>
      )}

      {alert.location && (
        <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress}>
          <Ionicons name="location" size={16} color="#1976d2" />
          <Text style={styles.locationText}>
            📍 {alert.location.address || 'Localisation partagée'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#1976d2" />
        </TouchableOpacity>
      )}

      {alert.status === 'EN_ATTENTE' && !hasUserReacted() && !isOwnAlert && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]} 
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Je confirme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.reportButton]} 
            onPress={handleReportFalse}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Fausse alerte</Text>
          </TouchableOpacity>
        </View>
      )}

      {isOwnAlert && (
        <View style={styles.ownAlertMessage}>
          <Text style={styles.ownAlertMessageText}>
            📢 Votre alerte a été envoyée à tous les résidents du quartier
          </Text>
        </View>
      )}

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          ✅ {alert.confirmCount || 0} confirmations
        </Text>
        <Text style={styles.statsText}>
          ❌ {alert.falseCount || 0} signalements
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertDetails: {
    marginLeft: 10,
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  radiusInfo: {
    fontSize: 11,
    color: '#d32f2f',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1976d2',
    flex: 1,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  reportButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  ownAlertText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  ownAlertMessage: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  ownAlertMessageText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
