import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { addComment, getComments, toggleCommentLike, deleteComment } from '../services/firebaseService';
import CommentReplies from './CommentReplies';

export default function CommentsModal({ visible, onClose, postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());
  
  const notifications = useNotifications();

  useEffect(() => {
    if (visible && postId) {
      const unsubscribe = getComments(postId, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
      });

      return unsubscribe;
    }
  }, [visible, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Vous devez être connecté pour commenter');
        return;
      }

      await addComment(postId, currentUser.uid, currentUser.displayName || 'Anonyme', newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du commentaire:', error);
      notifications.showError('Impossible d\'ajouter le commentaire', 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = date?.toDate ? date.toDate() : new Date(date);
    const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return commentDate.toLocaleDateString('fr-FR');
  };

  const handleLikeComment = async (commentId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Vous devez être connecté pour liker');
        return;
      }

      await toggleCommentLike(postId, commentId, currentUser.uid);
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const toggleCommentExpansion = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Supprimer le commentaire',
      'Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => deleteCommentWithConfirmation(commentId)
        }
      ]
    );
  };

  const deleteCommentWithConfirmation = async (commentId) => {
    try {
      const currentUser = auth.currentUser;
      await deleteComment(postId, commentId, currentUser.uid, currentUser.displayName || 'Anonyme');
      notifications.showSuccess('🗑️ Commentaire supprimé avec succès', 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notifications.showError('Impossible de supprimer le commentaire', 3000);
    }
  };

  const renderComment = ({ item }) => {
    const isExpanded = expandedComments.has(item.id);
    const isLiked = item.likes?.includes(auth.currentUser?.uid);
    const isOwnComment = item.authorId === auth.currentUser?.uid;
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            <Ionicons name="person" size={16} color="#666" />
          </View>
          <View style={styles.commentInfo}>
            <Text style={styles.commentAuthor}>{item.userName}</Text>
            <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
          </View>
          
          {/* Bouton de suppression - seulement pour les commentaires de l'utilisateur */}
          {isOwnComment && (
            <TouchableOpacity 
              style={styles.deleteCommentButton} 
              onPress={() => handleDeleteComment(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.commentText}>{item.comment}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikeComment(item.id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={isLiked ? "#e91e63" : "#666"} 
            />
            <Text style={styles.actionText}>{item.likesCount || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleCommentExpansion(item.id)}
          >
            <Ionicons 
              name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.actionText}>
              {isExpanded ? 'Masquer' : 'Réponses'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Réponses du commentaire */}
        {isExpanded && (
          <CommentReplies 
            postId={postId} 
            commentId={item.id} 
            visible={isExpanded}
          />
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Commentaires</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aucun commentaire</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
            onPress={handleAddComment}
            disabled={loading || !newComment.trim()}
          >
            <Ionicons name="send-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteCommentButton: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
