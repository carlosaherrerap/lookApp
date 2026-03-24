import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Theme } from '../constants/theme';
import { SyncService } from '../services/SyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Calendar, DollarSign, ListOrdered, FileText, CheckCircle2, RotateCcw } from 'lucide-react-native';

export const ReportVisitScreen = ({ route, navigation }: any) => {
  const { client } = route.params;
  const [observation, setObservation] = useState('');
  const [found, setFound] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('PAGARÁ');
  const [loading, setLoading] = useState(false);
  
  // Tiempos
  const [visitStartTime] = useState(new Date());
  const [travelStartTime, setTravelStartTime] = useState<Date | null>(null);

  // Ficha Crediticia
  const [creditInfo, setCreditInfo] = useState({
    tipo_credito: client.credit_info?.tipo_credito || '',
    fecha_desembolso: client.credit_info?.fecha_desembolso || '',
    monto_desembolso: client.credit_info?.monto_desembolso?.toString() || '',
    moneda: client.credit_info?.moneda || 'PEN',
    nro_cuotas: client.credit_info?.nro_cuotas?.toString() || '',
    cuotas_pagadas: client.credit_info?.cuotas_pagadas?.toString() || '',
    monto_cuota: client.credit_info?.monto_cuota?.toString() || '',
    condicion_contable: client.credit_info?.condicion_contable || '',
    saldo_capital: client.credit_info?.saldo_capital?.toString() || '',
  });

  useEffect(() => {
    (async () => {
        const startStr = await AsyncStorage.getItem(`travel_start_${client.id}`);
        if (startStr) setTravelStartTime(new Date(startStr));
    })();
  }, []);

  const handleSubmit = async (newStatus: string) => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (!storedUser) throw new Error('Usuario no identificado');
      const user = JSON.parse(storedUser);

      // Ubicación exacta del reporte
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // Cálculos de tiempo
      const now = new Date();
      const visitSeconds = Math.floor((now.getTime() - visitStartTime.getTime()) / 1000);
      let travelSeconds = 0;
      if (travelStartTime) {
          travelSeconds = Math.floor((visitStartTime.getTime() - travelStartTime.getTime()) / 1000);
      }

      const reportData = {
        client_id: client.id,
        worker_id: user.id,
        new_status: newStatus,
        travel_time_seconds: travelSeconds,
        visit_time_seconds: visitSeconds,
        location_at_report: { lat: location.coords.latitude, lng: location.coords.longitude },
        credit_info: {
            ...creditInfo,
            monto_desembolso: parseFloat(creditInfo.monto_desembolso) || 0,
            nro_cuotas: parseInt(creditInfo.nro_cuotas) || 0,
            cuotas_pagadas: parseInt(creditInfo.cuotas_pagadas) || 0,
            monto_cuota: parseFloat(creditInfo.monto_cuota) || 0,
            saldo_capital: parseFloat(creditInfo.saldo_capital) || 0,
        },
        data: {
          observation,
          found_in_home: found,
          payment_status: paymentStatus,
        },
      };

      await SyncService.queueReport('visit_report', reportData);
      
      // Limpiar tiempo de traslado
      await AsyncStorage.removeItem(`travel_start_${client.id}`);

      Alert.alert('Éxito', `Reporte guardado como ${newStatus.toUpperCase()}.`);
      navigation.navigate('RutasTab'); // Volver a rutas
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, icon: Icon, keyboardType = 'default' }: any) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Icon size={18} color={Theme.colors.primary} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={label}
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType={keyboardType}
            />
        </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.headerTitle}>Ficha del Cliente</Text>
      <Text style={styles.clientSubtitle}>{client.name} {client.apellido_paterno}</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <FileText size={20} color={Theme.colors.primary} />
            <Text style={styles.cardHeaderTitle}>INFORMACIÓN CREDITICIA</Text>
        </View>
        
        <InputField label="Tipo de Crédito" value={creditInfo.tipo_credito} icon={ListOrdered} 
          onChange={(t:any) => setCreditInfo({...creditInfo, tipo_credito: t})} />
        
        <InputField label="Fecha Desembolso" value={creditInfo.fecha_desembolso} icon={Calendar} 
          onChange={(t:any) => setCreditInfo({...creditInfo, fecha_desembolso: t})} />
        
        <View style={styles.row}>
            <View style={{ flex: 1 }}>
                <InputField label="Monto" value={creditInfo.monto_desembolso} icon={DollarSign} keyboardType="numeric"
                  onChange={(t:any) => setCreditInfo({...creditInfo, monto_desembolso: t})} />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="Saldo Capital" value={creditInfo.saldo_capital} icon={DollarSign} keyboardType="numeric"
                  onChange={(t:any) => setCreditInfo({...creditInfo, saldo_capital: t})} />
            </View>
        </View>

        <View style={styles.row}>
            <View style={{ flex: 1 }}>
                <InputField label="Cuotas Totales" value={creditInfo.nro_cuotas} icon={ListOrdered} keyboardType="numeric"
                  onChange={(t:any) => setCreditInfo({...creditInfo, nro_cuotas: t})} />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="Cuotas Pagadas" value={creditInfo.cuotas_pagadas} icon={CheckCircle2} keyboardType="numeric"
                  onChange={(t:any) => setCreditInfo({...creditInfo, cuotas_pagadas: t})} />
            </View>
        </View>

        <InputField label="Monto de la Cuota" value={creditInfo.monto_cuota} icon={DollarSign} keyboardType="numeric"
          onChange={(t:any) => setCreditInfo({...creditInfo, monto_cuota: t})} />

        <InputField label="Condición Contable" value={creditInfo.condicion_contable} icon={FileText} 
          onChange={(t:any) => setCreditInfo({...creditInfo, condicion_contable: t})} />
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <CheckCircle2 size={20} color={Theme.colors.primary} />
            <Text style={styles.cardHeaderTitle}>DETALLES DE LA VISITA</Text>
        </View>

        <Text style={styles.label}>¿Se encontró al cliente?</Text>
        <View style={styles.buttonGroup}>
            {['SÍ', 'NO'].map((val) => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.choiceButton, (found === (val === 'SÍ')) && styles.activeChoice]}
                  onPress={() => setFound(val === 'SÍ')}
                >
                    <Text style={[styles.choiceText, (found === (val === 'SÍ')) && styles.activeChoiceText]}>{val}</Text>
                </TouchableOpacity>
            ))}
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
            placeholder="Escribe aquí los detalles..."
            placeholderTextColor={Theme.colors.textMuted}
        />
      </View>

      <View style={styles.actionBlock}>
        <TouchableOpacity 
            style={[styles.mainButton, styles.registerButton]} 
            onPress={() => handleSubmit('visitado')}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                    <CheckCircle2 color="#fff" size={24} />
                    <Text style={styles.mainButtonText}>REGISTRAR VISITA</Text>
                </>
            )}
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.mainButton, styles.reproButton]} 
            onPress={() => handleSubmit('REPROGRAMAR')}
            disabled={loading}
        >
            <RotateCcw color="#fff" size={24} />
            <Text style={styles.mainButtonText}>REPROGRAMARÁ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.text },
  clientSubtitle: { fontSize: 16, color: Theme.colors.primary, marginBottom: 20 },
  card: { backgroundColor: Theme.colors.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Theme.colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardHeaderTitle: { fontSize: 14, fontWeight: '900', color: Theme.colors.textMuted, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 15 },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 12, color: Theme.colors.textMuted, marginBottom: 6, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: Theme.colors.border },
  input: { flex: 1, height: 45, color: Theme.colors.text, marginLeft: 10, fontSize: 14 },
  label: { color: Theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  buttonGroup: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  choiceButton: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: Theme.colors.surface, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  activeChoice: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  choiceText: { color: Theme.colors.text, fontWeight: 'bold' },
  activeChoiceText: { color: Theme.colors.background },
  paymentGroup: { gap: 8 },
  paymentButton: { padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: Theme.colors.border },
  activePayment: { backgroundColor: Theme.colors.primary + '20', borderColor: Theme.colors.primary },
  paymentText: { color: Theme.colors.textMuted, fontWeight: 'bold' },
  activePaymentText: { color: Theme.colors.primary },
  textArea: { backgroundColor: 'rgba(255,255,255,0.03)', color: Theme.colors.text, padding: 15, borderRadius: 12, textAlignVertical: 'top', borderWidth: 1, borderColor: Theme.colors.border, height: 100 },
  actionBlock: { gap: 12, marginTop: 10 },
  mainButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, gap: 12 },
  registerButton: { backgroundColor: Theme.colors.success },
  reproButton: { backgroundColor: Theme.colors.primary },
  mainButtonText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});
