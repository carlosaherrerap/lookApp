import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Theme } from '../constants/theme';
import { CustomMarker } from '../components/CustomMarker';
import { ChevronLeft } from 'lucide-react-native';

export const RouteMapScreen = ({ route, navigation }: any) => {
  const { clients, routeId } = route.params;
  const mapRef = useRef<MapView>(null);

  const coordinates = clients.map((c: any) => ({
    latitude: c.lat,
    longitude: c.lng,
  }));

  useEffect(() => {
    if (coordinates.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: coordinates[0]?.latitude || 0,
          longitude: coordinates[0]?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapStyle}
      >
        {clients.map((client: any, index: number) => (
          <CustomMarker
            key={client.id}
            coordinate={{ latitude: client.lat, longitude: client.lng }}
            title={client.name}
            order={index + 1}
            status={client.status}
          />
        ))}

        <Polyline
          coordinates={coordinates}
          strokeColor={Theme.colors.primary}
          strokeWidth={4}
          lineDashPattern={[0]}
        />
      </MapView>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={24} color={Theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.infoBadge}>
        <Text style={styles.infoText}>Ruta #{routeId} • {clients.length} Puntos</Text>
      </View>
    </View>
  );
};

const mapStyle = [
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: Theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    elevation: 5,
  },
  infoBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  infoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
