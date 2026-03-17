import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoutesScreen } from '../screens/RoutesScreen';
import { ClientDetailScreen } from '../screens/ClientDetailScreen';
import { ReportVisitScreen } from '../screens/ReportVisitScreen';
import { Theme } from '../constants/theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = ({ user }) => {
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
        {(props) => <RoutesScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ReportVisit" component={ReportVisitScreen} options={{ title: 'Nuevo Reporte' }} />
    </Stack.Navigator>
  );
};
