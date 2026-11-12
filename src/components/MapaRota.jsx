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
  Layers, 
  CheckCircle,
  Truck,
  AlertCircle
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f2f4f7] h-full text-center">
        <div className="w-16 h-16 rounded-[14px] bg-white border border-[#eaecef] shadow-sm flex items-center justify-center text-[#7048e8] mb-4">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-extrabold text-[#1a1f2e]">
          Nenhuma jornada selecionada
        </h3>
        <p className="text-xs text-[#868e96] max-w-sm mt-1.5 leading-relaxed">
          Selecione uma viagem na lista à esquerda para carregar o traçado de telemetria GPS, 
          pontos de parada e status das entregas.
        </p>
      </div>
    );
  }

  // 2. Estado: Carregando rota da jornada selecionada
  if (isLoadingRota) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f2f4f7] h-full text-center">
        <div className="relative mb-4">
          <Loader2 className="w-10 h-10 text-[#ff8c00] animate-spin" />
        </div>
        <h4 className="text-sm font-extrabold text-[#1a1f2e]">
          Carregando telemetria da rota...
        </h4>
        <p className="text-xs text-[#868e96] mt-1">
          Obtendo coordenadas de GPS e paradas para o veículo <strong className="text-[#1a1f2e] font-mono">{selectedJornada.veiculoId}</strong>.
        </p>
      </div>
    );
  }

  // 3. Estado: Jornada recém-iniciada sem coordenadas
  if (sortedCoordenadas.length === 0 && eventos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f2f4f7] h-full text-center">
        <div className="w-14 h-14 rounded-[14px] bg-[#fff9db] border border-[#ffe066] flex items-center justify-center text-[#e67700] mb-4 shadow-sm">
          <MapPinOff className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-extrabold text-[#1a1f2e]">
          Jornada recém-iniciada, aguardando envio do primeiro lote do app
        </h4>
        <p className="text-xs text-[#868e96] max-w-md mt-2 leading-relaxed">
          O entregador iniciou o expediente, mas o aplicativo embarcado ainda não sincronizou 
          as primeiras coordenadas de GPS com a central de logística.
        </p>
        <span className="mt-4 text-[11px] font-mono bg-white border border-[#dee2e6] text-[#495057] px-3.5 py-1.5 rounded-[8px] shadow-xs">
          Status da Rota: <strong className="text-[#e67700]">{selectedJornada.status}</strong>
        </span>
      </div>
    );
  }

  // Centro padrão inicial
  const defaultCenter = pontoPartida 
    ? [pontoPartida.latitude, pontoPartida.longitude] 
    : [-22.1256, -51.3889]; // Presidente Prudente (Sede Amigão)

  return (
    <div className="relative w-full h-full flex-1">
      
      {/* Legenda Flutuante Operacional - Design System Amigão */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white border border-[#eaecef] rounded-[14px] p-3.5 shadow-md text-xs space-y-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 text-[#1a1f2e] font-extrabold uppercase tracking-wider text-[10px] pb-1.5 border-b border-[#eaecef]">
          <Layers className="w-3.5 h-3.5 text-[#7048e8]" /> Legenda do Traçado
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2f9e44] border-2 border-white shadow-xs"></span>
            <span className="text-[#495057] font-semibold">Ponto de Partida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isEmAndamento ? 'bg-[#7048e8] animate-pulse' : 'bg-[#c92a2a]'} border-2 border-white shadow-xs`}></span>
            <span className="text-[#495057] font-semibold">{isEmAndamento ? 'Caminhão em Rota' : 'Ponto Final'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2f9e44] border-2 border-white shadow-xs"></span>
            <span className="text-[#495057] font-semibold">Entrega Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#e67700] border-2 border-white shadow-xs"></span>
            <span className="text-[#495057] font-semibold">Cliente Ausente</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1.5 border-t border-[#eaecef] text-[10px] text-[#868e96] font-medium">
          <span className="w-6 h-1.5 bg-[#7048e8] rounded-full"></span>
          <span>Rastro GPS Percorrido (Cargas Amigão)</span>
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

        {/* Traçado Contínuo da Rota (Polyline Roxo de Cargas / Logística #7048e8) */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#7048e8', // Cor oficial de Logística e Cargas Amigão
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

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

        {/* 2. Marcador de Ponto Final / Atual (Roxo Logística ou Vermelho) */}
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
                      <Truck className="w-3 h-3 text-[#e67700]" /> Caminhão em Trânsito
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
                  {pontoFinal.velocidadeKmH !== undefined && (
                    <p className="text-[#868e96] text-xs">
                      Velocidade: <span className="text-[#1a1f2e] font-bold">{pontoFinal.velocidadeKmH} km/h</span>
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
        {eventos.map((evento, index) => {
          const tipoUpper = (evento.tipoEvento || '').toUpperCase();
          const isRealizada = tipoUpper.includes('REALIZADA') || tipoUpper.includes('SUCESSO') || tipoUpper.includes('CONCLUIDA');
          const isAusente = tipoUpper.includes('AUSENTE') || tipoUpper.includes('CLIENTE_AUSENTE');

          return (
            <Marker
              key={evento.id || `evento-${index}`}
              position={[evento.latitude, evento.longitude]}
              icon={createEventIcon(evento.tipoEvento)}
            >
              <Popup>
                <div className="p-3.5 min-w-[240px]">
                  {/* Badge de tipo de evento */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {isRealizada ? (
                      <span className="badgeSucesso !text-[10px] !py-0.5 !px-2">
                        ENTREGA REALIZADA
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
                    <span className="font-mono text-[11px] text-[#868e96] font-bold">
                      {evento.pedidoId || `PED-${index + 1}`}
                    </span>
                  </div>

                  {/* Nome do Cliente */}
                  <h5 className="font-extrabold text-[#1a1f2e] text-sm">
                    {evento.clienteNome || 'Cliente Amigão'}
                  </h5>

                  {/* Observação / Descrição */}
                  {evento.descricao && (
                    <p className="text-xs text-[#495057] mt-1.5 bg-[#f8f9fa] p-2 rounded-[8px] border border-[#eaecef]">
                      {evento.descricao}
                    </p>
                  )}

                  {/* Detalhes de Horário e Coordenada */}
                  <div className="mt-2.5 pt-2 border-t border-[#eaecef] text-xs text-[#495057] space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#868e96]" />
                      <span>Baixa: <strong className="text-[#1a1f2e]">{formatDateTime(evento.dataHora)}</strong></span>
                    </p>
                    <p className="text-[10px] text-[#868e96] font-mono">
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
