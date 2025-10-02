import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { scheduleAlertNotification } from './notificationService';
import { soundManager } from '../components/SoundManager';

// Fonction pour calculer la distance entre deux points GPS (en mètres)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en mètres
};

// Fonction pour vérifier si l'utilisateur est dans le rayon de l'alerte
const isUserInAlertRadius = (alert, userLocation) => {
    // Si l'alerte est pour tout le quartier, toujours notifier
    if (alert.radius === 'quartier') {
        return true;
    }
    
    // Si l'alerte n'a pas de localisation, notifier tout le quartier
    if (!alert.location || !userLocation) {
        return true;
    }
    
    // Calculer la distance entre l'utilisateur et l'alerte
    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        alert.location.latitude,
        alert.location.longitude
    );
    
    // Convertir le rayon en mètres
    let radiusInMeters;
    switch (alert.radius) {
        case '300m':
            radiusInMeters = 300;
            break;
        case '600m':
            radiusInMeters = 600;
            break;
        case '1km':
            radiusInMeters = 1000;
            break;
        default:
            radiusInMeters = 1000; // Par défaut, 1km
    }
    
    return distance <= radiusInMeters;
};

export class RealtimeNotificationService {
    constructor(notificationContext) {
        this.notifications = notificationContext;
        this.listeners = new Map();
        this.lastPostCount = 0;
        this.lastAlertCount = 0;
    }

    // Écouter les nouvelles publications dans un quartier
    listenToNewPosts(quartier, userId) {
        const postsQuery = query(
            collection(db, 'posts'),
            where('quartier', '==', quartier),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Vérifier s'il y a de nouvelles publications
            const newPostCount = posts.length;
            if (this.lastPostCount > 0 && newPostCount > this.lastPostCount) {
                const newPosts = posts.slice(0, newPostCount - this.lastPostCount);
                
                newPosts.forEach(post => {
                    // Ne pas notifier l'utilisateur de ses propres publications
                    if (post.authorId !== userId) {
                        this.notifications.showInfo(
                            `📝 Nouvelle publication de ${post.authorName}`,
                            4000
                        );
                    }
                });
            }
            this.lastPostCount = newPostCount;
        });

        this.listeners.set(`posts_${quartier}`, unsubscribe);
        return unsubscribe;
    }

    // Écouter les nouvelles alertes dans un quartier
    listenToNewAlerts(quartier, userId, userLocation = null) {
        const alertsQuery = query(
            collection(db, 'alerts'),
            where('quartier', '==', quartier),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
            const alerts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Vérifier s'il y a de nouvelles alertes
            const newAlertCount = alerts.length;
            if (this.lastAlertCount > 0 && newAlertCount > this.lastAlertCount) {
                const newAlerts = alerts.slice(0, newAlertCount - this.lastAlertCount);
                
                newAlerts.forEach(alert => {
                    // Ne pas notifier l'utilisateur de ses propres alertes
                    if (alert.authorId !== userId) {
                        // Vérifier si l'utilisateur est dans le rayon de l'alerte
                        if (isUserInAlertRadius(alert, userLocation)) {
                            // Notification visuelle
                            this.notifications.showAlert(
                                `🚨 Nouvelle alerte ${alert.category} de ${alert.authorName}`,
                                6000
                            );
                            
                            // Notification sonore avec son d'urgence
                            scheduleAlertNotification(
                                `🚨 ALERTE ${alert.category.toUpperCase()}`,
                                alert.message || `Alerte de sécurité dans votre quartier`,
                                {
                                    type: 'alert',
                                    alertId: alert.id,
                                    category: alert.category,
                                    quartier: alert.quartier,
                                    authorName: alert.authorName,
                                    urgent: true
                                }
                            );

                            // Jouer le son d'alerte immédiatement
                            soundManager.playAlertSoundByCategory(alert.category);
                        }
                    } else {
                        // Notifier que l'alerte a été envoyée
                        this.notifications.showSuccess(
                            `✅ Votre alerte ${alert.category} a été envoyée à tous les résidents`,
                            5000
                        );
                    }
                });
            }
            this.lastAlertCount = newAlertCount;
        });

        this.listeners.set(`alerts_${quartier}`, unsubscribe);
        return unsubscribe;
    }

    // Écouter les confirmations d'alertes
    listenToAlertConfirmations(alertId, userId) {
        const alertRef = doc(db, 'alerts', alertId);
        
        const unsubscribe = onSnapshot(alertRef, (doc) => {
            if (doc.exists()) {
                const alertData = doc.data();
                
                // Vérifier les changements de statut
                if (alertData.status === 'CONFIRME' && alertData.authorId === userId) {
                    this.notifications.showSuccess(
                        `✅ Votre alerte ${alertData.category} a été confirmée par la communauté`,
                        5000
                    );
                } else if (alertData.status === 'SUSPECT' && alertData.authorId === userId) {
                    this.notifications.showWarning(
                        `⚠️ Votre alerte ${alertData.category} a été signalée comme suspecte`,
                        5000
                    );
                }
            }
        });

        this.listeners.set(`alert_${alertId}`, unsubscribe);
        return unsubscribe;
    }

    // Démarrer l'écoute pour un utilisateur et son quartier
    startListening(userId, quartier, userLocation = null) {
        this.listenToNewPosts(quartier, userId);
        this.listenToNewAlerts(quartier, userId, userLocation);
    }

    // Arrêter toutes les écoutes
    stopAllListening() {
        this.listeners.forEach((unsubscribe) => {
            unsubscribe();
        });
        this.listeners.clear();
        this.lastPostCount = 0;
        this.lastAlertCount = 0;
    }

    // Arrêter l'écoute d'un type spécifique
    stopListening(type) {
        const unsubscribe = this.listeners.get(type);
        if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(type);
        }
    }
}
