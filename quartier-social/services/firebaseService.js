import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Quartiers prédéfinis
export const QUARTIERS = [
  '1200 logements',
  'Kamsonghin',
  'Ouaga 2000',
  'Zogona',
  'Cissin',
  'Dassasgho',
  'Gounghin',
  'Koulouba',
  'Patte d\'Oie',
  'Secteur 15',
  'Dag Noen',
  'Kalgondin'
];

// Options de rayon pour les publications et alertes
export const RADIUS_OPTIONS = [
  { value: '300m', label: '300 mètres', description: 'Zone immédiate' },
  { value: '600m', label: '600 mètres', description: 'Quartier proche' },
  { value: '1km', label: '1 kilomètre', description: 'Zone étendue' },
  { value: 'quartier', label: 'Tout le quartier', description: 'Tous les résidents' }
];

// Authentification
export const signUp = async (email, password, displayName, quartier) => {
  try {
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil
    await updateProfile(user, { displayName });
    
    // Créer le document utilisateur dans Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      quartier,
      isPremium: false,
      createdAt: new Date(),
      fcmToken: null
    });
    
    return user;
  } catch (error) {
    console.error('❌ Message d\'erreur:', error.message);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Utilisateur
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    throw error;
  }
};

export const updateUserPremium = async (uid, isPremium) => {
  try {
    await updateDoc(doc(db, 'users', uid), { isPremium });
  } catch (error) {
    throw error;
  }
};

// Publications
export const createPost = async (authorId, authorName, quartier, content, imageUrl = null, radius = 'quartier') => {
  try {
    // console.log('🔍 Création de publication avec:', {
    //   authorId,
    //   authorName,
    //   quartier,
    //   content: content.substring(0, 50) + '...',
    //   imageUrl,
    //   radius
    // });

    const postData = {
      authorId,
      authorName,
      quartier,
      content,
      imageUrl,
      radius,
      createdAt: new Date(),
      likes: [],
      likesCount: 0,
      commentsCount: 0
    };
    
    // console.log('🔍 Données de publication:', postData);
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    // console.log('✅ Publication créée avec ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur lors de la création de publication:', error);
    throw error;
  }
};

export const getPostsByQuartier = (quartier, callback) => {
  const q = query(
    collection(db, 'posts'),
    where('quartier', '==', quartier),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, callback);
};

// Alertes
export const createAlert = async (authorId, authorName, quartier, category, message, location, radius = 'quartier') => {
  try {
    const alertData = {
      authorId,
      authorName,
      quartier,
      category,
      message,
      location,
      radius,
      status: 'EN_ATTENTE',
      confirmCount: 0,
      falseCount: 0,
      createdAt: new Date(),
      confirmedBy: [],
      falseBy: []
    };
    
    const docRef = await addDoc(collection(db, 'alerts'), alertData);
    const alertId = docRef.id;
    
    return alertId;
  } catch (error) {
    throw error;
  }
};

export const getAlertsByQuartier = (quartier, callback) => {
  const q = query(
    collection(db, 'alerts'),
    where('quartier', '==', quartier),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, callback);
};

export const confirmAlert = async (alertId, userId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      confirmCount: increment(1),
      confirmedBy: [...(await getDoc(alertRef)).data().confirmedBy, userId]
    });
    
    // Vérifier si l'alerte doit être confirmée
    const alertDoc = await getDoc(alertRef);
    const alertData = alertDoc.data();
    
    if (alertData.confirmCount >= 3) {
      await updateDoc(alertRef, { status: 'CONFIRME' });
    }
  } catch (error) {
    throw error;
  }
};

export const reportFalseAlert = async (alertId, userId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      falseCount: increment(1),
      falseBy: [...(await getDoc(alertRef)).data().falseBy, userId]
    });
    
    // Vérifier si l'alerte doit être marquée comme suspecte
    const alertDoc = await getDoc(alertRef);
    const alertData = alertDoc.data();
    
    if (alertData.falseCount >= 3) {
      await updateDoc(alertRef, { status: 'SUSPECT' });
    }
  } catch (error) {
    throw error;
  }
};

// Gestion des likes et commentaires
export const toggleLike = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Publication non trouvée');
    }
    
    const postData = postDoc.data();
    const likes = postData.likes || [];
    const isLiked = likes.includes(userId);
    
    let newLikes;
    if (isLiked) {
      // Retirer le like
      newLikes = likes.filter(id => id !== userId);
    } else {
      // Ajouter le like
      newLikes = [...likes, userId];
    }
    
    await updateDoc(postRef, {
      likes: newLikes,
      likesCount: newLikes.length
    });
    
    return { success: true, isLiked: !isLiked, likesCount: newLikes.length };
  } catch (error) {
    console.error('Erreur lors du toggle like:', error);
    throw error;
  }
};

export const addComment = async (postId, userId, userName, comment) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    
    await addDoc(commentsRef, {
      userId,
      userName,
      authorId: userId, // Ajout du champ authorId requis par les règles
      comment,
      createdAt: new Date()
    });
    
    // Mettre à jour le compteur de commentaires
    await updateCommentsCount(postId);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    throw error;
  }
};

// Supprimer un commentaire
export const deleteComment = async (postId, commentId, userId, userName) => {
  try {
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    
    // Récupérer les données du commentaire avant suppression pour le log
    const commentDoc = await getDoc(commentRef);
    const commentData = commentDoc.exists() ? commentDoc.data() : {};
    
    // Enregistrer le log de suppression
    await logDeletion('comment', commentId, userId, userName, {
      comment: commentData.comment?.substring(0, 100) + '...',
      postId: postId,
      createdAt: commentData.createdAt
    });
    
    await deleteDoc(commentRef);
    
    // Mettre à jour le compteur de commentaires
    await updateCommentsCount(postId);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    throw error;
  }
};

// Supprimer une réponse
export const deleteReply = async (replyId, postId, userId, userName) => {
  try {
    const replyRef = doc(db, 'replies', replyId);
    
    // Récupérer les données de la réponse avant suppression pour le log
    const replyDoc = await getDoc(replyRef);
    const replyData = replyDoc.exists() ? replyDoc.data() : {};
    
    // Enregistrer le log de suppression
    await logDeletion('reply', replyId, userId, userName, {
      reply: replyData.reply?.substring(0, 100) + '...',
      postId: postId,
      commentId: replyData.commentId,
      createdAt: replyData.createdAt
    });
    
    await deleteDoc(replyRef);
    
    // Mettre à jour le compteur de commentaires
    await updateCommentsCount(postId);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la réponse:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le compteur de commentaires
export const updateCommentsCount = async (postId) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    const commentsCount = commentsSnapshot.size;
    
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: commentsCount
    });
    
    return commentsCount;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur de commentaires:', error);
    throw error;
  }
};

export const getComments = (postId, callback) => {
  const commentsRef = collection(db, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, callback);
};

// Signalement de publications
export const reportPost = async (postId, userId, reason) => {
  try {
    const reportData = {
      postId,
      userId,
      reason,
      createdAt: new Date()
    };
    
    await addDoc(collection(db, 'reports'), reportData);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    throw error;
  }
};

// Réponses aux commentaires
export const addReplyToComment = async (postId, commentId, userId, userName, reply) => {
  try {
    // Utiliser une collection séparée pour les réponses
    const repliesRef = collection(db, 'replies');
    
    await addDoc(repliesRef, {
      postId,
      commentId,
      userId,
      userName,
      authorId: userId, // Ajout du champ authorId requis par les règles
      reply,
      createdAt: new Date(),
      likes: [],
      likesCount: 0
    });
    
    // Mettre à jour le compteur de commentaires (les réponses comptent comme des commentaires)
    await updateCommentsCount(postId);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse:', error);
    throw error;
  }
};

// Récupérer les réponses d'un commentaire
export const getCommentReplies = (postId, commentId, callback) => {
  const repliesRef = collection(db, 'replies');
  // Utiliser seulement un filtre pour éviter l'index composite
  const q = query(
    repliesRef, 
    where('commentId', '==', commentId)
  );
  
  return onSnapshot(q, (snapshot) => {
    // Filtrer et trier manuellement côté client
    const repliesData = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(reply => reply.postId === postId) // Filtre côté client
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA - dateB; // Tri croissant
      });
    
    // Appeler le callback avec les données triées
    callback({ docs: repliesData.map(reply => ({ id: reply.id, data: () => reply })) });
  });
};

// Réagir à un commentaire (like)
export const toggleCommentLike = async (postId, commentId, userId) => {
  try {
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error('Commentaire non trouvé');
    }
    
    const commentData = commentDoc.data();
    const likes = commentData.likes || [];
    const isLiked = likes.includes(userId);
    
    let newLikes;
    if (isLiked) {
      newLikes = likes.filter(id => id !== userId);
    } else {
      newLikes = [...likes, userId];
    }
    
    await updateDoc(commentRef, {
      likes: newLikes,
      likesCount: newLikes.length
    });
    
    return { success: true, isLiked: !isLiked, likesCount: newLikes.length };
  } catch (error) {
    console.error('Erreur lors du toggle like commentaire:', error);
    throw error;
  }
};

// Réagir à une réponse (like)
export const toggleReplyLike = async (replyId, userId) => {
  try {
    const replyRef = doc(db, 'replies', replyId);
    const replyDoc = await getDoc(replyRef);
    
    if (!replyDoc.exists()) {
      throw new Error('Réponse non trouvée');
    }
    
    const replyData = replyDoc.data();
    const likes = replyData.likes || [];
    const isLiked = likes.includes(userId);
    
    let newLikes;
    if (isLiked) {
      newLikes = likes.filter(id => id !== userId);
    } else {
      newLikes = [...likes, userId];
    }
    
    await updateDoc(replyRef, {
      likes: newLikes,
      likesCount: newLikes.length
    });
    
    return { success: true, isLiked: !isLiked, likesCount: newLikes.length };
  } catch (error) {
    console.error('Erreur lors du toggle like réponse:', error);
    throw error;
  }
};

// Mise à jour du profil utilisateur
export const updateUserProfile = async (userId, displayName) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      displayName: displayName,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

// Mise à jour du quartier utilisateur
export const updateUserQuartier = async (userId, quartier) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      quartier: quartier,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quartier:', error);
    throw error;
  }
};

// Fonction utilitaire pour enregistrer les logs de suppression
const logDeletion = async (type, itemId, userId, userName, itemData = {}) => {
  try {
    const logData = {
      type, // 'post', 'comment', 'reply', 'alert'
      itemId,
      userId,
      userName,
      itemData, // Données de l'élément supprimé pour référence
      deletedAt: new Date(),
      timestamp: Date.now()
    };
    
    await addDoc(collection(db, 'deletionLogs'), logData);
    console.log('✅ Log de suppression enregistré:', type, itemId);
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du log de suppression:', error);
    console.log('⚠️ La suppression continue malgré l\'erreur de log');
    // Ne pas faire échouer la suppression si le log échoue
  }
};

// Supprimer une publication
export const deletePost = async (postId, userId, userName) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    // Récupérer les données de la publication avant suppression pour le log
    const postDoc = await getDoc(postRef);
    const postData = postDoc.exists() ? postDoc.data() : {};
    
    // Enregistrer le log de suppression
    await logDeletion('post', postId, userId, userName, {
      content: postData.content?.substring(0, 100) + '...',
      authorName: postData.authorName,
      quartier: postData.quartier,
      createdAt: postData.createdAt
    });
    
    // Supprimer tous les commentaires associés
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    
    // Supprimer chaque commentaire
    const deletePromises = commentsSnapshot.docs.map(commentDoc => 
      deleteDoc(doc(db, 'posts', postId, 'comments', commentDoc.id))
    );
    
    await Promise.all(deletePromises);
    
    // Supprimer toutes les réponses associées aux commentaires de ce post
    const repliesQuery = query(
      collection(db, 'replies'),
      where('postId', '==', postId)
    );
    const repliesSnapshot = await getDocs(repliesQuery);
    
    const deleteRepliesPromises = repliesSnapshot.docs.map(replyDoc => 
      deleteDoc(doc(db, 'replies', replyDoc.id))
    );
    
    await Promise.all(deleteRepliesPromises);
    
    // Supprimer la publication elle-même
    await deleteDoc(postRef);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la publication:', error);
    throw error;
  }
};

// Supprimer une alerte
export const deleteAlert = async (alertId, userId, userName) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    
    // Récupérer les données de l'alerte avant suppression pour le log
    const alertDoc = await getDoc(alertRef);
    const alertData = alertDoc.exists() ? alertDoc.data() : {};
    
    // Enregistrer le log de suppression
    await logDeletion('alert', alertId, userId, userName, {
      category: alertData.category,
      message: alertData.message?.substring(0, 100) + '...',
      quartier: alertData.quartier,
      status: alertData.status,
      createdAt: alertData.createdAt
    });
    
    await deleteDoc(alertRef);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'alerte:', error);
    throw error;
  }
};

// Obtenir les logs de suppression pour l'administrateur
export const getDeletionLogs = (callback) => {
  const logsRef = collection(db, 'deletionLogs');
  const q = query(logsRef, orderBy('deletedAt', 'desc'));
  
  return onSnapshot(q, callback);
};

// Obtenir les statistiques des suppressions
export const getDeletionStats = async () => {
  try {
    const logsRef = collection(db, 'deletionLogs');
    const logsSnapshot = await getDocs(logsRef);
    
    const stats = {
      total: logsSnapshot.size,
      byType: {
        post: 0,
        comment: 0,
        reply: 0,
        alert: 0
      },
      byUser: {},
      recent: 0 // Suppressions des dernières 24h
    };
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    logsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Compter par type
      if (stats.byType[data.type] !== undefined) {
        stats.byType[data.type]++;
      }
      
      // Compter par utilisateur
      if (!stats.byUser[data.userName]) {
        stats.byUser[data.userName] = 0;
      }
      stats.byUser[data.userName]++;
      
      // Compter les récentes
      const deletedAt = data.deletedAt?.toDate ? data.deletedAt.toDate() : new Date(data.deletedAt);
      if (deletedAt > oneDayAgo) {
        stats.recent++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques de suppression:', error);
    throw error;
  }
};

// Obtenir les statistiques utilisateur
export const getUserStats = async (userId) => {
  try {
    // Compter les publications
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId)
    );
    const postsSnapshot = await getDocs(postsQuery);
    const postsCount = postsSnapshot.size;

    // Compter les alertes
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('authorId', '==', userId)
    );
    const alertsSnapshot = await getDocs(alertsQuery);
    const alertsCount = alertsSnapshot.size;

    // Compter les réactions (likes reçus)
    let totalLikes = 0;
    postsSnapshot.forEach(doc => {
      const postData = doc.data();
      totalLikes += postData.likesCount || 0;
    });

    return {
      postsCount,
      alertsCount,
      totalLikes
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
};
