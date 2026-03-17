import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.XX:3009'; // El puerto en .env es 3009

export const LoginScreen = ({ onLoginSuccess }) => {
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
      // Reemplazar XX con la IP de tu PC en la red local
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
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

      <Text style={styles.title}>Map X</Text>
      
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
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.buttonText}>INICIAR SESION</Text>
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
    backgroundColor: '#0f172a',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#38bdf8',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#38bdf8',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
});
