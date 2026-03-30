import { Theme } from '../constants/theme';

export const StatusColors: Record<string, string> = {
  'LIBRE': '#3498DB',        // Blue
  'PROGRAMADO': '#3498DB',   // Blue (internal name)
  'EN CAMINO': '#F1C40F',    // Yellow/Amber
  'REPROGRAMADO': '#E74C3C', // Red
  'REPROGRAMAR': '#E74C3C',  // Red (internal name)
  'FINALIZADO': '#2ECC71',   // Green
  'VISITADO': '#2ECC71',     // Green (internal name)
  'ABANDONADO': '#E74C3C',   // Red
};

export const StatusLabels: Record<string, string> = {
  'LIBRE': 'LIBRE',
  'PROGRAMADO': 'LIBRE',
  'EN CAMINO': 'EN CAMINO',
  'REPROGRAMADO': 'REPROGRAMADO',
  'REPROGRAMAR': 'REPROGRAMADO',
  'FINALIZADO': 'FINALIZADO',
  'VISITADO': 'FINALIZADO',
  'ABANDONADO': 'ABANDONADO',
};

export const getStatusColor = (status: string | undefined): string => {
  const s = status?.toUpperCase() || 'LIBRE';
  return StatusColors[s] || Theme.colors.textMuted;
};

export const getStatusLabel = (status: string | undefined): string => {
  const s = status?.toUpperCase() || 'LIBRE';
  return StatusLabels[s] || s;
};

export const isActionable = (status: string | undefined): boolean => {
  const s = status?.toUpperCase() || '';
  return s === 'PROGRAMADO' || s === 'REPROGRAMAR' || s === 'LIBRE' || s === 'REPROGRAMADO';
};

export const isLocked = (status: string | undefined): boolean => {
  const s = status?.toUpperCase() || '';
  return s === 'EN CAMINO' || s === 'VISITADO' || s === 'FINALIZADO' || s === 'ABANDONADO';
};
