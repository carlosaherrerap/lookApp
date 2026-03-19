import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.55:3009';

interface SyncItem {
  id: number;
  type: string;
  payload: string;
  event_timestamp: string;
  status: string;
}

import { getDatabase } from '../database/db';

export class SyncService {
  static async queueReport(type: 'visit_report' | 'time_log' | 'tracking', payload: any) {
    const db = await getDatabase();
    const timestamp = new Date().toISOString();
    
    await db.runAsync(
      'INSERT INTO sync_queue (type, payload, event_timestamp) VALUES (?, ?, ?)',
      [type, JSON.stringify(payload), timestamp]
    );
    
    this.syncAll();
  }

  static async syncAll() {
    const db = await getDatabase();
    const pendingItems = await db.getAllAsync<SyncItem>('SELECT * FROM sync_queue WHERE status = "pending"');

    if (pendingItems.length === 0) return;

    const token = await AsyncStorage.getItem('user_token');
    if (!token) {
      console.log('No token available for sync, skipping...');
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
          headers: { Authorization: `Bearer ${token}` }
        });

        await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        console.log(`Synced item ${item.id} successfully`);
      } catch (error) {
        console.log(`Failed to sync item ${item.id}, will retry later:`, error);
        await db.runAsync('UPDATE sync_queue SET status = "pending" WHERE id = ?', [item.id]);
      }
    }
  }
}
