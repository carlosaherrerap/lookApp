import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Theme } from '../constants/theme';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const API_URL = 'http://10.0.2.2:3000'; // IP para emulador Android

export const RoutesScreen = ({ user, navigation }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoutes = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Intentar obtener de la API
      const response = await axios.get(`${API_URL}/routes/worker`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const remoteRoutes = response.data;
      setRoutes(remoteRoutes);

      // 2. Cachear en SQLite local para uso offline
      const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
      await db.runAsync('DELETE FROM local_routes');
      for (const route of remoteRoutes) {
        await db.runAsync(
          'INSERT INTO local_routes (id, name, assigned_date, status) VALUES (?, ?, ?, ?)',
          [route.id, route.name, route.assigned_date, route.status]
        );
      }
    } catch (error) {
      console.log('Error fetching from API, falling back to local DB:', error);
      // 3. Fallback a DB local si no hay internet
      const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
      const localRoutes = await db.getAllAsync('SELECT * FROM local_routes');
      setRoutes(localRoutes);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.routeCard}
      onPress={() => navigation.navigate('ClientDetail', { routeId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.routeName}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'completed' ? Theme.colors.success : Theme.colors.warning }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.routeDate}>{item.assigned_date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Rutas</Text>
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
