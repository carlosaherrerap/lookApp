import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '../constants/theme';
import { Play, Coffee, LogOut, Clock, MapPin, XCircle, Navigation } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Config } from '../constants/Config';

const API_URL = Config.API_URL;

export const StatesScreen = ({ user, onLogout }: any) => {
  const [loading, setLoading] = useState(false);
  const [activeEnCamino, setActiveEnCamino] = useState<{ id: string, name: string } | null>(null);

  // Cargar estado de "En Camino" desde el SERVIDOR para evitar bloqueos globales incorrectos
  useFocusEffect(
    useCallback(() => {
      const checkEnCamino = async () => {
        try {
          const token = await AsyncStorage.getItem('user_token');
          const res = await axios.get(`${API_URL}/clients/active`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data) {
            const clientName = `${res.data.name} ${res.data.apellido_paterno || ''}`;
            setActiveEnCamino({ id: res.data.id.toString(), name: clientName });
            
            // Sincronizar local para otras pantallas
            await AsyncStorage.setItem('global_en_camino_client_id', res.data.id.toString());
            await AsyncStorage.setItem('global_en_camino_client_name', clientName);
          } else {
            setActiveEnCamino(null);
            await AsyncStorage.removeItem('global_en_camino_client_id');
            await AsyncStorage.removeItem('global_en_camino_client_name');
          }
        } catch (e) {
          console.warn('Sync active client failed:', e);
        }
      };
      checkEnCamino();
    }, [])
  );

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

  const confirmLogTime = (type: any, label: string) => {
    Alert.alert(
      'Confirmar Acción',
      `¿Estás seguro que deseas marcar ${label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'SÍ, MARCAR', onPress: () => logTime(type) }
      ]
    );
  };

  const handleCancelEnCamino = async () => {
    if (!activeEnCamino) return;

    Alert.alert(
      'Cancelar Traslado',
      `¿Deseas dejar de ir a "${activeEnCamino.name}" y quedar disponible para otro cliente?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, Cancelar', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('user_token');
              // Revertir estado en backend
              await axios.patch(`${API_URL}/clients/${activeEnCamino.id}`, { status: 'PROGRAMADO' }, {
                headers: { Authorization: `Bearer ${token}` }
              });

              // Limpiar datos locales
              await AsyncStorage.removeItem('global_en_camino_client_id');
              await AsyncStorage.removeItem('global_en_camino_client_name');
              await AsyncStorage.removeItem(`client_status_${activeEnCamino.id}`);
              await AsyncStorage.removeItem(`travel_start_${activeEnCamino.id}`);
              
              setActiveEnCamino(null);
              Alert.alert('Éxito', 'Traslado cancelado correctamente.');
            } catch (e) {
              Alert.alert('Error', 'No se pudo cancelar el traslado en el servidor.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Panel de Control Temporal</Text>
      </View>

      {/* PANEL DE TRASLADO ACTIVO - NUEVO */}
      {activeEnCamino && (
        <View style={styles.activeRouteBox}>
          <View style={styles.activeRouteHeader}>
            <View style={styles.row}>
              <Navigation color={Theme.colors.primary} size={18} />
              <Text style={styles.activeRouteTitle}>Traslado en Curso</Text>
            </View>
            <TouchableOpacity onPress={handleCancelEnCamino}>
              <XCircle color={Theme.colors.error} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.activeRouteTarget}>{activeEnCamino.name}</Text>
          <Text style={styles.activeRouteSub}>Estás bloqueado para otros clientes hasta llegar o cancelar.</Text>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={handleCancelEnCamino}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>CANCELAR DESTINO ACTUAL</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => confirmLogTime('start_day', 'INICIO DE JORNADA')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#2ecc7120' }]}>
            <Play color="#2ecc71" size={28} />
          </View>
          <Text style={styles.cardTitle}>Inicio Jornada</Text>
          <Text style={styles.cardSub}>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => confirmLogTime('lunch_start', 'REFRIGERIO / PAUSA')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#f39c1220' }]}>
            <Coffee color="#f39c12" size={28} />
          </View>
          <Text style={styles.cardTitle}>Refrigerio</Text>
          <Text style={styles.cardSub}>Salida / Retorno</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => confirmLogTime('end_day', 'FIN DE JORNADA')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#e74c3c20' }]}>
            <LogOut color="#e74c3c" size={28} />
          </View>
          <Text style={styles.cardTitle}>Fin Jornada</Text>
          <Text style={styles.cardSub}>Cerrar Día</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutCard} 
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIcon}>
            <LogOut color={Theme.colors.textMuted} size={20} />
          </View>
          <Text style={styles.logoutText}>Cerrar Sesión App</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Clock size={18} color={Theme.colors.primary} />
        <Text style={styles.infoText}>
          {loading ? 'Procesando registro...' : 'Tu ubicación y hora se registran automáticamente en la base de datos central.'}
        </Text>
      </View>
      
      {loading && <ActivityIndicator style={{ marginBottom: 20 }} color={Theme.colors.primary} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: {
    padding: 30,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  name: { fontSize: 20, fontWeight: '800', color: Theme.colors.text },
  role: { fontSize: 11, color: Theme.colors.primary, marginTop: 6, fontWeight: 'bold', letterSpacing: 1.2, textTransform: 'uppercase' },
  activeRouteBox: {
    margin: 20,
    padding: 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary + '50',
    elevation: 4,
  },
  activeRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeRouteTitle: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  activeRouteTarget: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, marginBottom: 6 },
  activeRouteSub: { fontSize: 11, color: Theme.colors.textMuted, lineHeight: 16, marginBottom: 15 },
  cancelBtn: {
    backgroundColor: Theme.colors.error + '20',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.error + '40',
  },
  cancelBtnText: { color: Theme.colors.error, fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  grid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
  card: {
    width: '47%',
    backgroundColor: Theme.colors.surface,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },
  cardSub: { fontSize: 10, color: Theme.colors.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  logoutCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 10,
    gap: 12,
  },
  logoutIcon: { backgroundColor: Theme.colors.border, padding: 8, borderRadius: 10 },
  logoutText: { fontSize: 14, fontWeight: '600', color: Theme.colors.textMuted },
  infoBox: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  infoText: { flex: 1, color: Theme.colors.textMuted, fontSize: 11, lineHeight: 16 },
});
