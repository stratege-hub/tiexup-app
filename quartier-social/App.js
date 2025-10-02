import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
// import { registerForPushNotifications, setupNotificationListeners } from './services/notificationService';
import { permissionService } from './services/permissionService';

// Screens
import AboutScreen from './screens/AboutScreen';
import AdminAlertsScreen from './screens/AdminAlertsScreen';
import AdminAnalyticsScreen from './screens/AdminAnalyticsScreen';
import AdminDeletionLogsScreen from './screens/AdminDeletionLogsScreen';
import AdminPostsScreen from './screens/AdminPostsScreen';
import AdminReportsScreen from './screens/AdminReportsScreen';
import AdminScreen from './screens/AdminScreen';
import AdminSettingsScreen from './screens/AdminSettingsScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AlertsScreen from './screens/AlertsScreen';
import AuthScreen from './screens/AuthScreen';
import CreateAlertScreen from './screens/CreateAlertScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import HelpScreen from './screens/HelpScreen';
import HomeScreen from './screens/HomeScreen';
import NotificationsSettingsScreen from './screens/NotificationsSettingsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import ProfileScreen from './screens/ProfileScreen';
import TermsScreen from './screens/TermsScreen';

// Components
import NotificationManager from './components/NotificationManager';

// Contexts
import { NotificationProvider } from './contexts/NotificationContext';

// Services
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { checkMaintenanceMode } from './services/adminService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MaintenanceScreen() {
  return (
    <View style={styles.maintenanceContainer}>
      <View style={styles.maintenanceContent}>
        <Ionicons name="construct" size={80} color="#1976d2" />
        <Text style={styles.maintenanceTitle}>Maintenance en cours</Text>
        <Text style={styles.maintenanceMessage}>
          L'application est temporairement indisponible pour maintenance.
          {'\n\n'}
          Nous travaillons pour améliorer votre expérience.
          {'\n\n'}
          Merci de votre patience.
        </Text>
        <View style={styles.maintenanceFooter}>
          <Text style={styles.maintenanceFooterText}>
            TiexUp
          </Text>
        </View>
      </View>
    </View>
  );
}

function TabNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NotificationsSettings" 
        component={NotificationsSettingsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="CreateAlert" 
        component={CreateAlertScreen} 
        options={{ title: 'Nouvelle Alerte' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ title: 'À propos' }}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{ title: 'Confidentialité' }}
      />
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{ title: 'Conditions d\'utilisation' }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ title: 'Aide et support' }}
      />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Create') {
            iconName = 'add-circle';
          } else if (route.name === 'Alerts') {
            iconName = 'notifications';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#1976d2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Fil du Quartier' }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreatePostScreen} 
        options={{ title: 'Nouvelle Publication' }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen} 
        options={{ title: 'Alertes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [permissionsGranted, setPermissionsGranted] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Demander les permissions au démarrage
      if (user) {
        try {
          console.log('🔐 Demande des permissions pour l\'utilisateur connecté...');
          const permissionResult = await permissionService.requestAllPermissions();
          setPermissionsGranted(permissionResult.allGranted);
          
          // Afficher une alerte si des permissions critiques sont refusées
          if (!permissionResult.allGranted) {
            permissionService.showPermissionAlert(permissionResult.denied);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la demande des permissions:', error);
          setPermissionsGranted(false);
        }
      } else {
        setPermissionsGranted(false);
      }
      
      // Vérifier le mode maintenance seulement si un utilisateur est connecté
      if (user) {
        try {
          const isMaintenance = await checkMaintenanceMode();
          setMaintenanceMode(isMaintenance);
        } catch (error) {
          console.error('Erreur lors de la vérification du mode maintenance:', error);
          setMaintenanceMode(false);
        }
      } else {
        setMaintenanceMode(false);
      }
      
      setLoading(false);
      
      // Les notifications seront configurées plus tard
      // pour éviter les erreurs Firebase Messaging
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Chargement...</Text>
        {user && (
          <Text style={styles.permissionText}>
            Demande des permissions nécessaires...
          </Text>
        )}
      </View>
    );
  }

  // Si mode maintenance activé, afficher l'écran de maintenance
  if (maintenanceMode) {
    return (
      <View style={styles.container}>
        <MaintenanceScreen />
      </View>
    );
  }

  return (
    <NotificationProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        {user ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="Admin" 
              component={AdminScreen}
              options={{ title: 'Administration' }}
            />
            <Stack.Screen 
              name="AdminUsers" 
              component={AdminUsersScreen}
              options={{ title: 'Gestion des Utilisateurs' }}
            />
            <Stack.Screen 
              name="AdminPosts" 
              component={AdminPostsScreen}
              options={{ title: 'Modération des Publications' }}
            />
            <Stack.Screen 
              name="AdminAlerts" 
              component={AdminAlertsScreen}
              options={{ title: 'Gestion des Alertes' }}
            />
            <Stack.Screen 
              name="AdminReports" 
              component={AdminReportsScreen}
              options={{ title: 'Signalements' }}
            />
            <Stack.Screen 
              name="AdminAnalytics" 
              component={AdminAnalyticsScreen}
              options={{ title: 'Statistiques' }}
            />
            <Stack.Screen 
              name="AdminSettings" 
              component={AdminSettingsScreen}
              options={{ title: 'Configuration Système' }}
            />
            <Stack.Screen 
              name="AdminDeletionLogs" 
              component={AdminDeletionLogsScreen}
              options={{ title: 'Logs de Suppression' }}
            />
            <Stack.Screen 
              name="NotificationsSettings" 
              component={NotificationsSettingsScreen}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen}
              options={{ title: 'À propos' }}
            />
            <Stack.Screen 
              name="Privacy" 
              component={PrivacyScreen}
              options={{ title: 'Confidentialité' }}
            />
            <Stack.Screen 
              name="Terms" 
              component={TermsScreen}
              options={{ title: 'Conditions d\'utilisation' }}
            />
            <Stack.Screen 
              name="Help" 
              component={HelpScreen}
              options={{ title: 'Aide et support' }}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
          </Stack.Navigator>
        )}
        <NotificationManager />
      </NavigationContainer>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 20,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  maintenanceContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  maintenanceContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 400,
  },
  maintenanceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  maintenanceMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  maintenanceFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  maintenanceFooterText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
});