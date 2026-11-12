import axios from 'axios';
import { mockJornadas, mockRotas } from './mockData';

const TOKEN_KEY = 'amigao_jwt_token';
const MOCK_KEY = 'amigao_mock_mode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334';

// Criação da instância Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisições: injeta o Bearer token armazenado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helpers para gerenciamento de Token
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setStoredToken = (token) => {
  if (!token || token.trim() === '') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token.trim());
  }
};

// Helpers para Modo Mock (para testes sem backend)
export const getStoredMockMode = () => {
  const val = localStorage.getItem(MOCK_KEY);
  return val === null ? true : val === 'true'; // Padrão 'true' no primeiro acesso para demonstração rica imediata
};

export const setStoredMockMode = (active) => {
  localStorage.setItem(MOCK_KEY, active ? 'true' : 'false');
};

/**
 * Busca a lista de jornadas na data selecionada
 * GET /api/v1/jornadas?data=YYYY-MM-DD
 */
export const fetchJornadas = async (data, forceMock = false) => {
  if (forceMock) {
    // Simula delay de rede
    await new Promise((r) => setTimeout(r, 400));
    return mockJornadas;
  }

  try {
    const response = await api.get('/api/v1/jornadas', {
      params: { data },
    });
    return response.data;
  } catch (error) {
    console.warn('[API Amigão] Falha ao conectar na API real, ativando fallback ou reportando erro:', error.message);
    throw error;
  }
};

/**
 * Busca o traçado e eventos da rota de uma jornada específica
 * GET /api/v1/jornadas/:id/rota
 */
export const fetchRotaJornada = async (id, forceMock = false) => {
  if (forceMock) {
    await new Promise((r) => setTimeout(r, 450));
    const rota = mockRotas[id] || {
      jornadaId: id,
      coordenadas: [],
      eventos: []
    };
    return rota;
  }

  try {
    const response = await api.get(`/api/v1/jornadas/${id}/rota`);
    return response.data;
  } catch (error) {
    console.warn(`[API Amigão] Falha ao buscar rota ${id}:`, error.message);
    throw error;
  }
};
