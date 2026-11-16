import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
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
      <header className="bg-white border-b border-[#eaecef] px-4 lg:px-6 py-2.5 shrink-0 z-40 shadow-xs faixaBordaTopo">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Identidade Visual Amiguinho Express */}
          <div className="flex items-center gap-3.5">
            {/* Logo Oficial Amiguinho Express */}
            <div className="flex items-center justify-center shrink-0">
              <img 
                src={logoImg} 
                alt="Amiguinho Express" 
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105" 
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-black text-[#1a1f2e] tracking-tight leading-none flex items-center gap-1.5">
                  <span>Amiguinho</span>
                  <span className="text-[#e50914] uppercase tracking-normal">Express</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f3f5] text-[#495057] border border-[#dee2e6] uppercase tracking-wider">
                  Logística
                </span>
              </div>
              <p className="text-xs text-[#868e96] font-medium mt-1 leading-tight">
                Painel Operacional de Telemetria e Rastreamento em Tempo Real
              </p>
            </div>
          </div>

          {/* Controles de Topo: Filtro por Data, Modo Mock, Token JWT e Atualização */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Seletor de Data */}
            <div className="h-9 flex items-center bg-[#f8f9fa] border border-[#dee2e6] rounded-[8px] px-3 focus-within:bg-white focus-within:border-[#e50914] focus-within:ring-2 focus-within:ring-[#e50914]/15 transition-all">
              <Calendar className="w-3.5 h-3.5 text-[#868e96] mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#1a1f2e] outline-none cursor-pointer"
                title="Filtrar rotas pela data"
              />
            </div>

            {/* Alternador API Real / Modo Simulado */}
            <button
              onClick={onToggleMockMode}
              type="button"
              className={`h-9 px-3 rounded-[8px] border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isMockMode 
                  ? 'bg-[#f8f9fa] text-[#495057] border-[#dee2e6] hover:bg-[#e9ecef]' 
                  : 'bg-[#f8f9fa] text-[#2b8a3e] border-[#dee2e6] hover:bg-[#e9ecef]'
              }`}
              title={isMockMode ? "Modo Simulado ativo. Clique para conectar na API Real." : "Conectado na API Real. Clique para alternar para modo simulado."}
            >
              {isMockMode ? (
                <>
                  <Database className="w-3.5 h-3.5 text-[#868e96]" />
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
              className={`h-9 px-3 rounded-[8px] border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                token
                  ? 'bg-[#f8f9fa] border-[#dee2e6] text-[#1a1f2e] hover:bg-[#e9ecef]'
                  : 'bg-[#f8f9fa] border-[#dee2e6] text-[#6c757d] hover:bg-[#e9ecef]'
              }`}
              title="Configurar Bearer Token JWT para requisições"
            >
              <Key className="w-3.5 h-3.5 text-[#868e96]" />
              <span className="hidden sm:inline">
                {token ? 'JWT Configurado' : 'Configurar JWT'}
              </span>
              {token && <span className="w-1.5 h-1.5 rounded-full bg-[#2f9e44]"></span>}
            </button>

            {/* Botão de Atualizar */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              type="button"
              className="h-9 px-3.5 rounded-[8px] text-white text-xs font-bold bg-[#e50914] hover:bg-[#c90812] shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
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
                <img src={logoImg} alt="Amiguinho Express" className="w-8 h-8 object-contain" />
                <div>
                  <h3 className="font-bold text-[#1a1f2e] text-base leading-tight">
                    Token de Autenticação JWT
                  </h3>
                  <p className="text-[11px] text-[#868e96]">
                    Amiguinho Express • Segurança da API
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
