import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../constants/theme';
import { Map, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/db';

export const ClientDetailScreen = ({ route, navigation }: any) => {
  const { routeId } = route.params;
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      const db = await getDatabase();
      const localClients: any[] = await db.getAllAsync(
        'SELECT * FROM local_clients WHERE route_id = ? ORDER BY visit_order',
        [routeId]
      );
      setClients(localClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [fetchClients])
  );

  const allFinished = clients.length > 0 && clients.every(c => 
    c.status === 'visitado' || c.status === 'abandonado' || c.status === 'visited'
  );

  const renderClient = ({ item }: { item: any }) => {
    const isFinished = item.status === 'visitado' || item.status === 'abandonado' || item.status === 'visited';
    const isAbandoned = item.status === 'abandonado';
    
    return (
      <TouchableOpacity 
        style={[
          styles.clientCard, 
          isFinished && { 
            borderLeftColor: isAbandoned ? Theme.colors.error : Theme.colors.success,
            backgroundColor: isAbandoned ? Theme.colors.error + '10' : Theme.colors.success + '10'
          }
        ]}
        onPress={() => isFinished ? Alert.alert('Completado', 'Esta visita ya ha sido registrada.') : navigation.navigate('ClientVisit', { client: item })}
      >
        <View style={styles.clientInfo}>
          <Text style={[styles.clientName, isFinished && { color: Theme.colors.textMuted }]}>{item.name}</Text>
          <Text style={styles.clientAddress} numberOfLines={1}>{item.address || 'Sin dirección'}</Text>
          {isFinished && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <CheckCircle2 size={12} color={isAbandoned ? Theme.colors.error : Theme.colors.success} />
              <Text style={{ color: isAbandoned ? Theme.colors.error : Theme.colors.success, fontSize: 12, fontWeight: 'bold' }}>
                {isAbandoned ? 'RECHAZADO / ABANDONADO' : 'VISITA COMPLETADA'}
              </Text>
            </View>
          )}
        </View>
        {isFinished ? (
          <CheckCircle2 size={20} color={isAbandoned ? Theme.colors.error : Theme.colors.success} />
        ) : (
          <ChevronRight size={20} color={Theme.colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, allFinished && styles.headerSuccess]}>
        <View>
          <Text style={[styles.title, allFinished && { color: Theme.colors.background }]}>Ruta #{routeId}</Text>
          <Text style={[styles.subtitle, allFinished && { color: Theme.colors.background + 'CC' }]}>
            {clients.filter(c => c.status === 'visitado' || c.status === 'visited').length} de {clients.length} visitas completadas
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => navigation.navigate('RouteMap', { clients, routeId })}
        >
          <Map size={20} color={Theme.colors.background} />
          <Text style={styles.mapButtonText}>Ver Ruta</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClient}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay clientes cargados para esta ruta.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: Theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.surfaceLight,
  },
  headerSuccess: {
    backgroundColor: Theme.colors.primary, // Verde InDrive Lima
    borderBottomColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  mapButton: {
    backgroundColor: Theme.colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mapButtonText: {
    color: Theme.colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  clientCard: {
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
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
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 50,
  }
});
