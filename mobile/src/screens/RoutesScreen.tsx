import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Theme } from '../constants/theme';
import axios from 'axios';
import { getDatabase } from '../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { Users, CheckCircle2, RotateCcw, Target } from 'lucide-react-native';
import { Config } from '../constants/Config';

const API_URL = Config.API_URL;

export const RoutesScreen = ({ user, navigation, onLogout }: { user: any, navigation: any, onLogout: () => void }) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    let total = 0, actual = 0, faltan = 0, reprogramar = 0;
    for (const route of routes) {
      if (!route.clients) continue;
      for (const c of route.clients) {
        total++;
        const s = (c.status || '').toUpperCase();
        if (s === 'VISITADO') actual++;
        else if (s === 'REPROGRAMAR') reprogramar++;
        else faltan++;
      }
    }
    return { total, actual, faltan, reprogramar };
  }, [routes]);

  useEffect(() => {
    const socket = io(API_URL);
    if (user?.id) {
       socket.on(`route_updated_${user.id}`, () => fetchRoutes(true));
    }
    fetchRoutes();
    return () => { socket.disconnect(); };
  }, []);

  const fetchRoutes = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await AsyncStorage.getItem('user_token');
      if (!token) throw new Error('No hay sesión activa');

      const response = await axios.get(`${API_URL}/routes/worker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const remoteRoutes = response.data;
      setRoutes(remoteRoutes);

      const db = await getDatabase();
      try {
        await db.runAsync('DELETE FROM local_routes');
        await db.runAsync('DELETE FROM local_clients');
        
        for (const route of remoteRoutes) {
          await db.runAsync(
            'INSERT INTO local_routes (id, name, assigned_date, status) VALUES (?, ?, ?, ?)',
            [route.id, route.name, route.assigned_date, route.status]
          );
          if (route.clients?.length > 0) {
            for (const client of route.clients) {
              const lat = client.location?.coordinates ? client.location.coordinates[1] : 0;
              const lng = client.location?.coordinates ? client.location.coordinates[0] : 0;
              await db.runAsync(
                'INSERT INTO local_clients (id, route_id, name, address, lat, lng, visit_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [client.id, route.id, client.name, client.address, lat, lng, client.visit_order || 0, client.status || 'PROGRAMADO']
              );
            }
          }
        }
      } catch (dbError) {
        console.error('SQLite Sync Error:', dbError);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert('Sesión Expirada', 'Inicia sesión nuevamente.', [{ text: 'OK', onPress: onLogout }]);
        return;
      }
      const db = await getDatabase();
      const localRoutes = await db.getAllAsync('SELECT * FROM local_routes');
      setRoutes(localRoutes as any[]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const clientCount = item.clients?.length || 0;
    const visited = item.clients?.filter((c: any) => c.status?.toUpperCase() === 'VISITADO').length || 0;

    return (
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
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: clientCount > 0 ? `${(visited / clientCount) * 100}%` : '0%' }]} />
          </View>
          <Text style={styles.progressText}>{visited}/{clientCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20 }}>
        <Text style={styles.title}>Mis Rutas</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={{ color: Theme.colors.error, fontWeight: 'bold', fontSize: 13 }}>Salir</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchRoutes(true)} tintColor={Theme.colors.primary} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes rutas asignadas.</Text>
          }
        />
      )}

      <View style={styles.statsFooter}>
        <View style={styles.statItem}>
          <Users size={16} color={Theme.colors.primary} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <CheckCircle2 size={16} color={Theme.colors.success} />
          <Text style={styles.statValue}>{stats.actual}</Text>
          <Text style={styles.statLabel}>Actual</Text>
        </View>
        <View style={styles.statItem}>
          <Target size={16} color={Theme.colors.warning} />
          <Text style={styles.statValue}>{stats.faltan}</Text>
          <Text style={styles.statLabel}>Faltan</Text>
        </View>
        <View style={styles.statItem}>
          <RotateCcw size={16} color={Theme.colors.error} />
          <Text style={styles.statValue}>{stats.reprogramar}</Text>
          <Text style={styles.statLabel}>Reprog.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 10 },
  routeCard: {
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeName: { fontSize: 17, fontWeight: 'bold', color: Theme.colors.text },
  routeDate: { color: Theme.colors.textMuted, marginTop: 4, fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#1B1B1F' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: Theme.colors.border, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Theme.colors.success, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.textMuted },
  emptyText: { color: Theme.colors.textMuted, textAlign: 'center', marginTop: 50 },
  statsFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingVertical: 18,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 100,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: Theme.colors.text },
  statLabel: { fontSize: 9, color: Theme.colors.textMuted, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
});
