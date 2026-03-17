import * as SQLite from 'expo-sqlite';

const dbName = 'lookapp_offline.db';

export const initSyncDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS local_routes (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT,
      assigned_date TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS local_clients (
      id INTEGER PRIMARY KEY NOT NULL,
      route_id INTEGER,
      name TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      visit_order INTEGER,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'visit_report', 'time_log', 'tracking'
      payload TEXT NOT NULL, -- JSON string
      event_timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'pending' -- 'pending', 'syncing'
    );
  `);

  return db;
};
