import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// ===== GESTION DES UTILISATEURS =====

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      throw new Error('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

export const blockUser = async (userId) => {
  return updateUserStatus(userId, { 
    isBlocked: true, 
    isActive: false,
    blockedAt: new Date()
  });
};

export const unblockUser = async (userId) => {
  return updateUserStatus(userId, { 
    isBlocked: false, 
    isActive: true,
    unblockedAt: new Date()
  });
};

export const makeUserPremium = async (userId) => {
  return updateUserStatus(userId, { 
    isPremium: true,
    premiumAt: new Date()
  });
};

export const removeUserPremium = async (userId) => {
  return updateUserStatus(userId, { 
    isPremium: false,
    premiumRemovedAt: new Date()
  });
};

// ===== GESTION DES PUBLICATIONS =====

export const getAllPosts = async () => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des publications:', error);
    throw error;
  }
};

export const getPostsByQuartier = async (quartier) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef, 
      where('quartier', '==', quartier),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des publications par quartier:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la publication:', error);
    throw error;
  }
};

export const moderatePost = async (postId, action, adminId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      moderated: true,
      moderationAction: action,
      moderatedBy: adminId,
      moderatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la modération de la publication:', error);
    throw error;
  }
};

// ===== GESTION DES ALERTES =====

export const getAllAlerts = async () => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    throw error;
  }
};

export const getAlertsByStatus = async (status) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes par statut:', error);
    throw error;
  }
};

export const updateAlertStatus = async (alertId, status, adminId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      status: status,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'alerte:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await deleteDoc(alertRef);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'alerte:', error);
    throw error;
  }
};

// ===== GESTION DES SIGNALEMENTS =====

export const getAllReports = async () => {
  try {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    throw error;
  }
};

export const getReportsByStatus = async (status) => {
  try {
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements par statut:', error);
    throw error;
  }
};

export const updateReportStatus = async (reportId, status, adminId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status: status,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du signalement:', error);
    throw error;
  }
};

export const resolveReport = async (reportId, action, adminId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status: 'resolved',
      resolution: action,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la résolution du signalement:', error);
    throw error;
  }
};

// ===== STATISTIQUES ET ANALYTICS =====

export const getAdminStats = async () => {
  try {
    // Compter les utilisateurs
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const totalUsers = usersSnapshot.size;
    
    const activeUsers = usersSnapshot.docs.filter(doc => 
      doc.data().isActive && !doc.data().isBlocked
    ).length;
    
    const premiumUsers = usersSnapshot.docs.filter(doc => 
      doc.data().isPremium
    ).length;

    // Compter les publications
    const postsQuery = query(collection(db, 'posts'));
    const postsSnapshot = await getDocs(postsQuery);
    const totalPosts = postsSnapshot.size;

    // Compter les alertes
    const alertsQuery = query(collection(db, 'alerts'));
    const alertsSnapshot = await getDocs(alertsQuery);
    const totalAlerts = alertsSnapshot.size;

    // Compter les signalements en attente
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'pending')
    );
    const reportsSnapshot = await getDocs(reportsQuery);
    const pendingReports = reportsSnapshot.size;

    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalPosts,
      totalAlerts,
      pendingReports
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
};

export const getQuartierStats = async () => {
  try {
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    const quartierCounts = {};
    usersSnapshot.docs.forEach(doc => {
      const quartier = doc.data().quartier;
      if (quartier) {
        quartierCounts[quartier] = (quartierCounts[quartier] || 0) + 1;
      }
    });

    return Object.entries(quartierCounts)
      .map(([quartier, count]) => ({ quartier, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques par quartier:', error);
    throw error;
  }
};

export const getEngagementStats = async () => {
  try {
    const postsQuery = query(collection(db, 'posts'));
    const postsSnapshot = await getDocs(postsQuery);
    
    let totalLikes = 0;
    let totalComments = 0;
    
    postsSnapshot.docs.forEach(doc => {
      const postData = doc.data();
      totalLikes += postData.likesCount || 0;
      totalComments += postData.commentsCount || 0;
    });

    return {
      totalLikes,
      totalComments,
      avgEngagement: postsSnapshot.size > 0 ? 
        (totalLikes + totalComments) / postsSnapshot.size : 0
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques d\'engagement:', error);
    throw error;
  }
};

// ===== ÉCOUTE EN TEMPS RÉEL =====

export const listenToAdminStats = (callback) => {
  const usersRef = collection(db, 'users');
  const postsRef = collection(db, 'posts');
  const alertsRef = collection(db, 'alerts');
  const reportsRef = collection(db, 'reports');

  const unsubscribeUsers = onSnapshot(usersRef, () => {
    getAdminStats().then(callback).catch(console.error);
  });

  const unsubscribePosts = onSnapshot(postsRef, () => {
    getAdminStats().then(callback).catch(console.error);
  });

  const unsubscribeAlerts = onSnapshot(alertsRef, () => {
    getAdminStats().then(callback).catch(console.error);
  });

  const unsubscribeReports = onSnapshot(reportsRef, () => {
    getAdminStats().then(callback).catch(console.error);
  });

  return () => {
    unsubscribeUsers();
    unsubscribePosts();
    unsubscribeAlerts();
    unsubscribeReports();
  };
};


// ===== GESTION DES PARAMÈTRES SYSTÈME =====

export const getSystemSettings = async () => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!auth.currentUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }
    
    // Utiliser la collection 'users' qui fonctionne déjà
    const settingsRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(settingsRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Vérifier si l'utilisateur a des paramètres système stockés
      if (userData.systemSettings) {
        return userData.systemSettings;
      } else {
        // Créer les paramètres par défaut et les stocker dans le profil utilisateur
        const defaultSettings = {
          maintenanceMode: false,
          newUserRegistration: true,
          alertNotifications: true,
          autoModeration: false,
          emailNotifications: true,
          pushNotifications: true,
          dataRetention: 365,
          maxFileSize: 10,
          maxPostsPerDay: 50,
          alertCooldown: 30,
          lastModified: new Date(),
          createdBy: auth.currentUser?.email || 'admin'
        };
        
        await updateDoc(settingsRef, { 
          systemSettings: defaultSettings,
          lastSystemUpdate: new Date()
        });
        
        return defaultSettings;
      }
    } else {
      throw new Error('Document utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    
    // En cas d'erreur, retourner les paramètres par défaut sans les sauvegarder
    return {
      maintenanceMode: false,
      newUserRegistration: true,
      alertNotifications: true,
      autoModeration: false,
      emailNotifications: true,
      pushNotifications: true,
      dataRetention: 365,
      maxFileSize: 10,
      maxPostsPerDay: 50,
      alertCooldown: 30,
      lastModified: new Date(),
      offline: true
    };
  }
};

export const updateSystemSettings = async (settings) => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!auth.currentUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }
    
    const settingsRef = doc(db, 'users', auth.currentUser.uid);
    const updatedSettings = {
      ...settings,
      lastModified: new Date(),
      updatedBy: auth.currentUser.email || 'admin'
    };
    
    await updateDoc(settingsRef, { 
      systemSettings: updatedSettings,
      lastSystemUpdate: new Date()
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    throw error;
  }
};

export const resetSystemSettings = async () => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!auth.currentUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }
    
    const defaultSettings = {
      maintenanceMode: false,
      newUserRegistration: true,
      alertNotifications: true,
      autoModeration: false,
      emailNotifications: true,
      pushNotifications: true,
      dataRetention: 365,
      maxFileSize: 10,
      maxPostsPerDay: 50,
      alertCooldown: 30,
      lastModified: new Date(),
      resetBy: auth.currentUser.email || 'admin'
    };
    
    const settingsRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(settingsRef, { 
      systemSettings: defaultSettings,
      lastSystemUpdate: new Date()
    });
    
    return defaultSettings;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
    throw error;
  }
};

// Fonction pour récupérer les paramètres système globaux (depuis le document admin)
export const getGlobalSystemSettings = async () => {
  try {
    // Trouver l'utilisateur admin
    const adminQuery = query(
      collection(db, 'users'),
      where('email', '==', 'admin@quartier-social.com')
    );
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      console.log('⚠️ Admin non trouvé, utilisation des paramètres par défaut');
      return getDefaultSystemSettings();
    }
    
    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();
    
    // Vérifier si l'admin a des paramètres système stockés
    if (adminData.systemSettings) {
      console.log('✅ Paramètres système récupérés depuis l\'admin');
      return adminData.systemSettings;
    } else {
      console.log('⚠️ Aucun paramètre système trouvé chez l\'admin, utilisation des paramètres par défaut');
      return getDefaultSystemSettings();
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des paramètres globaux:', error);
    console.log('🔄 Utilisation des paramètres par défaut en cas d\'erreur');
    return getDefaultSystemSettings();
  }
};

// Fonction pour obtenir les paramètres par défaut
const getDefaultSystemSettings = () => {
  return {
    maintenanceMode: false,
    newUserRegistration: true,
    alertNotifications: true,
    autoModeration: false,
    emailNotifications: true,
    pushNotifications: true,
    dataRetention: 365,
    maxFileSize: 10,
    maxPostsPerDay: 50,
    alertCooldown: 30,
    maxCommentsPerPost: 100,
    maxRepliesPerComment: 50,
    moderationThreshold: 5,
    autoDeleteAfterDays: 30,
    enableLocationTracking: true,
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    maxFileUploadsPerDay: 10,
    maxAlertsPerDay: 5,
    enableUserReports: true,
    enableContentModeration: true,
    enableSpamDetection: true,
    enableDuplicateDetection: true,
    enableAutoModeration: false,
    enableManualModeration: true,
    enableUserBlocking: true,
    enableContentFlagging: true,
    enableAnonymousReports: false,
    enableModeratorNotifications: true,
    enableAdminNotifications: true,
    enableSystemAlerts: true,
    enableMaintenanceMode: false,
    enableDebugMode: false,
    enableAnalytics: true,
    enableUserTracking: true,
    enableContentTracking: true,
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    enableSecurityTracking: true,
    enableAuditLogging: true,
    enableComplianceLogging: true,
    enableDataExport: true,
    enableDataImport: true,
    enableBackup: true,
    enableRestore: true,
    enableMigration: true,
    enableUpgrade: true,
    enableDowngrade: false,
    enableRollback: true,
    enableVersioning: true,
    enableHistory: true,
    enableArchiving: true,
    enableCleanup: true,
    enableOptimization: true,
    enableCompression: true,
    enableEncryption: true,
    enableSecurity: true,
    enablePrivacy: true,
    enableCompliance: true,
    enableGDPR: true,
    enableCCPA: true,
    enableHIPAA: false,
    enableSOX: false,
    enablePCI: false,
    enableISO27001: false,
    enableSOC2: false,
    enableFISMA: false,
    enableNIST: false,
    enableCOBIT: false,
    enableITIL: false,
    enableCOSO: false,
    enableCOSO_ERM: false,
    enableCOSO_IC: false,
    enableCOSO_CC: false,
    enableCOSO_MC: false,
    enableCOSO_OC: false,
    enableCOSO_RM: false,
    enableCOSO_IM: false,
    enableCOSO_CM: false,
    enableCOSO_AM: false,
    enableCOSO_PM: false,
    enableCOSO_QM: false,
    enableCOSO_SM: false,
    enableCOSO_TM: false,
    enableCOSO_UM: false,
    enableCOSO_VM: false,
    enableCOSO_WM: false,
    enableCOSO_XM: false,
    enableCOSO_YM: false,
    enableCOSO_ZM: false
  };
};

// ===== VÉRIFICATIONS DES LIMITES SYSTÈME =====

export const checkUserPostLimit = async (userId) => {
  try {
    const settings = await getGlobalSystemSettings(); // Utiliser les paramètres globaux
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      where('createdAt', '>=', today)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    const postsCount = postsSnapshot.size;
    
    return {
      canPost: postsCount < settings.maxPostsPerDay,
      postsToday: postsCount,
      limit: settings.maxPostsPerDay,
      remaining: Math.max(0, settings.maxPostsPerDay - postsCount)
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de la limite de posts:', error);
    return { canPost: true, postsToday: 0, limit: 50, remaining: 50 };
  }
};

export const checkUserAlertCooldown = async (userId) => {
  try {
    const settings = await getGlobalSystemSettings(); // Utiliser les paramètres globaux
    
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const alertsSnapshot = await getDocs(alertsQuery);
    
    if (alertsSnapshot.empty) {
      return { canCreateAlert: true, timeRemaining: 0 };
    }
    
    const lastAlert = alertsSnapshot.docs[0].data();
    const now = new Date();
    const lastAlertTime = lastAlert.createdAt.toDate();
    const timeDiff = now - lastAlertTime;
    const cooldownMs = settings.alertCooldown * 60 * 1000; // Convertir en millisecondes
    
    const canCreateAlert = timeDiff >= cooldownMs;
    const timeRemaining = canCreateAlert ? 0 : Math.ceil((cooldownMs - timeDiff) / 60000); // En minutes
    
    return { canCreateAlert, timeRemaining };
  } catch (error) {
    console.error('Erreur lors de la vérification du délai d\'alerte:', error);
    return { canCreateAlert: true, timeRemaining: 0 };
  }
};

export const checkMaintenanceMode = async () => {
  try {
    const settings = await getGlobalSystemSettings(); // Utiliser les paramètres globaux
    return settings.maintenanceMode || false;
  } catch (error) {
    console.error('Erreur lors de la vérification du mode maintenance:', error);
    return false;
  }
};

export const checkNewUserRegistration = async () => {
  try {
    const settings = await getGlobalSystemSettings(); // Utiliser les paramètres globaux
    return settings.newUserRegistration !== false;
  } catch (error) {
    console.error('Erreur lors de la vérification des inscriptions:', error);
    return true;
  }
};

export const listenToSystemSettings = (callback) => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!auth.currentUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }
    
    const settingsRef = doc(db, 'users', auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        
        if (userData.systemSettings) {
          callback(userData.systemSettings);
        } else {
          const defaultSettings = {
            maintenanceMode: false,
            newUserRegistration: true,
            alertNotifications: true,
            autoModeration: false,
            emailNotifications: true,
            pushNotifications: true,
            dataRetention: 365,
            maxFileSize: 10,
            maxPostsPerDay: 50,
            alertCooldown: 30,
            lastModified: new Date()
          };
          callback(defaultSettings);
        }
      } else {
        const defaultSettings = {
          maintenanceMode: false,
          newUserRegistration: true,
          alertNotifications: true,
          autoModeration: false,
          emailNotifications: true,
          pushNotifications: true,
          dataRetention: 365,
          maxFileSize: 10,
          maxPostsPerDay: 50,
          alertCooldown: 30,
          lastModified: new Date()
        };
        callback(defaultSettings);
      }
    }, (error) => {
      console.error('Erreur lors de l\'écoute des paramètres:', error);
      // En cas d'erreur, utiliser les paramètres par défaut
      const defaultSettings = {
        maintenanceMode: false,
        newUserRegistration: true,
        alertNotifications: true,
        autoModeration: false,
        emailNotifications: true,
        pushNotifications: true,
        dataRetention: 365,
        maxFileSize: 10,
        maxPostsPerDay: 50,
        alertCooldown: 30,
        lastModified: new Date(),
        offline: true
      };
      callback(defaultSettings);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Erreur lors de l\'écoute des paramètres:', error);
    throw error;
  }
};
