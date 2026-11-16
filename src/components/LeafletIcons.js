import L from 'leaflet';

// Correção dos ícones padrão do Leaflet no empacotador Vite / React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Cores Oficiais Amiguinho Express:
 * --brand-red: #e50914 (Vermelho do novo Logo)
 * --orange:    #ff8c00 / #ff5d00 (Destaques)
 * --green:     #2f9e44 (Sucesso / Concluído)
 * --gray-dark: #1a1f2e (Base neutra)
 */

// Marcador de Partida (Verde Sucesso Amiguinho Express: #2f9e44)
export const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; background: #2f9e44; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(47, 158, 68, 0.45);"></div>
        <svg style="position: relative; z-index: 2; width: 14px; height: 14px; color: #ffffff; margin-bottom: 3px;" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

// Marcador de Ponto Final ou Posição Atual do Veículo
export const createEndIcon = (isEmAndamento = false) => {
  // Se estiver em andamento usa o Vermelho Oficial Amiguinho Express (#e50914) com pulso radar, senão o Tom Finalizador Escuro (#343a40)
  const bgColor = isEmAndamento ? '#e50914' : '#343a40';
  const pulseClass = isEmAndamento ? 'marker-pulse-active' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="${pulseClass}" style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
        <div style="position: absolute; width: 32px; height: 32px; background: ${bgColor}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.25);"></div>
        <svg style="position: relative; z-index: 2; width: 15px; height: 15px; color: #ffffff; margin-bottom: 3px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${isEmAndamento 
            ? '<rect width="16" height="12" x="1" y="6" rx="2"></rect><circle cx="5.5" cy="18" r="2.5"></circle><circle cx="12.5" cy="18" r="2.5"></circle><path d="M17 14h4l3 4v4h-7"></path>'
            : '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>'}
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

// Marcador de Evento (Entregas Realizadas, Clientes Ausentes, Devoluções)
export const createEventIcon = (tipoEvento = '', isFocused = false) => {
  const tipoUpper = (tipoEvento || '').toUpperCase();

  let bgColor = '#1971c2'; // Gestão / Corporativo (#1971c2)
  let iconSvg = `
    <rect width="18" height="14" x="3" y="5" rx="2"></rect>
    <polyline points="3 7 12 13 21 7"></polyline>
  `;

  if (tipoUpper.includes('REALIZADA') || tipoUpper.includes('SUCESSO') || tipoUpper.includes('CONCLUIDA') || tipoUpper.includes('BAIXA') || tipoUpper.includes('ENTREGA')) {
    bgColor = '#2f9e44'; // Sucesso (Verde #2f9e44)
    iconSvg = '<polyline points="20 6 9 17 4 12"></polyline>';
  } else if (tipoUpper.includes('AUSENTE') || tipoUpper.includes('CLIENTE_AUSENTE') || tipoUpper.includes('FECHADO')) {
    bgColor = '#e67700'; // Atenção (Amarelo/Âmbar #e67700)
    iconSvg = `
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    `;
  } else if (tipoUpper.includes('RECUS') || tipoUpper.includes('CANCEL') || tipoUpper.includes('FALHA') || tipoUpper.includes('DEVOLVIDO')) {
    bgColor = '#c92a2a'; // Erro / Perigo (Vermelho #c92a2a)
    iconSvg = `
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    `;
  }

  const outerSize = isFocused ? 36 : 28;
  const innerSize = isFocused ? 32 : 26;
  const pulseClass = isFocused ? 'marker-pulse-active' : '';
  const borderAndShadow = isFocused
    ? 'border: 3px solid #ff8c00; box-shadow: 0 0 0 4px rgba(255, 140, 0, 0.45), 0 4px 12px rgba(0,0,0,0.3);'
    : 'border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.2);';

  return L.divIcon({
    className: 'custom-leaflet-event-marker',
    html: `
      <div class="${pulseClass}" style="position: relative; width: ${outerSize}px; height: ${outerSize}px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: ${innerSize}px; height: ${innerSize}px; background: ${bgColor}; border-radius: 50%; ${borderAndShadow}"></div>
        <svg style="position: relative; z-index: 2; width: ${isFocused ? 16 : 13}px; height: ${isFocused ? 16 : 13}px; color: #ffffff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvg}
        </svg>
      </div>
    `,
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    popupAnchor: [0, -outerSize / 2],
  });
};
