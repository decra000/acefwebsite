import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: 'API_URL',
  withCredentials: true // This ensures cookies are sent
});

export default api;
