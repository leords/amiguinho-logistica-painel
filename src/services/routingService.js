// src/services/routingService.js

/**
 * Calcula a distância em metros entre duas coordenadas geográficas (Fórmula de Haversine).
 */
export function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calcula a distância acumulada em quilômetros de um traçado ou conjunto de pontos.
 * Suporta:
 * 1. Lista de segmentos de polylines OSRM: [[[lat, lng], ...], [[lat, lng], ...]]
 * 2. Linha única de pontos Leaflet: [[lat, lng], [lat, lng], ...]
 * 3. Array de objetos de telemetria bruta: [{ latitude, longitude, precisao? }, ...]
 *    (aplica filtro anti-ruído para não somar oscilações de GPS com caminhão parado)
 */
export function calcularDistanciaPolylineKm(tracadoOuPontos) {
  if (!tracadoOuPontos || !Array.isArray(tracadoOuPontos) || tracadoOuPontos.length < 2) {
    return 0;
  }

  // Caso 1: Array de segmentos OSRM [[[lat, lng], ...], [[lat, lng], ...]]
  if (Array.isArray(tracadoOuPontos[0]) && Array.isArray(tracadoOuPontos[0][0])) {
    let metrosTotal = 0;
    for (const segmento of tracadoOuPontos) {
      if (Array.isArray(segmento) && segmento.length >= 2) {
        for (let i = 0; i < segmento.length - 1; i++) {
          const p1 = segmento[i];
          const p2 = segmento[i + 1];
          if (Array.isArray(p1) && Array.isArray(p2)) {
            const [lat1, lon1] = p1;
            const [lat2, lon2] = p2;
            if (typeof lat1 === 'number' && typeof lon1 === 'number' && typeof lat2 === 'number' && typeof lon2 === 'number') {
              metrosTotal += calcularDistanciaMetros(lat1, lon1, lat2, lon2);
            }
          }
        }
      }
    }
    return Number((metrosTotal / 1000).toFixed(2));
  }

  // Caso 2: Array de objetos de telemetria [{ latitude, longitude, precisao? }, ...]
  if (typeof tracadoOuPontos[0] === 'object' && 'latitude' in tracadoOuPontos[0]) {
    const waypoints = filtrarPontosTelemetria(tracadoOuPontos, 40, 10);
    if (waypoints.length < 2) return 0;

    let metrosTotal = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const lat1 = Number(p1.latitude);
      const lon1 = Number(p1.longitude);
      const lat2 = Number(p2.latitude);
      const lon2 = Number(p2.longitude);

      if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
        metrosTotal += calcularDistanciaMetros(lat1, lon1, lat2, lon2);
      }
    }
    return Number((metrosTotal / 1000).toFixed(2));
  }

  // Caso 3: Array de pares de coordenadas Leaflet [[lat, lng], [lat, lng], ...]
  if (Array.isArray(tracadoOuPontos[0]) && typeof tracadoOuPontos[0][0] === 'number') {
    let metrosTotal = 0;
    for (let i = 0; i < tracadoOuPontos.length - 1; i++) {
      const [lat1, lon1] = tracadoOuPontos[i];
      const [lat2, lon2] = tracadoOuPontos[i + 1];
      if (typeof lat1 === 'number' && typeof lon1 === 'number' && typeof lat2 === 'number' && typeof lon2 === 'number') {
        metrosTotal += calcularDistanciaMetros(lat1, lon1, lat2, lon2);
      }
    }
    return Number((metrosTotal / 1000).toFixed(2));
  }

  return 0;
}

/**
 * Filtro rigoroso de telemetria antes de enviar ao Map Matching:
 * 1. Descarta pontos com erro de precisão excessivo (> 40m), causados por perda de satélite.
 * 2. Remove micro-oscilações quando o veículo está parado ou manobrando (< 10 metros).
 * 3. Preserva obrigatoriamente o primeiro e o último ponto da jornada.
 */
export function filtrarPontosTelemetria(coordenadas, maxAccuracy = 40, minMoveMeters = 10) {
  if (!coordenadas || coordenadas.length <= 2) return coordenadas || [];

  const filtrados = [];
  let ultimoAnchor = null;

  for (let i = 0; i < coordenadas.length; i++) {
    const atual = coordenadas[i];
    
    // Descarta pontos com precisão ruim (> 40m), exceto se for o início ou fim
    if (atual.precisao && Number(atual.precisao) > maxAccuracy && i !== 0 && i !== coordenadas.length - 1) {
      continue;
    }

    if (!ultimoAnchor) {
      filtrados.push(atual);
      ultimoAnchor = atual;
      continue;
    }

    const d = calcularDistanciaMetros(
      ultimoAnchor.latitude,
      ultimoAnchor.longitude,
      atual.latitude,
      atual.longitude
    );

    // Mantém ponto se houver deslocamento real ou se for o ponto de encerramento
    if (d >= minMoveMeters || i === coordenadas.length - 1) {
      filtrados.push(atual);
      ultimoAnchor = atual;
    }
  }

  return filtrados;
}

// Cache em memória para evitar reprocessamento de rotas idênticas
const cacheRotas = new Map();

/**
 * Envia um trecho (máximo 8 pontos) para o OSRM Map Matching (/match).
 * Envia timestamps em segundos Unix, radiuses dinâmicos baseados na precisão do GPS
 * e ativa gaps=split e tidy=true.
 * 
 * Retorna uma lista de segmentos (arrays de coordenadas [lat, lng]).
 */
async function ajustarSegmentoMatchOSRM(segmento) {
  if (!segmento || segmento.length < 2) {
    return segmento ? [segmento.map((p) => [p.latitude, p.longitude])] : [];
  }

  const coordString = segmento
    .map((w) => `${Number(w.longitude).toFixed(6)},${Number(w.latitude).toFixed(6)}`)
    .join(';');

  // Raio de busca dinâmico: min(precisao, 25m), piso de 10m para ruas estreitas
  const radiuses = segmento
    .map((p) => Math.max(10, Math.min(Math.round(p.precisao || 20), 25)))
    .join(';');

  // Timestamps Unix estritamente crescentes para que o OSRM valide a física do deslocamento
  let lastT = 0;
  const timestamps = segmento
    .map((p) => {
      let t = p.dataHora ? Math.floor(new Date(p.dataHora).getTime() / 1000) : 0;
      if (t <= lastT) t = lastT + 1;
      lastT = t;
      return t;
    })
    .join(';');

  const hasTimestamps = segmento.some((p) => p.dataHora);
  const timeParam = hasTimestamps ? `&timestamps=${timestamps}` : '';

  try {
    const matchUrl = `https://router.project-osrm.org/match/v1/driving/${coordString}?overview=full&geometries=geojson&radiuses=${radiuses}${timeParam}&gaps=split&tidy=true`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(matchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.matchings && data.matchings.length > 0) {
        const segmentosValidos = [];
        for (const m of data.matchings) {
          if (m.geometry?.coordinates?.length > 1) {
            // OSRM retorna [lng, lat], convertemos para [lat, lng] para o Leaflet
            const coordsLatLng = m.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            segmentosValidos.push(coordsLatLng);
          }
        }
        if (segmentosValidos.length > 0) {
          return segmentosValidos;
        }
      }
    }
  } catch (err) {
    // Falha de rede ou timeout
  }

  // Fallback seguro: retorna as coordenadas brutas reais em um segmento único
  return [segmento.map((p) => [p.latitude, p.longitude])];
}

/**
 * Orquestra o ajuste da rota completa às ruas da cidade:
 * 1. Filtra ruído com accuracy > 40m e oscilações de parada < 10m.
 * 2. Fatia em lotes de até 8 coordenadas (limite da API /match do OSRM).
 * 3. Envia timestamps Unix, gaps=split e radiuses adaptativos.
 * 4. Costura os trechos contínuos e preserva splits de perda de sinal.
 * 
 * Retorna uma lista de polylines (suporta gaps de sinal sem traçar linhas retas no vazio).
 */
export async function obterTracadoAjustadoAsRuas(coordenadas) {
  if (!coordenadas || coordenadas.length < 2) return null;

  // 1. Filtragem prévia
  const waypoints = filtrarPontosTelemetria(coordenadas, 40, 10);
  if (waypoints.length < 2) return null;

  // Chave de cache
  const cacheKey = `${waypoints.length}_${Number(waypoints[0].latitude).toFixed(4)},${Number(waypoints[0].longitude).toFixed(4)}_${Number(waypoints[waypoints.length - 1].latitude).toFixed(4)},${Number(waypoints[waypoints.length - 1].longitude).toFixed(4)}`;

  if (cacheRotas.has(cacheKey)) {
    return cacheRotas.get(cacheKey);
  }

  try {
    // 2. Fatiamento em lotes de 8 pontos com 1 ponto de sobreposição contínua
    const CHUNK_SIZE = 8;
    const chunks = [];

    for (let i = 0; i < waypoints.length - 1; i += CHUNK_SIZE - 1) {
      const chunk = waypoints.slice(i, i + CHUNK_SIZE);
      if (chunk.length >= 2) {
        chunks.push(chunk);
      }
    }

    // 3. Processa cada lote via OSRM /match
    const todosSegmentos = [];
    let segmentoAtual = [];

    for (let i = 0; i < chunks.length; i++) {
      const trechoSegmentos = await ajustarSegmentoMatchOSRM(chunks[i]);
      for (let sIdx = 0; sIdx < trechoSegmentos.length; sIdx++) {
        const seg = trechoSegmentos[sIdx];
        if (sIdx === 0 && segmentoAtual.length > 0) {
          // Conecta com o trecho anterior removendo o ponto duplicado de ponte
          segmentoAtual.push(...seg.slice(1));
        } else {
          // Novo segmento (gap detectado ou início de rota)
          if (segmentoAtual.length > 0) {
            todosSegmentos.push(segmentoAtual);
          }
          segmentoAtual = [...seg];
        }
      }
    }

    if (segmentoAtual.length > 0) {
      todosSegmentos.push(segmentoAtual);
    }

    if (todosSegmentos.length > 0) {
      if (cacheRotas.size >= 30) {
        const primeiraChave = cacheRotas.keys().next().value;
        cacheRotas.delete(primeiraChave);
      }
      cacheRotas.set(cacheKey, todosSegmentos);
      return todosSegmentos;
    }

    return null;
  } catch (err) {
    console.warn('[routingService] Erro ao obter traçado em vias:', err.message);
    return null;
  }
}
