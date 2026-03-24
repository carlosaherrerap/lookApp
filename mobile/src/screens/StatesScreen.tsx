import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Theme } from '../constants/theme';
import { Play, Coffee, LogOut, Clock, MapPin } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const API_URL = 'http://192.168.1.55:3009';

export const StatesScreen = ({ user, onLogout }: any) => {
  const [loading, setLoading] = useState(false);

  const logTime = async (type: 'start_day' | 'lunch_start' | 'lunch_end' | 'end_day') => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permiso de ubicación denegado');
      
      const location = await Location.getCurrentPositionAsync({});
      const token = await AsyncStorage.getItem('user_token');

      await axios.post(`${API_URL}/tracking/time-log`, {
        type,
        event_timestamp: new Date().toISOString(),
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Éxito', 'Estado registrado correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo registrar el estado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Trabajador Schedule's</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => logTime('start_day')}>
          <View style={[styles.iconContainer, { backgroundColor: '#00BA8820' }]}>
            <Play color="#00BA88" size={32} />
          </View>
          <Text style={styles.cardTitle}>Inicio Jornada</Text>
          <Text style={styles.cardSub}>9:00 AM</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => logTime('lunch_start')}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFAA0020' }]}>
            <Coffee color="#FFAA00" size={32} />
          </View>
          <Text style={styles.cardTitle}>Refrigerio</Text>
          <Text style={styles.cardSub}>Descanso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => logTime('end_day')}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF4D4D20' }]}>
            <LogOut color="#FF4D4D" size={32} />
          </View>
          <Text style={styles.cardTitle}>Fin Jornada</Text>
          <Text style={styles.cardSub}>Salida</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.logoutCard]} onPress={onLogout}>
          <LogOut color={Theme.colors.textMuted} size={24} />
          <Text style={[styles.cardTitle, { fontSize: 14 }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Clock size={20} color={Theme.colors.primary} />
        <Text style={styles.infoText}>La jornada laboral inicia puntualmente a las 9:00 AM. Se recomienda marcar asistencia al llegar.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: 30,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  role: {
    fontSize: 14,
    color: Theme.colors.primary,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  card: {
    width: '47%',
    backgroundColor: Theme.colors.surface,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  logoutCard: {
    justifyContent: 'center',
    opacity: 0.7,
  },
  infoBox: {
    margin: 20,
    padding: 20,
    backgroundColor: Theme.colors.primary + '10',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    color: Theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  }
});
