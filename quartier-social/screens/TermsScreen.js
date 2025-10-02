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

export default function TermsScreen({ navigation }) {
  const openEmail = async () => {
    const email = 'hamza.zoungrana@yahoo.fr';
    const subject = 'Questions sur les Conditions d\'utilisation';
    const body = 'Bonjour,\n\nJe vous contacte concernant les conditions d\'utilisation de TiexUp.\n\n';
    
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
    const phoneNumber = '+22673335093';
    
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.title}>Conditions d'utilisation</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.description}>
            En utilisant l'application TiexUp, vous acceptez d'être lié par ces 
            conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
            veuillez ne pas utiliser l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Utilisation de l'application</Text>
          <Text style={styles.description}>
            Vous vous engagez à utiliser l'application de manière responsable et légale :
          </Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.ruleText}>Respecter les autres utilisateurs</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.ruleText}>Ne pas publier de contenu offensant ou illégal</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.ruleText}>Utiliser les alertes uniquement pour des situations réelles</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.ruleText}>Ne pas spammer ou harceler d'autres utilisateurs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Contenu utilisateur</Text>
          <Text style={styles.description}>
            Vous êtes responsable du contenu que vous publiez. Nous nous réservons le droit de :
          </Text>
          <View style={styles.contentList}>
            <View style={styles.contentItem}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.contentText}>Modérer et supprimer du contenu inapproprié</Text>
            </View>
            <View style={styles.contentItem}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.contentText}>Suspendre ou bannir des comptes en cas de violation</Text>
            </View>
            <View style={styles.contentItem}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.contentText}>Coopérer avec les autorités si nécessaire</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Alertes de sécurité</Text>
          <Text style={styles.description}>
            Les alertes de sécurité sont des fonctionnalités critiques. Veuillez :
          </Text>
          <View style={styles.alertList}>
            <View style={styles.alertItem}>
              <Ionicons name="alert-circle" size={16} color="#d32f2f" />
              <Text style={styles.alertText}>Les utiliser uniquement pour des situations d'urgence réelles</Text>
            </View>
            <View style={styles.alertItem}>
              <Ionicons name="alert-circle" size={16} color="#d32f2f" />
              <Text style={styles.alertText}>Fournir des informations précises et utiles</Text>
            </View>
            <View style={styles.alertItem}>
              <Ionicons name="alert-circle" size={16} color="#d32f2f" />
              <Text style={styles.alertText}>Ne pas créer de fausses alertes</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Comptes Premium</Text>
          <Text style={styles.description}>
            Les fonctionnalités Premium sont disponibles moyennant un abonnement :
          </Text>
          <View style={styles.premiumList}>
            <View style={styles.premiumItem}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.premiumText}>Accès aux alertes de sécurité</Text>
            </View>
            <View style={styles.premiumItem}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.premiumText}>Notifications prioritaires</Text>
            </View>
            <View style={styles.premiumItem}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.premiumText}>Fonctionnalités avancées</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation de responsabilité</Text>
          <Text style={styles.description}>
            TiexUp ne peut être tenu responsable des dommages directs ou indirects 
            résultant de l'utilisation de l'application. Les utilisateurs utilisent 
            l'application à leurs propres risques.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Modifications</Text>
          <Text style={styles.description}>
            Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
            Les modifications seront communiquées via l'application et prendront effet 
            immédiatement après publication.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact</Text>
          <Text style={styles.description}>
            Pour toute question concernant ces conditions d'utilisation, 
            contactez-nous :
          </Text>
          <View style={styles.contactItem}>
            <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
              <Ionicons name="mail" size={16} color="#1976d2" />
              <Text style={styles.contactText}>hamza.zoungrana@yahoo.fr</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactItem}>
            <TouchableOpacity style={styles.contactButton} onPress={openPhone}>
              <Ionicons name="call" size={16} color="#1976d2" />
              <Text style={styles.contactText}>+226 73 33 50 93</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Dernière mise à jour : Décembre 2024</Text>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
  rulesList: {
    marginTop: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  contentList: {
    marginTop: 10,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  alertList: {
    marginTop: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  premiumList: {
    marginTop: 10,
  },
  premiumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  contactItem: {
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactText: {
    fontSize: 15,
    color: '#1976d2',
    marginLeft: 10,
    fontWeight: '500',
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
