import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Theme } from '../constants/theme';
import { SyncService } from '../services/SyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ReportVisitScreen = ({ route, navigation }: any) => {
  const { client } = route.params;
  const [observation, setObservation] = useState('');
  const [found, setFound] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('PAGARÁ'); // Opciones: PAGARÁ, PAGÓ, EMITE RECLAMO

  const handleSubmit = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (!storedUser) throw new Error('Usuario no identificado');
      const user = JSON.parse(storedUser);

      const reportData = {
        client_id: client.id,
        worker_id: user.id,
        data: {
          observation,
          found_in_home: found,
          payment_status: paymentStatus,
        },
      };

      // Guardar en cola de sincronización (Offline-First)
      await SyncService.queueReport('visit_report', reportData);
      
      Alert.alert('Éxito', 'Reporte guardado. Se sincronizará automáticamente al detectar internet.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el reporte localmente.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reporte: {client.name}</Text>
      
      <Text style={styles.label}>¿Se encontró al cliente?</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.choiceButton, found && styles.activeChoice]}
          onPress={() => setFound(true)}
        >
          <Text style={[styles.choiceText, found && styles.activeChoiceText]}>SÍ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.choiceButton, !found && styles.activeChoice]}
          onPress={() => setFound(false)}
        >
          <Text style={[styles.choiceText, !found && styles.activeChoiceText]}>NO</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Estado de Pago</Text>
      <View style={styles.paymentGroup}>
        {['PAGARÁ', 'PAGÓ', 'EMITE RECLAMO'].map((status) => (
          <TouchableOpacity 
            key={status}
            style={[styles.paymentButton, paymentStatus === status && styles.activePayment]}
            onPress={() => setPaymentStatus(status)}
          >
            <Text style={[styles.paymentText, paymentStatus === status && styles.activePaymentText]}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Observaciones adicionales:</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        value={observation}
        onChangeText={setObservation}
        placeholder="Escribe aquí los detalles de la visita..."
        placeholderTextColor={Theme.colors.textMuted}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>FINALIZAR REPORTE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  label: {
    color: Theme.colors.text,
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
  },
  activeChoice: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  choiceText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
  activeChoiceText: {
    color: Theme.colors.background,
  },
  paymentGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  paymentButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
  },
  activePayment: {
    backgroundColor: Theme.colors.primary + '30',
    borderColor: Theme.colors.primary,
  },
  paymentText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  activePaymentText: {
    color: Theme.colors.primary,
  },
  textArea: {
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text,
    padding: 15,
    borderRadius: 8,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: Theme.colors.success,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  submitButtonText: {
    color: Theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
