import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { initSyncDatabase } from './src/database/db';
import { AppNavigator } from './src/navigation/AppNavigator';
import { idleMonitor } from './src/services/IdleMonitorService';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initSyncDatabase();
        idleMonitor.start(); // Start inactivity monitoring

        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
    return () => idleMonitor.stop();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <LoginScreen onLoginSuccess={setUser} />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  const logout = async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <AppNavigator user={user} onLogout={logout} />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
