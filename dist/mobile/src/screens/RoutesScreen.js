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
exports.RoutesScreen = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../constants/theme");
const axios_1 = __importDefault(require("axios"));
const SQLite = __importStar(require("expo-sqlite"));
const API_URL = 'http://10.0.2.2:3000';
const RoutesScreen = ({ user, navigation }) => {
    const [routes, setRoutes] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    const fetchRoutes = async (isRefreshing = false) => {
        if (isRefreshing)
            setRefreshing(true);
        else
            setLoading(true);
        try {
            const response = await axios_1.default.get(`${API_URL}/routes/worker`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const remoteRoutes = response.data;
            setRoutes(remoteRoutes);
            const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
            await db.runAsync('DELETE FROM local_routes');
            for (const route of remoteRoutes) {
                await db.runAsync('INSERT INTO local_routes (id, name, assigned_date, status) VALUES (?, ?, ?, ?)', [route.id, route.name, route.assigned_date, route.status]);
            }
        }
        catch (error) {
            console.log('Error fetching from API, falling back to local DB:', error);
            const db = await SQLite.openDatabaseAsync('lookapp_offline.db');
            const localRoutes = await db.getAllAsync('SELECT * FROM local_routes');
            setRoutes(localRoutes);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchRoutes();
    }, []);
    const renderItem = ({ item }) => (<react_native_1.TouchableOpacity style={styles.routeCard} onPress={() => navigation.navigate('ClientDetail', { routeId: item.id })}>
      <react_native_1.View style={styles.cardHeader}>
        <react_native_1.Text style={styles.routeName}>{item.name}</react_native_1.Text>
        <react_native_1.View style={[styles.badge, { backgroundColor: item.status === 'completed' ? theme_1.Theme.colors.success : theme_1.Theme.colors.warning }]}>
          <react_native_1.Text style={styles.badgeText}>{item.status.toUpperCase()}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
      <react_native_1.Text style={styles.routeDate}>{item.assigned_date}</react_native_1.Text>
    </react_native_1.TouchableOpacity>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>Mis Rutas</react_native_1.Text>
      {loading ? (<react_native_1.ActivityIndicator size="large" color={theme_1.Theme.colors.primary}/>) : (<react_native_1.FlatList data={routes} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} refreshControl={<react_native_1.RefreshControl refreshing={refreshing} onRefresh={() => fetchRoutes(true)} tintColor={theme_1.Theme.colors.primary}/>} ListEmptyComponent={<react_native_1.Text style={styles.emptyText}>No tienes rutas asignadas para hoy.</react_native_1.Text>}/>)}
    </react_native_1.View>);
};
exports.RoutesScreen = RoutesScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.Theme.colors.background,
        padding: theme_1.Theme.spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme_1.Theme.colors.text,
        marginBottom: theme_1.Theme.spacing.lg,
        marginTop: theme_1.Theme.spacing.lg,
    },
    routeCard: {
        backgroundColor: theme_1.Theme.colors.surface,
        padding: theme_1.Theme.spacing.md,
        borderRadius: theme_1.Theme.borderRadius.md,
        marginBottom: theme_1.Theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme_1.Theme.colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    routeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme_1.Theme.colors.text,
    },
    routeDate: {
        color: theme_1.Theme.colors.textMuted,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme_1.Theme.colors.background,
    },
    emptyText: {
        color: theme_1.Theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 50,
    }
});
//# sourceMappingURL=RoutesScreen.js.map