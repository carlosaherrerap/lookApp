import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Theme } from '../constants/theme';
import { Search, MapPin, Clock, ChevronRight, User } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

const API_URL = Config.API_URL;

import { getStatusColor, getStatusLabel } from '../utils/StatusHelper';

const getUbigeoLabel = (ubigeo: number | null) => {
  if (!ubigeo) return '';
  const s = ubigeo.toString().padStart(6, '0');
  return `${s.substring(0, 2)}-${s.substring(2, 4)}-${s.substring(4, 6)}`;
};

export const MundoScreen = ({ navigation }: any) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMundo = async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      const response = await axios.get(`${API_URL}/clients/mundo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (e) {
      console.error('Error fetching mundo:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMundo(); }, []);

  const filteredClients = clients.filter(c => {
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.apellido_paterno?.toLowerCase().includes(term) ||
      c.address?.toLowerCase().includes(term) ||
      c.id?.toString().includes(term)
    );
  });

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'S/F';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ClientVisit', { client: item })}
    >
      <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name} {item.apellido_paterno}
          </Text>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.itemAddress} numberOfLines={1}>
          <MapPin size={10} color={Theme.colors.textMuted} /> {item.address || 'Sin dirección'}
        </Text>

        <View style={styles.itemFooter}>
          <View style={styles.footerChip}>
            <User size={10} color={Theme.colors.primary} />
            <Text style={styles.chipText}>ID: {item.id}</Text>
          </View>
          <View style={styles.footerChip}>
            <Clock size={10} color={Theme.colors.primary} />
            <Text style={styles.chipText}>{formatDateTime(item.fecha_visita)}</Text>
          </View>
          {item.ubigeo ? (
             <Text style={styles.ubigeoText}>{getUbigeoLabel(item.ubigeo)}</Text>
          ) : null}
        </View>
      </View>
      <ChevronRight size={20} color={Theme.colors.textMuted} style={{ marginRight: 10 }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mundo</Text>
        <Text style={styles.headerSub}>Todos los clientes del sistema</Text>
        <View style={styles.searchContainer}>
          <Search size={18} color={Theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, dirección o ID..."
            placeholderTextColor={Theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchMundo} tintColor={Theme.colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay clientes disponibles.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: Theme.colors.text },
  headerSub: { fontSize: 13, color: Theme.colors.textMuted, marginBottom: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 42,
  },
  searchInput: { flex: 1, marginLeft: 10, color: Theme.colors.text, fontSize: 14 },
  list: { padding: 15 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statusBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemAddress: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  ubigeoText: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 60,
    fontSize: 14,
  },
});
