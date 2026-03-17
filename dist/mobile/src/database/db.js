"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSyncDatabase = void 0;
const SQLite = __importStar(require("expo-sqlite"));
const dbName = 'lookapp_offline.db';
const initSyncDatabase = async () => {
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
exports.initSyncDatabase = initSyncDatabase;
//# sourceMappingURL=db.js.map