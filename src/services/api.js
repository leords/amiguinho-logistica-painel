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
  return val === 'true'; // Padrão false (API Real), para carregar os dados reais de telemetria
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
    await new Promise((r) => setTimeout(r, 300));
    return mockJornadas;
  }

  try {
    const response = await api.get('/api/v1/jornadas', {
      params: { data },
    });
    const resp = response.data;
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp?.dados)) return resp.dados;
    if (Array.isArray(resp?.jornadas)) return resp.jornadas;
    return [];
  } catch (error) {
    console.warn('[API Amigão] Falha ao conectar na API real:', error.message);
    throw error;
  }
};

/**
 * Busca o traçado e eventos da rota de uma jornada específica
 * GET /api/v1/jornadas/:id/rota
 */
export const fetchRotaJornada = async (id, forceMock = false) => {
  let rota;

  if (forceMock) {
    await new Promise((r) => setTimeout(r, 350));
    rota = mockRotas[id] || {
      jornadaId: id,
      coordenadas: [],
      eventos: []
    };
  } else {
    try {
      const response = await api.get(`/api/v1/jornadas/${id}/rota`);
      rota = response.data?.dados || response.data || {};
    } catch (error) {
      console.warn(`[API Amigão] Falha ao buscar rota ${id}:`, error.message);
      throw error;
    }
  }

  const rawCoords = rota.coordenadas || rota.localizacoes || [];
  const coordenadas = rawCoords
    .map((c) => {
      const lat = typeof c.latitude === 'string' ? parseFloat(c.latitude) : c.latitude;
      const lng = typeof c.longitude === 'string' ? parseFloat(c.longitude) : c.longitude;
      const rawVel = c.velocidadeKmH ?? c.velocidade ?? 0;
      const vel = typeof rawVel === 'string' ? parseFloat(rawVel) : (typeof rawVel === 'number' ? rawVel : 0);
      return {
        ...c,
        latitude: lat,
        longitude: lng,
        velocidade: Math.round(vel),
        velocidadeKmH: Math.round(vel),
        dataHora: c.dataHora || c.criadoEm
      };
    })
    .filter((c) => !isNaN(c.latitude) && !isNaN(c.longitude));

  const rawEventos = rota.eventos || [];
  const eventos = rawEventos
    .map((e) => ({
      ...e,
      latitude: typeof e.latitude === 'string' ? parseFloat(e.latitude) : e.latitude,
      longitude: typeof e.longitude === 'string' ? parseFloat(e.longitude) : e.longitude,
      dataHora: e.dataHora || e.criadoEm
    }))
    .filter((e) => !isNaN(e.latitude) && !isNaN(e.longitude));

  // Cálculo da velocidade média em movimento (> 2 km/h) e velocidade máxima
  const pontosEmMovimento = coordenadas.filter((c) => (c.velocidadeKmH || 0) > 2);
  const velocidadeMedia = pontosEmMovimento.length > 0
    ? Math.round(pontosEmMovimento.reduce((acc, c) => acc + c.velocidadeKmH, 0) / pontosEmMovimento.length)
    : (coordenadas.length > 0 ? Math.round(coordenadas.reduce((acc, c) => acc + (c.velocidadeKmH || 0), 0) / coordenadas.length) : 0);

  const velocidadeMaxima = coordenadas.length > 0
    ? Math.round(Math.max(0, ...coordenadas.map((c) => c.velocidadeKmH || 0)))
    : 0;

  return {
    ...rota,
    coordenadas,
    eventos,
    velocidadeMedia,
    velocidadeMaxima
  };
};
