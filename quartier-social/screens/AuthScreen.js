import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { checkNewUserRegistration } from '../services/adminService';
import { QUARTIERS, signIn, signUp } from '../services/firebaseService';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!isLogin && (!displayName || !selectedQuartier)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Vérifier si les nouvelles inscriptions sont autorisées
    if (!isLogin) {
      try {
        const registrationAllowed = await checkNewUserRegistration();
        
        if (!registrationAllowed) {
          Alert.alert(
            'Inscriptions fermées',
            'Les nouvelles inscriptions sont temporairement fermées.\n\nVeuillez réessayer plus tard ou contactez l\'administrateur.',
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des inscriptions:', error);
        // En cas d'erreur, permettre l'inscription
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName, selectedQuartier);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>TiexUp</Text>
          <Text style={styles.subtitle}>
            Connectez-vous avec vos voisins
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
              
              <View style={styles.quartierContainer}>
                <Text style={styles.quartierLabel}>Choisissez votre quartier :</Text>
                <ScrollView style={styles.quartierScroll} horizontal showsHorizontalScrollIndicator={false}>
                  {QUARTIERS.map((quartier) => (
                    <TouchableOpacity
                      key={quartier}
                      style={[
                        styles.quartierButton,
                        selectedQuartier === quartier && styles.quartierButtonSelected
                      ]}
                      onPress={() => setSelectedQuartier(quartier)}
                    >
                      <Text style={[
                        styles.quartierButtonText,
                        selectedQuartier === quartier && styles.quartierButtonTextSelected
                      ]}>
                        {quartier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin 
                ? 'Pas encore de compte ? S\'inscrire' 
                : 'Déjà un compte ? Se connecter'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  quartierContainer: {
    marginBottom: 15,
  },
  quartierLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  quartierScroll: {
    maxHeight: 50,
  },
  quartierButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quartierButtonSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  quartierButtonText: {
    color: '#666',
    fontSize: 14,
  },
  quartierButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#1976d2',
    fontSize: 14,
  },
});
