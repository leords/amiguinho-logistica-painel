import React, { useState, useMemo } from 'react';
import JornadaCard from './JornadaCard';
import { Route, Search, AlertCircle, RefreshCw, Sparkles, Filter, Truck } from 'lucide-react';

export default function JornadaList({
  jornadas,
  selectedJornada,
  onSelectJornada,
  isLoading,
  error,
  onRetry,
  onSwitchToMock
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS'); // 'TODOS' | 'EM ANDAMENTO' | 'FINALIZADA'

  // Filtro por entregador ou veículo e por status
  const filteredJornadas = useMemo(() => {
    return jornadas.filter((j) => {
      const term = searchTerm.toLowerCase();
      const nome = (j.usuarioNome || '').toLowerCase();
      const userId = (j.usuarioId || '').toLowerCase();
      const veiculo = (j.veiculoId || '').toLowerCase();
      const matchesSearch = nome.includes(term) || userId.includes(term) || veiculo.includes(term);

      if (!matchesSearch) return false;

      if (statusFilter === 'EM ANDAMENTO') return j.status === 'EM ANDAMENTO' || j.status === 'EM_ANDAMENTO';
      if (statusFilter === 'FINALIZADA') return j.status === 'FINALIZADA' || j.status === 'CONCLUIDA';
      return true;
    });
  }, [jornadas, searchTerm, statusFilter]);

  const emAndamentoCount = jornadas.filter((j) => j.status === 'EM ANDAMENTO' || j.status === 'EM_ANDAMENTO').length;
  const finalizadasCount = jornadas.filter((j) => j.status === 'FINALIZADA' || j.status === 'CONCLUIDA').length;

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-[#eaecef] flex flex-col h-full overflow-hidden shrink-0 shadow-xs">
      
      {/* Cabeçalho da Barra Lateral */}
      <div className="p-4 border-b border-[#eaecef] bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#f3f0ff] text-[#7048e8]">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#1a1f2e] text-xs uppercase tracking-wide">
                Jornadas Operacionais
              </h2>
              <p className="text-[11px] text-[#868e96]">
                Entregadores e frotas ativas
              </p>
            </div>
          </div>
          <span className="badgeNeutro !text-[11px]">
            {jornadas.length} {jornadas.length === 1 ? 'rota' : 'rotas'}
          </span>
        </div>

        {/* Input de Busca Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#868e96] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por entregador, ID ou placa..."
            className="w-full bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] pl-9 pr-3 py-1.5 text-xs font-medium text-[#1a1f2e] placeholder-[#868e96] focus:bg-white focus:outline-none focus:border-[#ff8c00] focus:ring-2 focus:ring-[#ff8c00]/15 transition-all"
          />
        </div>

        {/* Filtros Rápidos de Status */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setStatusFilter('TODOS')}
            type="button"
            className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
              statusFilter === 'TODOS'
                ? 'bg-[#1a1f2e] text-white shadow-xs'
                : 'bg-[#f8f9fa] text-[#495057] hover:bg-[#dee2e6]'
            }`}
          >
            Todas ({jornadas.length})
          </button>
          <button
            onClick={() => setStatusFilter('EM ANDAMENTO')}
            type="button"
            className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
              statusFilter === 'EM ANDAMENTO'
                ? 'bg-[#e67700] text-white shadow-xs'
                : 'bg-[#fff9db] text-[#e67700] border border-[#ffe066] hover:opacity-90'
            }`}
          >
            Em Rota ({emAndamentoCount})
          </button>
          <button
            onClick={() => setStatusFilter('FINALIZADA')}
            type="button"
            className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer ${
              statusFilter === 'FINALIZADA'
                ? 'bg-[#2f9e44] text-white shadow-xs'
                : 'bg-[#ebfbee] text-[#2f9e44] border border-[#8ce99a] hover:opacity-90'
            }`}
          >
            Finalizadas ({finalizadasCount})
          </button>
        </div>
      </div>

      {/* Lista com Rolagem */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#f8f9fa]">
        
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
              onSelect={onSelectJornada}
            />
          ))
        )}

        {/* Estado Vazio de Busca */}
        {!isLoading && !error && filteredJornadas.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e7f5ff] text-[#1971c2] flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-[#1a1f2e]">Nenhuma rota localizada</h4>
            <p className="text-[11px] text-[#868e96] mt-1">
              {searchTerm 
                ? 'Tente ajustar os termos da busca.' 
                : 'Não há registros de jornadas para esta data.'}
            </p>
          </div>
        )}

      </div>

    </aside>
  );
}
