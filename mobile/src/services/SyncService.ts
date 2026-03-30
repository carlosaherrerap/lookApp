import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ToastAndroid, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Config } from '../constants/Config';
import { getDatabase } from '../database/db';

const API_URL = Config.API_URL;

interface SyncItem {
  id: number;
  type: string;
  payload: string;
  event_timestamp: string;
  status: string;
}

export class SyncService {
  private static isSyncing = false;

  static async queueReport(type: 'visit_report' | 'time_log' | 'tracking', payload: any) {
    const timestamp = new Date().toISOString();
    // Inject timestamp into payload itself for proper backend mapping
    const enrichedPayload = { ...payload, event_timestamp: timestamp };
    
    // Save to local SQLite first (Audit/Cache)
    await db.runAsync(
      'INSERT INTO sync_queue (type, payload, event_timestamp) VALUES (?, ?, ?)',
      [type, JSON.stringify(enrichedPayload), timestamp]
    );
    
    // Check connectivity for immediate sync
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
        Alert.alert(
            'SIN CONEXIÓN',
            'Tus datos han sido guardados localmente en caché. Se subirán automáticamente cuando recuperes internet.'
        );
        return;
    }

    this.syncAll();
  }

  static async syncAll() {
    if (this.isSyncing) return;
    
    const db = await getDatabase();
    const pendingItems = await db.getAllAsync<SyncItem>('SELECT * FROM sync_queue WHERE status = "pending"');

    if (pendingItems.length === 0) return;

    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    this.isSyncing = true;
    
    // Notification logic
    const msg = 'GUARDANDO INFORMACIÓN DE CACHÉ...';
    if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        console.log(msg);
    }

    const token = await AsyncStorage.getItem('user_token');
    if (!token) {
      this.isSyncing = false;
      return;
    }

    for (const item of pendingItems) {
      try {
        await db.runAsync('UPDATE sync_queue SET status = "syncing" WHERE id = ?', [item.id]);
        
        let endpoint = '';
        if (item.type === 'visit_report') endpoint = '/reports';
        else if (item.type === 'time_log') endpoint = '/tracking/time-log';
        else if (item.type === 'tracking') endpoint = '/tracking';

        await axios.post(`${API_URL}${endpoint}`, JSON.parse(item.payload), {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10s timeout per item
        });

        await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        console.log(`Synced item ${item.id} successfully`);
      } catch (error) {
        console.log(`Failed to sync item ${item.id}, will retry later:`, error);
        await db.runAsync('UPDATE sync_queue SET status = "pending" WHERE id = ?', [item.id]);
      }
    }
    this.isSyncing = false;
  }
}
