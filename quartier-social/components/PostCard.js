import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { reportPost, toggleLike, deletePost, RADIUS_OPTIONS } from '../services/firebaseService';
import CommentsModal from './CommentsModal';

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);

  // Fonction pour obtenir le label du rayon
  const getRadiusLabel = (radiusValue) => {
    const option = RADIUS_OPTIONS.find(opt => opt.value === radiusValue);
    return option ? option.label : 'Tout le quartier';
  };
  
  const notifications = useNotifications();

  React.useEffect(() => {
    // Vérifier si l'utilisateur actuel a liké cette publication
    const currentUser = auth.currentUser;
    if (currentUser && post.likes) {
      setIsLiked(post.likes.includes(currentUser.uid));
    }
    setLikesCount(post.likesCount || 0);
  }, [post.likes, post.likesCount]);

  const formatDate = (date) => {
    const now = new Date();
    const postDate = date?.toDate ? date.toDate() : new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return postDate.toLocaleDateString('fr-FR');
  };

  const handleLike = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Erreur', 'Vous devez être connecté pour liker une publication');
        return;
      }

      const result = await toggleLike(post.id, currentUser.uid);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      Alert.alert('Erreur', 'Impossible de liker cette publication');
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleReport = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour signaler');
      return;
    }

    // Vérifier si l'utilisateur essaie de signaler sa propre publication
    if (post.authorId === currentUser.uid) {
      Alert.alert('Erreur', 'Vous ne pouvez pas signaler votre propre publication');
      return;
    }

    Alert.alert(
      'Signaler cette publication',
      'Pourquoi souhaitez-vous signaler cette publication ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Contenu inapproprié', onPress: () => reportPostWithReason('Contenu inapproprié') },
        { text: 'Spam', onPress: () => reportPostWithReason('Spam') },
        { text: 'Harcèlement', onPress: () => reportPostWithReason('Harcèlement') },
        { text: 'Fausse information', onPress: () => reportPostWithReason('Fausse information') },
        { text: 'Autre', onPress: () => reportPostWithReason('Autre') }
      ]
    );
  };

  const reportPostWithReason = async (reason) => {
    try {
      const currentUser = auth.currentUser;
      await reportPost(post.id, currentUser.uid, reason);
      notifications.showSuccess('📢 Publication signalée avec succès', 3000);
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      notifications.showError('Impossible de signaler la publication', 3000);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Supprimer la publication',
      'Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: deletePostWithConfirmation
        }
      ]
    );
  };

  const deletePostWithConfirmation = async () => {
    try {
      const currentUser = auth.currentUser;
      await deletePost(post.id, currentUser.uid, currentUser.displayName || 'Anonyme');
      notifications.showSuccess('🗑️ Publication supprimée avec succès', 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notifications.showError('Impossible de supprimer la publication', 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            <Text style={styles.radiusInfo}>📡 {getRadiusLabel(post.radius)}</Text>
          </View>
        </View>
        
        {/* Bouton de suppression - seulement pour les publications de l'utilisateur */}
        {post.authorId === auth.currentUser?.uid && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
            <Ionicons name="trash-outline" size={18} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"} 
            size={16} 
            color={isLiked ? "#1976d2" : "#666"} 
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {likesCount}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubbles-outline" size={16} color="#666" />
          <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
        </TouchableOpacity>

        {/* Bouton de signalement - seulement si ce n'est pas notre publication */}
        {post.authorId !== auth.currentUser?.uid && (
          <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={16} color="#f44336" />
            <Text style={[styles.actionText, styles.reportText]}>Signaler</Text>
          </TouchableOpacity>
        )}
      </View>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    flex: 1,
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
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  radiusInfo: {
    fontSize: 11,
    color: '#1976d2',
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  reportText: {
    color: '#f44336',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
