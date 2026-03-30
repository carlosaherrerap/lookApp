// Configuración centralizada para la API de Schedule's
// En desarrollo, apunta a localhost:3000 o lo que indique .env.
// En producción, usa variables de entorno de Vite.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3009';

console.log('API_BASE_URL configurada en:', API_BASE_URL);
