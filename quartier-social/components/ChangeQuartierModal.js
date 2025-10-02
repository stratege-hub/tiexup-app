import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { QUARTIERS, updateUserQuartier } from '../services/firebaseService';

export default function ChangeQuartierModal({ visible, onClose, userData, onQuartierUpdated }) {
  const [selectedQuartier, setSelectedQuartier] = useState(userData?.quartier || '');
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  const handleSave = async () => {
    if (!selectedQuartier) {
      notifications.showError('Veuillez sélectionner un quartier', 3000);
      return;
    }

    if (selectedQuartier === userData?.quartier) {
      notifications.showInfo('Aucune modification détectée', 2000);
      onClose();
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        notifications.showError('Utilisateur non connecté', 3000);
        return;
      }

      await updateUserQuartier(currentUser.uid, selectedQuartier);
      notifications.showSuccess(`✅ Quartier changé vers ${selectedQuartier}`, 3000);
      onQuartierUpdated();
      onClose();
    } catch (error) {
      console.error('Erreur lors du changement de quartier:', error);
      notifications.showError('Impossible de changer de quartier', 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderQuartierItem = ({ item }) => {
    const isSelected = item === selectedQuartier;
    const isCurrentQuartier = item === userData?.quartier;

    return (
      <TouchableOpacity
        style={[
          styles.quartierItem,
          isSelected && styles.quartierItemSelected,
          isCurrentQuartier && styles.currentQuartierItem
        ]}
        onPress={() => setSelectedQuartier(item)}
      >
        <View style={styles.quartierInfo}>
          <Ionicons 
            name="location" 
            size={20} 
            color={isSelected ? '#1976d2' : '#666'} 
          />
          <Text style={[
            styles.quartierText,
            isSelected && styles.quartierTextSelected,
            isCurrentQuartier && styles.currentQuartierText
          ]}>
            {item}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#1976d2" />
        )}
        
        {isCurrentQuartier && !isSelected && (
          <Text style={styles.currentLabel}>Actuel</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Changer de quartier</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              Sélectionnez votre nouveau quartier. Vous verrez uniquement les publications et alertes de ce quartier.
            </Text>

            <FlatList
              data={QUARTIERS}
              renderItem={renderQuartierItem}
              keyExtractor={(item) => item}
              style={styles.quartierList}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Changement...</Text>
              ) : (
                <Text style={styles.saveButtonText}>Confirmer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  quartierList: {
    maxHeight: 300,
  },
  quartierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quartierItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  currentQuartierItem: {
    backgroundColor: '#f0f8ff',
    borderColor: '#1976d2',
  },
  quartierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quartierText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  quartierTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  currentQuartierText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  currentLabel: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
