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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const axios_1 = __importDefault(require("axios"));
const SQLite = __importStar(require("expo-sqlite"));
const API_URL = 'http://10.0.2.2:3000';
class SyncService {
    static async queueReport(type, payload) {
        const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
        const timestamp = new Date().toISOString();
        await db.runAsync('INSERT INTO sync_queue (type, payload, event_timestamp) VALUES (?, ?, ?)', [type, JSON.stringify(payload), timestamp]);
        this.syncAll();
    }
    static async syncAll() {
        const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
        const pendingItems = await db.getAllAsync('SELECT * FROM sync_queue WHERE status = "pending"');
        for (const item of pendingItems) {
            try {
                await db.runAsync('UPDATE sync_queue SET status = "syncing" WHERE id = ?', [item.id]);
                let endpoint = '';
                if (item.type === 'visit_report')
                    endpoint = '/reports';
                else if (item.type === 'time_log')
                    endpoint = '/tracking/time-log';
                else if (item.type === 'tracking')
                    endpoint = '/tracking';
                await axios_1.default.post(`${API_URL}${endpoint}`, JSON.parse(item.payload));
                await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
                console.log(`Synced item ${item.id} successfully`);
            }
            catch (error) {
                console.log(`Failed to sync item ${item.id}, will retry later:`, error);
                await db.runAsync('UPDATE sync_queue SET status = "pending" WHERE id = ?', [item.id]);
            }
        }
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=SyncService.js.map