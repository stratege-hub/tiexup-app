import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { getAdminStats, listenToAdminStats } from '../services/adminService';

export default function AdminScreen({ navigation }) {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalPosts: 0,
    totalAlerts: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);
  const notifications = useNotifications();

  useEffect(() => {
    loadAdminStats();
    
    // Écoute en temps réel des statistiques
    const unsubscribe = listenToAdminStats((stats) => {
      setUserStats(stats);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const stats = await getAdminStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      notifications.showError('Impossible de charger les statistiques', 3000);
    } finally {
      setLoading(false);
    }
  };

  const adminMenuItems = [
    {
      id: 'users',
      title: 'Gestion des Utilisateurs',
      description: 'Voir et gérer tous les utilisateurs',
      icon: 'people',
      color: '#1976d2',
      count: userStats.totalUsers,
      screen: 'AdminUsers'
    },
    {
      id: 'posts',
      title: 'Modération des Publications',
      description: 'Modérer et gérer les publications',
      icon: 'newspaper',
      color: '#2e7d32',
      count: userStats.totalPosts,
      screen: 'AdminPosts'
    },
    {
      id: 'alerts',
      title: 'Gestion des Alertes',
      description: 'Valider et gérer les alertes de sécurité',
      icon: 'warning',
      color: '#d32f2f',
      count: userStats.totalAlerts,
      screen: 'AdminAlerts'
    },
    {
      id: 'reports',
      title: 'Signalements',
      description: 'Traiter les signalements',
      icon: 'flag',
      color: '#ff9800',
      count: userStats.pendingReports,
      screen: 'AdminReports'
    },
    {
      id: 'analytics',
      title: 'Statistiques',
      description: 'Analytics et rapports',
      icon: 'analytics',
      color: '#9c27b0',
      count: null,
      screen: 'AdminAnalytics'
    },
    {
      id: 'settings',
      title: 'Paramètres Admin',
      description: 'Configuration système',
      icon: 'settings',
      color: '#607d8b',
      count: null,
      screen: 'AdminSettings'
    },
    {
      id: 'deletionLogs',
      title: 'Logs de Suppression',
      description: 'Traçabilité des suppressions',
      icon: 'trash',
      color: '#795548',
      count: null,
      screen: 'AdminDeletionLogs'
    }
  ];

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      notifications.showInfo('Fonctionnalité en cours de développement', 2000);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statIcon}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const MenuItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={() => handleMenuPress(item)}
    >
      <View style={styles.menuItemContent}>
        <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
        </View>
        {item.count !== null && (
          <View style={[styles.menuBadge, { backgroundColor: item.color }]}>
            <Text style={styles.menuBadgeText}>{item.count}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administration</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadAdminStats}
        >
          <Ionicons name="refresh" size={24} color="#1976d2" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Utilisateurs"
            value={userStats.totalUsers}
            icon="people"
            color="#1976d2"
            subtitle={`${userStats.activeUsers} actifs`}
          />
          <StatCard
            title="Premium"
            value={userStats.premiumUsers}
            icon="star"
            color="#ff9800"
            subtitle="Utilisateurs premium"
          />
          <StatCard
            title="Publications"
            value={userStats.totalPosts}
            icon="newspaper"
            color="#2e7d32"
            subtitle="Total publiées"
          />
          <StatCard
            title="Alertes"
            value={userStats.totalAlerts}
            icon="warning"
            color="#d32f2f"
            subtitle="Alertes créées"
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Outils d'administration</Text>
        {adminMenuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Connecté en tant qu'administrateur
        </Text>
        <Text style={styles.footerSubtext}>
          {auth.currentUser?.email || 'admin@quartier-social.com'}
        </Text>
      </View>
    </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  menuSection: {
    padding: 20,
    paddingTop: 0,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  menuBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});
