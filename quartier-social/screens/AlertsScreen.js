import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AlertCard from '../components/AlertCard';
import { auth } from '../firebase';
import { getAlertsByQuartier, getUserData } from '../services/firebaseService';

export default function AlertsScreen() {
  const [userData, setUserData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, suspect

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData?.quartier) {
      const unsubscribe = getAlertsByQuartier(userData.quartier, (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAlerts(alertsData);
      });

      return unsubscribe;
    }
  }, [userData]);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getFilteredAlerts = () => {
    switch (filter) {
      case 'pending':
        return alerts.filter(alert => alert.status === 'EN_ATTENTE');
      case 'confirmed':
        return alerts.filter(alert => alert.status === 'CONFIRME');
      case 'suspect':
        return alerts.filter(alert => alert.status === 'SUSPECT');
      default:
        return alerts;
    }
  };

  const getFilterCount = (status) => {
    switch (status) {
      case 'pending':
        return alerts.filter(alert => alert.status === 'EN_ATTENTE').length;
      case 'confirmed':
        return alerts.filter(alert => alert.status === 'CONFIRME').length;
      case 'suspect':
        return alerts.filter(alert => alert.status === 'SUSPECT').length;
      default:
        return alerts.length;
    }
  };

  const renderFilterButton = (filterKey, label) => {
    const isActive = filter === filterKey;
    const count = getFilterCount(filterKey);

    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterKey)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <AlertCard alert={item} userData={userData} />
  );

  const filteredAlerts = getFilteredAlerts();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertes de Sécurité</Text>
        <Text style={styles.subtitle}>
          Historique des alertes de {userData?.quartier}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', 'Toutes')}
          {renderFilterButton('pending', 'En attente')}
          {renderFilterButton('confirmed', 'Confirmées')}
          {renderFilterButton('suspect', 'Suspectes')}
        </ScrollView>
      </View>

      {filteredAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucune alerte</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' 
              ? 'Aucune alerte n\'a été signalée dans votre quartier'
              : `Aucune alerte ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmée' : 'suspecte'}`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAlerts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomColor: '#f0f0f0',
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
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});
