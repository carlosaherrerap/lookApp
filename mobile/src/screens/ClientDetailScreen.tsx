import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Theme } from '../constants/theme';
import * as SQLite from 'expo-sqlite';

export const ClientDetailScreen = ({ route, navigation }) => {
  const { routeId } = route.params;
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
      // En una versión real, esto también intentaría sincronizar primero con la API
      const localClients = await db.getAllAsync(
        'SELECT * FROM local_clients WHERE route_id = ? ORDER BY visit_order',
        [routeId]
      );
      setClients(localClients);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const renderClient = ({ item }) => (
    <TouchableOpacity 
      style={styles.clientCard}
      onPress={() => navigation.navigate('ReportVisit', { client: item })}
    >
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientAddress}>{item.address}</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: item.status === 'visited' ? Theme.colors.success : Theme.colors.warning }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes en Ruta</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClient}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay clientes cargados para esta ruta.</Text>}
      />
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
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  clientCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  clientAddress: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  }
});
