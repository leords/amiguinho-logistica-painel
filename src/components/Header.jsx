import React, { useState } from 'react';
import { 
  Truck, 
  Calendar, 
  Key, 
  RefreshCw, 
  Database, 
  Radio, 
  CheckCircle2, 
  X,
  ExternalLink
} from 'lucide-react';

export default function Header({
  selectedDate,
  onDateChange,
  token,
  onTokenChange,
  isMockMode,
  onToggleMockMode,
  onRefresh,
  isLoading
}) {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempToken, setTempToken] = useState(token);

  const handleSaveToken = () => {
    onTokenChange(tempToken);
    setShowTokenModal(false);
  };

  const handleClearToken = () => {
    setTempToken('');
    onTokenChange('');
  };

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 sticky top-0 z-40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Marca Amigão */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-400 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950 font-black flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base md:text-lg">
                  DISTRIBUIDORA AMIGÃO
                </span>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  LOGÍSTICA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Painel Operacional de Telemetria e Monitoramento de Frotas
              </p>
            </div>
          </div>

          {/* Controles: Data, Token, Mock/API, Atualizar */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Seletor de Data */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 focus-within:border-blue-500 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer focus:text-white"
                title="Filtrar jornadas pela data"
              />
            </div>

            {/* Alternador API Real / Dados Mock */}
            <button
              onClick={onToggleMockMode}
              type="button"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                isMockMode
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
              }`}
              title={isMockMode ? "Utilizando dados simulados de teste. Clique para conectar na API." : "Conectado na API Real. Clique para alternar para modo simulado."}
            >
              {isMockMode ? (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Simulado</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>API Real</span>
                </>
              )}
            </button>

            {/* Botão de Configuração de JWT */}
            <button
              onClick={() => {
                setTempToken(token);
                setShowTokenModal(true);
              }}
              type="button"
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                token
                  ? 'bg-blue-950/60 border-blue-600/50 text-blue-300 hover:bg-blue-900/50'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
              }`}
              title="Configurar Bearer Token JWT para requisições"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {token ? 'Token JWT Ativo' : 'Configurar JWT'}
              </span>
              {token && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
            </button>

            {/* Botão de Atualizar */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              type="button"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/60 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-blue-600/30 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

          </div>
        </div>
      </header>

      {/* Modal para configurar o Token JWT */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-100 text-base">
                  Token de Autenticação JWT
                </h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-300">
                Cole o token Bearer JWT retornado pelo endpoint de autenticação. Ele será salvo localmente no seu navegador (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 font-mono">localStorage</code>) e injetado automaticamente em todas as requisições para a API.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Valor do Token (Bearer)
                </label>
                <textarea
                  rows={4}
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Endpoint da API configurado: <strong className="text-slate-300">{import.meta.env.VITE_API_URL || 'http://localhost:3000'}</strong></span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={handleClearToken}
                type="button"
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-950/40 transition-colors"
              >
                Remover Token
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTokenModal(false)}
                  type="button"
                  className="text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveToken}
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold shadow-md shadow-blue-600/30 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Salvar Token
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
