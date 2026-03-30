import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../constants/theme';
import { Config } from '../constants/Config';

const API_URL = Config.API_URL;

export const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      }, { 
        timeout: Config.TIMEOUT 
      });

      const { access_token, user } = response.data;
      await AsyncStorage.setItem('user_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      onLoginSuccess(user);
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Autenticación', 'Credenciales incorrectas o problema de conexión. Verifica que la IP del servidor sea correcta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Schedule's</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        placeholderTextColor="#64748b"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#64748b"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Theme.colors.background} />
        ) : (
          <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: Theme.colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text,
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    fontSize: 16,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: Theme.colors.background,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
