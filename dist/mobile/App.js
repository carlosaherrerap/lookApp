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
exports.default = App;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const native_1 = require("@react-navigation/native");
const LoginScreen_1 = require("./src/screens/LoginScreen");
const db_1 = require("./src/database/db");
const AppNavigator_1 = require("./src/navigation/AppNavigator");
function App() {
    const [isReady, setIsReady] = (0, react_1.useState)(false);
    const [user, setUser] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const bootstrap = async () => {
            try {
                await (0, db_1.initSyncDatabase)();
                const storedUser = await async_storage_1.default.getItem('user_data');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
            catch (e) {
                console.warn(e);
            }
            finally {
                setIsReady(true);
            }
        };
        bootstrap();
    }, []);
    if (!isReady) {
        return (<react_native_1.View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <react_native_1.ActivityIndicator size="large" color="#38bdf8"/>
      </react_native_1.View>);
    }
    if (!user) {
        return (<native_1.NavigationContainer>
        <react_native_1.StatusBar barStyle="light-content"/>
        <LoginScreen_1.LoginScreen onLoginSuccess={setUser}/>
      </native_1.NavigationContainer>);
    }
    return (<native_1.NavigationContainer>
      <react_native_1.View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <react_native_1.StatusBar barStyle="light-content"/>
        <AppNavigator_1.AppNavigator user={user}/>
      </react_native_1.View>
    </native_1.NavigationContainer>);
}
//# sourceMappingURL=App.js.map