import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class IdleMonitorService {
  private interval: any = null;
  private lastLocation: Location.LocationObjectCoords | null = null;
  private idleStartTime: number | null = null;
  private readonly IDLE_LIMIT = 10 * 60 * 1000; // 10 minutes
  private readonly DISTANCE_TOLERANCE = 3; // 3 meters

  async start() {
    if (this.interval) return;

    // Permissions check
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    this.interval = setInterval(async () => {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const current = loc.coords;

      if (!this.lastLocation) {
        this.lastLocation = current;
        this.idleStartTime = Date.now();
        return;
      }

      // Calculate distance (very basic approximation for tiny distances)
      const dist = this.getDistance(this.lastLocation, current);

      if (dist < this.DISTANCE_TOLERANCE) {
        // Still idle
        if (this.idleStartTime) {
          const idleTime = Date.now() - this.idleStartTime;
          if (idleTime > this.IDLE_LIMIT) {
             this.triggerAlert();
             this.idleStartTime = Date.now(); // Reset to avoid flooding
          }
        }
      } else {
        // Moved! Reset idle timer
        this.lastLocation = current;
        this.idleStartTime = Date.now();
      }
    }, 60000); // Check every minute
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private triggerAlert() {
    Alert.alert(
      'Aviso de Inactividad',
      'Has estado en la misma ubicación por más de 10 minutos. Por favor, reporta tu estado si hay algún inconveniente.',
      [{ text: 'Entendido' }]
    );
  }

  private getDistance(c1: Location.LocationObjectCoords, c2: Location.LocationObjectCoords) {
    const R = 6371e3; // metres
    const φ1 = c1.latitude * Math.PI/180;
    const φ2 = c2.latitude * Math.PI/180;
    const Δφ = (c2.latitude-c1.latitude) * Math.PI/180;
    const Δλ = (c2.longitude-c1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

export const idleMonitor = new IdleMonitorService();
