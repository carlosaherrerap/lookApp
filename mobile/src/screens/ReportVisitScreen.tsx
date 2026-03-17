import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Theme } from '../constants/theme';
import { SyncService } from '../services/SyncService';

export const ReportVisitScreen = ({ route, navigation }) => {
  const { client } = route.params;
  const [observation, setObservation] = useState('');
  const [found, setFound] = useState(true);

  const handleSubmit = async () => {
    const reportData = {
      client_id: client.id,
      data: {
        observation,
        found_in_home: found,
      },
      // location_at_report se agregaría con expo-location en una integración real
    };

    try {
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
        <Text style={styles.submitButtonText}>Guardar Reporte</Text>
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
    borderColor: Theme.colors.border,
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
  textArea: {
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text,
    padding: 15,
    borderRadius: 8,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Theme.colors.border,
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
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
