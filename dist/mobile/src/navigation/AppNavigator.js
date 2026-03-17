"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppNavigator = void 0;
const react_1 = __importDefault(require("react"));
const native_stack_1 = require("@react-navigation/native-stack");
const RoutesScreen_1 = require("../screens/RoutesScreen");
const ClientDetailScreen_1 = require("../screens/ClientDetailScreen");
const ReportVisitScreen_1 = require("../screens/ReportVisitScreen");
const theme_1 = require("../constants/theme");
const Stack = (0, native_stack_1.createNativeStackNavigator)();
const AppNavigator = ({ user }) => {
    return (<Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: theme_1.Theme.colors.surface },
            headerTintColor: theme_1.Theme.colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
            animation: 'slide_from_right',
        }}>
      <Stack.Screen name="Routes" options={{ title: 'Mis Rutas' }}>
        {(props) => <RoutesScreen_1.RoutesScreen {...props} user={user}/>}
      </Stack.Screen>
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen_1.ClientDetailScreen} options={{ title: 'Clientes' }}/>
      <Stack.Screen name="ReportVisit" component={ReportVisitScreen_1.ReportVisitScreen} options={{ title: 'Nuevo Reporte' }}/>
    </Stack.Navigator>);
};
exports.AppNavigator = AppNavigator;
//# sourceMappingURL=AppNavigator.js.map