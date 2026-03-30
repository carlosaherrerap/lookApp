import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  Alert, ScrollView, StatusBar, ActivityIndicator, Platform, ToastAndroid
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { 
  Navigation, CheckCircle2, ChevronLeft, FileText, 
  AlertTriangle, XCircle, MapPin 
} from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme } from '../constants/theme';
import { CustomMarker } from '../components/CustomMarker';
import { RoutingService, RouteGeometry } from '../services/RoutingService';
import { Config } from '../constants/Config';
import { getStatusColor, getStatusLabel } from '../utils/StatusHelper';

const API_URL = Config.API_URL;
const routeCache = new Map<string, { data: RouteGeometry[], ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(lat: number, lng: number, destLat: number, destLng: number) {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `${r(lat)},${r(lng)}->${r(destLat)},${r(destLng)}`;
}

async function getRouteWithCache(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteGeometry[]> {
  const key = getCacheKey(fromLat, fromLng, toLat, toLng);
  const cached = routeCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  const data = await RoutingService.getRouteGeometry([{ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }]);
  routeCache.set(key, { data, ts: Date.now() });
  return data;
}

export const ClientVisitScreen = ({ route, navigation }: any) => {
  const { client } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const lastFetchCoords = useRef<{ lat: number; lng: number } | null>(null);

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [abandonModalVisible, setAbandonModalVisible] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [navigationPath, setNavigationPath] = useState<RouteGeometry[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [enCaminoLoading, setEnCaminoLoading] = useState(false);
  const [clientStatus, setClientStatus] = useState(client.status || 'PROGRAMADO');
  const [globalEnCamino, setGlobalEnCamino] = useState<string | null>(null);

  const clientCoords = {
    latitude: client.location?.coordinates ? client.location.coordinates[1] : (client.lat || 0),
    longitude: client.location?.coordinates ? client.location.coordinates[0] : (client.lng || 0),
  };
  const hasLocation = clientCoords.latitude !== 0 && clientCoords.longitude !== 0;

  useEffect(() => {
    const loadState = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const res = await axios.get(`${API_URL}/clients/active`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data) {
          setGlobalEnCamino(res.data.id.toString());
          if (res.data.id === client.id) {
              setClientStatus('EN CAMINO');
          }
        } else {
          setGlobalEnCamino(null);
          if (clientStatus === 'EN CAMINO') setClientStatus(client.status || 'PROGRAMADO');
        }
      } catch (e) {
        console.error('Error sync active client:', e);
      }
    };
    loadState();
  }, []);

  const fetchRoute = useCallback(async (coords: { latitude: number; longitude: number }) => {
    if (!hasLocation) return;
    const last = lastFetchCoords.current;
    if (last) {
      const dx = Math.abs(coords.latitude - last.lat);
      const dy = Math.abs(coords.longitude - last.lng);
      if (dx < 0.0005 && dy < 0.0005) return;
    }

    lastFetchCoords.current = { lat: coords.latitude, lng: coords.longitude };
    setRouteLoading(true);
    try {
      const path = await getRouteWithCache(coords.latitude, coords.longitude, clientCoords.latitude, clientCoords.longitude);
      setNavigationPath(path);
    } catch (e) {
      console.warn('Route fetch failed:', e);
    } finally {
      setRouteLoading(false);
    }
  }, [hasLocation, clientCoords.latitude, clientCoords.longitude]);

  useEffect(() => {
    if (!hasLocation) return;
    let subscription: any;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCurrentLocation(loc.coords);
      fetchRoute(loc.coords);
      subscription = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 50 }, (loc) => {
          setCurrentLocation(loc.coords);
          fetchRoute(loc.coords);
      });
    })();
    return () => { subscription?.remove(); };
  }, [hasLocation, fetchRoute]);

  useEffect(() => {
    if (navigationPath.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(navigationPath, {
        edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
        animated: true,
      });
    }
  }, [navigationPath]);

  const handleEnCamino = async () => {
    if (clientStatus === 'EN CAMINO') {
        handleCancelEnCamino();
        return;
    }

    if (globalEnCamino) {
      Alert.alert('Bloqueado', 'Ya estás en camino a otro cliente. Cancela ese destino primero.');
      return;
    }
    processEnCamino();
  };

  const processEnCamino = async () => {
    setEnCaminoLoading(true);
    try {
      const token = await AsyncStorage.getItem('user_token');
      await axios.patch(`${API_URL}/clients/${client.id}/en-camino`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await AsyncStorage.setItem(`travel_start_${client.id}`, new Date().toISOString());

      setClientStatus('EN CAMINO');
      setGlobalEnCamino(client.id.toString());
      Alert.alert('¡En Camino!', 'Te diriges a este cliente. Los demás clientes ahora están bloqueados para ti.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo marcar como EN CAMINO');
    } finally {
      setEnCaminoLoading(false);
    }
  };

  const handleCancelEnCamino = async () => {
    Alert.alert('Cancelar Traslado', '¿Estás seguro que deseas dejar de ir a este cliente?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, Cancelar', style: 'destructive', onPress: async () => {
          setEnCaminoLoading(true);
          try {
            const token = await AsyncStorage.getItem('user_token');
            await axios.patch(`${API_URL}/clients/${client.id}`, { status: 'PROGRAMADO' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await AsyncStorage.removeItem(`travel_start_${client.id}`);
            setClientStatus('PROGRAMADO');
            setGlobalEnCamino(null);
          } catch (e) {
            Alert.alert('Error', 'No se pudo cancelar el traslado.');
          } finally {
            setEnCaminoLoading(false);
          }
      }}
    ]);
  };

  const handleGoToReport = () => {
    navigation.navigate('ReportVisit', { client: { ...client, status: clientStatus } });
  };

  const isEnCamino = clientStatus === 'EN CAMINO';
  const isVisitado = clientStatus?.toUpperCase() === 'VISITADO' || clientStatus?.toUpperCase() === 'FINALIZADO';
  const isMine = globalEnCamino === client.id.toString();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {hasLocation ? (
        <View style={styles.mapContainer}>
          <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={{ ...clientCoords, latitudeDelta: 0.012, longitudeDelta: 0.012 }} showsUserLocation={true} showsMyLocationButton={false} customMapStyle={mapStyle}>
            {navigationPath.length > 0 && <Polyline coordinates={navigationPath} strokeColor={Theme.colors.primary} strokeWidth={5} lineDashPattern={[0]} />}
            <CustomMarker coordinate={clientCoords} title={`${client.name}`} status={clientStatus} />
          </MapView>
          <TouchableOpacity style={[styles.backFab, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Theme.colors.text} />
          </TouchableOpacity>
          {routeLoading && (
            <View style={styles.routeLoadingBadge}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
              <Text style={styles.routeLoadingText}>Trazando ruta...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.noLocationHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={22} color={Theme.colors.text} /></TouchableOpacity>
          <Text style={styles.noLocationTitle}>Sin Ubicación GPS</Text>
          <Text style={styles.noLocationSub}>Solo dirección disponible</Text>
        </View>
      )}

      <View style={styles.infoPanel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.clientRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{client.name} {client.apellido_paterno || ''}</Text>
              <Text style={styles.addressText}><MapPin size={10} color={Theme.colors.textMuted} /> {client.address || 'Sin dirección'}</Text>
            </View>
            <View style={[styles.statusPill, { borderColor: getStatusColor(clientStatus) }]}>
              <Text style={[styles.statusPillText, { color: getStatusColor(clientStatus) }]}>
                {getStatusLabel(clientStatus)}
              </Text>
            </View>
          </View>

          {globalEnCamino && !isMine && (
            <View style={styles.warningBox}>
              <AlertTriangle size={16} color={Theme.colors.warning} />
              <Text style={styles.warningText}>Ya estás en camino a otro cliente. Libérate primero.</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {!isVisitado && (
              <TouchableOpacity
                style={[
                    styles.actionBtn, 
                    isEnCamino ? styles.cancelBtn : styles.enCaminoBtn, 
                    (globalEnCamino && !isMine) && styles.disabledBtn
                ]}
                onPress={handleEnCamino}
                disabled={enCaminoLoading || (globalEnCamino && !isMine)}
              >
                {isEnCamino ? <XCircle color="#fff" size={20} /> : <Navigation color="#fff" size={20} />}
                <Text style={styles.actionBtnText}>
                  {enCaminoLoading ? 'PROCESANDO...' : isEnCamino ? 'CANCELAR TRASLADO' : 'MARCAR EN CAMINO'}
                </Text>
              </TouchableOpacity>
            )}

            {!isVisitado && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.fichaBtn, !isEnCamino && styles.disabledBtn]}
                onPress={handleGoToReport}
                disabled={!isEnCamino}
              >
                <View style={styles.row}>
                  <FileText color="#fff" size={20} />
                  <Text style={styles.actionBtnText}>
                    {isEnCamino ? 'LLENAR FICHA' : 'BLOQUEADO (DEBE ESTAR EN CAMINO)'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {isVisitado && (
              <View style={styles.visitedBox}>
                <CheckCircle2 color={Theme.colors.success} size={24} />
                <Text style={styles.visitedText}>CLIENTE FINALIZADO</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal visible={abandonModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Motivo de Abandono</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Describe el motivo..."
              placeholderTextColor={Theme.colors.textMuted}
              value={abandonReason}
              onChangeText={setAbandonReason}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Theme.colors.surfaceLight }]}
                onPress={() => setAbandonModalVisible(false)}
              >
                <Text style={{ color: Theme.colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Theme.colors.error }]}
                onPress={() => {
                  if (!abandonReason.trim()) return;
                  setAbandonModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStyle = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { elementType: 'geometry', stylers: [{ color: '#1B1B1F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8A93A8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2E2E3A' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373747' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D2137' }] },
];

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  container: { flex: 1, backgroundColor: Theme.colors.background },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  backFab: {
    position: 'absolute',
    left: 16,
    backgroundColor: Theme.colors.surface + 'EE',
    padding: 10,
    borderRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  routeLoadingBadge: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.surface + 'EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  routeLoadingText: { color: Theme.colors.textMuted, fontSize: 12 },
  noLocationHeader: {
    padding: 20,
    backgroundColor: Theme.colors.surface,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  noLocationTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text, marginTop: 12 },
  noLocationSub: { fontSize: 13, color: Theme.colors.textMuted },
  infoPanel: {
    maxHeight: '45%',
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  clientName: { fontSize: 17, fontWeight: '800', color: Theme.colors.text, marginBottom: 3 },
  addressText: { fontSize: 13, color: Theme.colors.textMuted, marginBottom: 2 },
  statusPill: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.warning + '18',
    borderWidth: 1,
    borderColor: Theme.colors.warning + '50',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  warningText: { flex: 1, fontSize: 12, color: Theme.colors.warning, lineHeight: 18 },
  actionsContainer: { gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  enCaminoBtn: { backgroundColor: '#F1C40F' },
  cancelBtn: { backgroundColor: '#E74C3C' },
  fichaBtn: { backgroundColor: Theme.colors.primary },
  disabledBtn: { opacity: 0.4 },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  visitedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: Theme.colors.success + '18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.success + '50',
  },
  visitedText: { color: Theme.colors.success, fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text },
  modalInput: {
    backgroundColor: Theme.colors.background,
    borderRadius: 10,
    padding: 12,
    color: Theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
