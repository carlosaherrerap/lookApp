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
exports.LoginScreen = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const axios_1 = __importDefault(require("axios"));
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const API_URL = 'http://192.168.1.XX:3000';
const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleLogin = async () => {
        if (!email || !password) {
            react_native_1.Alert.alert('Error', 'Por favor llena todos los campos');
            return;
        }
        setLoading(true);
        try {
            const response = await axios_1.default.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            const { access_token, user } = response.data;
            await async_storage_1.default.setItem('user_token', access_token);
            await async_storage_1.default.setItem('user_data', JSON.stringify(user));
            onLoginSuccess(user);
        }
        catch (error) {
            console.error(error);
            react_native_1.Alert.alert('Error de Autenticación', 'Credenciales incorrectas o problema de conexión');
        }
        finally {
            setLoading(false);
        }
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>LookApp Workers</react_native_1.Text>
      <react_native_1.Text style={styles.subtitle}>Panel de Trabajador</react_native_1.Text>
      
      <react_native_1.TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
      
      <react_native_1.TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry/>
      
      <react_native_1.TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (<react_native_1.ActivityIndicator color="#fff"/>) : (<react_native_1.Text style={styles.buttonText}>Iniciar Jornada</react_native_1.Text>)}
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
exports.LoginScreen = LoginScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#0f172a',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#38bdf8',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#1e293b',
        color: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    button: {
        backgroundColor: '#38bdf8',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#0f172a',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
//# sourceMappingURL=LoginScreen.js.map