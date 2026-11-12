// Dados de demonstração da Distribuidora de Bebidas Amigão
export const mockJornadas = [
  {
    id: "jornada-001",
    usuarioId: "ENTR-842",
    usuarioNome: "Carlos Silva (Amigão Rota 1)",
    veiculoId: "CAM-04 (Mercedes Accelo - PLACA: BRA2E19)",
    dataInicio: "2026-11-11T07:30:00Z",
    dataFim: "2026-11-11T16:45:00Z",
    status: "FINALIZADA",
    distanciaTotalKm: 42.8,
    totalEntregas: 14,
    entregasRealizadas: 13,
    clientesAusentes: 1
  },
  {
    id: "jornada-002",
    usuarioId: "ENTR-105",
    usuarioNome: "Marcos Souza (Amigão Rota 2)",
    veiculoId: "CAM-07 (VW Delivery - PLACA: AMG7G22)",
    dataInicio: "2026-11-11T08:15:00Z",
    dataFim: null,
    status: "EM ANDAMENTO",
    distanciaTotalKm: 28.3,
    totalEntregas: 12,
    entregasRealizadas: 7,
    clientesAusentes: 0
  },
  {
    id: "jornada-003",
    usuarioId: "ENTR-329",
    usuarioNome: "Rafael Oliveira (Amigão Express)",
    veiculoId: "VAN-02 (Fiat Ducato - PLACA: BEB9D45)",
    dataInicio: "2026-11-11T09:00:00Z",
    dataFim: null,
    status: "EM ANDAMENTO",
    distanciaTotalKm: 0.0,
    totalEntregas: 8,
    entregasRealizadas: 0,
    clientesAusentes: 0
  }
];

// Detalhes da rota de cada jornada com coordenadas e eventos
export const mockRotas = {
  "jornada-001": {
    jornadaId: "jornada-001",
    usuarioId: "ENTR-842",
    veiculoId: "CAM-04",
    coordenadas: [
      { latitude: -23.55052, longitude: -46.633308, dataHora: "2026-11-11T07:30:00Z", velocidadeKmH: 0 },
      { latitude: -23.55320, longitude: -46.637500, dataHora: "2026-11-11T07:42:10Z", velocidadeKmH: 38 },
      { latitude: -23.55890, longitude: -46.643200, dataHora: "2026-11-11T07:55:30Z", velocidadeKmH: 45 },
      { latitude: -23.56510, longitude: -46.651400, dataHora: "2026-11-11T08:10:00Z", velocidadeKmH: 22 },
      { latitude: -23.57020, longitude: -46.658900, dataHora: "2026-11-11T08:35:15Z", velocidadeKmH: 15 },
      { latitude: -23.57840, longitude: -46.669800, dataHora: "2026-11-11T09:15:00Z", velocidadeKmH: 32 },
      { latitude: -23.58560, longitude: -46.678200, dataHora: "2026-11-11T10:05:40Z", velocidadeKmH: 40 },
      { latitude: -23.59310, longitude: -46.685400, dataHora: "2026-11-11T11:20:00Z", velocidadeKmH: 28 },
      { latitude: -23.59890, longitude: -46.691200, dataHora: "2026-11-11T12:10:15Z", velocidadeKmH: 0 },
      { latitude: -23.59100, longitude: -46.679500, dataHora: "2026-11-11T13:40:00Z", velocidadeKmH: 35 },
      { latitude: -23.57500, longitude: -46.662000, dataHora: "2026-11-11T14:30:20Z", velocidadeKmH: 42 },
      { latitude: -23.56200, longitude: -46.648000, dataHora: "2026-11-11T15:25:00Z", velocidadeKmH: 36 },
      { latitude: -23.55052, longitude: -46.633308, dataHora: "2026-11-11T16:45:00Z", velocidadeKmH: 0 }
    ],
    eventos: [
      {
        id: "evt-101",
        pedidoId: "PED-9801",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa realizada - 30 caixas Cerveja Amigão Pilsen",
        dataHora: "2026-11-11T08:15:22Z",
        clienteNome: "Bar & Lanchonete do Zé",
        latitude: -23.56510,
        longitude: -46.651400
      },
      {
        id: "evt-102",
        pedidoId: "PED-9804",
        tipoEvento: "CLIENTE_AUSENTE",
        descricao: "Estabelecimento fechado no horário combinado",
        dataHora: "2026-11-11T09:20:05Z",
        clienteNome: "Restaurante Sabor da Vila",
        latitude: -23.57840,
        longitude: -46.669800
      },
      {
        id: "evt-103",
        pedidoId: "PED-9807",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa realizada - 50 engradados Chopp Amigão",
        dataHora: "2026-11-11T10:12:45Z",
        clienteNome: "Empório dos Amigos",
        latitude: -23.58560,
        longitude: -46.678200
      },
      {
        id: "evt-104",
        pedidoId: "PED-9812",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa realizada - 20 fardos Água Mineral e Refrigerantes",
        dataHora: "2026-11-11T12:15:30Z",
        clienteNome: "Pizzaria Bella Paulista",
        latitude: -23.59890,
        longitude: -46.691200
      },
      {
        id: "evt-105",
        pedidoId: "PED-9819",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa final de rota - Retorno ao depósito Amigão",
        dataHora: "2026-11-11T15:30:10Z",
        clienteNome: "Padaria Estrela Nobre",
        latitude: -23.56200,
        longitude: -46.648000
      }
    ]
  },
  "jornada-002": {
    jornadaId: "jornada-002",
    usuarioId: "ENTR-105",
    veiculoId: "CAM-07",
    coordenadas: [
      { latitude: -23.53200, longitude: -46.62500, dataHora: "2026-11-11T08:15:00Z", velocidadeKmH: 0 },
      { latitude: -23.52800, longitude: -46.61900, dataHora: "2026-11-11T08:35:00Z", velocidadeKmH: 29 },
      { latitude: -23.52200, longitude: -46.61100, dataHora: "2026-11-11T09:05:00Z", velocidadeKmH: 41 },
      { latitude: -23.51500, longitude: -46.60400, dataHora: "2026-11-11T09:40:00Z", velocidadeKmH: 18 },
      { latitude: -23.50900, longitude: -46.59800, dataHora: "2026-11-11T10:25:00Z", velocidadeKmH: 33 },
      { latitude: -23.50300, longitude: -46.59100, dataHora: "2026-11-11T11:15:00Z", velocidadeKmH: 26 },
      { latitude: -23.49800, longitude: -46.58500, dataHora: "2026-11-11T12:00:00Z", velocidadeKmH: 12 }
    ],
    eventos: [
      {
        id: "evt-201",
        pedidoId: "PED-8711",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa confirmada - 40 caixas Cerveja Lager 600ml",
        dataHora: "2026-11-11T09:42:00Z",
        clienteNome: "Distribuidora Irmãos Silva",
        latitude: -23.51500,
        longitude: -46.60400
      },
      {
        id: "evt-202",
        pedidoId: "PED-8715",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa confirmada - 15 barris Chopp 50L",
        dataHora: "2026-11-11T11:20:00Z",
        clienteNome: "Boteco da Esquina",
        latitude: -23.50300,
        longitude: -46.59100
      }
    ]
  },
  "jornada-003": {
    jornadaId: "jornada-003",
    usuarioId: "ENTR-329",
    veiculoId: "VAN-02",
    coordenadas: [],
    eventos: []
  }
};
