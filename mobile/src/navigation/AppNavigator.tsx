import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, Globe, UserCheck } from 'lucide-react-native';
import { Theme } from '../constants/theme';

// Screens
import { RoutesScreen } from '../screens/RoutesScreen';
import { ClientDetailScreen } from '../screens/ClientDetailScreen';
import { ClientVisitScreen } from '../screens/ClientVisitScreen';
import { ReportVisitScreen } from '../screens/ReportVisitScreen';
import { RouteMapScreen } from '../screens/RouteMapScreen';
import { MundoScreen } from '../screens/MundoScreen';
import { StatesScreen } from '../screens/StatesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const RutasStack = ({ user, onLogout }: any) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Theme.colors.surface },
      headerTintColor: Theme.colors.text,
      headerTitleStyle: { fontWeight: 'bold' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="RoutesHome" options={{ title: 'Mis Rutas' }}>
      {(props) => <RoutesScreen {...props} user={user} onLogout={onLogout} />}
    </Stack.Screen>
    <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Clientes' }} />
    <Stack.Screen name="ClientVisit" component={ClientVisitScreen} options={{ title: 'Visita' }} />
    <Stack.Screen name="ReportVisit" component={ReportVisitScreen} options={{ title: 'Registro' }} />
    <Stack.Screen name="RouteMap" component={RouteMapScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const MundoStack = () => (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Theme.colors.surface },
        headerTintColor: Theme.colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MundoHome" component={MundoScreen} options={{ title: 'Lista Global' }} />
      <Stack.Screen name="ClientVisit" component={ClientVisitScreen} options={{ title: 'Visita Global' }} />
      <Stack.Screen name="ReportVisit" component={ReportVisitScreen} options={{ title: 'Registro Global' }} />
    </Stack.Navigator>
);

export const AppNavigator = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
            backgroundColor: Theme.colors.surface,
            borderTopColor: Theme.colors.border,
            height: 60,
            paddingBottom: 8
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
      }}
    >
      <Tab.Screen 
        name="RutasTab" 
        options={{ 
            title: 'Mis Rutas',
            tabBarLabel: 'Rutas',
            tabBarIcon: ({ color, size }) => <Map color={color} size={size} />
        }}
      >
        {(props) => <RutasStack {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen 
        name="MundoTab" 
        options={{ 
            title: 'Mundo',
            tabBarLabel: 'Mundo',
            tabBarIcon: ({ color, size }) => <Globe color={color} size={size} />
        }}
        component={MundoStack}
      />

      <Tab.Screen 
        name="EstadosTab" 
        options={{ 
            title: 'Estados',
            tabBarLabel: 'Estados',
            tabBarIcon: ({ color, size }) => <UserCheck color={color} size={size} />
        }}
      >
        {(props) => <StatesScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
