import axios from 'axios';

export interface RouteGeometry {
  coordinates: [number, number][];
}

export class RoutingService {
  // Usamos el demo server de OSRM. En producción se recomienda uno propio.
  private static OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

  /**
   * Obtiene la geometría de la ruta que une varios puntos siguiendo las calles.
   * @param waypoints Lista de {lat, lng}
   */
  static async getRouteGeometry(waypoints: { lat: number, lng: number }[]): Promise<[number, number][]> {
    if (waypoints.length < 2) return [];

    try {
      const coordsString = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
      const url = `${this.OSRM_BASE_URL}/${coordsString}?overview=full&geometries=geojson`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        // OSRM GeoJSON devuelve [lng, lat], react-native-maps Polyline espera {latitude, longitude}
        // pero lo convertiremos aquí a [lat, lng] para facilitar el mapeo luego
        return response.data.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
      }
      
      // Fallback a líneas rectas si falla el servicio
      return waypoints.map(w => ({ latitude: w.lat, longitude: w.lng }));
    } catch (error) {
      console.error('Error fetching routing from OSRM:', error);
      // Fallback a líneas rectas
      return waypoints.map(w => ({ latitude: w.lat, longitude: w.lng }));
    }
  }
}
