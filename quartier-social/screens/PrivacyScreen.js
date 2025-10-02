import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PrivacyScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collecte des données</Text>
          <Text style={styles.description}>
            Nous collectons uniquement les informations nécessaires au fonctionnement de l'application :
          </Text>
          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <Ionicons name="person" size={16} color="#1976d2" />
              <Text style={styles.dataText}>Nom d'affichage et email</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="location" size={16} color="#1976d2" />
              <Text style={styles.dataText}>Quartier de résidence</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="document-text" size={16} color="#1976d2" />
              <Text style={styles.dataText}>Publications et commentaires</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="warning" size={16} color="#1976d2" />
              <Text style={styles.dataText}>Alertes de sécurité créées</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utilisation des données</Text>
          <Text style={styles.description}>
            Vos données sont utilisées exclusivement pour :
          </Text>
          <View style={styles.useList}>
            <View style={styles.useItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.useText}>Afficher vos publications dans votre quartier</Text>
            </View>
            <View style={styles.useItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.useText}>Envoyer des notifications pertinentes</Text>
            </View>
            <View style={styles.useItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.useText}>Maintenir la sécurité de la communauté</Text>
            </View>
            <View style={styles.useItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.useText}>Améliorer l'expérience utilisateur</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partage des données</Text>
          <Text style={styles.description}>
            Nous ne partageons jamais vos données personnelles avec des tiers. 
            Vos informations restent privées et ne sont visibles que par :
          </Text>
          <View style={styles.shareList}>
            <View style={styles.shareItem}>
              <Ionicons name="people" size={16} color="#1976d2" />
              <Text style={styles.shareText}>Les résidents de votre quartier uniquement</Text>
            </View>
            <View style={styles.shareItem}>
              <Ionicons name="shield-checkmark" size={16} color="#1976d2" />
              <Text style={styles.shareText}>Notre équipe technique (données anonymisées)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <Text style={styles.description}>
            Nous utilisons des mesures de sécurité avancées pour protéger vos données :
          </Text>
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Chiffrement des données en transit et au repos</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="key" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Authentification sécurisée</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="server" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Infrastructure Firebase sécurisée</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos droits</Text>
          <Text style={styles.description}>
            Vous avez le droit de :
          </Text>
          <View style={styles.rightsList}>
            <View style={styles.rightsItem}>
              <Ionicons name="eye" size={16} color="#1976d2" />
              <Text style={styles.rightsText}>Consulter vos données</Text>
            </View>
            <View style={styles.rightsItem}>
              <Ionicons name="create" size={16} color="#1976d2" />
              <Text style={styles.rightsText}>Modifier vos informations</Text>
            </View>
            <View style={styles.rightsItem}>
              <Ionicons name="trash" size={16} color="#1976d2" />
              <Text style={styles.rightsText}>Supprimer votre compte</Text>
            </View>
            <View style={styles.rightsItem}>
              <Ionicons name="download" size={16} color="#1976d2" />
              <Text style={styles.rightsText}>Exporter vos données</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions sur la confidentialité ?</Text>
          <Text style={styles.contactText}>
            Contactez-nous à : hamza.zoungrana@yahoo.fr
          </Text>
          <Text style={styles.contactText}>
            Téléphone : +226 73 33 50 93
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Dernière mise à jour : Décembre 2024</Text>
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
  dataList: {
    marginTop: 10,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  useList: {
    marginTop: 10,
  },
  useItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  useText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  shareList: {
    marginTop: 10,
  },
  shareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  securityList: {
    marginTop: 10,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  rightsList: {
    marginTop: 10,
  },
  rightsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rightsText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  contactSection: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#1976d2',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
