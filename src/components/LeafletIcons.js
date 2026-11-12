import L from 'leaflet';

// 1. Correção clássica do bug de ícones padrão do Leaflet no empacotador Vite / React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Cria marcadores vetoriais (L.divIcon) altamente estilizados e sem dependência
 * de assets externos, eliminando 100% de erros 404 e problemas de renderização.
 */

// Marcador de Ponto de Partida (Verde)
export const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; background: #16a34a; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4);"></div>
        <svg style="position: relative; z-index: 2; width: 16px; height: 16px; color: white; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Marcador de Ponto Final (Vermelho / Finalizada ou Caminhão Ativo)
export const createEndIcon = (isEmAndamento = false) => {
  const bgColor = isEmAndamento ? '#0284c7' : '#dc2626';
  const pulseClass = isEmAndamento ? 'marker-pulse-active' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="${pulseClass}" style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
        <div style="position: absolute; width: 34px; height: 34px; background: ${bgColor}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4);"></div>
        <svg style="position: relative; z-index: 2; width: 16px; height: 16px; color: white; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${isEmAndamento 
            ? '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path>'
            : '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>'}
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Marcador de Evento (Entregas Realizadas, Clientes Ausentes, etc.)
export const createEventIcon = (tipoEvento = '') => {
  const tipoUpper = (tipoEvento || '').toUpperCase();

  let bgColor = '#2563eb'; // Padrão Azul
  let iconSvg = `
    <path d="m7.5 4.27 9 5.15"></path>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
    <path d="m3.3 7 8.7 5 8.7-5"></path>
    <path d="M12 22V12"></path>
  `; // Pacote

  if (tipoUpper.includes('REALIZADA') || tipoUpper.includes('SUCESSO') || tipoUpper.includes('CONCLUIDA')) {
    bgColor = '#0284c7'; // Azul ciano / royal amigão
    iconSvg = '<polyline points="20 6 9 17 4 12"></polyline>'; // Check
  } else if (tipoUpper.includes('AUSENTE') || tipoUpper.includes('CLIENTE_AUSENTE')) {
    bgColor = '#ea580c'; // Laranja de atenção
    iconSvg = `
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <line x1="17" y1="8" x2="23" y2="14"></line>
      <line x1="23" y1="8" x2="17" y2="14"></line>
    `; // User-X
  } else if (tipoUpper.includes('RECUS') || tipoUpper.includes('CANCEL') || tipoUpper.includes('FALHA')) {
    bgColor = '#e11d48'; // Vermelho rosa
    iconSvg = `
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    `;
  }

  return L.divIcon({
    className: 'custom-leaflet-event-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; background: ${bgColor}; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.45);"></div>
        <svg style="position: relative; z-index: 2; width: 14px; height: 14px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvg}
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};
