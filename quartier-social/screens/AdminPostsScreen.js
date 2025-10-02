import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { deletePost, getAllPosts, moderatePost } from '../services/adminService';

export default function AdminPostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const notifications = useNotifications();

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await getAllPosts();
      
      // Enrichir les données avec des informations supplémentaires
      const enrichedPosts = allPosts.map(post => ({
        ...post,
        content: post.content || 'Contenu non disponible',
        authorName: post.authorName || 'Auteur inconnu',
        quartier: post.quartier || 'Quartier non spécifié',
        moderated: post.moderated || false
      }));

      let filteredPosts = enrichedPosts;
      switch (filter) {
        case 'moderated':
          filteredPosts = enrichedPosts.filter(post => post.moderated);
          break;
        case 'pending':
          filteredPosts = enrichedPosts.filter(post => !post.moderated);
          break;
        case 'reported':
          // Filtrer les posts signalés (à implémenter avec une collection reports)
          filteredPosts = enrichedPosts;
          break;
        default:
          filteredPosts = enrichedPosts;
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Erreur lors du chargement des publications:', error);
      notifications.showError('Impossible de charger les publications', 3000);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const showPostActions = (post) => {
    const actions = [
      {
        text: 'Modérer',
        onPress: () => moderatePostAction(post.id, 'moderated'),
        style: 'default'
      },
      {
        text: 'Supprimer',
        onPress: () => deletePostAction(post.id),
        style: 'destructive'
      },
      {
        text: 'Annuler',
        style: 'cancel'
      }
    ];

    Alert.alert(
      'Actions sur la publication',
      `Que souhaitez-vous faire avec cette publication ?`,
      actions
    );
  };

  const moderatePostAction = async (postId, action) => {
    try {
      const adminId = 'admin@quartier-social.com';
      await moderatePost(postId, action, adminId);
      notifications.showSuccess('Publication modérée avec succès', 3000);
      
      // Mettre à jour la liste locale
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, moderated: true, moderationAction: action }
            : post
        )
      );
    } catch (error) {
      console.error('Erreur lors de la modération:', error);
      notifications.showError('Impossible de modérer la publication', 3000);
    }
  };

  const deletePostAction = async (postId) => {
    try {
      await deletePost(postId);
      notifications.showSuccess('Publication supprimée avec succès', 3000);
      
      // Retirer de la liste locale
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notifications.showError('Impossible de supprimer la publication', 3000);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non disponible';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (post) => {
    if (post.moderated) return '#2e7d32';
    return '#ff9800';
  };

  const getStatusText = (post) => {
    if (post.moderated) return 'Modérée';
    return 'En attente';
  };

  const PostItem = ({ post }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => showPostActions(post)}
    >
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.postAuthor}>{post.authorName}</Text>
          <Text style={styles.postQuartier}>{post.quartier}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post) }]}>
          <Text style={styles.statusText}>{getStatusText(post)}</Text>
        </View>
      </View>
      
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      
      <View style={styles.postFooter}>
        <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
        <View style={styles.postStats}>
          <Ionicons name="heart" size={16} color="#e91e63" />
          <Text style={styles.statText}>{post.likesCount || 0}</Text>
          <Ionicons name="chatbubble" size={16} color="#2196f3" />
          <Text style={styles.statText}>{post.commentsCount || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ title, value, isActive }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilter]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modération des Publications</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadPosts}
        >
          <Ionicons name="refresh" size={24} color="#1976d2" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <FilterButton title="Toutes" value="all" isActive={filter === 'all'} />
        <FilterButton title="En attente" value="pending" isActive={filter === 'pending'} />
        <FilterButton title="Modérées" value="moderated" isActive={filter === 'moderated'} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  filters: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#1976d2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postQuartier: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 12,
  },
});
