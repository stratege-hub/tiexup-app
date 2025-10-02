import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth } from '../firebase';
import { addReplyToComment, getCommentReplies, toggleReplyLike, deleteReply } from '../services/firebaseService';

export default function CommentReplies({ postId, commentId, visible }) {
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  useEffect(() => {
    if (visible && postId && commentId) {
      const unsubscribe = getCommentReplies(postId, commentId, (snapshot) => {
        const repliesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReplies(repliesData);
      });

      return unsubscribe;
    }
  }, [visible, postId, commentId]);

  const handleAddReply = async () => {
    if (!newReply.trim()) return;

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Vous devez être connecté pour répondre');
        return;
      }

      await addReplyToComment(
        postId, 
        commentId, 
        currentUser.uid, 
        currentUser.displayName || 'Anonyme', 
        newReply.trim()
      );
      setNewReply('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      alert('Impossible d\'ajouter la réponse');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReply = async (replyId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Vous devez être connecté pour liker');
        return;
      }

      await toggleReplyLike(replyId, currentUser.uid);
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handleDeleteReply = (replyId) => {
    Alert.alert(
      'Supprimer la réponse',
      'Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => deleteReplyWithConfirmation(replyId)
        }
      ]
    );
  };

  const deleteReplyWithConfirmation = async (replyId) => {
    try {
      const currentUser = auth.currentUser;
      await deleteReply(replyId, postId, currentUser.uid, currentUser.displayName || 'Anonyme');
      alert('Réponse supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Impossible de supprimer la réponse');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const replyDate = date?.toDate ? date.toDate() : new Date(date);
    const diffInHours = Math.floor((now - replyDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return replyDate.toLocaleDateString('fr-FR');
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Bouton pour afficher/masquer l'input de réponse */}
      <TouchableOpacity 
        style={styles.replyButton}
        onPress={() => setShowReplyInput(!showReplyInput)}
      >
        <Ionicons name="arrow-undo-outline" size={16} color="#666" />
        <Text style={styles.replyButtonText}>
          {showReplyInput ? 'Annuler' : 'Répondre'}
        </Text>
      </TouchableOpacity>

      {/* Input de réponse */}
      {showReplyInput && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Écrire une réponse..."
            value={newReply}
            onChangeText={setNewReply}
            multiline
            maxLength={500}
          />
          <View style={styles.replyInputActions}>
            <Text style={styles.characterCount}>{newReply.length}/500</Text>
            <TouchableOpacity 
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleAddReply}
              disabled={loading || !newReply.trim()}
            >
              <Ionicons name="send-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Liste des réponses */}
      {replies.length > 0 && (
        <View style={styles.repliesList}>
          {replies.map((reply) => {
            const isOwnReply = reply.authorId === auth.currentUser?.uid;
            
            return (
              <View key={reply.id} style={styles.replyItem}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyAuthor}>{reply.userName}</Text>
                  <View style={styles.replyHeaderRight}>
                    <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
                    {/* Bouton de suppression - seulement pour les réponses de l'utilisateur */}
                    {isOwnReply && (
                      <TouchableOpacity 
                        style={styles.deleteReplyButton} 
                        onPress={() => handleDeleteReply(reply.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#f44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.replyText}>{reply.reply}</Text>
                <View style={styles.replyActions}>
                  <TouchableOpacity 
                    style={styles.likeButton}
                    onPress={() => handleLikeReply(reply.id)}
                  >
                    <Ionicons 
                      name={reply.likes?.includes(auth.currentUser?.uid) ? "heart" : "heart-outline"} 
                      size={16} 
                      color={reply.likes?.includes(auth.currentUser?.uid) ? "#e91e63" : "#666"} 
                    />
                    <Text style={styles.likeCount}>{reply.likesCount || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginLeft: 20,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  replyInputContainer: {
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  replyInput: {
    fontSize: 14,
    color: '#333',
    minHeight: 40,
    maxHeight: 100,
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#1976d2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  repliesList: {
    marginTop: 8,
  },
  replyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e0e0e0',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteReplyButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
  },
  replyDate: {
    fontSize: 11,
    color: '#999',
  },
  replyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});
