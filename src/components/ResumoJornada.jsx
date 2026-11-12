import React from 'react';
import { 
  MapPin, 
  PackageCheck, 
  Clock, 
  Navigation, 
  Truck, 
  User, 
  CheckCircle,
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function ResumoJornada({ jornada, rotaDetalhada, isLoadingRota }) {
  if (!jornada) return null;

  const coordenadas = rotaDetalhada?.coordenadas || [];
  const eventos = rotaDetalhada?.eventos || [];
  
  const totalPontosGps = coordenadas.length;
  const totalEventos = eventos.length;

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

  const isEmAndamento = jornada.status === 'EM ANDAMENTO';

  return (
    <div className="bg-white border-b border-[#eaecef] p-3.5 z-20 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Identificação do Veículo e Motorista */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-[10px] bg-[#f3f0ff] border border-[#b197fc]/40 text-[#7048e8] shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#1a1f2e] tracking-tight">
                {jornada.veiculoId}
              </h3>
              {isEmAndamento ? (
                <span className="badgeAlerta !text-[10px] !py-0.5 !px-2">
                  <span className="w-2 h-2 rounded-full bg-[#e67700] animate-pulse"></span>
                  EM ROTA
                </span>
              ) : (
                <span className="badgeSucesso !text-[10px] !py-0.5 !px-2">
                  <CheckCircle className="w-3 h-3 text-[#2f9e44]" />
                  CONCLUÍDA
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#868e96] mt-0.5 font-medium">
              <span className="flex items-center gap-1 text-[#495057]">
                <User className="w-3.5 h-3.5 text-[#868e96]" />
                {jornada.usuarioNome || `ID: ${jornada.usuarioId}`}
              </span>
              <span>•</span>
              <span className="font-bold text-[#1971c2]">
                Início: {formatTime(jornada.dataInicio)}
              </span>
            </div>
          </div>
        </div>

        {/* Chips de KPIs e Métricas Operacionais */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Pontos GPS */}
          <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#e7f5ff] text-[#1971c2] flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-[#868e96] uppercase font-bold leading-none">
                Pontos GPS
              </p>
              <p className="text-xs font-extrabold text-[#1a1f2e] mt-1 leading-none font-mono">
                {isLoadingRota ? '...' : totalPontosGps}
              </p>
            </div>
          </div>

          {/* Eventos / Paradas */}
          <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#ebfbee] text-[#2f9e44] flex items-center justify-center shrink-0">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-[#868e96] uppercase font-bold leading-none">
                Eventos / Baixas
              </p>
              <p className="text-xs font-extrabold text-[#1a1f2e] mt-1 leading-none font-mono">
                {isLoadingRota ? '...' : totalEventos}
              </p>
            </div>
          </div>

          {/* Distância Percorrida */}
          <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#fff3e0] text-[#ff8c00] flex items-center justify-center shrink-0">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-[#868e96] uppercase font-bold leading-none">
                Distância Total
              </p>
              <p className="text-xs font-extrabold text-[#1a1f2e] mt-1 leading-none font-mono">
                {(jornada.distanciaTotalKm ?? 0).toFixed(1)} km
              </p>
            </div>
          </div>

          {/* Última Transmissão */}
          {ultimaCoordenada && (
            <div className="hidden xl:flex items-center gap-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[#f3f0ff] text-[#7048e8] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-[#868e96] uppercase font-bold leading-none">
                  Último Sinal
                </p>
                <p className="text-xs font-extrabold text-[#1a1f2e] mt-1 leading-none font-mono">
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
