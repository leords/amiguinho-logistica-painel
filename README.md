# 🚚 Distribuidora de Bebidas Amigão - Painel Operacional Logístico & Geospatial

Painel web operacional de alto desempenho para acompanhamento, rastreamento e auditoria em tempo real das jornadas e rotas de entrega dos caminhões e frotas da **Distribuidora de Bebidas Amigão**.

---

## 🎯 Funcionalidades Principais

1. **Filtro de Jornadas por Data**:
   - Seleção de data com padrão na data corrente.
   - Atualização sob demanda das jornadas registradas.
2. **Autenticação & Token JWT**:
   - Modal para inserção ou simulação de Bearer Token JWT.
   - Persistência automática em `localStorage` para facilitar sessões de teste e desenvolvimento.
   - Injeção automática do cabeçalho `Authorization: Bearer <token>` em todas as requisições via Axios.
3. **Lista de Jornadas Operacionais**:
   - Identificação do entregador (`usuarioId`), caminhão/veículo (`veiculoId`) e horários.
   - Badges visuais de status com animação pulsante para jornadas **EM ANDAMENTO** e cinza/azul para **FINALIZADA**.
   - Distância total informada em km e status de entregas.
   - Busca instantânea por placa ou nome do entregador.
4. **Painel de Métricas da Jornada Selecionada**:
   - Total de pontos GPS de telemetria coletados.
   - Total de eventos e paradas realizadas.
   - Horário exato da primeira e última coordenada registrada.
5. **Mapa Interativo Geospatial (Leaflet + OpenStreetMap)**:
   - Enquadramento automático com `fitBounds` cobrindo todos os pontos da rota.
   - Polyline contínua em azul vibrante Amigão conectando as coordenadas cronológicas.
   - **Marcador de Partida (Verde)** com ícone Play e detalhes da saída.
   - **Marcador de Chegada / Posição Atual (Vermelho ou Ciano Pulsante)** indicando status do veículo.
   - **Marcadores de Eventos (Azul / Laranja)**:
     - Entrega Realizada / Baixa efetuada com sucesso.
     - Ocorrência de Cliente Ausente ou estabelecimento fechado.
     - Popups ricos com ID do pedido, cliente, horário e descrição.
6. **Resiliência e Modo Simulado**:
   - Alternador com um clique entre API Real e Dados Simulados da Amigão.
   - Tratamento amigável para jornadas recém-iniciadas sem coordenadas enviadas.

---

## 🛠️ Stack Tecnológica

- **Core**: React 18 + Vite (JavaScript puro ES Modules, sem TypeScript).
- **Estilização**: Tailwind CSS com tema personalizado e design system escuro profissional (dark operational).
- **Mapas**: Leaflet 1.9 + React-Leaflet 4.2 com tiles do OpenStreetMap.
  - Correção nativa do bug clássico de ícones e sombras do Leaflet no empacotador.
  - Marcadores vetoriais SVG customizados (`L.divIcon`).
- **Ícones**: Lucide React.
- **Cliente HTTP**: Axios com interceptor de tokens e leitura de variável de ambiente `VITE_API_URL`.

---

## 📁 Estrutura de Arquivos

```text
amiguinho-logistica-painel/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Filtros de data, JWT, alternador de modo e botões
│   │   ├── JornadaList.jsx      # Barra lateral com busca e lista de jornadas
│   │   ├── JornadaCard.jsx      # Card da jornada com status, veículo e horários
│   │   ├── ResumoJornada.jsx    # Barra superior com métricas e contagens da rota
│   │   ├── MapaRota.jsx         # Mapa interativo com Polyline, Markers e FitBounds
│   │   └── LeafletIcons.js      # Marcadores SVG customizados e fix de assets Leaflet
│   ├── services/
│   │   ├── api.js               # Instância Axios, interceptor de token e endpoints
│   │   └── mockData.js          # Dados de teste realistas com rotas da Amigão
│   ├── App.jsx                  # Estado central da aplicação e orquestração
│   ├── main.jsx                 # Entrada da aplicação React
│   └── index.css                # Estilos Tailwind e customizações Leaflet
├── .env                         # Variáveis de ambiente padrão
├── .env.example                 # Exemplo de configuração
├── index.html                   # HTML base com fontes e viewport
├── package.json                 # Dependências e scripts
├── postcss.config.js            # Configuração do PostCSS
├── tailwind.config.js           # Configuração de temas e cores Tailwind
└── vite.config.js               # Configuração do Vite
```

---

## 🚀 Como Instalar e Rodar Localmente

### 1. Pré-requisitos
- Node.js instalado (v18 ou superior).

### 2. Instalação das dependências
Abra o terminal na pasta do projeto e execute:
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` se necessário:
```bash
cp .env.example .env
```
Por padrão, a variável `VITE_API_URL` aponta para:
```env
VITE_API_URL=http://localhost:3334
```

### 4. Executando em Modo de Desenvolvimento
```bash
npm run dev
```
O painel estará disponível em `http://localhost:5173`.

### 5. Compilação para Produção
```bash
npm run build
```
Os arquivos otimizados e prontos para deploy estático serão gerados na pasta `dist/`.

---

## 📡 Contrato de Endpoints da API

### 1. Listar Jornadas
- **Método**: `GET /api/v1/jornadas?data=YYYY-MM-DD`
- **Cabeçalho**: `Authorization: Bearer <TOKEN>` (se autenticado)
- **Exemplo de Resposta**:
```json
[
  {
    "id": "jornada-001",
    "usuarioId": "ENTR-842",
    "usuarioNome": "Carlos Silva (Amigão Rota 1)",
    "veiculoId": "CAM-04 (Mercedes Accelo - PLACA: BRA2E19)",
    "dataInicio": "2026-11-11T07:30:00Z",
    "dataFim": "2026-11-11T16:45:00Z",
    "status": "FINALIZADA",
    "distanciaTotalKm": 42.8,
    "totalEntregas": 14,
    "entregasRealizadas": 13,
    "clientesAusentes": 1
  }
]
```

### 2. Obter Rota e Eventos da Jornada
- **Método**: `GET /api/v1/jornadas/:id/rota`
- **Cabeçalho**: `Authorization: Bearer <TOKEN>` (se autenticado)
- **Exemplo de Resposta**:
```json
{
  "jornadaId": "jornada-001",
  "usuarioId": "ENTR-842",
  "veiculoId": "CAM-04",
  "coordenadas": [
    {
      "latitude": -23.55052,
      "longitude": -46.633308,
      "dataHora": "2026-11-11T07:30:00Z",
      "velocidadeKmH": 0
    },
    {
      "latitude": -23.55890,
      "longitude": -46.643200,
      "dataHora": "2026-11-11T07:55:30Z",
      "velocidadeKmH": 45
    }
  ],
  "eventos": [
    {
      "id": "evt-101",
      "pedidoId": "PED-9801",
      "tipoEvento": "ENTREGA_REALIZADA",
      "descricao": "Baixa realizada - 30 caixas Cerveja Amigão Pilsen",
      "dataHora": "2026-11-11T08:15:22Z",
      "clienteNome": "Bar & Lanchonete do Zé",
      "latitude": -23.56510,
      "longitude": -46.651400
    },
    {
      "id": "evt-102",
      "pedidoId": "PED-9804",
      "tipoEvento": "CLIENTE_AUSENTE",
      "descricao": "Estabelecimento fechado no horário combinado",
      "dataHora": "2026-11-11T09:20:05Z",
      "clienteNome": "Restaurante Sabor da Vila",
      "latitude": -23.57840,
      "longitude": -46.669800
    }
  ]
}
```
