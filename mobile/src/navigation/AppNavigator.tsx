import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoutesScreen } from '../screens/RoutesScreen';
import { ClientDetailScreen } from '../screens/ClientDetailScreen';
import { ClientVisitScreen } from '../screens/ClientVisitScreen';
import { ReportVisitScreen } from '../screens/ReportVisitScreen';
import { Theme } from '../constants/theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = ({ user, onLogout }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Theme.colors.surface },
        headerTintColor: Theme.colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Routes" options={{ title: 'Mis Rutas' }}>
        {(props) => <RoutesScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClientVisit" component={ClientVisitScreen} options={{ title: 'Visita' }} />
      <Stack.Screen name="ReportVisit" component={ReportVisitScreen} options={{ title: 'Registro' }} />
    </Stack.Navigator>
  );
};
