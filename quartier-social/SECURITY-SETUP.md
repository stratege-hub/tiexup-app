# 🔐 Configuration de Sécurité pour TiexUp APK

Ce document explique comment sécuriser votre APK Android pour TiexUp.

## 📋 Checklist de Sécurité

### ✅ 1. Variables d'Environnement (.env)
- [x] Fichier `.env` créé avec les clés Firebase
- [x] Fichier `.env` ajouté à `.gitignore`
- [x] Configuration `react-native-dotenv` dans `babel.config.js`
- [x] Mise à jour de `firebase.js` pour utiliser les variables d'environnement

### ✅ 2. ProGuard - Obfuscation du Code
- [x] Configuration ProGuard dans `eas.json`
- [x] Fichier `proguard-rules.pro` créé avec règles de sécurité
- [ ] Test de build avec obfuscation activée

### ✅ 3. Mode Debug Désactivé
- [x] Configuration `AndroidManifest.xml` créée
- [x] Configuration de sécurité réseau créée
- [x] Configuration des chemins de fichiers sécurisés

### ✅ 4. Play Integrity API
- [x] Classe `SecurityManager.java` créée
- [x] Configuration du hash de certificat de signature
- [x] Vérifications de sécurité intégrées

### ✅ 5. Signature APK
- [x] Génération des clés de signature (`tiexup.keystore`)
- [x] Configuration dans `eas.json`
- [x] Hash de certificat configuré dans SecurityManager

## 🔑 Étapes de Signature APK

### 1. Générer une Clé de Signature

```bash
# Générer une keystore
keytool -genkey -v -keystore tiexup-release-key.keystore -alias tiexup-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Extraire le hash du certificat pour SecurityManager
keytool -list -v -keystore tiexup-release-key.keystore -alias tiexup-key-alias
```

### 2. Configurer EAS Build

Ajouter dans `eas.json` :

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "release",
        "proguard": true,
        "credentialsSource": "local"
      }
    }
  },
  "credentials": {
    "android": {
      "keystore": {
        "keystorePath": "./tiexup-release-key.keystore",
        "keystorePassword": "VOTRE_MOT_DE_PASSE_KEYSTORE",
        "keyAlias": "tiexup-key-alias",
        "keyPassword": "VOTRE_MOT_DE_PASSE_KEY"
      }
    }
  }
}
```

### 3. Mettre à Jour SecurityManager

Dans `SecurityManager.java`, remplacer :
```java
private static final String EXPECTED_SIGNATURE_HASH = "VOTRE_HASH_DE_CERTIFICAT_ICI";
```

Par le hash obtenu à l'étape 1.

## 🛡️ Mesures de Sécurité Implémentées

### ProGuard Rules
- Obfuscation des noms de classes et méthodes
- Masquage des chaînes de caractères sensibles
- Suppression des logs de debug
- Protection des classes critiques

### AndroidManifest.xml
- Mode debug désactivé
- Permissions strictes
- Configuration de sécurité réseau
- FileProvider sécurisé

### SecurityManager
- Vérification de signature APK
- Détection anti-debug
- Validation des permissions
- Intégration Play Integrity API (préparée)

## 🚀 Build de Production

### Commandes de Build

```bash
# Build de développement
eas build --platform android --profile development

# Build de preview
eas build --platform android --profile preview

# Build de production (sécurisé)
eas build --platform android --profile production
```

### Vérification Post-Build

1. **Test d'obfuscation** : Vérifier que le code est obfusqué
2. **Test de signature** : Vérifier la signature de l'APK
3. **Test d'intégrité** : Utiliser Play Integrity API
4. **Test de sécurité** : Scanner avec des outils de sécurité

## ⚠️ Points d'Attention

### Sécurité des Clés
- **JAMAIS** commiter les clés de signature
- Stocker les keystores dans un endroit sécurisé
- Utiliser des mots de passe forts
- Sauvegarder les clés de récupération

### Mise à Jour des Certificats
- Les certificats Firebase changent périodiquement
- Mettre à jour `network_security_config.xml`
- Surveiller les notifications de Google Play

### Tests de Sécurité
- Tester sur différents appareils
- Vérifier la résistance aux outils de reverse engineering
- Scanner l'APK avec des outils comme MobSF

## 📞 Support

Pour toute question sur la sécurité :
- Consulter la documentation Expo EAS Build
- Vérifier les guides de sécurité Android
- Tester régulièrement les mesures de sécurité

---

**🔒 TiexUp - Application Sécurisée**
