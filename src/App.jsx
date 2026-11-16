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
  const [isMockMode, setIsMockMode] = useState(false);

  const [jornadas, setJornadas] = useState([]);
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [rotaDetalhada, setRotaDetalhada] = useState(null);
  const [focusedPedido, setFocusedPedido] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [isLoadingJornadas, setIsLoadingJornadas] = useState(false);
  const [errorJornadas, setErrorJornadas] = useState(null);

  const [isLoadingRota, setIsLoadingRota] = useState(false);
  const [errorRota, setErrorRota] = useState(null);
  const [distanciaCalculada, setDistanciaCalculada] = useState(null);

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

      // Mantém a jornada atual se o usuário já tiver selecionado uma e ela ainda existir na lista.
      // Ao iniciar ou trocar a data, NÃO seleciona automaticamente (aguarda o clique do usuário na lista).
      if (lista.length > 0) {
        setSelectedJornada((prev) => {
          if (prev && lista.some((j) => j.id === prev.id)) {
            return lista.find((j) => j.id === prev.id);
          }
          return null;
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

  // Carrega rota detalhada da jornada selecionada (suporta modo silencioso para polling de 15s)
  const loadRota = useCallback(async (jornadaId, isSilent = false) => {
    if (!jornadaId) return;

    if (!isSilent) {
      setIsLoadingRota(true);
      setErrorRota(null);
    }

    try {
      const data = await fetchRotaJornada(jornadaId, isMockMode);
      setRotaDetalhada(data);
      setLastSyncTime(new Date());

      // Se for atualização silenciosa e houver dados de entregas atualizados, sincroniza o item na lista
      if (data && isSilent) {
        setJornadas((prev) =>
          prev.map((j) => (j.id === jornadaId ? { ...j, ...data } : j))
        );
      }
    } catch (err) {
      console.warn(`[LiveTracking] Erro ao sincronizar rota ${jornadaId}:`, err.message);
      if (!isSilent) {
        setErrorRota(
          err.response?.data?.message || 
          err.message || 
          'Erro ao carregar telemetria da rota.'
        );
        setRotaDetalhada(null);
      }
    } finally {
      if (!isSilent) {
        setIsLoadingRota(false);
      }
    }
  }, [isMockMode]);

  // Efeito: Carrega jornadas quando a data ou o modo mock mudar
  useEffect(() => {
    loadJornadas();
  }, [loadJornadas]);

  // Efeito: Carrega a rota quando a jornada selecionada mudar (carregamento normal)
  useEffect(() => {
    if (selectedJornada?.id) {
      loadRota(selectedJornada.id, false);
    } else {
      setRotaDetalhada(null);
    }
  }, [selectedJornada?.id, loadRota]);

  // Efeito: Rastreamento em Tempo Real - Atualização automática silenciosa da rota a cada 15 segundos
  useEffect(() => {
    const isEmAndamento =
      selectedJornada?.status === 'EM ANDAMENTO' ||
      selectedJornada?.status === 'EM_ANDAMENTO';

    if (!selectedJornada?.id || !isEmAndamento) {
      return;
    }

    const intervalId = setInterval(() => {
      // Faz a requisição em segundo plano, sem travar a interface e sem spinner invasivo
      loadRota(selectedJornada.id, true);
    }, 15000); // 15 segundos

    return () => clearInterval(intervalId);
  }, [selectedJornada?.id, selectedJornada?.status, loadRota]);

  // Efeito: Sincronização periódica da lista geral de jornadas a cada 45 segundos (se houver alguma jornada ativa)
  useEffect(() => {
    const temEmAndamento = jornadas.some(
      (j) => j.status === 'EM ANDAMENTO' || j.status === 'EM_ANDAMENTO'
    );
    if (!temEmAndamento) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await fetchJornadas(selectedDate, isMockMode);
        const lista = Array.isArray(data) ? data : (data.jornadas || []);
        if (lista.length > 0) {
          setJornadas(lista);
        }
      } catch (err) {
        // silencioso
      }
    }, 45000);

    return () => clearInterval(intervalId);
  }, [jornadas, selectedDate, isMockMode]);

  // Seleção de jornada (ao clicar no card da carga, desmarca qualquer pedido focado e reseta cálculo de distância)
  const handleSelectJornada = (jornada) => {
    setSelectedJornada(jornada);
    setFocusedPedido(null);
    setDistanciaCalculada(null);
  };

  // Atualização dinâmica da distância percorrida apurada pelo mapa/OSRM
  const handleDistanciaCalculada = useCallback((distKm) => {
    if (typeof distKm === 'number' && !isNaN(distKm) && distKm > 0) {
      setDistanciaCalculada(distKm);

      // Sincroniza a distância ajustada na jornada selecionada e na lista da barra lateral
      setSelectedJornada((prev) => (prev ? { ...prev, distanciaTotalKm: distKm } : prev));
      setJornadas((prev) =>
        prev.map((j) => (j.id === selectedJornada?.id ? { ...j, distanciaTotalKm: distKm } : j))
      );
    }
  }, [selectedJornada?.id]);

  // Manipulador seguro de clique em um pedido para focar no mapa (com toggle ao clicar no mesmo)
  const handleSelectPedido = (arg1, arg2) => {
    let jornada = null;
    let pedido = null;

    if (arg2) {
      jornada = arg1;
      pedido = arg2;
    } else if (arg1) {
      pedido = arg1;
      jornada = selectedJornada;
    }

    if (!pedido) return;

    // Se o pedido clicado já for o atualmente focado, desfoque (toggle)
    const pId = String(pedido.id || '');
    const pUuid = String(pedido.uuid || '');
    if (
      focusedPedido &&
      ((pId && String(focusedPedido.id) === pId) ||
       (pUuid && String(focusedPedido.uuid) === pUuid))
    ) {
      setFocusedPedido(null);
      return;
    }

    // Só troca de jornada se arg1 for um objeto de jornada real diferente da atual
    if (jornada && jornada.id && selectedJornada?.id !== jornada.id) {
      // Valida se o ID é uma jornada real (UUID ou possui campos de rota) e não um ID de pedido numérico
      if (typeof jornada.id === 'string' && (jornada.id.length > 10 || jornada.veiculoId)) {
        setSelectedJornada(jornada);
      }
    }

    setFocusedPedido({
      ...pedido,
      timestamp: Date.now()
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f2f4f7] text-[#1a1f2e] font-sans">
      
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
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Barra Lateral: Lista de Jornadas com Filtro de Status */}
        <JornadaList
          jornadas={jornadas}
          selectedJornada={selectedJornada}
          onSelectJornada={handleSelectJornada}
          isLoading={isLoadingJornadas}
          error={errorJornadas}
          onRetry={loadJornadas}
          focusedPedido={focusedPedido}
          onSelectPedido={handleSelectPedido}
          onSwitchToMock={isMockMode ? null : () => {
            setIsMockMode(true);
            setStoredMockMode(true);
          }}
        />

        {/* Área Central / Direita: Resumo de Métricas + Mapa Interativo */}
        <section className="flex-1 min-h-0 h-full flex flex-col overflow-hidden bg-[#f2f4f7] relative">
          
          {/* Painel de Métricas da Jornada Ativa */}
          {selectedJornada && (
            <ResumoJornada
              jornada={selectedJornada}
              rotaDetalhada={rotaDetalhada}
              isLoadingRota={isLoadingRota}
              focusedPedido={focusedPedido}
              onSelectPedido={(p) => handleSelectPedido(selectedJornada, p)}
              onClearFocus={() => setFocusedPedido(null)}
              distanciaCalculada={distanciaCalculada}
            />
          )}

          {/* Visualizador do Mapa com Leaflet */}
          <div className="flex-1 min-h-0 relative w-full h-full overflow-hidden">
            <MapaRota
              selectedJornada={selectedJornada}
              rotaDetalhada={rotaDetalhada}
              isLoadingRota={isLoadingRota}
              errorRota={errorRota}
              focusedPedido={focusedPedido}
              onClearFocus={() => setFocusedPedido(null)}
              lastSyncTime={lastSyncTime}
              onManualRefresh={() => selectedJornada?.id && loadRota(selectedJornada.id, true)}
              onDistanciaCalculada={handleDistanciaCalculada}
            />
          </div>

        </section>

      </main>

    </div>
  );
}
