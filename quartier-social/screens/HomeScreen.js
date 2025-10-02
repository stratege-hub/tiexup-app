import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AlertCard from '../components/AlertCard';
// import AlertModal from '../components/AlertModal';
import FeedbackPopup from '../components/FeedbackPopup';
import PostCard from '../components/PostCard';
import { useNotifications } from '../contexts/NotificationContext';
import { auth } from '../firebase';
import { getAlertsByQuartier, getPostsByQuartier, getUserData } from '../services/firebaseService';
import { RealtimeNotificationService } from '../services/realtimeNotificationService';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  
  const navigation = useNavigation();
  const notifications = useNotifications();
  const realtimeService = useRef(null);

  useEffect(() => {
    loadUserData();
    loadUserLocation();
  }, []);

  // Afficher le pop-up de feedback après connexion
  useEffect(() => {
    if (userData && !showFeedbackPopup) {
      // Afficher le pop-up une seule fois par session
      setTimeout(() => {
        setShowFeedbackPopup(true);
      }, 2000); // Délai de 2 secondes pour laisser le temps à l'interface de se charger
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.quartier && userData?.uid) {
      // Initialiser le service de notifications temps réel
      realtimeService.current = new RealtimeNotificationService(notifications);
      realtimeService.current.startListening(userData.uid, userData.quartier, userLocation);

      const unsubscribePosts = getPostsByQuartier(userData.quartier, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
      });

      const unsubscribeAlerts = getAlertsByQuartier(userData.quartier, (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAlerts(alertsData);
      });

      return () => {
        unsubscribePosts();
        unsubscribeAlerts();
        if (realtimeService.current) {
          realtimeService.current.stopAllListening();
        }
      };
    }
  }, [userData, notifications, userLocation]);

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

  const loadUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const locationResult = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'obtention de la localisation:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleEmergencyAlert = () => {
    if (!userData?.isPremium) {
      Alert.alert(
        'Fonctionnalité Premium',
        'Cette fonctionnalité est réservée aux utilisateurs premium. Contactez-nous pour activer votre compte Premium après paiement.\n\nPrix : 2000 FCFA/mois',
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
      return;
    }
  };

  const handleCreateAlert = () => {
    navigation.navigate('CreateAlert', { userData });
  };

  const renderItem = ({ item }) => {
    if (item.category) {
      // C'est une alerte - vérifier si c'est l'utilisateur actuel qui l'a créée
      const isOwnAlert = item.authorId === userData?.uid;
      return <AlertCard alert={item} userData={userData} isOwnAlert={isOwnAlert} />;
    } else {
      // C'est une publication
      return <PostCard post={item} />;
    }
  };

  // Combiner les posts et alertes et les trier par date
  const combinedData = [...posts, ...alerts].sort((a, b) => 
    new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt)
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Bouton d'alerte d'urgence */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleCreateAlert}
      >
        <Ionicons name="warning" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Pop-up de feedback */}
      <FeedbackPopup 
        visible={showFeedbackPopup}
        onClose={() => setShowFeedbackPopup(false)}
      />

      {/* Modal d'alerte */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 10,
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#d32f2f',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});