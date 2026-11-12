import React, { useEffect, useMemo, useState } from 'react';
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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

// Subcomponente interno para gerenciar redimensionamento (invalidateSize) e enquadramento (fitBounds)
function MapController({ bounds, center }) {
  const map = useMap();

  // Força o Leaflet a recalcular as dimensões do container logo após a renderização
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Ajusta automaticamente o zoom e o centro para os limites da rota
  useEffect(() => {
    if (!map) return;
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
          duration: 0.6
        });
      } catch (err) {
        console.warn('Erro ao ajustar bounds do mapa:', err);
      }
    } else if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, 13);
    }
  }, [bounds, center, map]);

  return null;
}

export default function MapaRota({
  selectedJornada,
  rotaDetalhada,
  isLoadingRota,
  errorRota
}) {
  const [isLegendOpen, setIsLegendOpen] = useState(true);

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

  // Eventos mapeados com coordenadas numéricas válidas
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

  // Calcula todos os bounds (coordenadas + eventos) para enquadramento perfeito
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

  // 1. Estado: Nenhuma jornada selecionada
  if (!selectedJornada) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 bg-[#f2f4f7] h-full text-center">
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

  // Centro padrão inicial
  const defaultCenter = pontoPartida 
    ? [pontoPartida.latitude, pontoPartida.longitude] 
    : [-22.1256, -51.3889]; // Presidente Prudente (Sede Amigão)

  const hasRouteData = sortedCoordenadas.length > 0 || eventos.length > 0;

  return (
    <div className="relative w-full h-full flex-1 min-h-0 overflow-hidden">
      
      {/* Overlay de Carregamento Suave sem destruir a instância do mapa */}
      {isLoadingRota && (
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

      {/* Alerta de Jornada Recém-Iniciada (Sem dados de telemetria ainda) */}
      {!isLoadingRota && !hasRouteData && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] max-w-md w-full px-4 pointer-events-auto">
          <div className="bg-white border border-[#ffe066] rounded-[14px] p-4 shadow-md text-center">
            <div className="w-10 h-10 rounded-full bg-[#fff9db] text-[#e67700] flex items-center justify-center mx-auto mb-2.5">
              <MapPinOff className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-[#1a1f2e]">
              Aguardando Envio de Coordenadas GPS
            </h4>
            <p className="text-[11px] text-[#868e96] mt-1 leading-relaxed">
              A jornada está ativa, mas o aplicativo embarcado do entregador ainda não sincronizou o primeiro pacote de coordenadas com a central.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#f8f9fa] border border-[#dee2e6] text-[#495057] px-3 py-1 rounded-[6px]">
              Status da Rota: <strong className="text-[#e67700]">{selectedJornada.status}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Legenda do Traçado - Fixada e ancorada no canto inferior esquerdo */}
      <div className="absolute bottom-5 left-5 z-[500] pointer-events-auto">
        <div className="bg-white border border-[#eaecef] rounded-[14px] shadow-md text-xs overflow-hidden transition-all duration-200">
          
          {/* Cabeçalho da Legenda com botão para recolher/expandir */}
          <div 
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-[#f8f9fa] transition-colors border-b border-[#eaecef]"
            title={isLegendOpen ? "Recolher legenda" : "Expandir legenda"}
          >
            <div className="flex items-center gap-2 text-[#1a1f2e] font-extrabold uppercase tracking-wider text-[10px]">
              <Layers className="w-3.5 h-3.5 text-[#7048e8]" />
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
                  <span className={`w-3 h-3 rounded-full ${isEmAndamento ? 'bg-[#7048e8] animate-pulse' : 'bg-[#c92a2a]'} border-2 border-white shadow-xs shrink-0`}></span>
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
                <span className="w-6 h-1.5 bg-[#7048e8] rounded-full shrink-0"></span>
                <span>Rastro GPS (Logística Amigão)</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Container do Mapa Leaflet com key dinâmica e posicionamento absoluto firme */}
      <MapContainer
        key={selectedJornada?.id || 'mapa-principal'}
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Gerenciador de Enquadramento e Invalidação de Tamanho */}
        <MapController bounds={allBounds} center={defaultCenter} />

        {/* Traçado Contínuo da Rota (Polyline Roxo de Cargas / Logística #7048e8) */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#7048e8',
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
