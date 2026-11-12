import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import JornadaList from './components/JornadaList';
import ResumoJornada from './components/ResumoJornada';
import MapaRota from './components/MapaRota';
import { 
  fetchJornadas, 
  fetchRotaJornada, 
  getStoredToken, 
  setStoredToken,
  getStoredMockMode,
  setStoredMockMode
} from './services/api';

// Obtém data de hoje no formato YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [token, setTokenState] = useState(getStoredToken());
  const [isMockMode, setIsMockMode] = useState(getStoredMockMode());

  const [jornadas, setJornadas] = useState([]);
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [rotaDetalhada, setRotaDetalhada] = useState(null);

  const [isLoadingJornadas, setIsLoadingJornadas] = useState(false);
  const [errorJornadas, setErrorJornadas] = useState(null);

  const [isLoadingRota, setIsLoadingRota] = useState(false);
  const [errorRota, setErrorRota] = useState(null);

  // Manipulador de token com persistência no localStorage
  const handleTokenChange = (newToken) => {
    setTokenState(newToken);
    setStoredToken(newToken);
  };

  // Alternador de modo mock
  const handleToggleMockMode = () => {
    const nextVal = !isMockMode;
    setIsMockMode(nextVal);
    setStoredMockMode(nextVal);
  };

  // Carrega lista de jornadas
  const loadJornadas = useCallback(async () => {
    setIsLoadingJornadas(true);
    setErrorJornadas(null);

    try {
      const data = await fetchJornadas(selectedDate, isMockMode);
      const lista = Array.isArray(data) ? data : (data.jornadas || []);
      setJornadas(lista);

      // Se houver jornadas, seleciona a primeira automaticamente ou mantém a atual se ainda existir
      if (lista.length > 0) {
        setSelectedJornada((prev) => {
          if (prev && lista.some((j) => j.id === prev.id)) {
            return lista.find((j) => j.id === prev.id);
          }
          return lista[0];
        });
      } else {
        setSelectedJornada(null);
        setRotaDetalhada(null);
      }
    } catch (err) {
      console.error('Erro ao buscar jornadas:', err);
      setErrorJornadas(
        err.response?.data?.message || 
        err.message || 
        'Não foi possível conectar com a API de jornadas. Verifique se o servidor está ativo ou o token JWT.'
      );
      setJornadas([]);
      setSelectedJornada(null);
      setRotaDetalhada(null);
    } finally {
      setIsLoadingJornadas(false);
    }
  }, [selectedDate, isMockMode]);

  // Carrega rota detalhada da jornada selecionada
  const loadRota = useCallback(async (jornadaId) => {
    if (!jornadaId) return;

    setIsLoadingRota(true);
    setErrorRota(null);

    try {
      const data = await fetchRotaJornada(jornadaId, isMockMode);
      setRotaDetalhada(data);
    } catch (err) {
      console.error(`Erro ao buscar rota da jornada ${jornadaId}:`, err);
      setErrorRota(
        err.response?.data?.message || 
        err.message || 
        'Erro ao carregar telemetria da rota.'
      );
      setRotaDetalhada(null);
    } finally {
      setIsLoadingRota(false);
    }
  }, [isMockMode]);

  // Efeito: Carrega jornadas quando a data ou o modo mock mudar
  useEffect(() => {
    loadJornadas();
  }, [loadJornadas]);

  // Efeito: Carrega a rota quando a jornada selecionada mudar
  useEffect(() => {
    if (selectedJornada?.id) {
      loadRota(selectedJornada.id);
    } else {
      setRotaDetalhada(null);
    }
  }, [selectedJornada?.id, loadRota]);

  return (
    <div className="min-h-screen bg-[#f2f4f7] flex flex-col text-[#1a1f2e] font-sans">
      
      {/* 1. Cabeçalho Oficial Amigão com Filtros, JWT e Modo */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        token={token}
        onTokenChange={handleTokenChange}
        isMockMode={isMockMode}
        onToggleMockMode={handleToggleMockMode}
        onRefresh={loadJornadas}
        isLoading={isLoadingJornadas}
      />

      {/* 2. Área Principal: Sidebar de Jornadas + Painel de Mapa & Métricas */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-69px)] overflow-hidden">
        
        {/* Barra Lateral: Lista de Jornadas com Filtro de Status */}
        <JornadaList
          jornadas={jornadas}
          selectedJornada={selectedJornada}
          onSelectJornada={setSelectedJornada}
          isLoading={isLoadingJornadas}
          error={errorJornadas}
          onRetry={loadJornadas}
          onSwitchToMock={isMockMode ? null : () => {
            setIsMockMode(true);
            setStoredMockMode(true);
          }}
        />

        {/* Área Central / Direita: Resumo de Métricas + Mapa Interativo */}
        <section className="flex-1 flex flex-col h-full overflow-hidden bg-[#f2f4f7] relative">
          
          {/* Painel de Métricas da Jornada Ativa */}
          {selectedJornada && (
            <ResumoJornada
              jornada={selectedJornada}
              rotaDetalhada={rotaDetalhada}
              isLoadingRota={isLoadingRota}
            />
          )}

          {/* Visualizador do Mapa com Leaflet */}
          <div className="flex-1 relative w-full h-full">
            <MapaRota
              selectedJornada={selectedJornada}
              rotaDetalhada={rotaDetalhada}
              isLoadingRota={isLoadingRota}
              errorRota={errorRota}
            />
          </div>

        </section>

      </main>

    </div>
  );
}
