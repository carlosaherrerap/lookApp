import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Theme } from '../constants/theme';
import { Search, MapPin, Clock, ChevronRight } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.55:3009';

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMundo();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROGRAMADO': return '#FF4D4D'; // Rojo
      case 'EN CAMINO': return '#FFAA00'; // Dorado/Naranja
      case 'REPROGRAMAR': return '#00a4e4'; // Azul
      case 'visitado': return '#00f0ff'; // Cyan
      default: return Theme.colors.textMuted;
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('ClientVisit', { client: item })}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name} {item.apellido_paterno}</Text>
        <Text style={styles.itemAddress} numberOfLines={1}>{item.address}</Text>
        <View style={styles.itemFooter}>
            <View style={styles.footerInfo}>
                <MapPin size={14} color={Theme.colors.textMuted} />
                <Text style={styles.footerText}>ID: {item.id}</Text>
            </View>
            <View style={styles.footerInfo}>
                <Clock size={14} color={Theme.colors.textMuted} />
                <Text style={styles.footerText}>{item.fecha_visita || 'Hoy'}</Text>
            </View>
        </View>
      </View>
      <ChevronRight color={Theme.colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente global..."
            placeholderTextColor={Theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchMundo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: Theme.colors.text,
  },
  list: {
    padding: Theme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    gap: 15,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  }
});
