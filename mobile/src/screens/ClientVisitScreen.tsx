import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Theme } from '../constants/theme';
import * as Location from 'expo-location';
import { Navigation, ClipboardList, XOctagon, ChevronLeft } from 'lucide-react-native';
import { CustomMarker } from '../components/CustomMarker';
import { RoutingService, RouteGeometry } from '../services/RoutingService';

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

  const fetchNavigationPath = async (coords: { latitude: number, longitude: number }) => {
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
  }, []);

  const handleAbandon = () => {
    if (!abandonReason.trim()) return Alert.alert('Error', 'Debes ingresar un motivo');
    Alert.alert('Éxito', 'Visita marcada como abandonada');
    setAbandonModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
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
              strokeColor="#38bdf8"
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

      {!showFullMap && (
        <View style={styles.infoArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.clientHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.addressText}>{client.address || 'Sin dirección'}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{client.status?.toUpperCase() || 'PENDIENTE'}</Text>
              </View>
            </View>
            
            <View style={styles.coordsContainer}>
                <Text style={styles.coordsLabel}>Coordenadas Destino</Text>
                <Text style={styles.coordsText}>Lat: {clientCoords.latitude.toFixed(5)}, Lng: {clientCoords.longitude.toFixed(5)}</Text>
            </View>

            {client.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descripción / Referencia</Text>
                <Text style={styles.descriptionText}>{client.description}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.registerButton]}
                onPress={() => navigation.navigate('ReportVisit', { client })}
              >
                <ClipboardList color={Theme.colors.background} size={22} />
                <Text style={styles.registerButtonText}>REGISTRAR VISITA</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.abandonButton]}
                onPress={() => setAbandonModalVisible(true)}
              >
                <XOctagon color={Theme.colors.text} size={22} />
                <Text style={styles.abandonButtonText}>ABANDONAR</Text>
              </TouchableOpacity>
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
  confirmBtnText: { color: Theme.colors.background, fontWeight: 'bold' }
});
