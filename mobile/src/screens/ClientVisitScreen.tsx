import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Theme } from '../constants/theme';
import * as Location from 'expo-location';
import { MapPin, Navigation, ClipboardList, XOctagon } from 'lucide-react-native';

export const ClientVisitScreen = ({ route, navigation }) => {
  const { client } = route.params;
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [abandonModalVisible, setAbandonModalVisible] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [showFullMap, setShowFullMap] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, []);

  const handleAbandon = () => {
    if (!abandonReason.trim()) return Alert.alert('Error', 'Debes ingresar un motivo');
    // Aquí se guardaría el estado 'abandonado' localmente
    Alert.alert('Éxito', 'Visita marcada como abandonada');
    setAbandonModalVisible(false);
    navigation.goBack();
  };

  const clientCoords = {
    latitude: client.location.coordinates[1],
    longitude: client.location.coordinates[0],
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={[styles.mapContainer, showFullMap ? styles.fullMap : null]}>
        <MapView
          style={styles.map}
          initialRegion={{
            ...clientCoords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          <Marker coordinate={clientCoords} title={client.name}>
             <View style={styles.customMarker}>
               <MapPin size={24} color={Theme.colors.text} />
             </View>
          </Marker>
        </MapView>
        
        <TouchableOpacity 
          style={styles.mapToggle} 
          onPress={() => setShowFullMap(!showFullMap)}
        >
          <Text style={styles.mapToggleText}>{showFullMap ? 'Ver Detalle' : 'Ver Mapa Completo'}</Text>
        </TouchableOpacity>
      </View>

      {/* Info & Actions */}
      {!showFullMap && (
        <ScrollView style={styles.infoArea}>
          <View style={styles.clientHeader}>
            <Text style={styles.clientName}>{client.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{client.status?.toUpperCase() || 'PENDIENTE'}</Text>
            </View>
          </View>
          
          <Text style={styles.addressLabel}>Dirección:</Text>
          <Text style={styles.addressText}>{client.address || 'Sin dirección especificada'}</Text>

          {client.description && (
            <>
              <Text style={styles.addressLabel}>Descripción:</Text>
              <Text style={styles.addressText}>{client.description}</Text>
            </>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.registerButton]}
              onPress={() => navigation.navigate('ReportVisit', { client })}
            >
              <ClipboardList color="#fff" size={24} />
              <Text style={styles.buttonText}>REGISTRAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.abandonButton]}
              onPress={() => setAbandonModalVisible(true)}
            >
              <XOctagon color="#fff" size={24} />
              <Text style={styles.buttonText}>ABANDONAR</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Abandon Modal */}
      <Modal visible={abandonModalVisible} transparent animationType="slide">
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
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setAbandonModalVisible(false)}
              >
                <Text style={styles.btnText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleAbandon}
              >
                <Text style={styles.btnText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  mapContainer: {
    height: '40%',
    width: '100%',
  },
  fullMap: {
    height: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapToggle: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  mapToggleText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoArea: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Theme.colors.warning + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.warning,
  },
  statusText: {
    color: Theme.colors.warning,
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressLabel: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 15,
  },
  addressText: {
    color: Theme.colors.text,
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  registerButton: {
    backgroundColor: Theme.colors.primary,
  },
  abandonButton: {
    backgroundColor: Theme.colors.danger,
  },
  buttonText: {
    color: Theme.colors.background,
    fontWeight: 'bold',
    fontSize: 18,
  },
  customMarker: {
    backgroundColor: Theme.colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    color: Theme.colors.text,
    textAlignVertical: 'top',
    height: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Theme.colors.textMuted,
  },
  confirmBtn: {
    backgroundColor: Theme.colors.primary,
  },
  btnText: {
    fontWeight: 'bold',
    color: Theme.colors.text,
  }
});
