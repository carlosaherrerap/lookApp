import * as SQLite from 'expo-sqlite';

const dbName = 'lookapp_offline.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(dbName);
  }
  return dbInstance;
};

export const initSyncDatabase = async () => {
  const db = await getDatabase();
  
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
      description TEXT,
      lat REAL,
      lng REAL,
      visit_order INTEGER,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      event_timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );
  `);

  return db;
};
