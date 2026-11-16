import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import logoImg from '../assets/logo.png';
import { 
  createStartIcon, 
  createEndIcon, 
  createEventIcon 
} from './LeafletIcons';
import { 
  Loader2, 
  MapPinOff, 
  Clock, 
  Layers, 
  CheckCircle,
  Truck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Gauge,
  User,
  MapPin,
  Compass,
  RefreshCw,
  Route,
  Radio
} from 'lucide-react';
import { obterTracadoAjustadoAsRuas, calcularDistanciaPolylineKm } from '../services/routingService';

// Coordenadas centrais oficiais de Canoinhas - SC
const CANOINHAS_CENTER = [-26.1772, -50.3900];
const CANOINHAS_ZOOM = 13;

// Subcomponente interno para gerenciar redimensionamento, bounds e auto-acompanhamento suave do caminhão
function MapController({
  bounds,
  center,
  targetLocation,
  latestCoord,
  autoFollowTruck,
  jornadaId,
  fitTrigger,
  focusedPedido
}) {
  const map = useMap();
  const initialFitDoneRef = useRef(null);
  const prevFocusedRef = useRef(null);

  // Força o Leaflet a recalcular as dimensões do container logo após a renderização
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Enquadramento da rota: executa 1x ao carregar a jornada ou quando o usuário clica no botão "Centralizar"
  useEffect(() => {
    if (!map) return;
    if (targetLocation) return; // Se há foco em um pedido específico, não reseta bounds gerais

    if (initialFitDoneRef.current !== jornadaId) {
      if (bounds && bounds.length > 0) {
        try {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 0.6
          });
          initialFitDoneRef.current = jornadaId;
        } catch (err) {
          console.warn('Erro ao ajustar bounds do mapa:', err);
        }
      } else if (center && Array.isArray(center) && center.length === 2) {
        map.setView(center, 13);
        initialFitDoneRef.current = jornadaId;
      }
    }
  }, [bounds, center, map, jornadaId, targetLocation, fitTrigger]);

  // Se houver um targetLocation específico (ex: clique no pedido JOAOZINHO), dá flyTo suave
  useEffect(() => {
    if (!map || !targetLocation) return;
    try {
      map.flyTo([targetLocation.latitude, targetLocation.longitude], 16, {
        animate: true,
        duration: 0.9
      });
    } catch (err) {
      console.warn('Erro ao animar para coordenadas do pedido:', err);
    }
  }, [map, targetLocation]);

  // Restaura o enquadramento geral e fecha o popup quando o pedido for desfocado (clique na carga)
  useEffect(() => {
    if (!map) return;

    if (prevFocusedRef.current && !focusedPedido) {
      try {
        map.closePopup();
        if (bounds && bounds.length > 0) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 0.8
          });
        } else if (center && Array.isArray(center) && center.length === 2) {
          map.setView(center, 13);
        }
      } catch (err) {
        console.warn('Erro ao restaurar enquadramento ao desfocar:', err);
      }
    }

    prevFocusedRef.current = focusedPedido;
  }, [map, focusedPedido, bounds, center]);

  // Acompanhamento contínuo suave da posição do caminhão (quando autoFollow estiver ativo e novas coordenadas chegarem)
  useEffect(() => {
    if (!map || !autoFollowTruck || !latestCoord || targetLocation) return;
    try {
      map.panTo([latestCoord.latitude, latestCoord.longitude], {
        animate: true,
        duration: 1.0
      });
    } catch (err) {
      console.warn('Erro ao acompanhar caminhão:', err);
    }
  }, [map, autoFollowTruck, latestCoord, targetLocation]);

  return null;
}

export default function MapaRota({
  selectedJornada,
  rotaDetalhada,
  isLoadingRota,
  errorRota,
  focusedPedido,
  onClearFocus,
  lastSyncTime,
  onManualRefresh,
  onDistanciaCalculada
}) {
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [autoFollowTruck, setAutoFollowTruck] = useState(true);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [avisoNaoLocalizado, setAvisoNaoLocalizado] = useState(null);
  const [tracadoRuas, setTracadoRuas] = useState(null);
  const [modoTracado, setModoTracado] = useState('ruas'); // 'ruas' (ajustado às vias via OSRM) | 'gps' (linhas diretas entre pontos)
  const [carregandoRuas, setCarregandoRuas] = useState(false);
  const [mostrarPontosBrutos, setMostrarPontosBrutos] = useState(false);
  const markerRefs = useRef({});

  // Contador em segundos desde a última atualização silenciosa de telemetria
  useEffect(() => {
    const updateSeconds = () => {
      if (!lastSyncTime) {
        setSecondsAgo(0);
        return;
      }
      const diff = Math.max(0, Math.floor((Date.now() - new Date(lastSyncTime).getTime()) / 1000));
      setSecondsAgo(diff);
    };

    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const handleRecenterMap = () => {
    setFitTrigger((prev) => prev + 1);
  };

  // Normaliza e ordena as coordenadas cronologicamente (suporta 'coordenadas' ou 'localizacoes')
  const sortedCoordenadas = useMemo(() => {
    const raw = rotaDetalhada?.coordenadas || rotaDetalhada?.localizacoes;
    if (!raw || !Array.isArray(raw)) return [];

    return raw
      .map((c) => ({
        ...c,
        latitude: typeof c.latitude === 'string' ? parseFloat(c.latitude) : c.latitude,
        longitude: typeof c.longitude === 'string' ? parseFloat(c.longitude) : c.longitude,
        dataHora: c.dataHora || c.criadoEm
      }))
      .filter((c) => typeof c.latitude === 'number' && !isNaN(c.latitude) && typeof c.longitude === 'number' && !isNaN(c.longitude))
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  }, [rotaDetalhada]);

  // Lista de pontos [lat, lng] para a Polyline
  const polylinePositions = useMemo(() => {
    return sortedCoordenadas.map((c) => [c.latitude, c.longitude]);
  }, [sortedCoordenadas]);

  // Ajuste do traçado às vias da cidade via OSRM (Snap to Roads)
  useEffect(() => {
    if (!sortedCoordenadas || sortedCoordenadas.length < 2) {
      setTracadoRuas(null);
      return;
    }

    let cancelado = false;
    setCarregandoRuas(true);

    obterTracadoAjustadoAsRuas(sortedCoordenadas)
      .then((pontos) => {
        if (!cancelado) {
          setTracadoRuas(pontos);
          setCarregandoRuas(false);
        }
      })
      .catch(() => {
        if (!cancelado) setCarregandoRuas(false);
      });

    return () => {
      cancelado = true;
    };
  }, [sortedCoordenadas]);

  // Define as posições ativas a desenhar na Polyline (Ruas perfeitamente ajustadas ou GPS bruto)
  const activePolylinePositions = useMemo(() => {
    if (modoTracado === 'ruas' && tracadoRuas && tracadoRuas.length > 0) {
      return tracadoRuas;
    }
    return polylinePositions;
  }, [modoTracado, tracadoRuas, polylinePositions]);

  // Notifica o painel com a distância real calculada (vias OSRM ou telemetria filtrada)
  useEffect(() => {
    if (!onDistanciaCalculada) return;

    if (modoTracado === 'ruas' && tracadoRuas && tracadoRuas.length > 0) {
      const dist = calcularDistanciaPolylineKm(tracadoRuas);
      if (dist > 0) onDistanciaCalculada(dist, 'ruas');
    } else if (sortedCoordenadas && sortedCoordenadas.length > 1) {
      const dist = calcularDistanciaPolylineKm(sortedCoordenadas);
      if (dist > 0) onDistanciaCalculada(dist, 'telemetria');
    }
  }, [modoTracado, tracadoRuas, sortedCoordenadas, onDistanciaCalculada]);

  // Eventos brutos da rota com coordenadas numéricas válidas
  const eventos = useMemo(() => {
    const raw = rotaDetalhada?.eventos;
    if (!raw || !Array.isArray(raw)) return [];

    return raw
      .map((e) => ({
        ...e,
        latitude: typeof e.latitude === 'string' ? parseFloat(e.latitude) : e.latitude,
        longitude: typeof e.longitude === 'string' ? parseFloat(e.longitude) : e.longitude,
        dataHora: e.dataHora || e.criadoEm
      }))
      .filter((e) => typeof e.latitude === 'number' && !isNaN(e.latitude) && typeof e.longitude === 'number' && !isNaN(e.longitude));
  }, [rotaDetalhada]);

  // Lista de pedidos da jornada/carga
  const listaPedidos = useMemo(() => {
    return rotaDetalhada?.pedidos || selectedJornada?.pedidos || [];
  }, [rotaDetalhada?.pedidos, selectedJornada?.pedidos]);

  // Enriquece cada evento no mapa com os dados reais do cliente e endereço do pedido
  const eventosComPedido = useMemo(() => {
    return eventos.map((evt) => {
      const pId = String(evt.pedidoId || '').trim();
      const pedido = listaPedidos.find(
        (p) => String(p.id).trim() === pId || String(p.uuid || '').trim() === pId
      );

      const clienteNome = pedido?.clienteNome || evt.clienteNome || 'Cliente Amiguinho Express';
      const endereco = pedido?.endereco || evt.endereco || (pedido?.cidade ? `Cidade: ${pedido.cidade}` : 'Endereço não informado');

      return {
        ...evt,
        pedido,
        clienteNome,
        endereco,
        cidade: pedido?.cidade || evt.cidade || '',
        valorTotal: pedido?.total ?? evt.valorTotal ?? null,
      };
    });
  }, [eventos, listaPedidos]);

  // Identifica as coordenadas do pedido selecionado (para animação e foco)
  const targetLocation = useMemo(() => {
    if (!focusedPedido) return null;
    const targetId = String(focusedPedido.id || '').trim();
    const targetUuid = String(focusedPedido.uuid || '').trim();

    const matching = eventosComPedido.find((e) => {
      const eId = String(e.pedidoId || '').trim();
      return (targetUuid && eId === targetUuid) || (targetId && eId === targetId);
    });

    if (matching) {
      return {
        latitude: matching.latitude,
        longitude: matching.longitude,
        pedidoId: matching.pedidoId,
        timestamp: focusedPedido.timestamp || Date.now(),
      };
    }
    return null;
  }, [focusedPedido, eventosComPedido]);

  // Dispara a abertura do Popup no marcador correspondente quando o pedido for clicado
  useEffect(() => {
    if (!focusedPedido) return;
    const targetId = String(focusedPedido.id || '').trim();
    const targetUuid = String(focusedPedido.uuid || '').trim();

    if (!targetLocation) {
      setAvisoNaoLocalizado(`O pedido de "${focusedPedido.clienteNome || 'Cliente'}" ainda não possui coordenada de baixa registrada no mapa.`);
      const t = setTimeout(() => setAvisoNaoLocalizado(null), 4000);
      return () => clearTimeout(t);
    } else {
      setAvisoNaoLocalizado(null);
    }

    const timer = setTimeout(() => {
      const ref =
        (targetUuid && markerRefs.current[targetUuid]) ||
        (targetId && markerRefs.current[targetId]);
      if (ref && typeof ref.openPopup === 'function') {
        ref.openPopup();
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [focusedPedido, targetLocation]);

  // Calcula todos os bounds (coordenadas + eventos) para enquadramento perfeito
  const allBounds = useMemo(() => {
    const coords = (activePolylinePositions && activePolylinePositions.length > 0 ? activePolylinePositions : polylinePositions).slice();
    eventos.forEach((e) => {
      coords.push([e.latitude, e.longitude]);
    });
    return coords;
  }, [activePolylinePositions, polylinePositions, eventos]);

  // Ponto inicial e ponto final
  const pontoPartida = sortedCoordenadas.length > 0 ? sortedCoordenadas[0] : null;
  const pontoFinal = sortedCoordenadas.length > 1 ? sortedCoordenadas[sortedCoordenadas.length - 1] : null;

  const isEmAndamento = selectedJornada?.status === 'EM ANDAMENTO' || selectedJornada?.status === 'EM_ANDAMENTO';

  // Formatador de data e hora
  const formatDateTime = (isoString) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Centro padrão inicial: ponto de partida da rota > primeiro evento > Canoinhas, SC
  const defaultCenter = pontoPartida 
    ? [pontoPartida.latitude, pontoPartida.longitude] 
    : (eventos.length > 0 ? [eventos[0].latitude, eventos[0].longitude] : CANOINHAS_CENTER);

  const hasRouteData = sortedCoordenadas.length > 0 || eventos.length > 0;

  return (
    <div className="relative w-full h-full flex-1 min-h-0 overflow-hidden">
      
      {/* Guia Visual Inicial quando nenhuma carga estiver selecionada */}
      {!selectedJornada && (
        <div className="absolute top-4 left-4 z-[500] pointer-events-auto max-w-sm sm:max-w-md">
          <div className="bg-white/95 backdrop-blur-xs border border-[#dee2e6] rounded-[14px] p-3 shadow-md flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#fdf2f2] border border-[#fecaca] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#e50914]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1a1f2e]">Canoinhas - SC</h4>
              <p className="text-[11px] text-[#6c757d] mt-0.5">
                Selecione uma carga na lista à esquerda para carregar o traçado e telemetria da rota.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Carregamento Suave sem destruir a instância do mapa */}
      {isLoadingRota && selectedJornada && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-[600] flex flex-col items-center justify-center pointer-events-auto">
          <div className="p-4 bg-white border border-[#eaecef] rounded-[14px] shadow-md flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#ff8c00] animate-spin" />
            <div>
              <h5 className="text-xs font-extrabold text-[#1a1f2e]">
                Carregando Telemetria da Rota...
              </h5>
              <p className="text-[11px] text-[#868e96]">
                Obtendo coordenadas do veículo <strong className="text-[#1a1f2e]">{selectedJornada.veiculoId}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Falha ao Carregar Telemetria */}
      {!isLoadingRota && errorRota && selectedJornada && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] max-w-md w-full px-4 pointer-events-auto">
          <div className="bg-white border border-[#ffc9c9] rounded-[14px] p-4 shadow-md text-center">
            <div className="w-10 h-10 rounded-full bg-[#ffe3e3] text-[#c92a2a] flex items-center justify-center mx-auto mb-2.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-[#c92a2a]">
              Falha ao Carregar Telemetria
            </h4>
            <p className="text-[11px] text-[#495057] mt-1 leading-relaxed">
              {errorRota}
            </p>
          </div>
        </div>
      )}

      {/* Notificação Temporária: Pedido Clicado sem Coordenada de Baixa */}
      {avisoNaoLocalizado && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] pointer-events-auto animate-bounce">
          <div className="bg-[#1a1f2e] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium">
            <MapPinOff className="w-4 h-4 text-[#ffe066]" />
            <span>{avisoNaoLocalizado}</span>
          </div>
        </div>
      )}

      {/* Indicador de Pedido Focado com botão para Desfocar com 1 clique */}
      {!avisoNaoLocalizado && focusedPedido && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] pointer-events-auto">
          <div className="bg-[#1a1f2e] text-white pl-3.5 pr-2 py-1.5 rounded-full shadow-md flex items-center gap-2.5 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#ffe066]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Focado: <strong>{focusedPedido.clienteNome || 'Cliente'}</strong></span>
            </span>
            <button
              type="button"
              onClick={onClearFocus}
              className="bg-white/15 hover:bg-white/25 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Voltar à visão geral da carga e rota completa"
            >
              <span>✕ Desfocar</span>
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Jornada EM ANDAMENTO sem Coordenadas (Aguardando primeiro sinal) */}
      {!isLoadingRota && !errorRota && !hasRouteData && isEmAndamento && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] max-w-md w-full px-4 pointer-events-auto">
          <div className="bg-white border border-[#ffe066] rounded-[14px] p-4 shadow-md text-center">
            <div className="w-10 h-10 rounded-full bg-[#fff9db] text-[#e67700] flex items-center justify-center mx-auto mb-2.5">
              <MapPinOff className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-[#1a1f2e]">
              Aguardando Envio de Coordenadas GPS
            </h4>
            <p className="text-[11px] text-[#868e96] mt-1 leading-relaxed">
              A jornada está em andamento, aguardando o aplicativo embarcado do entregador sincronizar o primeiro pacote de coordenadas com a central.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#f8f9fa] border border-[#dee2e6] text-[#495057] px-3 py-1 rounded-[6px]">
              Status da Rota: <strong className="text-[#e67700]">EM ANDAMENTO</strong>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Jornada FINALIZADA sem Registros (Não aguarda mais GPS) */}
      {!isLoadingRota && !errorRota && !hasRouteData && !isEmAndamento && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] max-w-md w-full px-4 pointer-events-auto">
          <div className="bg-white border border-[#eaecef] rounded-[14px] p-4 shadow-md text-center">
            <div className="w-10 h-10 rounded-full bg-[#f8f9fa] text-[#868e96] flex items-center justify-center mx-auto mb-2.5">
              <MapPinOff className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-[#1a1f2e]">
              Jornada Finalizada sem Histórico GPS
            </h4>
            <p className="text-[11px] text-[#868e96] mt-1 leading-relaxed">
              Esta rota foi concluída sem coordenadas de telemetria ou eventos registrados durante o percurso.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#ebfbee] border border-[#8ce99a] text-[#2f9e44] px-3 py-1 rounded-[6px]">
              Status da Rota: <strong className="text-[#2f9e44]">FINALIZADA</strong>
            </div>
          </div>
        </div>
      )}

      {/* Badge Informativo: Jornada com eventos de parada mas sem traçado GPS contínuo */}
      {!isLoadingRota && !errorRota && sortedCoordenadas.length === 0 && eventos.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xs border border-[#eaecef] rounded-full px-4 py-1.5 shadow-sm text-center flex items-center gap-2 text-xs text-[#495057]">
            <span className="w-2 h-2 rounded-full bg-[#2f9e44]"></span>
            <span>Exibindo <strong>{eventos.length}</strong> {eventos.length === 1 ? 'parada/baixa registrada' : 'paradas/baixas registradas'} nesta rota</span>
          </div>
        </div>
      )}

      {/* Legenda do Traçado - Fixada e ancorada no canto inferior esquerdo (exibida apenas com carga ativa) */}
      {selectedJornada && (
        <div className="absolute bottom-5 left-5 z-[500] pointer-events-auto">
          <div className="bg-white border border-[#eaecef] rounded-[14px] shadow-md text-xs overflow-hidden transition-all duration-200">
            
            {/* Cabeçalho da Legenda com botão para recolher/expandir */}
            <div 
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-[#f8f9fa] transition-colors border-b border-[#eaecef]"
              title={isLegendOpen ? "Recolher legenda" : "Expandir legenda"}
            >
              <div className="flex items-center gap-2 text-[#1a1f2e] font-extrabold uppercase tracking-wider text-[10px]">
                <Layers className="w-3.5 h-3.5 text-[#e50914]" />
                <span>Legenda do Traçado</span>
              </div>
              <button type="button" className="text-[#868e96] hover:text-[#1a1f2e] p-0.5">
                {isLegendOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* Conteúdo Expansível da Legenda */}
            {isLegendOpen && (
              <div className="p-3.5 space-y-2">
                <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2f9e44] border-2 border-white shadow-xs shrink-0"></span>
                    <span className="text-[#495057] font-semibold">Início da Rota</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isEmAndamento ? 'bg-[#e50914] animate-pulse' : 'bg-[#343a40]'} border-2 border-white shadow-xs shrink-0`}></span>
                    <span className="text-[#495057] font-semibold">{isEmAndamento ? 'Caminhão em Rota' : 'Ponto Final'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2f9e44] border-2 border-white shadow-xs shrink-0"></span>
                    <span className="text-[#495057] font-semibold">Entrega Concluída</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#e67700] border-2 border-white shadow-xs shrink-0"></span>
                    <span className="text-[#495057] font-semibold">Cliente Ausente</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#eaecef] text-[10px] text-[#868e96] font-medium">
                  <span className="w-6 h-1 bg-[#ff8c00] rounded-full shrink-0"></span>
                  <span>{modoTracado === 'ruas' && tracadoRuas ? 'Traçado em Vias (Ajustado às Ruas)' : 'Rastro GPS (Laranja Amiguinho Express)'}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Barra Flutuante de Status e Controles em Tempo Real */}
      <div className="absolute top-4 right-4 z-[500] pointer-events-auto flex items-center gap-2">
        {selectedJornada ? (
          isEmAndamento ? (
            <div className="h-9 bg-white/95 backdrop-blur-xs border border-[#dee2e6] rounded-full pl-3 pr-3.5 shadow-sm flex items-center gap-2 text-xs font-bold text-[#1a1f2e]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e50914] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e50914]"></span>
              </span>
              <span className="text-[#b91c1c]">GPS 15s Ativo</span>
              <span className="text-[10px] text-[#868e96] font-mono font-normal border-l border-[#dee2e6] pl-2">
                {secondsAgo > 0 ? `${secondsAgo}s atrás` : 'Sincronizado'}
              </span>
            </div>
          ) : (
            <div className="h-9 bg-white/95 backdrop-blur-xs border border-[#dee2e6] rounded-full px-3.5 shadow-sm flex items-center gap-1.5 text-xs font-semibold text-[#868e96]">
              <CheckCircle className="w-3.5 h-3.5 text-[#2f9e44]" />
              <span>Rota Encerrada</span>
            </div>
          )
        ) : (
          <div className="h-9 bg-white/95 backdrop-blur-xs border border-[#dee2e6] rounded-full px-3.5 shadow-sm flex items-center gap-1.5 text-xs font-bold text-[#1a1f2e]">
            <MapPin className="w-3.5 h-3.5 text-[#e50914]" />
            <span>Canoinhas - SC</span>
          </div>
        )}

        {/* Toggle Traçado Ajustado às Vias / Ruas */}
        {polylinePositions.length > 1 && (
          <button
            type="button"
            onClick={() => setModoTracado((prev) => (prev === 'ruas' ? 'gps' : 'ruas'))}
            className={`h-9 px-3.5 rounded-full text-xs font-bold border transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              modoTracado === 'ruas' && tracadoRuas
                ? 'bg-[#ebfbee] text-[#2b8a3e] border-[#b2f2bb] hover:bg-[#d3f9d8]'
                : 'bg-white text-[#495057] border-[#dee2e6] hover:bg-[#f8f9fa]'
            }`}
            title={
              modoTracado === 'ruas' && tracadoRuas
                ? "Traçado inteligente ajustado perfeitamente às ruas da cidade (OpenStreetMap OSRM). Clique para ver GPS bruto."
                : "Exibindo retas diretas entre pontos GPS. Clique para ajustar o traçado às ruas."
            }
          >
            {carregandoRuas ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2b8a3e]" />
            ) : (
              <Route className={`w-3.5 h-3.5 ${modoTracado === 'ruas' && tracadoRuas ? 'text-[#2b8a3e]' : 'text-[#868e96]'}`} />
            )}
            <span>
              {carregandoRuas
                ? 'Ajustando às ruas...'
                : modoTracado === 'ruas' && tracadoRuas
                ? 'Ajustado às Ruas'
                : 'GPS Direto'}
            </span>
          </button>
        )}

        {/* Toggle para Depuração de Pontos Brutos do GPS */}
        {sortedCoordenadas.length > 0 && (
          <button
            type="button"
            onClick={() => setMostrarPontosBrutos((prev) => !prev)}
            className={`h-9 px-3 rounded-full text-xs font-bold border transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              mostrarPontosBrutos
                ? 'bg-[#1a1f2e] text-white border-[#1a1f2e]'
                : 'bg-white text-[#495057] border-[#dee2e6] hover:bg-[#f8f9fa]'
            }`}
            title="Exibir os pontos exatos coletados pelo celular no mapa (Auditoria GPS)"
          >
            <Radio className={`w-3.5 h-3.5 ${mostrarPontosBrutos ? 'text-[#ff8c00]' : 'text-[#868e96]'}`} />
            <span>{mostrarPontosBrutos ? 'Ocultar Pontos' : 'Pontos GPS'}</span>
          </button>
        )}

        {/* Toggle para Seguir Caminhão Automaticamente */}
        {isEmAndamento && pontoFinal && (
          <button
            type="button"
            onClick={() => setAutoFollowTruck((prev) => !prev)}
            className={`h-9 px-3.5 rounded-full text-xs font-bold border transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              autoFollowTruck
                ? 'bg-[#e50914] text-white border-[#b91c1c] shadow-xs'
                : 'bg-white text-[#495057] border-[#dee2e6] hover:bg-[#f8f9fa]'
            }`}
            title={autoFollowTruck ? "Câmera acompanhando o deslocamento do caminhão" : "Clique para fixar a câmera no caminhão"}
          >
            <Compass className={`w-3.5 h-3.5 ${autoFollowTruck ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span>{autoFollowTruck ? 'Seguindo' : 'Seguir Veículo'}</span>
          </button>
        )}

        {/* Botão de Enquadrar / Centralizar Rota ou Canoinhas */}
        <button
          type="button"
          onClick={handleRecenterMap}
          className="h-9 px-3.5 rounded-full bg-white border border-[#dee2e6] text-[#495057] hover:text-[#1a1f2e] hover:bg-[#f8f9fa] shadow-xs flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
          title={selectedJornada ? "Re-enquadrar toda a rota e eventos na tela" : "Centralizar mapa em Canoinhas - SC"}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{selectedJornada ? 'Centralizar' : 'Centralizar Canoinhas'}</span>
        </button>

        {/* Botão Atualizar Agora Manual */}
        {selectedJornada && onManualRefresh && (
          <button
            type="button"
            onClick={onManualRefresh}
            className="h-9 w-9 rounded-full bg-white border border-[#dee2e6] text-[#495057] hover:text-[#e50914] hover:border-[#fecaca] hover:bg-[#fef2f2] shadow-xs transition-all cursor-pointer flex items-center justify-center"
            title="Buscar novas coordenadas agora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Container do Mapa Leaflet com key dinâmica e posicionamento absoluto firme */}
      <MapContainer
        key={selectedJornada?.id || 'mapa-canoinhas'}
        center={defaultCenter}
        zoom={CANOINHAS_ZOOM}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Gerenciador de Enquadramento, Invalidação e Acompanhamento Suave */}
        <MapController 
          bounds={allBounds} 
          center={defaultCenter} 
          targetLocation={targetLocation}
          latestCoord={pontoFinal}
          autoFollowTruck={autoFollowTruck && isEmAndamento}
          jornadaId={`${selectedJornada?.id || 'canoinhas'}_${fitTrigger}`}
          fitTrigger={fitTrigger}
          focusedPedido={focusedPedido}
        />

        {/* Traçado da Rota (Polyline Laranja Suave Amiguinho Express - suporta multi-segmentos) */}
        {(activePolylinePositions.length > 0 || polylinePositions.length > 1) && (
          <Polyline
            positions={activePolylinePositions.length > 0 ? activePolylinePositions : polylinePositions}
            pathOptions={{
              color: '#ff8c00',
              weight: 3.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Marcadores de Depuração / Auditoria dos Pontos Brutos do GPS */}
        {mostrarPontosBrutos && sortedCoordenadas.map((coord, idx) => (
          <CircleMarker
            key={`raw-pt-${coord.id || idx}`}
            center={[coord.latitude, coord.longitude]}
            radius={3.5}
            pathOptions={{
              color: '#1a1f2e',
              fillColor: '#ff8c00',
              fillOpacity: 0.85,
              weight: 1.5
            }}
          >
            <Tooltip direction="top" offset={[0, -5]}>
              <div className="text-[11px] p-0.5 leading-tight font-sans">
                <p className="font-bold text-[#1a1f2e]">Ponto #{idx + 1}</p>
                <p className="text-[#495057]">Hora: {coord.dataHora ? new Date(coord.dataHora).toLocaleTimeString('pt-BR') : '--:--'}</p>
                {coord.velocidade !== undefined && <p className="text-[#495057]">Vel: {coord.velocidade} km/h</p>}
                {coord.precisao !== undefined && <p className="text-[#495057]">Precisão: {Math.round(coord.precisao)}m</p>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* 1. Marcador de Ponto de Partida (Verde Sucesso) */}
        {pontoPartida && (
          <Marker
            position={[pontoPartida.latitude, pontoPartida.longitude]}
            icon={createStartIcon()}
          >
            <Popup>
              <div className="p-3.5 min-w-[230px]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="badgeSucesso !text-[10px] !py-0.5 !px-2">
                    <CheckCircle className="w-3 h-3 text-[#2f9e44]" /> Início da Jornada
                  </span>
                </div>
                <h5 className="font-extrabold text-[#1a1f2e] text-sm">
                  Ponto de Partida
                </h5>
                <div className="mt-2 text-xs text-[#495057] space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#868e96]" />
                    <span>Horário: <strong className="text-[#1a1f2e]">{formatDateTime(pontoPartida.dataHora)}</strong></span>
                  </p>
                  <p className="text-[11px] text-[#868e96] font-mono">
                    Coord: {pontoPartida.latitude.toFixed(5)}, {pontoPartida.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Marcador de Ponto Final / Posição Atual (Roxo ou Vermelho) */}
        {pontoFinal && (
          <Marker
            position={[pontoFinal.latitude, pontoFinal.longitude]}
            icon={createEndIcon(isEmAndamento)}
          >
            <Popup>
              <div className="p-3.5 min-w-[230px]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {isEmAndamento ? (
                    <span className="badgeAlerta !text-[10px] !py-0.5 !px-2">
                      <Truck className="w-3 h-3 text-[#e67700]" /> Caminhão em Rota
                    </span>
                  ) : (
                    <span className="badgeErro !text-[10px] !py-0.5 !px-2">
                      <CheckCircle className="w-3 h-3 text-[#c92a2a]" /> Fim da Jornada
                    </span>
                  )}
                </div>
                <h5 className="font-extrabold text-[#1a1f2e] text-sm">
                  {isEmAndamento ? 'Última Posição Registrada' : 'Retorno à Distribuidora'}
                </h5>
                <div className="mt-2 text-xs text-[#495057] space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#868e96]" />
                    <span>Horário: <strong className="text-[#1a1f2e]">{formatDateTime(pontoFinal.dataHora)}</strong></span>
                  </p>
                  {(pontoFinal.velocidadeKmH !== undefined || pontoFinal.velocidade !== undefined) && (
                    <p className="text-[#868e96] text-xs flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#e50914]" />
                      <span>Velocidade Registrada: <strong className="text-[#1a1f2e]">{pontoFinal.velocidadeKmH ?? pontoFinal.velocidade} km/h</strong></span>
                    </p>
                  )}
                  <p className="text-[11px] text-[#868e96] font-mono">
                    Coord: {pontoFinal.latitude.toFixed(5)}, {pontoFinal.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Marcadores de Eventos (Entregas Realizadas, Clientes Ausentes) */}
        {eventosComPedido.map((evento, index) => {
          const tipoUpper = (evento.tipoEvento || '').toUpperCase();
          const isRealizada = tipoUpper.includes('REALIZADA') || tipoUpper.includes('SUCESSO') || tipoUpper.includes('CONCLUIDA') || tipoUpper.includes('BAIXA') || tipoUpper.includes('ENTREGA');
          const isAusente = tipoUpper.includes('AUSENTE') || tipoUpper.includes('CLIENTE_AUSENTE');

          const isThisFocused = Boolean(
            focusedPedido &&
            ((evento.pedidoId && String(focusedPedido.uuid) === String(evento.pedidoId)) ||
             (evento.pedidoId && String(focusedPedido.id) === String(evento.pedidoId)) ||
             (evento.pedido?.id && String(focusedPedido.id) === String(evento.pedido.id)) ||
             (evento.pedido?.uuid && String(focusedPedido.uuid) === String(evento.pedido.uuid)))
          );

          return (
            <Marker
              key={evento.id || `evento-${index}`}
              ref={(ref) => {
                if (ref) {
                  if (evento.id) markerRefs.current[String(evento.id)] = ref;
                  if (evento.pedidoId) markerRefs.current[String(evento.pedidoId)] = ref;
                  if (evento.pedido?.id) markerRefs.current[String(evento.pedido.id)] = ref;
                  if (evento.pedido?.uuid) markerRefs.current[String(evento.pedido.uuid)] = ref;
                }
              }}
              position={[evento.latitude, evento.longitude]}
              icon={createEventIcon(evento.tipoEvento, isThisFocused)}
            >
              <Popup>
                <div className="p-3.5 min-w-[260px] max-w-[320px]">
                  {/* Badge de tipo de evento e identificador do pedido */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {isRealizada ? (
                      <span className="badgeSucesso !text-[10px] !py-0.5 !px-2">
                        <CheckCircle className="w-3 h-3 text-[#2f9e44]" />
                        ENTREGA CONCLUÍDA
                      </span>
                    ) : isAusente ? (
                      <span className="badgeAlerta !text-[10px] !py-0.5 !px-2">
                        CLIENTE AUSENTE
                      </span>
                    ) : (
                      <span className="badgeErro !text-[10px] !py-0.5 !px-2">
                        {evento.tipoEvento ? evento.tipoEvento.replace(/_/g, ' ') : 'OCORRÊNCIA'}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-[#1971c2] font-bold bg-[#e7f5ff] px-2 py-0.5 rounded-[4px] border border-[#a5d8ff]">
                      {evento.pedido?.id ? `PED #${evento.pedido.id}` : (evento.pedidoId ? (evento.pedidoId.length > 8 ? `PED #${evento.pedidoId.slice(0, 6)}` : evento.pedidoId) : `PED-${index + 1}`)}
                    </span>
                  </div>

                  {/* Nome do Cliente em Destaque Conforme Card do Pedido */}
                  <div className="flex items-start gap-2 mt-1">
                    <div className="p-1.5 rounded-[6px] bg-[#fef2f2] text-[#e50914] shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-[#1a1f2e] text-sm leading-snug">
                        {evento.clienteNome}
                      </h5>
                      {evento.valorTotal !== null && evento.valorTotal !== undefined && (
                        <span className="text-[11px] font-bold text-[#2b8a3e] font-mono">
                          R$ {Number(evento.valorTotal).toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Endereço Conforme Card do Pedido */}
                  <div className="mt-2.5 p-2 bg-[#f8f9fa] rounded-[8px] border border-[#eaecef] text-xs text-[#495057]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#ff8c00] shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium leading-relaxed">
                        {evento.endereco}
                      </p>
                    </div>
                  </div>

                  {/* Observação / Descrição */}
                  {evento.descricao && (
                    <p className="text-[11px] text-[#495057] mt-2 bg-[#fff9db] p-2 rounded-[6px] border border-[#ffe066]/60">
                      {evento.descricao}
                    </p>
                  )}

                  {/* Detalhes de Horário e Coordenada */}
                  <div className="mt-2.5 pt-2 border-t border-[#eaecef] text-xs text-[#868e96] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#495057]">
                      <Clock className="w-3.5 h-3.5 text-[#868e96]" />
                      <span>Baixa: <strong className="text-[#1a1f2e]">{formatDateTime(evento.dataHora)}</strong></span>
                    </span>
                    <span className="font-mono text-[10px]">
                      {evento.latitude.toFixed(4)}, {evento.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}
