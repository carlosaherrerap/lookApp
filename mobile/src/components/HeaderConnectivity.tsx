import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { Theme } from '../constants/theme';
import { SyncService } from '../services/SyncService';

export const HeaderConnectivity = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = !!state.isConnected && !!state.isInternetReachable;
            
            // Si pasamos de offline a online, intentar sincronizar
            if (!isConnected && connected) {
                SyncService.syncAll();
            }
            
            setIsConnected(connected);
        });

        return () => unsubscribe();
    }, [isConnected]);

    const showStatus = () => {
        Alert.alert(
            'Estado de Conexión',
            isConnected 
                ? 'Estás conectado a internet. Tus datos se sincronizan en tiempo real.' 
                : 'Sin conexión a internet. Los datos se guardarán en tu dispositivo y se sincronizarán al recuperar señal.'
        );
    };

    return (
        <TouchableOpacity onPress={showStatus} style={{ marginRight: 15 }}>
            {isConnected ? (
                <Wifi size={20} color="#2ecc71" />
            ) : (
                <WifiOff size={20} color="#888888" />
            )}
        </TouchableOpacity>
    );
};
