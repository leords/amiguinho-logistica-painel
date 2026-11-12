import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  createStartIcon, 
  createEndIcon, 
  createEventIcon 
} from './LeafletIcons';
import { 
  Loader2, 
  MapPinOff, 
  Clock, 
  Package, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Truck,
  Layers
} from 'lucide-react';

// Subcomponente interno para ajustar o enquadramento (fitBounds) automaticamente
function FitBoundsController({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
          duration: 0.8
        });
      } catch (err) {
        console.warn('Erro ao ajustar bounds do mapa:', err);
      }
    }
  }, [bounds, map]);

  return null;
}

export default function MapaRota({
  selectedJornada,
  rotaDetalhada,
  isLoadingRota,
  errorRota
}) {
  // Ordena as coordenadas por dataHora cronologicamente
  const sortedCoordenadas = useMemo(() => {
    if (!rotaDetalhada?.coordenadas || !Array.isArray(rotaDetalhada.coordenadas)) {
      return [];
    }
    return [...rotaDetalhada.coordenadas].sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    );
  }, [rotaDetalhada]);

  // Lista de pontos [lat, lng] para a Polyline
  const polylinePositions = useMemo(() => {
    return sortedCoordenadas.map((c) => [c.latitude, c.longitude]);
  }, [sortedCoordenadas]);

  // Eventos mapeados
  const eventos = useMemo(() => {
    if (!rotaDetalhada?.eventos || !Array.isArray(rotaDetalhada.eventos)) {
      return [];
    }
    return rotaDetalhada.eventos.filter(
      (e) => typeof e.latitude === 'number' && typeof e.longitude === 'number'
    );
  }, [rotaDetalhada]);

  // Calcula todos os bounds (coordenadas + eventos) para o fitBounds
  const allBounds = useMemo(() => {
    const coords = polylinePositions.slice();
    eventos.forEach((e) => {
      coords.push([e.latitude, e.longitude]);
    });
    return coords;
  }, [polylinePositions, eventos]);

  // Ponto inicial e ponto final
  const pontoPartida = sortedCoordenadas.length > 0 ? sortedCoordenadas[0] : null;
  const pontoFinal = sortedCoordenadas.length > 1 ? sortedCoordenadas[sortedCoordenadas.length - 1] : null;

  const isEmAndamento = selectedJornada?.status === 'EM ANDAMENTO';

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

  // 1. Estado: Nenhuma jornada selecionada
  if (!selectedJornada) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">
          Nenhuma jornada selecionada
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Selecione uma viagem na lista lateral para carregar a rota percorrida, 
          marcador de partida, paradas de entrega e última localização do caminhão.
        </p>
      </div>
    );
  }

  // 2. Estado: Carregando rota da jornada selecionada
  if (isLoadingRota) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="relative mb-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <div className="absolute inset-0 blur-sm bg-blue-500/30 animate-pulse rounded-full"></div>
        </div>
        <h4 className="text-sm font-semibold text-slate-200">
          Carregando telemetria da rota...
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Obtendo coordenadas de GPS e registros de eventos para o veículo <span className="text-slate-300 font-mono font-medium">{selectedJornada.veiculoId}</span>.
        </p>
      </div>
    );
  }

  // 3. Estado: Jornada recém-iniciada sem coordenadas
  if (sortedCoordenadas.length === 0 && eventos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <MapPinOff className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-200">
          Jornada recém-iniciada, aguardando envio do primeiro lote do app
        </h4>
        <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
          O entregador iniciou a jornada, mas o dispositivo embarcado ainda não sincronizou 
          as primeiras coordenadas de GPS com a central de logística.
        </p>
        <span className="mt-4 text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg">
          Status da Jornada: {selectedJornada.status}
        </span>
      </div>
    );
  }

  // Centro padrão inicial (fallback se não houver bounds)
  const defaultCenter = pontoPartida 
    ? [pontoPartida.latitude, pontoPartida.longitude] 
    : [-23.55052, -46.633308]; // São Paulo como referência Distribuidora Amigão

  return (
    <div className="relative w-full h-full flex-1">
      
      {/* Legenda Flutuante Operacional */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
          <Layers className="w-3 h-3 text-blue-400" /> Legenda do Mapa
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600 border border-white"></span>
            <span className="text-slate-300">Ponto de Partida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isEmAndamento ? 'bg-sky-500 animate-pulse' : 'bg-red-600'} border border-white`}></span>
            <span className="text-slate-300">{isEmAndamento ? 'Posição Atual' : 'Ponto Final'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
            <span className="text-slate-300">Baixa Realizada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 border border-white"></span>
            <span className="text-slate-300">Cliente Ausente</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
          <span className="w-5 h-1 bg-blue-500 rounded"></span>
          <span>Traçado da Rota GPS</span>
        </div>
      </div>

      {/* Container do Mapa Leaflet */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajuste Automático dos Limites da Rota */}
        {allBounds.length > 0 && <FitBoundsController bounds={allBounds} />}

        {/* Traçado Contínuo da Rota (Polyline Azul Vibrante) */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#2563eb', // Azul vibrante Amigão
              weight: 4.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* 1. Marcador de Ponto de Partida (Verde) */}
        {pontoPartida && (
          <Marker
            position={[pontoPartida.latitude, pontoPartida.longitude]}
            icon={createStartIcon()}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase mb-1">
                  <CheckCircle className="w-4 h-4" /> Início da Jornada
                </div>
                <h5 className="font-semibold text-slate-100 text-sm">
                  Ponto de Partida
                </h5>
                <div className="mt-2 text-xs text-slate-300 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Horário: <strong>{formatDateTime(pontoPartida.dataHora)}</strong></span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Coord: {pontoPartida.latitude.toFixed(5)}, {pontoPartida.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Marcador de Ponto Final / Atual (Vermelho ou Azul Pulsante) */}
        {pontoFinal && (
          <Marker
            position={[pontoFinal.latitude, pontoFinal.longitude]}
            icon={createEndIcon(isEmAndamento)}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                <div className={`flex items-center gap-1.5 font-bold text-xs uppercase mb-1 ${isEmAndamento ? 'text-sky-400' : 'text-rose-400'}`}>
                  <Truck className="w-4 h-4" />
                  {isEmAndamento ? 'Última Posição Registrada' : 'Fim da Jornada'}
                </div>
                <h5 className="font-semibold text-slate-100 text-sm">
                  {isEmAndamento ? 'Caminhão em Trânsito' : 'Retorno ao Depósito'}
                </h5>
                <div className="mt-2 text-xs text-slate-300 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Horário: <strong>{formatDateTime(pontoFinal.dataHora)}</strong></span>
                  </p>
                  {pontoFinal.velocidadeKmH !== undefined && (
                    <p className="text-slate-400 text-xs">
                      Velocidade: <span className="text-slate-200 font-semibold">{pontoFinal.velocidadeKmH} km/h</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 font-mono">
                    Coord: {pontoFinal.latitude.toFixed(5)}, {pontoFinal.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Marcadores de Eventos (Entregas Realizadas, Clientes Ausentes) */}
        {eventos.map((evento, index) => {
          const isRealizada = (evento.tipoEvento || '').toUpperCase().includes('REALIZADA');
          return (
            <Marker
              key={evento.id || `evento-${index}`}
              position={[evento.latitude, evento.longitude]}
              icon={createEventIcon(evento.tipoEvento)}
            >
              <Popup>
                <div className="p-3 min-w-[240px]">
                  {/* Badge de tipo de evento */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isRealizada 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {evento.tipoEvento ? evento.tipoEvento.replace(/_/g, ' ') : 'EVENTO'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">
                      {evento.pedidoId || `PED-${index + 1}`}
                    </span>
                  </div>

                  {/* Nome do Cliente / Estabelecimento */}
                  <h5 className="font-bold text-slate-100 text-sm">
                    {evento.clienteNome || 'Cliente Amigão'}
                  </h5>

                  {/* Descrição do Evento */}
                  {evento.descricao && (
                    <p className="text-xs text-slate-300 mt-1 bg-slate-900/60 p-1.5 rounded border border-slate-700/50">
                      {evento.descricao}
                    </p>
                  )}

                  {/* Detalhes de Horário e Coordenada */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-xs text-slate-300 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Horário da Baixa: <strong>{formatDateTime(evento.dataHora)}</strong></span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Coord: {evento.latitude.toFixed(5)}, {evento.longitude.toFixed(5)}
                    </p>
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
