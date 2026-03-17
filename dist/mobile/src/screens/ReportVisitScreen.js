"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportVisitScreen = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../constants/theme");
const SyncService_1 = require("../services/SyncService");
const ReportVisitScreen = ({ route, navigation }) => {
    const { client } = route.params;
    const [observation, setObservation] = (0, react_1.useState)('');
    const [found, setFound] = (0, react_1.useState)(true);
    const handleSubmit = async () => {
        const reportData = {
            client_id: client.id,
            data: {
                observation,
                found_in_home: found,
            },
        };
        try {
            await SyncService_1.SyncService.queueReport('visit_report', reportData);
            react_native_1.Alert.alert('Éxito', 'Reporte guardado. Se sincronizará automáticamente al detectar internet.');
            navigation.goBack();
        }
        catch (error) {
            react_native_1.Alert.alert('Error', 'No se pudo guardar el reporte localmente.');
        }
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>Reporte: {client.name}</react_native_1.Text>
      
      <react_native_1.Text style={styles.label}>¿Se encontró al cliente?</react_native_1.Text>
      <react_native_1.View style={styles.buttonGroup}>
        <react_native_1.TouchableOpacity style={[styles.choiceButton, found && styles.activeChoice]} onPress={() => setFound(true)}>
          <react_native_1.Text style={[styles.choiceText, found && styles.activeChoiceText]}>SÍ</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity style={[styles.choiceButton, !found && styles.activeChoice]} onPress={() => setFound(false)}>
          <react_native_1.Text style={[styles.choiceText, !found && styles.activeChoiceText]}>NO</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      <react_native_1.Text style={styles.label}>Observaciones adicionales:</react_native_1.Text>
      <react_native_1.TextInput style={styles.textArea} multiline numberOfLines={4} value={observation} onChangeText={setObservation} placeholder="Escribe aquí los detalles de la visita..." placeholderTextColor={theme_1.Theme.colors.textMuted}/>

      <react_native_1.TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <react_native_1.Text style={styles.submitButtonText}>Guardar Reporte</react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.ScrollView>);
};
exports.ReportVisitScreen = ReportVisitScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.Theme.colors.background,
        padding: theme_1.Theme.spacing.md,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme_1.Theme.colors.text,
        marginBottom: theme_1.Theme.spacing.lg,
    },
    label: {
        color: theme_1.Theme.colors.text,
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
        backgroundColor: theme_1.Theme.colors.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme_1.Theme.colors.border,
    },
    activeChoice: {
        backgroundColor: theme_1.Theme.colors.primary,
        borderColor: theme_1.Theme.colors.primary,
    },
    choiceText: {
        color: theme_1.Theme.colors.text,
        fontWeight: 'bold',
    },
    activeChoiceText: {
        color: theme_1.Theme.colors.background,
    },
    textArea: {
        backgroundColor: theme_1.Theme.colors.surface,
        color: theme_1.Theme.colors.text,
        padding: 15,
        borderRadius: 8,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: theme_1.Theme.colors.border,
    },
    submitButton: {
        backgroundColor: theme_1.Theme.colors.success,
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    submitButtonText: {
        color: theme_1.Theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    }
});
//# sourceMappingURL=ReportVisitScreen.js.map