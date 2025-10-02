import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { checkUserPostLimit } from '../services/adminService';
import { createPost, getUserData, RADIUS_OPTIONS } from '../services/firebaseService';

export default function CreatePostScreen() {
  const [userData, setUserData] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [postLimit, setPostLimit] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState('quartier');
  
  const notifications = useNotifications();

  useEffect(() => {
    loadUserData();
    loadPostLimit();
  }, []);

  const loadPostLimit = async () => {
    try {
      if (auth.currentUser) {
        const limit = await checkUserPostLimit(auth.currentUser.uid);
        setPostLimit(limit);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la limite:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // console.log('🔍 Utilisateur connecté:', user.uid);
        
        const data = await getUserData(user.uid);
        // console.log('🔍 Données utilisateur chargées:', data);
        setUserData(data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données utilisateur:', error);
    }
  };

  // Fonctionnalités d'images désactivées (Storage non activé)

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose avant de publier');
      return;
    }

    // Vérifier la limite de publications par jour
    try {
      const postLimit = await checkUserPostLimit(auth.currentUser.uid);
      
      if (!postLimit.canPost) {
        Alert.alert(
          'Limite atteinte',
          `Vous avez déjà publié ${postLimit.postsToday} posts aujourd'hui (limite: ${postLimit.limit}).\n\nVeuillez attendre demain pour publier de nouveau.`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Afficher un avertissement si proche de la limite
      if (postLimit.remaining <= 2 && postLimit.remaining > 0) {
        Alert.alert(
          'Attention',
          `Il vous reste ${postLimit.remaining} publication(s) pour aujourd'hui.`,
          [
            { text: 'Continuer', onPress: () => publishPost() },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
        return;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la limite:', error);
      // En cas d'erreur, permettre la publication
    }

    publishPost();
  };

  const publishPost = async () => {

    if (!userData) {
      Alert.alert('Erreur', 'Données utilisateur non disponibles');
      return;
    }

    // console.log('🔍 Données utilisateur:', userData);
    // console.log('🔍 Contenu:', content.trim());

    setLoading(true);

    try {
      // Ici vous pourriez uploader l'image vers Firebase Storage
      // Pour l'instant, on utilise l'URI locale
      const postId = await createPost(
        userData.uid,
        userData.displayName,
        userData.quartier,
        content.trim(),
        null, // Pas d'image (Storage non activé)
        selectedRadius
      );

      // Afficher une notification de succès
      notifications.showSuccess('📝 Publication créée et partagée !', 3000);
      
      // Vider le champ de texte
      setContent('');
    } catch (error) {
      console.error('❌ Erreur lors de la publication:', error);
      notifications.showError(`Impossible de publier le message: ${error.message}`, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <View>
              <Text style={styles.userName}>{userData?.displayName}</Text>
              <Text style={styles.userQuartier}>{userData?.quartier}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Que se passe-t-il dans votre quartier ?"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          {/* Sélection du rayon */}
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Rayon de diffusion :</Text>
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
                  <Text style={[
                    styles.radiusOptionDescription,
                    selectedRadius === option.value && styles.radiusOptionDescriptionSelected
                  ]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          <View style={styles.actions}>
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {content.length}/500
              </Text>
            </View>
            
            {postLimit && (
              <View style={styles.postLimitContainer}>
                <Text style={[
                  styles.postLimitText,
                  postLimit.remaining <= 2 && styles.postLimitWarning,
                  !postLimit.canPost && styles.postLimitError
                ]}>
                  {postLimit.canPost 
                    ? `Publications aujourd'hui: ${postLimit.postsToday}/${postLimit.limit}`
                    : `Limite atteinte: ${postLimit.postsToday}/${postLimit.limit}`
                  }
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.publishButton, loading && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={loading}
        >
          <Text style={styles.publishButtonText}>
            {loading ? 'Publication...' : 'Publier'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userQuartier: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  characterCount: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  characterCountText: {
    fontSize: 12,
    color: '#666',
  },
  postLimitContainer: {
    marginTop: 5,
  },
  postLimitText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  postLimitWarning: {
    color: '#ff9800',
  },
  postLimitError: {
    color: '#f44336',
  },
  publishButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#ccc',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  radiusContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: '45%',
    alignItems: 'center',
  },
  radiusOptionSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  radiusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  radiusOptionTextSelected: {
    color: '#fff',
  },
  radiusOptionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  radiusOptionDescriptionSelected: {
    color: '#e3f2fd',
  },
});
