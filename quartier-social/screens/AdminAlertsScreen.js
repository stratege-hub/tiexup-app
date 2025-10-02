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
import { deleteAlert, getAllAlerts, updateAlertStatus } from '../services/adminService';

export default function AdminAlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const notifications = useNotifications();

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const allAlerts = await getAllAlerts();
      
      // Enrichir les données avec des informations supplémentaires
      const enrichedAlerts = allAlerts.map(alert => ({
        ...alert,
        message: alert.message || 'Aucun message',
        authorName: alert.authorName || 'Auteur inconnu',
        quartier: alert.quartier || 'Quartier non spécifié',
        status: alert.status || 'PENDING'
      }));

      let filteredAlerts = enrichedAlerts;
      switch (filter) {
        case 'pending':
          filteredAlerts = enrichedAlerts.filter(alert => alert.status === 'PENDING');
          break;
        case 'confirmed':
          filteredAlerts = enrichedAlerts.filter(alert => alert.status === 'CONFIRMED');
          break;
        case 'suspect':
          filteredAlerts = enrichedAlerts.filter(alert => alert.status === 'SUSPECT');
          break;
        default:
          filteredAlerts = enrichedAlerts;
      }

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      notifications.showError('Impossible de charger les alertes', 3000);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const showAlertActions = (alert) => {
    const actions = [
      {
        text: 'Valider',
        onPress: () => updateAlertAction(alert.id, 'CONFIRMED'),
        style: 'default'
      },
      {
        text: 'Marquer comme suspect',
        onPress: () => updateAlertAction(alert.id, 'SUSPECT'),
        style: 'default'
      },
      {
        text: 'Supprimer',
        onPress: () => deleteAlertAction(alert.id),
        style: 'destructive'
      },
      {
        text: 'Annuler',
        style: 'cancel'
      }
    ];

    Alert.alert(
      'Actions sur l\'alerte',
      `Que souhaitez-vous faire avec cette alerte ?`,
      actions
    );
  };

  const updateAlertAction = async (alertId, status) => {
    try {
      const adminId = 'admin@quartier-social.com';
      await updateAlertStatus(alertId, status, adminId);
      notifications.showSuccess(`Alerte ${status.toLowerCase()} avec succès`, 3000);
      
      // Mettre à jour la liste locale
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: status, reviewedBy: adminId, reviewedAt: new Date() }
            : alert
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      notifications.showError('Impossible de mettre à jour l\'alerte', 3000);
    }
  };

  const deleteAlertAction = async (alertId) => {
    try {
      await deleteAlert(alertId);
      notifications.showSuccess('Alerte supprimée avec succès', 3000);
      
      // Retirer de la liste locale
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notifications.showError('Impossible de supprimer l\'alerte', 3000);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return '#2e7d32';
      case 'SUSPECT': return '#d32f2f';
      case 'PENDING': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'SUSPECT': return 'Suspecte';
      case 'PENDING': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Intrusion': return 'shield-outline';
      case 'Robbery': return 'cash-outline';
      case 'Fire': return 'flame-outline';
      case 'Assault': return 'warning-outline';
      default: return 'alert-circle-outline';
    }
  };

  const AlertItem = ({ alert }) => (
    <TouchableOpacity 
      style={styles.alertItem}
      onPress={() => showAlertActions(alert)}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={styles.categoryRow}>
            <Ionicons 
              name={getCategoryIcon(alert.category)} 
              size={20} 
              color="#d32f2f" 
            />
            <Text style={styles.alertCategory}>{alert.category}</Text>
          </View>
          <Text style={styles.alertAuthor}>{alert.authorName}</Text>
          <Text style={styles.alertQuartier}>{alert.quartier}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(alert.status) }]}>
          <Text style={styles.statusText}>{getStatusText(alert.status)}</Text>
        </View>
      </View>
      
      {alert.message && (
        <Text style={styles.alertMessage} numberOfLines={2}>
          {alert.message}
        </Text>
      )}
      
      <View style={styles.alertFooter}>
        <Text style={styles.alertDate}>{formatDate(alert.createdAt)}</Text>
        <View style={styles.alertStats}>
          <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
          <Text style={styles.statText}>{alert.confirmCount || 0}</Text>
          <Ionicons name="close-circle" size={16} color="#d32f2f" />
          <Text style={styles.statText}>{alert.falseCount || 0}</Text>
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
        <Text style={styles.headerTitle}>Gestion des Alertes</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadAlerts}
        >
          <Ionicons name="refresh" size={24} color="#1976d2" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <FilterButton title="Toutes" value="all" isActive={filter === 'all'} />
        <FilterButton title="En attente" value="pending" isActive={filter === 'pending'} />
        <FilterButton title="Confirmées" value="confirmed" isActive={filter === 'confirmed'} />
        <FilterButton title="Suspectes" value="suspect" isActive={filter === 'suspect'} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertItem alert={item} />}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#d32f2f',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
    marginLeft: 8,
  },
  alertAuthor: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  alertQuartier: {
    fontSize: 12,
    color: '#666',
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
  alertMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertDate: {
    fontSize: 12,
    color: '#999',
  },
  alertStats: {
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
