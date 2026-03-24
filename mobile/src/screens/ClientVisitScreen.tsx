import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Theme } from '../constants/theme';
import * as Location from 'expo-location';
import { Navigation, ClipboardList, XOctagon, ChevronLeft } from 'lucide-react-native';
import { CustomMarker } from '../components/CustomMarker';
import { RoutingService, RouteGeometry } from '../services/RoutingService';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.55:3009';

export const ClientVisitScreen = ({ route, navigation }: any) => {
  const { client } = route.params;
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [abandonModalVisible, setAbandonModalVisible] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [showFullMap, setShowFullMap] = useState(false);
  const [navigationPath, setNavigationPath] = useState<RouteGeometry[]>([]);

  const clientCoords = {
    latitude: client.location?.coordinates ? client.location.coordinates[1] : (client.lat || 0),
    longitude: client.location?.coordinates ? client.location.coordinates[0] : (client.lng || 0),
  };

  const hasLocation = clientCoords.latitude !== 0 && clientCoords.longitude !== 0;
  const [enCaminoLoading, setEnCaminoLoading] = useState(false);

  const fetchNavigationPath = async (coords: { latitude: number, longitude: number }) => {
    if (!hasLocation) return;
    try {
      const path = await RoutingService.getRouteGeometry([
        { lat: coords.latitude, lng: coords.longitude },
        { lat: clientCoords.latitude, lng: clientCoords.longitude }
      ]);
      setNavigationPath(path);
    } catch (error) {
      console.error('Error fetching navigation path:', error);
    }
  };

  useEffect(() => {
    if (!hasLocation) return;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      fetchNavigationPath(location.coords);

      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => {
          setCurrentLocation(loc.coords);
          fetchNavigationPath(loc.coords);
        }
      );

      return () => subscription.remove();
    })();
  }, [hasLocation]);

  const handleEnCamino = async () => {
    setEnCaminoLoading(true);
    try {
      const token = await AsyncStorage.getItem('user_token');
      await axios.patch(`${API_URL}/clients/${client.id}/en-camino`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Guardar tiempo de inicio de traslado
      const startTime = new Date().toISOString();
      await AsyncStorage.setItem(`travel_start_${client.id}`, startTime);
      
      Alert.alert('¡En Camino!', 'Tu tiempo de traslado ha comenzado a cronometrarse.');
      // Refrescar estado local
      client.status = 'EN CAMINO';
      navigation.setParams({ client: { ...client, status: 'EN CAMINO' } });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo marcar como EN CAMINO';
      Alert.alert('Atención', msg);
    } finally {
      setEnCaminoLoading(false);
    }
  };

  const handleAbandon = () => {
    if (!abandonReason.trim()) return Alert.alert('Error', 'Debes ingresar un motivo');
    Alert.alert('Éxito', 'Visita marcada como abandonada');
    setAbandonModalVisible(false);
    navigation.goBack();
  };

  const isEnCamino = client.status === 'EN CAMINO';
  const isVisitado = client.status === 'visitado' || client.status === 'VISITADO';

  return (
    <View style={styles.container}>
      {hasLocation ? (
        <View style={[styles.mapContainer, showFullMap ? styles.fullMap : null]}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              ...clientCoords,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
            showsMyLocationButton={true}
            customMapStyle={mapStyle}
          >
            {navigationPath.length > 0 && (
              <Polyline
                coordinates={navigationPath}
                strokeColor={Theme.colors.primary}
                strokeWidth={4}
              />
            )}

            <CustomMarker 
              coordinate={clientCoords} 
              title={client.name}
            />
          </MapView>
          
          <TouchableOpacity style={styles.backFab} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={Theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mapToggle} 
            onPress={() => setShowFullMap(!showFullMap)}
          >
            <Text style={styles.mapToggleText}>{showFullMap ? 'Ver Detalle' : 'Ver Mapa Completo'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noLocationHeader}>
            <TouchableOpacity style={styles.backFabInline} onPress={() => navigation.goBack()}>
                <ChevronLeft size={24} color={Theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.noLocationTitle}>Sin Ubicación GPS</Text>
            <Text style={styles.noLocationSub}>Solo dirección física disponible</Text>
        </View>
      )}

      {!showFullMap && (
        <View style={[styles.infoArea, !hasLocation && { borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.clientHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{client.name} {client.apellido_paterno || ''}</Text>
                <Text style={styles.addressText}>{client.address || 'Sin dirección'}</Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: isEnCamino ? '#FFAA00' : Theme.colors.warning }]}>
                <Text style={[styles.statusText, { color: isEnCamino ? '#FFAA00' : Theme.colors.warning }]}>
                    {client.status?.toUpperCase() || 'PENDIENTE'}
                </Text>
              </View>
            </View>
            
            {hasLocation && (
                <View style={styles.coordsContainer}>
                    <Text style={styles.coordsLabel}>Coordenadas Destino</Text>
                    <Text style={styles.coordsText}>Lat: {clientCoords.latitude.toFixed(5)}, Lng: {clientCoords.longitude.toFixed(5)}</Text>
                </View>
            )}

            {client.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descripción / Referencia</Text>
                <Text style={styles.descriptionText}>{client.description}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {!isEnCamino && !isVisitado && (
                <TouchableOpacity 
                    style={[styles.actionButton, styles.enCaminoButton]}
                    onPress={handleEnCamino}
                    disabled={enCaminoLoading}
                >
                    <Navigation color={Theme.colors.background} size={22} />
                    <Text style={styles.enCaminoButtonText}>
                        {enCaminoLoading ? 'PROCESANDO...' : 'MARCAR EN CAMINO'}
                    </Text>
                </TouchableOpacity>
              )}

              {isEnCamino && (
                <TouchableOpacity 
                    style={[styles.actionButton, styles.registerButton]}
                    onPress={() => navigation.navigate('ReportVisit', { client })}
                >
                    <ClipboardList color={Theme.colors.background} size={22} />
                    <Text style={styles.registerButtonText}>FINALIZAR REPORTE</Text>
                </TouchableOpacity>
              )}

              {!isVisitado && (
                <TouchableOpacity 
                    style={[styles.actionButton, styles.abandonButton]}
                    onPress={() => setAbandonModalVisible(true)}
                >
                    <XOctagon color={Theme.colors.text} size={22} />
                    <Text style={styles.abandonButtonText}>ABANDONAR</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      <Modal visible={abandonModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Motivo de Abandono</Text>
            <TextInput
              style={styles.input}
              placeholder="Explique por qué no se pudo visitar..."
              placeholderTextColor={Theme.colors.textMuted}
              multiline
              numberOfLines={4}
              value={abandonReason}
              onChangeText={setAbandonReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setAbandonModalVisible(false)}>
                <Text style={styles.cancelBtnText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAbandon}>
                <Text style={styles.confirmBtnText}>ENVIAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStyle = [
    { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  mapContainer: { height: '35%', width: '100%' },
  fullMap: { height: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  backFab: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: Theme.colors.surface,
    padding: 10,
    borderRadius: 12,
    elevation: 4,
  },
  mapToggle: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  mapToggleText: { color: Theme.colors.text, fontWeight: 'bold', fontSize: 13 },
  infoArea: { flex: 1, backgroundColor: Theme.colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 24, elevation: 10 },
  clientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  clientName: { fontSize: 26, fontWeight: 'bold', color: Theme.colors.text },
  addressText: { color: Theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  statusBadge: { backgroundColor: Theme.colors.warning + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Theme.colors.warning + '40' },
  statusText: { color: Theme.colors.warning, fontSize: 10, fontWeight: '800' },
  coordsContainer: { backgroundColor: Theme.colors.surface, padding: 16, borderRadius: 12, marginBottom: 20 },
  coordsLabel: { color: Theme.colors.primary, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  coordsText: { color: Theme.colors.text, fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { color: Theme.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  descriptionText: { color: Theme.colors.text, fontSize: 15, lineHeight: 22 },
  buttonContainer: { gap: 12, marginTop: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 12 },
  registerButton: { backgroundColor: Theme.colors.primary },
  registerButtonText: { color: Theme.colors.background, fontWeight: '900', fontSize: 16 },
  abandonButton: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.surfaceLight },
  abandonButtonText: { color: Theme.colors.text, fontWeight: '700', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: Theme.colors.surface, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: Theme.colors.surfaceLight },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: Theme.colors.surfaceLight, borderRadius: 12, padding: 16, color: Theme.colors.text, textAlignVertical: 'top', height: 120, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent' },
  cancelBtnText: { color: Theme.colors.textMuted, fontWeight: 'bold' },
  confirmBtn: { backgroundColor: Theme.colors.primary },
  confirmBtnText: { color: Theme.colors.background, fontWeight: 'bold' },
  
  // New Styles v2.0
  noLocationHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backFabInline: {
    position: 'absolute',
    top: 55,
    left: 20,
  },
  noLocationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  noLocationSub: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  enCaminoButton: {
    backgroundColor: '#FFAA00', // Dorado Adobe
  },
  enCaminoButtonText: {
    color: Theme.colors.background,
    fontWeight: '900',
    fontSize: 16,
  }
});
