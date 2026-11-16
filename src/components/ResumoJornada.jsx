import React, { useMemo } from 'react';
import { 
  MapPin, 
  PackageCheck, 
  Clock, 
  Navigation, 
  Truck, 
  User, 
  CheckCircle,
  AlertTriangle,
  Radio,
  Gauge
} from 'lucide-react';
import { calcularDistanciaPolylineKm } from '../services/routingService';

export default function ResumoJornada({ 
  jornada, 
  rotaDetalhada, 
  isLoadingRota,
  focusedPedido,
  onSelectPedido,
  onClearFocus,
  distanciaCalculada
}) {
  if (!jornada) return null;

  const coordenadas = rotaDetalhada?.coordenadas || rotaDetalhada?.localizacoes || [];
  const eventos = rotaDetalhada?.eventos || [];
  
  const totalPontosGps = coordenadas.length;
  const totalEventos = eventos.length;

  // Métricas da carga (pedidos e percentual entregue)
  const pedidos = rotaDetalhada?.pedidos || jornada.pedidos || [];
  const totalPedidos = rotaDetalhada?.totalPedidos ?? jornada.totalPedidos ?? (pedidos.length > 0 ? pedidos.length : (jornada.totalEntregas ?? 0));
  const entregues = rotaDetalhada?.entregasRealizadas ?? jornada.entregasRealizadas ?? pedidos.filter((p) => p.entregue).length;
  const percentual = totalPedidos > 0 ? Math.round((entregues / totalPedidos) * 100) : (entregues > 0 ? 100 : 0);
  const nomeMotorista = rotaDetalhada?.motoristaNome || jornada.motoristaNome || jornada.motorista?.nome || jornada.usuarioNome || `ID: ${jornada.usuarioId}`;

  // Métricas de velocidade (calculadas em movimento pela telemetria)
  const velMedia = rotaDetalhada?.velocidadeMedia !== undefined
    ? rotaDetalhada.velocidadeMedia
    : (jornada.velocidadeMediaKmH ?? null);

  const velMaxima = rotaDetalhada?.velocidadeMaxima !== undefined
    ? rotaDetalhada.velocidadeMaxima
    : (jornada.velocidadeMaximaKmH ?? null);

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const primeiraCoordenada = coordenadas.length > 0 ? coordenadas[0] : null;
  const ultimaCoordenada = coordenadas.length > 0 ? coordenadas[coordenadas.length - 1] : null;

  const horaPrimeira = primeiraCoordenada ? formatTime(primeiraCoordenada.dataHora) : '--:--';
  const horaUltima = ultimaCoordenada ? formatTime(ultimaCoordenada.dataHora) : '--:--';

  const isEmAndamento = jornada.status === 'EM ANDAMENTO' || jornada.status === 'EM_ANDAMENTO';

  // Distância percorrida com suporte a cálculo dinâmico de alta precisão
  const distanciaExibida = useMemo(() => {
    // 1. Se recebemos o cálculo em tempo real das vias (OSRM) ou telemetria dinâmica
    if (typeof distanciaCalculada === 'number' && distanciaCalculada > 0) {
      return distanciaCalculada;
    }
    // 2. Se a jornada já possui uma distância válida gravada no banco
    if (jornada.distanciaTotalKm && Number(jornada.distanciaTotalKm) > 0) {
      return Number(jornada.distanciaTotalKm);
    }
    // 3. Fallback imediato: calcula pela telemetria com filtro anti-ruído de paradas
    if (coordenadas && coordenadas.length > 1) {
      const distTelemetria = calcularDistanciaPolylineKm(coordenadas);
      if (distTelemetria > 0) return distTelemetria;
    }
    return 0;
  }, [distanciaCalculada, jornada.distanciaTotalKm, coordenadas]);

  return (
    <div className="bg-white border-b border-[#eaecef] px-4 lg:px-6 py-3 z-20 shadow-xs shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Identificação do Veículo e Motorista (Clique para desfocar e voltar à visão completa da carga) */}
        <div 
          onClick={focusedPedido ? onClearFocus : undefined}
          className={`flex items-center gap-3 ${focusedPedido ? 'cursor-pointer group' : ''}`}
          title={focusedPedido ? "Clique para desfocar e ver rota completa da carga" : undefined}
        >
          <div className={`p-2 rounded-[10px] bg-[#f8f9fa] border border-[#dee2e6] text-[#1a1f2e] shrink-0 transition-colors ${focusedPedido ? 'group-hover:bg-[#f1f3f5]' : ''}`}>
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {jornada.cargaId && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#495057] bg-[#f1f3f5] border border-[#dee2e6] px-2 py-0.5 rounded font-mono">
                  Carga #{jornada.cargaId}
                </span>
              )}
              <h3 className={`text-sm sm:text-base font-black text-[#1a1f2e] tracking-tight transition-colors ${focusedPedido ? 'group-hover:text-[#e50914]' : ''}`}>
                {jornada.veiculoId}
              </h3>
              {focusedPedido ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearFocus && onClearFocus();
                  }}
                  className="bg-[#f8f9fa] text-[#495057] border border-[#dee2e6] text-[10px] py-0.5 px-2.5 rounded-full hover:bg-[#e9ecef] transition-colors cursor-pointer flex items-center gap-1 font-bold shadow-2xs"
                  title="Clique para desfocar e ver rota completa da carga"
                >
                  <span>📍 {focusedPedido.clienteNome || 'Cliente'}</span>
                  <span className="text-[#868e96] underline">✕ Desfocar</span>
                </button>
              ) : isEmAndamento ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#fff4e6] text-[#d9480f] border border-[#ffd8a8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c00] animate-pulse" />
                  EM ROTA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#ebfbee] text-[#2b8a3e] border border-[#b2f2bb]">
                  <CheckCircle className="w-3 h-3 text-[#2b8a3e]" />
                  CONCLUÍDA
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#868e96] mt-0.5 font-medium">
              <span className="flex items-center gap-1 text-[#495057] font-semibold">
                <User className="w-3.5 h-3.5 text-[#868e96]" />
                {nomeMotorista}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#6c757d]">
                Início: {formatTime(jornada.dataInicio)}
              </span>
            </div>
          </div>
        </div>

        {/* Chips de KPIs e Métricas Operacionais Padronizados */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          {/* Progresso da Carga (% e Pedidos) */}
          {totalPedidos > 0 && (
            <div className="h-9 flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-2.5" title={`${entregues} pedidos entregues de ${totalPedidos}`}>
              <div className="w-5 h-5 rounded-full bg-[#f1f3f5] text-[#495057] flex items-center justify-center shrink-0">
                <PackageCheck className="w-3 h-3" />
              </div>
              <div>
                <p className="text-[9px] text-[#868e96] uppercase font-bold leading-none">
                  Carga Entregue
                </p>
                <p className="text-xs font-black text-[#1a1f2e] mt-0.5 leading-none font-mono">
                  {percentual}% <span className="text-[10px] text-[#868e96] font-normal">({entregues}/{totalPedidos})</span>
                </p>
              </div>
            </div>
          )}

          {/* Pontos GPS */}
          <div className="h-9 flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-2.5">
            <div className="w-5 h-5 rounded-full bg-[#f1f3f5] text-[#495057] flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[9px] text-[#868e96] uppercase font-bold leading-none">
                Pontos GPS
              </p>
              <p className="text-xs font-black text-[#1a1f2e] mt-0.5 leading-none font-mono">
                {isLoadingRota ? '...' : totalPontosGps}
              </p>
            </div>
          </div>

          {/* Eventos / Paradas */}
          <div className="h-9 flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-2.5">
            <div className="w-5 h-5 rounded-full bg-[#f1f3f5] text-[#495057] flex items-center justify-center shrink-0">
              <PackageCheck className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[9px] text-[#868e96] uppercase font-bold leading-none">
                Eventos
              </p>
              <p className="text-xs font-black text-[#1a1f2e] mt-0.5 leading-none font-mono">
                {isLoadingRota ? '...' : totalEventos}
              </p>
            </div>
          </div>

          {/* Distância Percorrida */}
          <div 
            className="h-9 flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-2.5"
            title={distanciaExibida > 0 ? `Distância real percorrida aferida: ${distanciaExibida.toFixed(2)} km` : 'Distância percorrida'}
          >
            <div className="w-5 h-5 rounded-full bg-[#f1f3f5] text-[#495057] flex items-center justify-center shrink-0">
              <Navigation className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[9px] text-[#868e96] uppercase font-bold leading-none">
                Distância
              </p>
              <p className="text-xs font-black text-[#1a1f2e] mt-0.5 leading-none font-mono">
                {isLoadingRota ? '...' : `${distanciaExibida.toFixed(1)} km`}
              </p>
            </div>
          </div>

          {/* Velocidade Média em Movimento & Pico */}
          {velMedia !== null && (
            <div className="h-9 flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-2.5" title="Média calculada em movimento (> 2 km/h)">
              <div className="w-5 h-5 rounded-full bg-[#f1f3f5] text-[#495057] flex items-center justify-center shrink-0">
                <Gauge className="w-3 h-3" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] text-[#868e96] uppercase font-bold leading-none">
                    Velocidade
                  </p>
                  {velMaxima > 0 && (
                    <span className="text-[9px] font-bold text-[#495057] bg-[#e9ecef] px-1 py-0.2 rounded font-mono">
                      Pico: {velMaxima} km/h
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-[#1a1f2e] mt-0.5 leading-none font-mono">
                  {isLoadingRota ? '...' : `${velMedia} km/h`}
                </p>
              </div>
            </div>
          )}

          {/* Última Transmissão */}
          {ultimaCoordenada && (
            <div className="hidden 2xl:flex h-9 items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-2.5">
              <div className="w-5 h-5 rounded-full bg-[#f1f3f5] text-[#495057] flex items-center justify-center shrink-0">
                <Clock className="w-3 h-3" />
              </div>
              <div>
                <p className="text-[9px] text-[#868e96] uppercase font-bold leading-none">
                  Último Sinal
                </p>
                <p className="text-xs font-black text-[#1a1f2e] mt-0.5 leading-none font-mono">
                  {horaUltima}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
