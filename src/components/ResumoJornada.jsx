import React from 'react';
import { 
  MapPin, 
  PackageCheck, 
  Clock, 
  Activity, 
  Truck, 
  User, 
  Calendar,
  AlertTriangle
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
    <div className="bg-slate-900/95 border-b border-slate-800 p-3.5 backdrop-blur z-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Identificação da Jornada */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {jornada.veiculoId}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isEmAndamento 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {jornada.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                {jornada.usuarioNome || `ID: ${jornada.usuarioId}`}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">
                {(jornada.distanciaTotalKm ?? 0).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Principais em Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          
          {/* Total de Pontos GPS */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5">
            <MapPin className="w-4 h-4 text-sky-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                Pontos GPS
              </p>
              <p className="text-xs font-bold text-white mt-1 leading-none font-mono">
                {isLoadingRota ? '...' : totalPontosGps}
              </p>
            </div>
          </div>

          {/* Total de Eventos / Entregas */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                Eventos / Paradas
              </p>
              <p className="text-xs font-bold text-white mt-1 leading-none font-mono">
                {isLoadingRota ? '...' : totalEventos}
              </p>
            </div>
          </div>

          {/* Horários 1ª e Última Coordenada */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                Primeira &rarr; Última Coordenada
              </p>
              <p className="text-xs font-semibold text-slate-200 mt-1 leading-none font-mono">
                {isLoadingRota ? '...' : `${horaPrimeira} - ${horaUltima}`}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
