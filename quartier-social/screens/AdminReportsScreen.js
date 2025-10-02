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
import { deletePost, getAllReports, resolveReport, updateReportStatus } from '../services/adminService';

export default function AdminReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending'); // pending, resolved, dismissed
  const notifications = useNotifications();

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const allReports = await getAllReports();
      
      // Enrichir les données avec des informations supplémentaires
      const enrichedReports = allReports.map(report => ({
        ...report,
        postContent: report.postContent || 'Contenu non disponible',
        postAuthor: report.postAuthor || 'Auteur inconnu',
        reporterName: report.reporterName || 'Utilisateur anonyme',
        description: report.description || 'Aucune description fournie',
        status: report.status || 'pending'
      }));

      let filteredReports = enrichedReports;
      switch (filter) {
        case 'pending':
          filteredReports = enrichedReports.filter(report => report.status === 'pending');
          break;
        case 'resolved':
          filteredReports = enrichedReports.filter(report => report.status === 'resolved');
          break;
        case 'dismissed':
          filteredReports = enrichedReports.filter(report => report.status === 'dismissed');
          break;
        default:
          filteredReports = enrichedReports;
      }

      setReports(filteredReports);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      notifications.showError('Impossible de charger les signalements', 3000);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleReportAction = (reportId, action) => {
    const actionTexts = {
      'resolve': 'résoudre',
      'dismiss': 'rejeter',
      'delete_post': 'supprimer la publication'
    };

    Alert.alert(
      'Confirmer l\'action',
      `Êtes-vous sûr de vouloir ${actionTexts[action]} ce signalement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          style: action === 'dismiss' ? 'destructive' : 'default',
          onPress: () => executeReportAction(reportId, action)
        }
      ]
    );
  };

  const executeReportAction = async (reportId, action) => {
    try {
      const adminId = 'admin@quartier-social.com';
      let result;

      switch (action) {
        case 'resolve':
          result = await resolveReport(reportId, 'resolved', adminId);
          break;
        case 'dismiss':
          result = await updateReportStatus(reportId, 'dismissed', adminId);
          break;
        case 'delete_post':
          // Trouver le report pour obtenir le postId
          const report = reports.find(r => r.id === reportId);
          if (report && report.postId) {
            await deletePost(report.postId);
            result = await resolveReport(reportId, 'post_deleted', adminId);
          } else {
            throw new Error('Post ID non trouvé');
          }
          break;
        default:
          throw new Error('Action non reconnue');
      }

      if (result.success) {
        const actionTexts = {
          'resolve': 'Signalement résolu',
          'dismiss': 'Signalement rejeté',
          'delete_post': 'Publication supprimée'
        };

        notifications.showSuccess(actionTexts[action], 3000);
        
        // Mettre à jour la liste locale
        setReports(prevReports => 
          prevReports.map(report => {
            if (report.id === reportId) {
              return {
                ...report,
                status: action === 'resolve' ? 'resolved' : 
                        action === 'dismiss' ? 'dismissed' : report.status,
                reviewedAt: new Date(),
                reviewedBy: adminId
              };
            }
            return report;
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonColor = (reason) => {
    const colors = {
      'Contenu inapproprié': '#d32f2f',
      'Spam': '#ff9800',
      'Harcèlement': '#9c27b0',
      'Fausse information': '#f44336',
      'Autre': '#607d8b'
    };
    return colors[reason] || '#666';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9800',
      'resolved': '#2e7d32',
      'dismissed': '#666'
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'En attente',
      'resolved': 'Résolu',
      'dismissed': 'Rejeté'
    };
    return texts[status] || status;
  };

  const renderReport = ({ item: report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportReason} style={{ color: getReasonColor(report.reason) }}>
            {report.reason}
          </Text>
          <Text style={styles.reportDate}>
            Signalé le {formatDate(report.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{getStatusText(report.status)}</Text>
        </View>
      </View>

      <View style={styles.reportContent}>
        <Text style={styles.contentLabel}>Publication signalée :</Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {report.postContent}
        </Text>
        <Text style={styles.postAuthor}>Par : {report.postAuthor}</Text>
      </View>

      <View style={styles.reportDetails}>
        <Text style={styles.detailLabel}>Signalé par :</Text>
        <Text style={styles.reporterName}>{report.reporterName}</Text>
        
        {report.description && (
          <>
            <Text style={styles.detailLabel}>Description :</Text>
            <Text style={styles.description}>{report.description}</Text>
          </>
        )}
      </View>

      {report.reviewedAt && (
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewText}>
            Traité le {formatDate(report.reviewedAt)} par {report.reviewedBy}
          </Text>
        </View>
      )}

      {report.status === 'pending' && (
        <View style={styles.reportActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.resolveButton]}
            onPress={() => handleReportAction(report.id, 'resolve')}
          >
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Résoudre</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleReportAction(report.id, 'delete_post')}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Supprimer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => handleReportAction(report.id, 'dismiss')}
          >
            <Ionicons name="close-circle" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filterButtons = [
    { key: 'pending', label: 'En attente', count: reports.filter(r => r.status === 'pending').length },
    { key: 'resolved', label: 'Résolus', count: reports.filter(r => r.status === 'resolved').length },
    { key: 'dismissed', label: 'Rejetés', count: reports.filter(r => r.status === 'dismissed').length },
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
        <Text style={styles.headerTitle}>Signalements</Text>
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
        data={reports}
        renderItem={renderReport}
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
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportReason: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportDate: {
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
  reportContent: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  contentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  postAuthor: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  reporterName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewInfo: {
    padding: 8,
    backgroundColor: '#e8f5e8',
    borderRadius: 6,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 12,
    color: '#2e7d32',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  resolveButton: {
    backgroundColor: '#2e7d32',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  dismissButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});
