import React, { useState } from 'react';
import JornadaCard from './JornadaCard';
import { Route, Search, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

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

  // Filtro por entregador ou veículo
  const filteredJornadas = jornadas.filter((j) => {
    const term = searchTerm.toLowerCase();
    const nome = (j.usuarioNome || '').toLowerCase();
    const userId = (j.usuarioId || '').toLowerCase();
    const veiculo = (j.veiculoId || '').toLowerCase();
    return nome.includes(term) || userId.includes(term) || veiculo.includes(term);
  });

  return (
    <aside className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-65px)] overflow-hidden shrink-0">
      
      {/* Cabeçalho da Sidebar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-slate-100 text-sm tracking-wide">
              JORNADAS DE HOJE
            </h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {jornadas.length} {jornadas.length === 1 ? 'rota' : 'rotas'}
          </span>
        </div>

        {/* Input de Busca Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por entregador ou placa..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Conteúdo da Lista com Scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 animate-pulse space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                </div>
                <div className="h-3 bg-slate-700/60 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700/40 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Estado de Erro de Conexão */}
        {!isLoading && error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div>
              <h4 className="text-sm font-semibold text-rose-300">Erro ao carregar jornadas</h4>
              <p className="text-xs text-rose-400/80 mt-1">{error}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={onRetry}
                className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Novamente
              </button>
              {onSwitchToMock && (
                <button
                  onClick={onSwitchToMock}
                  className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs py-2 px-3 rounded-lg font-medium border border-amber-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Ver Dados Simulados Amigão
                </button>
              )}
            </div>
          </div>
        )}

        {/* Estado Vazio (sem jornadas para a data ou busca) */}
        {!isLoading && !error && filteredJornadas.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
            <Route className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">Nenhuma jornada encontrada</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              {searchTerm 
                ? 'Nenhum resultado corresponde ao termo pesquisado.' 
                : 'Não há viagens registradas nesta data. Altere a data no topo ou verifique a API.'}
            </p>
          </div>
        )}

        {/* Lista de Cards */}
        {!isLoading && !error && filteredJornadas.map((jornada) => (
          <JornadaCard
            key={jornada.id}
            jornada={jornada}
            isSelected={selectedJornada?.id === jornada.id}
            onSelect={onSelectJornada}
          />
        ))}

      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Sistema de Telemetria v1.0</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Operacional
        </span>
      </div>

    </aside>
  );
}
