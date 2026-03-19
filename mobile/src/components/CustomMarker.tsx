import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Theme } from '../constants/theme';
import { MapPin } from 'lucide-react-native';

interface CustomMarkerProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  order?: number;
  status?: string;
  onPress?: () => void;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({ coordinate, title, order, status, onPress }) => {
  const isVisited = status === 'visitado';
  const isAbandoned = status === 'abandonado';
  
  let bgColor = Theme.colors.primary; // Verde Lima #C0F11C
  if (isVisited) bgColor = Theme.colors.success; // #4CAF50
  if (isAbandoned) bgColor = Theme.colors.error; // #FF5252

  return (
    <Marker 
      coordinate={coordinate} 
      onPress={onPress} 
      tracksViewChanges={true}
      zIndex={100}
    >
      <View style={styles.container}>
        <View style={[styles.pin, { backgroundColor: bgColor }]}>
          {order !== undefined ? (
            <Text style={styles.orderText}>{order}</Text>
          ) : (
            <MapPin size={14} color={Theme.colors.background} />
          )}
        </View>
        <View style={[styles.arrow, { borderTopColor: bgColor }]} />
        {title && (
          <View style={styles.labelContainer}>
            <Text style={styles.label} numberOfLines={1}>{title}</Text>
          </View>
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  orderText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  labelContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  }
});
