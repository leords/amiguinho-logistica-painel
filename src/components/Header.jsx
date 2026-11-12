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
  ExternalLink,
  ArrowLeft,
  Navigation
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
      <header className="bg-white border-b border-[#eaecef] px-4 lg:px-6 py-3 shrink-0 z-40 shadow-sm faixaBordaTopo">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Identidade Visual Amigão - Seção Cargas & Logística */}
          <div className="flex items-center gap-3">
            {/* Botão Voltar Padrão */}
            <button
              type="button"
              className="botaoVoltar"
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.reload()}
              title="Voltar para a tela anterior"
            >
              <ArrowLeft className="w-4 h-4 text-[#495057]" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            {/* Ícone com Gradiente Oficial de Cargas/Transporte */}
            <div className="gradienteCargas p-2.5 rounded-[10px] shadow-sm text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-wider text-[#7048e8] uppercase">
                  MÓDULO DE CARGAS & LOGÍSTICA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff3e0] text-[#ff8c00] border border-[#ffd699]">
                  AMIGÃO
                </span>
              </div>
              <h1 className="text-base md:text-lg font-extrabold text-[#1a1f2e] tracking-tight leading-tight">
                Painel Operacional de Telemetria e Rotas
              </h1>
            </div>
          </div>

          {/* Controles de Topo: Filtro por Data, Modo Mock, Token JWT e Atualização */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Seletor de Data */}
            <div className="flex items-center bg-white border-[1.5px] border-[#dee2e6] rounded-[8px] px-3 py-1.5 focus-within:border-[#ff8c00] focus-within:ring-2 focus-within:ring-[#ff8c00]/15 transition-all">
              <Calendar className="w-4 h-4 text-[#868e96] mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1a1f2e] outline-none cursor-pointer"
                title="Filtrar rotas pela data"
              />
            </div>

            {/* Alternador API Real / Modo Simulado */}
            <button
              onClick={onToggleMockMode}
              type="button"
              className={`transition-all cursor-pointer ${isMockMode ? 'badgeAlerta' : 'badgeSucesso'}`}
              title={isMockMode ? "Modo Simulado ativo. Clique para conectar na API Real." : "Conectado na API Real. Clique para alternar para modo simulado."}
            >
              {isMockMode ? (
                <>
                  <Database className="w-3.5 h-3.5 text-[#e67700]" />
                  <span>Modo Simulado</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#2f9e44] animate-pulse"></span>
                  <span>API Real</span>
                </>
              )}
            </button>

            {/* Configuração de JWT */}
            <button
              onClick={() => {
                setTempToken(token);
                setShowTokenModal(true);
              }}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] border text-xs font-bold transition-all ${
                token
                  ? 'bg-[#e7f5ff] border-[#a5d8ff] text-[#1971c2] hover:bg-[#d0ebff]'
                  : 'bg-white border-[#dee2e6] text-[#495057] hover:bg-[#f8f9fa] hover:border-[#ced4da]'
              }`}
              title="Configurar Bearer Token JWT para requisições"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {token ? 'JWT Configurado' : 'Configurar JWT'}
              </span>
              {token && <span className="w-1.5 h-1.5 rounded-full bg-[#1971c2]"></span>}
            </button>

            {/* Botão de Atualizar com Gradiente Oficial Amigão */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-white text-xs font-bold gradienteMarca shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-bold">Atualizar</span>
            </button>

          </div>
        </div>
      </header>

      {/* Modal JWT - Design System Amigão (Light) */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-[#1a1f2e]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#eaecef] w-full max-w-md rounded-[14px] p-6 shadow-md relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-[#eaecef]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#e7f5ff] text-[#1971c2] rounded-[8px]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1f2e] text-base leading-tight">
                    Token de Autenticação JWT
                  </h3>
                  <p className="text-[11px] text-[#868e96]">
                    Distribuidora Amigão • Segurança da API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-[#868e96] hover:text-[#1a1f2e] p-1.5 rounded-[8px] hover:bg-[#f8f9fa] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <p className="text-xs text-[#495057] leading-relaxed">
                Insira o token <code className="bg-[#f8f9fa] border border-[#dee2e6] px-1.5 py-0.5 rounded text-[#ff8c00] font-mono text-[11px]">Bearer JWT</code>. Ele é salvo com segurança no seu navegador (<code className="bg-[#f8f9fa] border border-[#dee2e6] px-1.5 py-0.5 rounded text-[#1971c2] font-mono text-[11px]">localStorage</code>) e enviado nos cabeçalhos de autorização da telemetria.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#495057] mb-1.5">
                  Valor do Token
                </label>
                <textarea
                  rows={4}
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] p-3 text-xs font-mono text-[#1a1f2e] placeholder-[#868e96] focus:bg-white focus:outline-none focus:border-[#ff8c00] focus:ring-2 focus:ring-[#ff8c00]/15 transition-all resize-none"
                />
              </div>

              <div className="text-[11px] text-[#495057] flex items-center gap-2 bg-[#f8f9fa] p-2.5 rounded-[8px] border border-[#eaecef]">
                <ExternalLink className="w-3.5 h-3.5 text-[#1971c2] shrink-0" />
                <span>API de Logística: <strong className="text-[#1a1f2e] font-mono">{import.meta.env.VITE_API_URL || 'http://localhost:3334'}</strong></span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[#eaecef]">
              <button
                onClick={handleClearToken}
                type="button"
                className="text-xs font-bold text-[#c92a2a] hover:bg-[#fff5f5] px-3 py-2 rounded-[8px] transition-colors"
              >
                Limpar Token
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTokenModal(false)}
                  type="button"
                  className="botaoVoltar !py-2 !px-3.5 !text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveToken}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs text-white gradienteSucesso px-4 py-2 rounded-[8px] font-bold shadow-sm hover:opacity-95 transition-all"
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
