import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const API_URL = 'http://10.0.2.2:3000';

interface SyncItem {
  id: number;
  type: string;
  payload: string;
  event_timestamp: string;
  status: string;
}

export class SyncService {
  static async queueReport(type: 'visit_report' | 'time_log' | 'tracking', payload: any) {
    const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
    const timestamp = new Date().toISOString();
    
    await db.runAsync(
      'INSERT INTO sync_queue (type, payload, event_timestamp) VALUES (?, ?, ?)',
      [type, JSON.stringify(payload), timestamp]
    );
    
    this.syncAll();
  }

  static async syncAll() {
    const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
    const pendingItems = await db.getAllAsync<SyncItem>('SELECT * FROM sync_queue WHERE status = "pending"');

    for (const item of pendingItems) {
      try {
        await db.runAsync('UPDATE sync_queue SET status = "syncing" WHERE id = ?', [item.id]);
        
        let endpoint = '';
        if (item.type === 'visit_report') endpoint = '/reports';
        else if (item.type === 'time_log') endpoint = '/tracking/time-log';
        else if (item.type === 'tracking') endpoint = '/tracking';

        await axios.post(`${API_URL}${endpoint}`, JSON.parse(item.payload));

        await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        console.log(`Synced item ${item.id} successfully`);
      } catch (error) {
        console.log(`Failed to sync item ${item.id}, will retry later:`, error);
        await db.runAsync('UPDATE sync_queue SET status = "pending" WHERE id = ?', [item.id]);
      }
    }
  }
}
