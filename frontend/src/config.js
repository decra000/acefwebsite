// ✅ API Configuration - Always prefer .env values
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

console.log('🌐 API Configuration:');
console.log('API_URL:', API_URL);
console.log('STATIC_URL:', STATIC_URL);