import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HelpScreen({ navigation }) {
  // Fonctions pour ouvrir les applications
  const openEmail = async () => {
    const email = 'hamza.zoungrana@yahoo.fr';
    const subject = 'Support TiexUp';
    const body = 'Bonjour,\n\nJe vous contacte concernant l\'application TiexUp.\n\n';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email non disponible',
          'Aucune application email trouvée sur votre appareil.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir l\'application email.',
        [{ text: 'OK' }]
      );
    }
  };

  const openPhone = async () => {
    const phoneNumber = '+22673335093'; // Format international sans espaces
    
    try {
      const phoneUrl = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Téléphone non disponible',
          'Aucune application téléphone trouvée sur votre appareil.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir l\'application téléphone.',
        [{ text: 'OK' }]
      );
    }
  };

  const openWhatsApp = async () => {
    const phoneNumber = '22673335093'; // Format international sans le +
    const message = 'Bonjour, je vous contacte concernant l\'application TiexUp.';
    
    try {
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback vers WhatsApp Web
        const whatsappWebUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        await Linking.openURL(whatsappWebUrl);
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir WhatsApp.',
        [{ text: 'OK' }]
      );
    }
  };

  const faqData = [
    {
      question: "Comment créer une publication ?",
      answer: "Appuyez sur l'onglet 'Nouvelle publication' en bas de l'écran, écrivez votre message et appuyez sur 'Publier'."
    },
    {
      question: "Comment créer une alerte de sécurité ?",
      answer: "Les alertes sont réservées aux utilisateurs Premium. Appuyez sur le bouton 🚨 rouge sur l'écran d'accueil."
    },
    {
      question: "Comment devenir Premium ?",
      answer: "Allez dans votre profil et appuyez sur 'Devenir Premium'. Le coût est de 2000 FCFA/mois."
    },
    {
      question: "Comment changer de quartier ?",
      answer: "Dans votre profil, appuyez sur 'Changer de quartier' et sélectionnez votre nouveau quartier."
    },
    {
      question: "Comment signaler une publication ?",
      answer: "Appuyez sur le bouton 'Signaler' (drapeau rouge) sous la publication que vous souhaitez signaler."
    },
    {
      question: "Comment confirmer une alerte ?",
      answer: "Sous chaque alerte en attente, appuyez sur 'Je confirme' ou 'Fausse alerte' selon la situation."
    }
  ];

  const contactMethods = [
    {
      icon: "mail",
      title: "Email",
      description: "hamza.zoungrana@yahoo.fr",
      action: "Envoyer un email",
      onPress: openEmail
    },
    {
      icon: "call",
      title: "Téléphone",
      description: "+226 73 33 50 93",
      action: "Appeler le support",
      onPress: openPhone
    },
    {
      icon: "chatbubbles",
      title: "WhatsApp",
      description: "Disponible 24h/24",
      action: "Démarrer une conversation",
      onPress: openWhatsApp
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.title}>Aide et support</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <Ionicons name="help-circle" size={20} color="#1976d2" />
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous contacter</Text>
          <Text style={styles.description}>
            Besoin d'aide ? Notre équipe de support est là pour vous aider.
          </Text>
          
          {contactMethods.map((method, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.contactItem}
              onPress={method.onPress}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={method.icon} size={24} color="#1976d2" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </View>
              <Text style={styles.contactAction}>{method.action}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guide d'utilisation</Text>
          <View style={styles.guideList}>
            <View style={styles.guideItem}>
              <Ionicons name="home" size={20} color="#4CAF50" />
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>Fil d'actualité</Text>
                <Text style={styles.guideText}>Consultez les dernières publications et alertes de votre quartier</Text>
              </View>
            </View>
            
            <View style={styles.guideItem}>
              <Ionicons name="add-circle" size={20} color="#4CAF50" />
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>Créer du contenu</Text>
                <Text style={styles.guideText}>Publiez des messages et créez des alertes de sécurité</Text>
              </View>
            </View>
            
            <View style={styles.guideItem}>
              <Ionicons name="notifications" size={20} color="#4CAF50" />
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>Notifications</Text>
                <Text style={styles.guideText}>Recevez des alertes importantes en temps réel</Text>
              </View>
            </View>
            
            <View style={styles.guideItem}>
              <Ionicons name="person" size={20} color="#4CAF50" />
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>Profil</Text>
                <Text style={styles.guideText}>Gérez vos informations et paramètres</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résolution de problèmes</Text>
          <View style={styles.troubleshootList}>
            <View style={styles.troubleshootItem}>
              <Ionicons name="refresh" size={20} color="#FF9800" />
              <Text style={styles.troubleshootText}>L'application ne se charge pas ? Redémarrez l'application</Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Ionicons name="wifi" size={20} color="#FF9800" />
              <Text style={styles.troubleshootText}>Problème de connexion ? Vérifiez votre connexion internet</Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Ionicons name="log-out" size={20} color="#FF9800" />
              <Text style={styles.troubleshootText}>Erreurs d'authentification ? Déconnectez-vous et reconnectez-vous</Text>
            </View>
            <View style={styles.troubleshootItem}>
              <Ionicons name="trash" size={20} color="#FF9800" />
              <Text style={styles.troubleshootText}>Données corrompues ? Effacez le cache de l'application</Text>
            </View>
          </View>
        </View>

        <View style={styles.urgentSection}>
          <View style={styles.urgentIcon}>
            <Ionicons name="alert-circle" size={24} color="#d32f2f" />
          </View>
          <View style={styles.urgentContent}>
            <Text style={styles.urgentTitle}>Urgence technique</Text>
            <Text style={styles.urgentText}>
              Si l'application ne fonctionne pas correctement et que vous avez besoin d'aide urgente, 
              contactez-nous immédiatement par téléphone.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Support disponible 24h/24, 7j/7</Text>
          <Text style={styles.footerText}>Temps de réponse moyen : 2 heures</Text>
        </View>
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
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    marginLeft: 30,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
  },
  contactAction: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  guideList: {
    marginTop: 10,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  guideContent: {
    flex: 1,
    marginLeft: 10,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  troubleshootList: {
    marginTop: 10,
  },
  troubleshootItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  troubleshootText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  urgentSection: {
    flexDirection: 'row',
    backgroundColor: '#ffebee',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  urgentIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  urgentContent: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  urgentText: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 20,
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
