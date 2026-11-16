import React, { useState, useEffect } from 'react';
import { 
  User, 
  Truck, 
  Clock, 
  Navigation, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  PackageCheck,
  MapPin,
  Eye,
  Check
} from 'lucide-react';

export default function JornadaCard({ 
  jornada, 
  isSelected, 
  hasAnySelected,
  onSelect,
  focusedPedido,
  onSelectPedido
}) {
  const [expandido, setExpandido] = useState(isSelected);
  const isEmAndamento = jornada.status === 'EM ANDAMENTO' || jornada.status === 'EM_ANDAMENTO';

  // Abre os pedidos automaticamente quando a jornada for selecionada
  useEffect(() => {
    if (isSelected) {
      setExpandido(true);
    }
  }, [isSelected]);

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
  const horaFim = jornada.dataFim ? formatTime(jornada.dataFim) : 'Em trânsito';

  // 1. Nome do motorista e carga
  const nomeMotorista = jornada.motoristaNome || jornada.motorista?.nome || jornada.usuarioNome || `Motorista #${jornada.usuarioId}`;
  const labelCarga = jornada.cargaId ? `CARGA #${jornada.cargaId}` : `ROTA #${String(jornada.id).slice(0, 8)}`;

  // 2. Indicadores de entregas e percentual
  const pedidos = jornada.pedidos || [];
  const totalPedidos = jornada.totalPedidos ?? (pedidos.length > 0 ? pedidos.length : (jornada.totalEntregas ?? 0));
  const entregues = jornada.entregasRealizadas ?? pedidos.filter((p) => p.entregue).length;
  const percentual = totalPedidos > 0 
    ? Math.round((entregues / totalPedidos) * 100) 
    : (entregues > 0 ? 100 : 0);

  return (
    <div
      onClick={() => onSelect(jornada)}
      className={`group relative p-3.5 rounded-[14px] border-[1.5px] transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-white border-[#ff8c00] shadow-sm opacity-100 z-10'
          : hasAnySelected
          ? 'bg-white border-[#dee2e6] opacity-60 hover:opacity-100 hover:border-[#ffd8a8] hover:shadow-xs'
          : 'bg-white border-[#dee2e6] hover:border-[#ffd8a8] hover:shadow-xs opacity-100'
      }`}
    >
      {/* Faixa Superior de Destaque Laranja Suave: Indica claramente que esta rota está ativa no mapa */}
      {isSelected ? (
        <div className="bg-[#fff4e6] border-b border-[#ffd8a8] px-3.5 py-1.5 -mx-3.5 -mt-3.5 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-black text-[#e8590c] uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff8c00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff8c00]"></span>
            </span>
            <span>Rota em Análise no Mapa</span>
          </span>
          <span className="text-[10px] font-black text-[#d9480f] bg-white px-2 py-0.5 rounded-full border border-[#ffd8a8] shadow-xs flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#ff8c00]" />
            <span>Exibindo</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#495057] bg-[#f8f9fa] border border-[#dee2e6] px-2 py-0.5 rounded-md font-mono">
            {labelCarga}
          </span>
          <span className="text-[10px] text-[#868e96] group-hover:text-[#ff8c00] flex items-center gap-0.5 font-bold transition-colors">
            Ver rota &rarr;
          </span>
        </div>
      )}

      {/* Topo do Card: Identificador de Carga, Motorista e Status */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-[10px] transition-colors shrink-0 ${
            isSelected 
              ? 'bg-[#fff4e6] text-[#e8590c] border border-[#ffd8a8]' 
              : 'bg-[#f8f9fa] text-[#495057] group-hover:bg-[#fff4e6] group-hover:text-[#e8590c]'
          }`}>
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            {isSelected && (
              <span className="text-[10px] font-black uppercase tracking-wider text-[#e8590c] bg-[#fff4e6] border border-[#ffd8a8] px-2 py-0.2 rounded-md font-mono inline-block mb-0.5">
                {labelCarga}
              </span>
            )}
            <h4 className="text-xs sm:text-sm font-black text-[#1a1f2e] leading-snug group-hover:text-[#ff8c00] transition-colors truncate">
              {nomeMotorista}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-[11px] font-bold text-[#495057] bg-[#f8f9fa] border border-[#dee2e6] px-1.5 py-0.2 rounded flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#ff8c00]" />
                <span>{jornada.veiculoId}</span>
              </span>
              {isSelected && focusedPedido && (
                <span className="text-[9px] bg-[#fff3e0] text-[#ff8c00] font-black px-1.5 py-0.2 rounded border border-[#ffd699]">
                  📍 Pedido focado (clique p/ desfocar)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badge Semântica de Status */}
        {isEmAndamento ? (
          <span className="badgeAlerta !text-[10px] !py-0.5 !px-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#e67700] animate-pulse"></span>
            EM ANDAMENTO
          </span>
        ) : (
          <span className="badgeSucesso !text-[10px] !py-0.5 !px-2 shrink-0">
            <CheckCircle className="w-3 h-3 text-[#2f9e44]" />
            FINALIZADA
          </span>
        )}
      </div>

      {/* Indicadores Operacionais: Horários, Distância e Velocidade */}
      <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#eaecef] pt-2 mt-2 bg-[#fdfdfd] p-1.5 rounded-[8px]">
        
        {/* Linha do Tempo de Horário */}
        <div className="flex items-center gap-1.5 text-[#495057] text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#868e96] shrink-0" />
          <span className="truncate">
            {horaInicio} &rarr; <strong className={isEmAndamento ? 'text-[#e50914]' : 'text-[#495057]'}>{horaFim}</strong>
          </span>
        </div>

        {/* Distância e Velocidade */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 text-[11px]">
          {jornada.velocidadeMediaKmH && (
            <span className="text-[10px] text-[#495057] font-bold bg-[#f1f3f5] px-1.5 py-0.2 rounded border border-[#dee2e6] font-mono" title="Velocidade média em movimento">
              {jornada.velocidadeMediaKmH} km/h
            </span>
          )}
          <span className="text-[#1a1f2e] font-extrabold font-mono text-[11px]">
            {(jornada.distanciaTotalKm ?? 0).toFixed(1)} km
          </span>
        </div>

      </div>

      {/* Progresso da Carga: Percentual e Quantidade */}
      <div className="mt-2.5 pt-2 border-t border-[#eaecef] space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-[#495057] font-semibold">
            <PackageCheck className="w-3.5 h-3.5 text-[#6c757d]" />
            <span>Progresso da Carga:</span>
          </span>
          <span className="font-extrabold text-[#1a1f2e]">
            {percentual}% <span className="text-[#868e96] font-normal">({entregues} de {totalPedidos} {totalPedidos === 1 ? 'parada' : 'paradas'})</span>
          </span>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full h-1.5 bg-[#e9ecef] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentual >= 100 ? 'bg-[#2f9e44]' : 'bg-[#e50914]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }}
          />
        </div>
      </div>

      {/* Botão de Expansão de Paradas/Pedidos */}
      {(pedidos.length > 0 || totalPedidos > 0) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpandido((prev) => !prev);
          }}
          className="mt-2.5 w-full py-1.5 px-2.5 rounded-[8px] text-[11px] font-bold transition-colors flex items-center justify-between cursor-pointer text-[#495057] bg-[#f8f9fa] hover:bg-[#e9ecef] border border-[#dee2e6]"
          title="Clique para ver a lista de paradas e clientes desta carga"
        >
          <span className="flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-[#868e96]" />
            <span>{expandido ? 'Ocultar Paradas' : 'Ver Paradas da Carga'} ({pedidos.length || totalPedidos})</span>
          </span>
          {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Lista de Pedidos Expandida (Nome do Cliente - Endereço) */}
      {expandido && (
        <div className="mt-2 space-y-1.5 pt-2 border-t border-[#eaecef]/70 max-h-56 overflow-y-auto">
          {pedidos.length > 0 ? (
            pedidos.map((pedido, idx) => {
              const isPedidoFocused =
                focusedPedido &&
                ((pedido.id && String(focusedPedido.id) === String(pedido.id)) ||
                 (pedido.uuid && String(focusedPedido.uuid) === String(pedido.uuid)));

              return (
                <div
                  key={pedido.id || pedido.uuid || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPedido && onSelectPedido(pedido);
                  }}
                  className={`group/pedido p-2 rounded-[9px] text-[11px] border transition-all cursor-pointer ${
                    isPedidoFocused
                      ? 'bg-[#fff4e6] border-[#ff8c00] shadow-2xs ring-1 ring-[#ff8c00]/30'
                      : 'bg-[#f8f9fa] border-[#e9ecef] text-[#343a40] hover:bg-white hover:border-[#ced4da]'
                  }`}
                  title="Clique para localizar esta parada no mapa 📍"
                >
                  <div className="flex items-center justify-between gap-1 font-bold">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-white border border-[#dee2e6] text-[#868e96] flex items-center justify-center text-[9px] font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate group-hover/pedido:text-[#ff8c00] transition-colors">
                        {pedido.clienteNome || `Cliente #${pedido.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPedidoFocused && (
                        <span className="text-[9px] bg-[#ff8c00] text-white px-1.5 py-0.2 rounded font-black uppercase">
                          📍 Focado
                        </span>
                      )}
                      {pedido.entregue ? (
                        <span 
                          title="Entregue" 
                          className="w-4 h-4 rounded-full bg-[#ebfbee] text-[#2b8a3e] border border-[#b2f2bb] flex items-center justify-center shrink-0"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span 
                          title="Pendente" 
                          className="w-4 h-4 rounded-full bg-[#f1f3f5] text-[#adb5bd] border border-[#dee2e6] flex items-center justify-center shrink-0 text-[10px] leading-none"
                        >
                          •
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#868e96] truncate mt-0.5 pl-5">
                    📍 {pedido.endereco || 'Endereço não informado'}
                  </p>
                  <div className="mt-1 pl-5 flex items-center justify-between text-[10px]">
                    {pedido.total ? (
                      <span className="text-[#495057] font-mono font-semibold">
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                    ) : <span />}
                    <span 
                      title="Ver no mapa"
                      className="p-1 rounded text-[#868e96] group-hover/pedido:text-[#ff8c00] group-hover/pedido:bg-[#fff4e6] transition-all flex items-center justify-center"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-[#868e96] text-center py-2 text-[#868e96]">
              Nenhuma parada listada nesta carga.
            </p>
          )}
        </div>
      )}

    </div>
  );
}
