import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from './src/screens/LoginScreen';
import { initSyncDatabase } from './src/database/db';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initSyncDatabase();
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
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <LoginScreen onLoginSuccess={setUser} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <StatusBar barStyle="light-content" />
        <AppNavigator user={user} />
      </View>
    </NavigationContainer>
  );
}
