# 🏘️ TiexUp

Application mobile React Native + Expo pour connecter les résidents d'un quartier et partager des informations de sécurité.

## 🚀 Fonctionnalités

### ✅ **Authentification**
- Inscription/Connexion par email
- Sélection du quartier de résidence
- Gestion du profil utilisateur

### ✅ **Publications**
- Création de posts textuels
- Fil d'actualité par quartier
- Système de likes et commentaires
- Signalement de contenu inapproprié

### ✅ **Alertes de Sécurité** (Premium)
- Création d'alertes d'urgence
- Catégories : Intrusion, Braquage, Incendie, Agression, Autre
- Confirmation par la communauté
- Notifications temps réel

### ✅ **Interactions Avancées**
- Réponses aux commentaires
- Système de réactions (likes)
- Notifications en temps réel
- Interface optimisée

## 🛠️ Technologies

- **Frontend** : React Native + Expo
- **Backend** : Firebase (Auth, Firestore, FCM)
- **Navigation** : React Navigation
- **UI** : @expo/vector-icons
- **Notifications** : Expo Notifications + Firebase

## 📱 Installation

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

## 🔧 Configuration Firebase

1. **Créer un projet Firebase**
2. **Activer Authentication** (Email/Password)
3. **Créer une base Firestore**
4. **Configurer les règles de sécurité**
5. **Mettre à jour** `firebase.js` avec vos clés

## 📋 Règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Structure du Projet

```
quartier-social/
├── App.js                 # Point d'entrée
├── firebase.js           # Configuration Firebase
├── components/           # Composants réutilisables
├── screens/             # Écrans de l'application
├── services/            # Services Firebase
├── contexts/            # Contextes React
└── assets/              # Images et icônes
```

## 🚀 Démarrage Rapide

1. **Cloner le projet**
2. **Installer les dépendances** : `npm install`
3. **Configurer Firebase** dans `firebase.js`
4. **Démarrer** : `npm start`
5. **Scanner le QR** avec Expo Go

## 📞 Support

**Contact :**
- 📧 Email : hamza.zoungrana@yahoo.fr
- 📱 Téléphone : +226 73 33 50 93

Pour toute question ou problème, vérifiez la configuration Firebase et les règles de sécurité Firestore.

---

**Développé avec ❤️ pour connecter les quartiers**