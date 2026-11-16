## Funcionalidades Principais

* **Live Tracking & Radar 15s**: Acompanhamento em tempo real das rotas e caminhões em trânsito com sincronização periódica e indicador de status da frota.
* **Traçado Inteligente em Vias (OSRM Map Matching)**: Ajuste das coordenadas brutas de GPS à malha viária oficial das ruas, eliminando retas artificiais e desvios irreais.
* **Cálculo de Distância Aferida**: Aferição dinâmica da distância percorrida pelas vias com filtro anti-ruído para paradas prolongadas e oscilações naturais de GPS.
* **Monitor de Velocidade & Picos**: Registro da velocidade média em deslocamento e detecção contínua dos picos máximos de velocidade atingidos durante a jornada.
* **Mapa Interativo (Leaflet & OpenStreetMap)**:
  * Inicialização e centralização automática em Canoinhas - SC.
  * Enquadramento dinâmico (`fitBounds`) com zoom suave ao selecionar qualquer carga da lista.
  * Foco pontual com animação de aproximação (`flyTo`) e abertura automática de popups ao clicar em pedidos específicos.
  * Camada de auditoria para inspeção e depuração de pontos brutos de GPS coletados pelo dispositivo.
* **Gestão de Cargas & Entregas**:
  * Progresso percentual da carga e contagem de pedidos entregues versus pendentes.
  * Marcadores visuais diferenciados para início de rota, posição atual do veículo, entregas concluídas e clientes ausentes.
  * Seleção sob demanda: lista lateral de fácil navegação com busca rápida e sem seleção forçada ao carregar o painel.

---

## Stack Tecnológica

* **Core**: React 18, Vite (JavaScript ES Modules)
* **Estilização**: Tailwind CSS com tema corporativo Amigão Express
* **Mapas & Geoprocessamento**: Leaflet 1.9, React-Leaflet 4.2, OpenStreetMap
* **Roteamento & Map Matching**: OSRM (Open Source Routing Machine) API
* **Ícones**: Lucide React
* **Cliente HTTP**: Axios (com interceptor de Bearer Token JWT)
