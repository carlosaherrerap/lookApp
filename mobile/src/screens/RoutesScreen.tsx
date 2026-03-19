import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Theme } from '../constants/theme';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

const API_URL = 'http://192.168.1.55:3009';

export const RoutesScreen = ({ user, navigation, onLogout }: { user: any, navigation: any, onLogout: () => void }) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Configuración de Tiempo Real
    const socket = io(API_URL);
    
    if (user?.id) {
       console.log('Listening for real-time updates for worker:', user.id);
       socket.on(`route_updated_${user.id}`, (data) => {
         console.log('Real-time update received:', data);
         fetchRoutes(true); // Refrescar automáticamente
       });
    }

    fetchRoutes();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRoutes = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await AsyncStorage.getItem('user_token');
      if (!token) throw new Error('No hay sesión activa');

      // 1. Intentar obtener de la API
      const response = await axios.get(`${API_URL}/routes/worker`, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      
      const remoteRoutes = response.data;
      setRoutes(remoteRoutes);

      // 2. Cachear en SQLite local para uso offline
      const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
      
      try {
        await db.runAsync('DELETE FROM local_routes');
        await db.runAsync('DELETE FROM local_clients'); // Limpiar clientes antiguos
        
        for (const route of remoteRoutes) {
          await db.runAsync(
            'INSERT INTO local_routes (id, name, assigned_date, status) VALUES (?, ?, ?, ?)',
            [route.id, route.name, route.assigned_date, route.status]
          );
          
          if (route.clients && route.clients.length > 0) {
            for (const client of route.clients) {
              const lat = client.location?.coordinates ? client.location.coordinates[1] : 0;
              const lng = client.location?.coordinates ? client.location.coordinates[0] : 0;
              
              await db.runAsync(
                'INSERT INTO local_clients (id, route_id, name, address, lat, lng, visit_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [client.id, route.id, client.name, client.address, lat, lng, client.visit_order || 0, client.status || 'pendiente']
              );
            }
          }
        }
      } catch (dbError) {
        console.error('SQLite Sync Error:', dbError);
      }
    } catch (error: any) {
      console.log('Error fetching from API, falling back to local DB:', error);
      
      if (error?.response?.status === 401) {
        Alert.alert('Sesión Expirada', 'Por favor inicia sesión nuevamente.', [
          { text: 'OK', onPress: handleLogout }
        ]);
        return;
      }

      // 3. Fallback a DB local si no hay internet o hay otro error
      const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
      const localRoutes = await db.getAllAsync('SELECT * FROM local_routes');
      setRoutes(localRoutes as any[]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    // Cerrar socket y limpiar sesión
    onLogout();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.routeCard}
      onPress={() => navigation.navigate('ClientDetail', { routeId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.routeName}>{item.name}</Text>
        <View style={[styles.badge, { 
          backgroundColor: item.status === 'completado' ? Theme.colors.success : (item.status === 'en_progreso' ? Theme.colors.primary : Theme.colors.warning) 
        }]}>
          <Text style={styles.badgeText}>{(item.status || 'planeado').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.routeDate}>{item.assigned_date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>Mis Rutas</Text>
        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
          <Text style={{ color: Theme.colors.error, fontWeight: 'bold' }}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchRoutes(true)} tintColor={Theme.colors.primary} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes rutas asignadas para hoy.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  routeCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  routeDate: {
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Theme.colors.background,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 50,
  }
});
