import React from 'react';
import { User, Truck, Clock, Navigation, CheckCircle, ChevronRight, PackageCheck } from 'lucide-react';

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
      className={`group relative p-3.5 rounded-[14px] border-[1.5px] transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-[#fffbf5] border-[#ff8c00] shadow-sm'
          : 'bg-white border-[#eaecef] hover:border-[#ffd699] hover:shadow-xs'
      }`}
    >
      {/* Indicador lateral laranja quando selecionado */}
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#ff8c00] rounded-r-md"></div>
      )}

      {/* Topo do Card: Entregador e Status Badge Semântica */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-[8px] transition-colors ${
            isSelected 
              ? 'bg-[#fff3e0] text-[#ff8c00]' 
              : 'bg-[#f8f9fa] text-[#495057] group-hover:bg-[#fff3e0] group-hover:text-[#ff8c00]'
          }`}>
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#1a1f2e] leading-snug group-hover:text-[#ff8c00] transition-colors">
              {jornada.usuarioNome || `Entregador #${jornada.usuarioId}`}
            </h4>
            <span className="text-[10px] text-[#868e96] font-mono">
              ID: {jornada.usuarioId}
            </span>
          </div>
        </div>

        {/* Badge Semântica Conforme Padrão Amigão */}
        {isEmAndamento ? (
          <span className="badgeAlerta !text-[10px] !py-0.5 !px-2">
            <span className="w-2 h-2 rounded-full bg-[#e67700] animate-pulse"></span>
            EM ANDAMENTO
          </span>
        ) : (
          <span className="badgeSucesso !text-[10px] !py-0.5 !px-2">
            <CheckCircle className="w-3 h-3 text-[#2f9e44]" />
            FINALIZADA
          </span>
        )}
      </div>

      {/* Informações Centrais: Veículo, Horários e Distância */}
      <div className="space-y-1.5 text-xs border-t border-[#eaecef] pt-2.5 mt-2">
        
        {/* Veículo / Caminhão com Tag de Logística */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#495057]">
            <Truck className="w-3.5 h-3.5 text-[#7048e8] shrink-0" />
            <span className="font-bold text-[#1a1f2e]">{jornada.veiculoId}</span>
          </div>
          <span className="badgeNeutro !text-[10px] !py-0 !px-1.5 !font-mono">
            {(jornada.distanciaTotalKm ?? 0).toFixed(1)} km
          </span>
        </div>

        {/* Linha do Tempo de Horário */}
        <div className="flex items-center justify-between text-[#868e96] text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#868e96] shrink-0" />
            <span>
              {horaInicio} &rarr; <strong className={isEmAndamento ? 'text-[#e67700]' : 'text-[#495057]'}>{horaFim}</strong>
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#ff8c00] translate-x-1' : 'text-[#868e96]'}`} />
        </div>

      </div>

      {/* Rodapé com contagem de entregas se houver */}
      {jornada.totalEntregas !== undefined && (
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#eaecef] text-[11px] text-[#495057]">
          <span className="flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5 text-[#2f9e44]" />
            <span>Entregas Concluídas:</span>
          </span>
          <span className="font-extrabold text-[#1a1f2e]">
            {jornada.entregasRealizadas ?? 0}/{jornada.totalEntregas}
          </span>
        </div>
      )}
    </div>
  );
}
