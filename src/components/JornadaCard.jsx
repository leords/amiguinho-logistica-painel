import React from 'react';
import { User, Truck, Clock, Navigation, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function JornadaCard({ jornada, isSelected, onSelect }) {
  const isEmAndamento = jornada.status === 'EM ANDAMENTO';

  // Formatador de hora amigável
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const horaInicio = formatTime(jornada.dataInicio);
  const horaFim = jornada.dataFim ? formatTime(jornada.dataFim) : 'Em curso';

  return (
    <div
      onClick={() => onSelect(jornada)}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
          : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
      }`}
    >
      {/* Indicador lateral quando selecionado */}
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r"></div>
      )}

      {/* Topo do Card: Entregador e Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/60 text-slate-300'}`}>
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
              {jornada.usuarioNome || `Entregador ${jornada.usuarioId}`}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {jornada.usuarioId}
            </span>
          </div>
        </div>

        {/* Badge de Status */}
        {isEmAndamento ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            EM ANDAMENTO
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/50">
            <CheckCircle className="w-2.5 h-2.5 text-blue-400" />
            FINALIZADA
          </span>
        )}
      </div>

      {/* Informações centrais: Veículo, Horários, Distância */}
      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/40 pt-2.5 mt-2">
        
        {/* Veículo */}
        <div className="flex items-center gap-2 text-slate-300">
          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{jornada.veiculoId}</span>
        </div>

        {/* Horários */}
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {horaInicio} &rarr; <span className={isEmAndamento ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>{horaFim}</span>
            </span>
          </div>

          {/* Distância */}
          <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
            <Navigation className="w-3 h-3 text-blue-400 shrink-0" />
            <span>{(jornada.distanciaTotalKm ?? 0).toFixed(1)} km</span>
          </div>
        </div>

      </div>

      {/* Rodapé do Card com resumo de entregas se houver */}
      {jornada.totalEntregas !== undefined && (
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/30 text-[11px] text-slate-400">
          <span>
            Entregas: <strong className="text-slate-200">{jornada.entregasRealizadas ?? 0}/{jornada.totalEntregas}</strong>
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-blue-400 translate-x-1' : 'text-slate-500'}`} />
        </div>
      )}
    </div>
  );
}
