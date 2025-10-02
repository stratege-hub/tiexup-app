import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ChangeQuartierModal from '../components/ChangeQuartierModal';
import EditProfileModal from '../components/EditProfileModal';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { getUserData, getUserStats, logout } from '../services/firebaseService';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangeQuartier, setShowChangeQuartier] = useState(false);
  const [userStats, setUserStats] = useState({ postsCount: 0, alertsCount: 0, totalLikes: 0 });
  const notifications = useNotifications();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
        
        // Charger les statistiques utilisateur
        const stats = await getUserStats(user.uid);
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    }
  };

  const handleBecomePremium = () => {
    Alert.alert(
      'Devenir Premium',
      'Avec Premium, vous pourrez :\n\n• Créer des alertes de sécurité\n• Recevoir des notifications prioritaires\n• Accéder à des fonctionnalités avancées\n\nPrix : 2000 FCFA/mois\n\nContactez-nous pour activer votre compte Premium après paiement.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            Linking.openURL('tel:+22673335093');
          }
        },
        { 
          text: 'WhatsApp', 
          onPress: () => {
            Linking.openURL('https://wa.me/22673335093?text=Bonjour, je souhaite devenir membre Premium de TiexUp.');
          }
        },
        { 
          text: 'Email', 
          onPress: () => {
            Linking.openURL('mailto:hamza.zoungrana@yahoo.fr?subject=Demande Premium - TiexUp&body=Bonjour, je souhaite devenir membre Premium de TiexUp. Mon email: ' + userData.email);
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          onPress: () => {
            logout().catch((error) => {
              notifications.showError('Impossible de se déconnecter', 3000);
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleProfileUpdated = () => {
    loadUserData();
  };

  const handleQuartierUpdated = () => {
    loadUserData();
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
          {userData.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{userData.displayName}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
        <Text style={styles.userQuartier}>📍 {userData.quartier}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.postsCount}</Text>
          <Text style={styles.statLabel}>Publications</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.alertsCount}</Text>
          <Text style={styles.statLabel}>Alertes créées</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.totalLikes}</Text>
          <Text style={styles.statLabel}>Réactions</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowEditProfile(true)}
        >
          <Ionicons name="create-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Modifier le profil</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowChangeQuartier(true)}
        >
          <Ionicons name="location" size={24} color="#666" />
          <Text style={styles.menuItemText}>Changer de quartier</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('NotificationsSettings')}
        >
          <Ionicons name="notifications" size={24} color="#666" />
          <Text style={styles.menuItemText}>Notifications</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium</Text>
        
        {!userData.isPremium ? (
          <TouchableOpacity 
            style={styles.premiumButton} 
            onPress={handleBecomePremium}
            disabled={loading}
          >
            <Ionicons name="star" size={24} color="#fff" />
            <Text style={styles.premiumButtonText}>
              {loading ? 'Traitement...' : 'Devenir Premium'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.premiumActiveContainer}>
            <Ionicons name="star" size={24} color="#ffd700" />
            <Text style={styles.premiumActiveText}>Compte Premium actif</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('Help')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Aide et support</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        
        {/* Bouton Administration - visible seulement pour les admins */}
        {userData?.email === 'admin@quartier-social.com' && (
          <TouchableOpacity 
            style={[styles.menuItem, styles.adminMenuItem]}
            onPress={() => navigation.navigate('Admin')}
          >
            <Ionicons name="settings-outline" size={24} color="#d32f2f" />
            <Text style={[styles.menuItemText, styles.adminMenuItemText]}>Administration</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
          </TouchableOpacity>
        )}
        
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('About')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>À propos</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('Privacy')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Confidentialité</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('Terms')}
        >
          <Ionicons name="document-text-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>TiexUp v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 - Tous droits réservés</Text>
      </View>

      {/* Modals */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        userData={userData}
        onProfileUpdated={handleProfileUpdated}
      />

      <ChangeQuartierModal
        visible={showChangeQuartier}
        onClose={() => setShowChangeQuartier(false)}
        userData={userData}
        onQuartierUpdated={handleQuartierUpdated}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffd700',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userQuartier: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  premiumActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e8',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  premiumActiveText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  adminMenuItem: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 3,
    borderLeftColor: '#d32f2f',
  },
  adminMenuItemText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  testMenuItem: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  testMenuItemText: {
    color: '#ff9800',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
});
