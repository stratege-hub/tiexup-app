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
import { blockUser, getAllUsers, makeUserPremium, removeUserPremium, unblockUser } from '../services/adminService';

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, premium, blocked
  const notifications = useNotifications();

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      
      // Enrichir les données utilisateurs avec des statistiques calculées
      const enrichedUsers = allUsers.map(user => ({
        ...user,
        postsCount: 0, // À calculer depuis les posts
        alertsCount: 0, // À calculer depuis les alertes
        totalLikes: 0, // À calculer depuis les posts
        isActive: user.isActive !== false, // Par défaut actif si non spécifié
        isBlocked: user.isBlocked === true, // Par défaut non bloqué
        isPremium: user.isPremium === true, // Par défaut non premium
        lastLogin: user.lastLogin || user.createdAt
      }));

      let filteredUsers = enrichedUsers;
      switch (filter) {
        case 'active':
          filteredUsers = enrichedUsers.filter(user => user.isActive && !user.isBlocked);
          break;
        case 'premium':
          filteredUsers = enrichedUsers.filter(user => user.isPremium);
          break;
        case 'blocked':
          filteredUsers = enrichedUsers.filter(user => user.isBlocked);
          break;
        default:
          filteredUsers = enrichedUsers;
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      notifications.showError('Impossible de charger les utilisateurs', 3000);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleUserAction = (userId, action) => {
    Alert.alert(
      'Confirmer l\'action',
      `Êtes-vous sûr de vouloir ${action} cet utilisateur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          style: 'destructive',
          onPress: () => executeUserAction(userId, action)
        }
      ]
    );
  };

  const executeUserAction = async (userId, action) => {
    try {
      let result;
      switch (action) {
        case 'bloquer':
          result = await blockUser(userId);
          break;
        case 'débloquer':
          result = await unblockUser(userId);
          break;
        case 'rendre premium':
          result = await makeUserPremium(userId);
          break;
        case 'retirer premium':
          result = await removeUserPremium(userId);
          break;
        default:
          throw new Error('Action non reconnue');
      }

      if (result.success) {
        notifications.showSuccess(`Utilisateur ${action} avec succès`, 3000);
        
        // Mettre à jour la liste locale
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              switch (action) {
                case 'bloquer':
                  return { ...user, isBlocked: true, isActive: false };
                case 'débloquer':
                  return { ...user, isBlocked: false, isActive: true };
                case 'rendre premium':
                  return { ...user, isPremium: true };
                case 'retirer premium':
                  return { ...user, isPremium: false };
                default:
                  return user;
              }
            }
            return user;
          })
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      notifications.showError('Impossible d\'exécuter l\'action', 3000);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non disponible';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (user) => {
    if (user.isBlocked) return '#d32f2f';
    if (!user.isActive) return '#ff9800';
    if (user.isPremium) return '#2e7d32';
    return '#1976d2';
  };

  const getStatusText = (user) => {
    if (user.isBlocked) return 'Bloqué';
    if (!user.isActive) return 'Inactif';
    if (user.isPremium) return 'Premium';
    return 'Actif';
  };

  const renderUser = ({ item: user }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userQuartier}>📍 {user.quartier}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user) }]}>
          <Text style={styles.statusText}>{getStatusText(user)}</Text>
        </View>
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Ionicons name="newspaper" size={16} color="#666" />
          <Text style={styles.statText}>{user.postsCount} posts</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="warning" size={16} color="#666" />
          <Text style={styles.statText}>{user.alertsCount} alertes</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#666" />
          <Text style={styles.statText}>{user.totalLikes} likes</Text>
        </View>
      </View>

      <View style={styles.userDates}>
        <Text style={styles.dateText}>Inscrit: {formatDate(user.createdAt)}</Text>
        <Text style={styles.dateText}>Dernière connexion: {formatDate(user.lastLogin)}</Text>
      </View>

      <View style={styles.userActions}>
        {!user.isBlocked ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.blockButton]}
            onPress={() => handleUserAction(user.id, 'bloquer')}
          >
            <Ionicons name="ban" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Bloquer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.unblockButton]}
            onPress={() => handleUserAction(user.id, 'débloquer')}
          >
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Débloquer</Text>
          </TouchableOpacity>
        )}

        {!user.isPremium ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.premiumButton]}
            onPress={() => handleUserAction(user.id, 'rendre premium')}
          >
            <Ionicons name="star" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Premium</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.removePremiumButton]}
            onPress={() => handleUserAction(user.id, 'retirer premium')}
          >
            <Ionicons name="star-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Retirer Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filterButtons = [
    { key: 'all', label: 'Tous', count: users.length },
    { key: 'active', label: 'Actifs', count: users.filter(u => u.isActive && !u.isBlocked).length },
    { key: 'premium', label: 'Premium', count: users.filter(u => u.isPremium).length },
    { key: 'blocked', label: 'Bloqués', count: users.filter(u => u.isBlocked).length },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#1976d2" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {filterButtons.map((button) => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.filterButton,
              filter === button.key && styles.filterButtonActive
            ]}
            onPress={() => setFilter(button.key)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === button.key && styles.filterButtonTextActive
            ]}>
              {button.label}
            </Text>
            <View style={[
              styles.filterBadge,
              filter === button.key && styles.filterBadgeActive
            ]}>
              <Text style={[
                styles.filterBadgeText,
                filter === button.key && styles.filterBadgeTextActive
              ]}>
                {button.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#1976d2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#fff',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  filterBadgeTextActive: {
    color: '#1976d2',
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userQuartier: {
    fontSize: 13,
    color: '#1976d2',
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
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  userDates: {
    marginVertical: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  blockButton: {
    backgroundColor: '#d32f2f',
  },
  unblockButton: {
    backgroundColor: '#2e7d32',
  },
  premiumButton: {
    backgroundColor: '#ff9800',
  },
  removePremiumButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
