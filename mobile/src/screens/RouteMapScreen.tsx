import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Theme } from '../constants/theme';
import { CustomMarker } from '../components/CustomMarker';
import { ChevronLeft } from 'lucide-react-native';
import { RoutingService, RouteGeometry } from '../services/RoutingService';

export const RouteMapScreen = ({ route, navigation }: any) => {
  const { clients, routeId } = route.params;
  const mapRef = useRef<MapView>(null);
  const [routePath, setRoutePath] = useState<RouteGeometry[]>([]);
  const [loading, setLoading] = useState(true);

  const waypoints = clients.map((c: any) => ({
    lat: c.lat,
    lng: c.lng,
  }));

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const path = await RoutingService.getRouteGeometry(waypoints);
      setRoutePath(path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  useEffect(() => {
    if (waypoints.length > 0 && mapRef.current) {
      // Priorizar el fit a la ruta trazada si existe, sino a los puntos
      const coords = routePath.length > 0 
        ? routePath 
        : waypoints.map((w: any) => ({ latitude: w.lat, longitude: w.lng }));

      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [routePath, waypoints]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: waypoints[0]?.lat || 0,
          longitude: waypoints[0]?.lng || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Polyline
          coordinates={routePath}
          strokeColor={Theme.colors.primary}
          strokeWidth={4}
          lineDashPattern={[0]}
        />

        {clients.map((client: any, index: number) => (
          <CustomMarker
            key={client.id}
            coordinate={{ latitude: client.lat, longitude: client.lng }}
            title={client.name}
            order={index + 1}
            status={client.status}
          />
        ))}
      </MapView>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={24} color={Theme.colors.text} />
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Trazando ruta por calles...</Text>
        </View>
      )}

      {!loading && (
        <View style={styles.infoBadge}>
          <Text style={styles.infoText}>Ruta #{routeId} • {clients.length} Puntos</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    zIndex: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Theme.colors.primary,
    marginTop: 10,
    fontWeight: 'bold',
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
