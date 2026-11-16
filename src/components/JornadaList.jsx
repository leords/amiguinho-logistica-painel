import React, { useState, useMemo } from 'react';
import JornadaCard from './JornadaCard';
import logoImg from '../assets/logo.png';
import { Route, Search, AlertCircle, RefreshCw, Sparkles, Filter, Truck, X, Eye } from 'lucide-react';

export default function JornadaList({
  jornadas,
  selectedJornada,
  onSelectJornada,
  isLoading,
  error,
  onRetry,
  onSwitchToMock,
  focusedPedido,
  onSelectPedido
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('EM ANDAMENTO'); // 'EM ANDAMENTO' | 'FINALIZADA' | 'TODOS'

  // Filtro por motorista, veículo ou ID e por status
  const filteredJornadas = useMemo(() => {
    return jornadas.filter((j) => {
      const term = searchTerm.toLowerCase();
      const nome = (j.usuarioNome || '').toLowerCase();
      const motorista = (j.motoristaNome || '').toLowerCase();
      const userId = (j.usuarioId || '').toLowerCase();
      const veiculo = (j.veiculoId || '').toLowerCase();
      const cargaId = String(j.cargaId || '');
      const matchesSearch = 
        nome.includes(term) || 
        motorista.includes(term) || 
        userId.includes(term) || 
        veiculo.includes(term) ||
        cargaId.includes(term);

      if (!matchesSearch) return false;

      if (statusFilter === 'EM ANDAMENTO') return j.status === 'EM ANDAMENTO' || j.status === 'EM_ANDAMENTO';
      if (statusFilter === 'FINALIZADA') return j.status === 'FINALIZADA' || j.status === 'CONCLUIDA';
      return true;
    });
  }, [jornadas, searchTerm, statusFilter]);

  const emAndamentoCount = jornadas.filter((j) => j.status === 'EM ANDAMENTO' || j.status === 'EM_ANDAMENTO').length;
  const finalizadasCount = jornadas.filter((j) => j.status === 'FINALIZADA' || j.status === 'CONCLUIDA').length;

  return (
    <aside className="w-full lg:w-[410px] xl:w-[430px] bg-white border-r border-[#eaecef] flex flex-col h-full overflow-hidden shrink-0 shadow-xs">
      
      {/* Cabeçalho da Barra Lateral com Logo e Identidade Amiguinho Express */}
      <div className="p-4 border-b border-[#eaecef] bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Logo" 
              className="w-9 h-9 object-contain drop-shadow-xs shrink-0" 
            />
            <div>
              <h2 className="font-black text-[#1a1f2e] text-sm uppercase tracking-wide">
                Cargas & Rotas
              </h2>
              <p className="text-xs text-[#868e96] font-medium leading-tight mt-0.5">
                Monitoramento de frotas e telemetria
              </p>
            </div>
          </div>
          <span className="badgeNeutro !text-[11px] !py-0.5 !px-2.5 font-mono font-bold">
            {jornadas.length} {jornadas.length === 1 ? 'rota' : 'rotas'}
          </span>
        </div>

        {/* Input de Busca Rápida com Limpar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#868e96] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por motorista, carga ou veículo..."
            className="w-full h-10 bg-[#f8f9fa] border border-[#dee2e6] rounded-[10px] pl-9 pr-8 text-xs font-semibold text-[#1a1f2e] placeholder-[#868e96] focus:bg-white focus:outline-none focus:border-[#e50914] focus:ring-2 focus:ring-[#e50914]/15 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#868e96] hover:text-[#1a1f2e] p-1 rounded-full hover:bg-[#e9ecef]"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Rápidos de Status: Design sóbrio, limpo e profissional */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f1f3f5] rounded-[10px]">
          <button
            onClick={() => setStatusFilter('EM ANDAMENTO')}
            type="button"
            className={`h-8 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              statusFilter === 'EM ANDAMENTO'
                ? 'bg-white text-[#1a1f2e] shadow-xs'
                : 'text-[#6c757d] hover:text-[#1a1f2e]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
            <span>Em Rota</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              statusFilter === 'EM ANDAMENTO' ? 'bg-[#f8f9fa] text-[#495057] border border-[#e9ecef]' : 'text-[#868e96]'
            }`}>
              {emAndamentoCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('FINALIZADA')}
            type="button"
            className={`h-8 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              statusFilter === 'FINALIZADA'
                ? 'bg-white text-[#1a1f2e] shadow-xs'
                : 'text-[#6c757d] hover:text-[#1a1f2e]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f9e44]" />
            <span>Finalizadas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              statusFilter === 'FINALIZADA' ? 'bg-[#f8f9fa] text-[#495057] border border-[#e9ecef]' : 'text-[#868e96]'
            }`}>
              {finalizadasCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('TODOS')}
            type="button"
            className={`h-8 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              statusFilter === 'TODOS'
                ? 'bg-white text-[#1a1f2e] shadow-xs'
                : 'text-[#6c757d] hover:text-[#1a1f2e]'
            }`}
          >
            <span>Todas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              statusFilter === 'TODOS' ? 'bg-[#f8f9fa] text-[#495057] border border-[#e9ecef]' : 'text-[#868e96]'
            }`}>
              {jornadas.length}
            </span>
          </button>
        </div>

        {/* Banner de Rota em Análise Atual (Discreto e em cinza claro) */}
        {selectedJornada && (
          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-[10px] px-3 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#495057] font-semibold min-w-0">
              <Eye className="w-4 h-4 text-[#868e96] shrink-0" />
              <span className="truncate">
                No Mapa: <strong className="text-[#212529]">{selectedJornada.cargaId ? `Carga #${selectedJornada.cargaId}` : selectedJornada.veiculoId}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-white text-[#495057] font-bold px-2 py-0.5 rounded-full border border-[#dee2e6] uppercase tracking-wider shrink-0 shadow-2xs">
              Ativa 👁️
            </span>
          </div>
        )}
      </div>

      {/* Lista com Rolagem */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa]">
        
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-[14px] border border-[#eaecef] bg-white animate-pulse space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-[#dee2e6] rounded w-1/2"></div>
                  <div className="h-4 bg-[#dee2e6] rounded w-1/4"></div>
                </div>
                <div className="h-3 bg-[#e9ecef] rounded w-3/4"></div>
                <div className="h-3 bg-[#e9ecef] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Estado de Erro de Conexão */}
        {!isLoading && error && (
          <div className="p-4 rounded-[14px] bg-[#fff5f5] border border-[#ffc9c9] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#ffe3e3] text-[#c92a2a] flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#c92a2a]">Erro ao Conectar na API</h4>
              <p className="text-[11px] text-[#495057] mt-1 leading-relaxed">{error}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={onRetry}
                type="button"
                className="inline-flex items-center justify-center gap-1.5 bg-[#c92a2a] hover:bg-[#b02525] text-white text-xs py-2 px-3.5 rounded-[8px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Novamente
              </button>
              {onSwitchToMock && (
                <button
                  onClick={onSwitchToMock}
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-[#ff8c00] text-xs py-2 px-3.5 rounded-[8px] font-bold border border-[#ffd699] hover:bg-[#fff3e0] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ff8c00]" />
                  Carregar Dados de Demonstração
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista de Jornadas Renderizadas */}
        {!isLoading && !error && filteredJornadas.length > 0 && (
          filteredJornadas.map((jornada) => (
            <JornadaCard
              key={jornada.id}
              jornada={jornada}
              isSelected={selectedJornada?.id === jornada.id}
              hasAnySelected={Boolean(selectedJornada?.id)}
              onSelect={onSelectJornada}
              focusedPedido={focusedPedido}
              onSelectPedido={(pedido) => onSelectPedido && onSelectPedido(jornada, pedido)}
            />
          ))
        )}

        {/* Estado Vazio de Busca */}
        {!isLoading && !error && filteredJornadas.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e7f5ff] text-[#1971c2] flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-[#1a1f2e]">
              {statusFilter === 'EM ANDAMENTO' ? 'Nenhuma rota em andamento' : 'Nenhuma rota localizada'}
            </h4>
            <p className="text-[11px] text-[#868e96] mt-1">
              {searchTerm 
                ? 'Tente ajustar os termos da busca.' 
                : statusFilter === 'EM ANDAMENTO'
                ? 'Não há caminhões em trânsito no momento.'
                : statusFilter === 'FINALIZADA'
                ? 'Não há jornadas finalizadas nesta data.'
                : 'Não há registros de jornadas para esta data.'}
            </p>
            {statusFilter === 'EM ANDAMENTO' && finalizadasCount > 0 && !searchTerm && (
              <button
                type="button"
                onClick={() => setStatusFilter('FINALIZADA')}
                className="mt-3 text-xs font-bold text-[#1971c2] hover:text-[#1864ab] inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                Ver {finalizadasCount} {finalizadasCount === 1 ? 'rota finalizada' : 'rotas finalizadas'} &rarr;
              </button>
            )}
          </div>
        )}

      </div>

    </aside>
  );
}
