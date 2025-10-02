import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { updateUserProfile } from '../services/firebaseService';

export default function EditProfileModal({ visible, onClose, userData, onProfileUpdated }) {
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  const handleSave = async () => {
    if (!displayName.trim()) {
      notifications.showError('Le nom ne peut pas être vide', 3000);
      return;
    }

    if (displayName.trim() === userData?.displayName) {
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

      await updateUserProfile(currentUser.uid, displayName.trim());
      notifications.showSuccess('✅ Profil mis à jour avec succès', 3000);
      onProfileUpdated();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      notifications.showError('Impossible de mettre à jour le profil', 3000);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Modifier le profil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom d'affichage</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Votre nom"
                maxLength={50}
                autoFocus={true}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.emailText}>{userData?.email}</Text>
              <Text style={styles.emailNote}>L'email ne peut pas être modifié</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quartier</Text>
              <Text style={styles.quartierText}>📍 {userData?.quartier}</Text>
              <Text style={styles.quartierNote}>Utilisez "Changer de quartier" pour modifier</Text>
            </View>
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
                <Text style={styles.saveButtonText}>Enregistrement...</Text>
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emailNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  quartierText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  quartierNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
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
