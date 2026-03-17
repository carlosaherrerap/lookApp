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
exports.ClientDetailScreen = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../constants/theme");
const SQLite = __importStar(require("expo-sqlite"));
const ClientDetailScreen = ({ route, navigation }) => {
    const { routeId } = route.params;
    const [clients, setClients] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const fetchClients = async () => {
        try {
            const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
            const localClients = await db.getAllAsync('SELECT * FROM local_clients WHERE route_id = ? ORDER BY visit_order', [routeId]);
            setClients(localClients);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchClients();
    }, []);
    const renderClient = ({ item }) => (<react_native_1.TouchableOpacity style={styles.clientCard} onPress={() => navigation.navigate('ReportVisit', { client: item })}>
      <react_native_1.View style={styles.clientInfo}>
        <react_native_1.Text style={styles.clientName}>{item.name}</react_native_1.Text>
        <react_native_1.Text style={styles.clientAddress}>{item.address}</react_native_1.Text>
      </react_native_1.View>
      <react_native_1.View style={[styles.statusDot, { backgroundColor: item.status === 'visited' ? theme_1.Theme.colors.success : theme_1.Theme.colors.warning }]}/>
    </react_native_1.TouchableOpacity>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>Clientes en Ruta</react_native_1.Text>
      <react_native_1.FlatList data={clients} keyExtractor={(item) => item.id.toString()} renderItem={renderClient} ListEmptyComponent={<react_native_1.Text style={styles.emptyText}>No hay clientes cargados para esta ruta.</react_native_1.Text>}/>
    </react_native_1.View>);
};
exports.ClientDetailScreen = ClientDetailScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.Theme.colors.background,
        padding: theme_1.Theme.spacing.md,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme_1.Theme.colors.text,
        marginBottom: theme_1.Theme.spacing.lg,
    },
    clientCard: {
        backgroundColor: theme_1.Theme.colors.surface,
        padding: theme_1.Theme.spacing.md,
        borderRadius: theme_1.Theme.borderRadius.md,
        marginBottom: theme_1.Theme.spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 18,
        color: theme_1.Theme.colors.text,
        fontWeight: '600',
    },
    clientAddress: {
        color: theme_1.Theme.colors.textMuted,
        fontSize: 14,
        marginTop: 2,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 10,
    },
    emptyText: {
        color: theme_1.Theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 20,
    }
});
//# sourceMappingURL=ClientDetailScreen.js.map