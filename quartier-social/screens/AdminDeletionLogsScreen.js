import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getDeletionLogs, getDeletionStats } from '../services/firebaseService';

export default function AdminDeletionLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const deletionStats = await getDeletionStats();
      setStats(deletionStats);
      
      // Charger les logs en temps réel
      const unsubscribe = getDeletionLogs((snapshot) => {
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLogs(logsData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    const logDate = date?.toDate ? date.toDate() : new Date(date);
    return logDate.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'post': return 'document-text-outline';
      case 'comment': return 'chatbubble-outline';
      case 'reply': return 'arrow-undo-outline';
      case 'alert': return 'warning-outline';
      default: return 'trash-outline';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'post': return '#1976d2';
      case 'comment': return '#4caf50';
      case 'reply': return '#ff9800';
      case 'alert': return '#f44336';
      default: return '#666';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'post': return 'Publication';
      case 'comment': return 'Commentaire';
      case 'reply': return 'Réponse';
      case 'alert': return 'Alerte';
      default: return 'Inconnu';
    }
  };

  const renderLogItem = ({ item }) => {
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);
    const typeLabel = getTypeLabel(item.type);

    return (
      <View style={styles.logItem}>
        <View style={styles.logHeader}>
          <View style={styles.logType}>
            <Ionicons name={typeIcon} size={20} color={typeColor} />
            <Text style={[styles.typeLabel, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          <Text style={styles.logDate}>{formatDate(item.deletedAt)}</Text>
        </View>
        
        <View style={styles.logContent}>
          <Text style={styles.userName}>👤 {item.userName}</Text>
          <Text style={styles.itemId}>ID: {item.itemId}</Text>
          
          {item.itemData && (
            <View style={styles.itemData}>
              {item.itemData.content && (
                <Text style={styles.itemText}>📝 {item.itemData.content}</Text>
              )}
              {item.itemData.comment && (
                <Text style={styles.itemText}>💬 {item.itemData.comment}</Text>
              )}
              {item.itemData.reply && (
                <Text style={styles.itemText}>↩️ {item.itemData.reply}</Text>
              )}
              {item.itemData.category && (
                <Text style={styles.itemText}>🚨 {item.itemData.category}</Text>
              )}
              {item.itemData.message && (
                <Text style={styles.itemText}>📢 {item.itemData.message}</Text>
              )}
              {item.itemData.quartier && (
                <Text style={styles.itemText}>🏘️ {item.itemData.quartier}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Statistiques des suppressions</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recent}</Text>
            <Text style={styles.statLabel}>24h</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.byType.post}</Text>
            <Text style={styles.statLabel}>Publications</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.byType.comment}</Text>
            <Text style={styles.statLabel}>Commentaires</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.byType.reply}</Text>
            <Text style={styles.statLabel}>Réponses</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.byType.alert}</Text>
            <Text style={styles.statLabel}>Alertes</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗑️ Logs de Suppression</Text>
        <Text style={styles.subtitle}>Traçabilité des suppressions par les utilisateurs</Text>
      </View>

      {renderStatsCard()}

      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        style={styles.logsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trash-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucune suppression enregistrée</Text>
          </View>
        }
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  logsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  logItem: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logDate: {
    fontSize: 12,
    color: '#666',
  },
  logContent: {
    marginTop: 5,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  itemData: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e0e0e0',
  },
  itemText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
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
});
