// Dados de demonstração do Amiguinho Express
export const mockJornadas = [
  {
    id: "jornada-001",
    usuarioId: "ENTR-842",
    motoristaNome: "Carlos Silva",
    usuarioNome: "Carlos Silva (Amiguinho Express Rota 1)",
    veiculoId: "CAM-04 (Mercedes Accelo - PLACA: BRA2E19)",
    dataInicio: "2026-11-11T07:30:00Z",
    dataFim: "2026-11-11T16:45:00Z",
    status: "FINALIZADA",
    distanciaTotalKm: 42.8,
    velocidadeMediaKmH: 33,
    velocidadeMaximaKmH: 45,
    totalPedidos: 14,
    totalEntregas: 14,
    entregasRealizadas: 13,
    percentualEntregue: 93,
    clientesAusentes: 1,
    pedidos: [
      { id: "PED-9801", clienteNome: "Bar & Lanchonete do Zé", endereco: "Av. Tiradentes, 450 - Centro", cidade: "Canoinhas", status: "entregue", entregue: true },
      { id: "PED-9804", clienteNome: "Restaurante Sabor da Vila", endereco: "Rua Vidal Ramos, 120 - Campo d'Água Verde", cidade: "Canoinhas", status: "ausente", entregue: false },
      { id: "PED-9807", clienteNome: "Empório dos Amigos", endereco: "Rua Paula Pereira, 890 - Centro", cidade: "Canoinhas", status: "entregue", entregue: true }
    ]
  },
  {
    id: "jornada-002",
    usuarioId: "ENTR-105",
    motoristaNome: "Marcos Souza",
    usuarioNome: "Marcos Souza (Amiguinho Express Rota 2)",
    veiculoId: "CAM-07 (VW Delivery - PLACA: AMG7G22)",
    dataInicio: "2026-11-11T08:15:00Z",
    dataFim: null,
    status: "EM ANDAMENTO",
    distanciaTotalKm: 28.3,
    velocidadeMediaKmH: 27,
    velocidadeMaximaKmH: 41,
    totalPedidos: 12,
    totalEntregas: 12,
    entregasRealizadas: 7,
    percentualEntregue: 58,
    clientesAusentes: 0,
    pedidos: [
      { id: "PED-9810", clienteNome: "Panificadora Central", endereco: "Rua Coronel Diniz, 320 - Centro", cidade: "Irineópolis", status: "entregue", entregue: true },
      { id: "PED-9812", clienteNome: "Supermercado Santa Cruz", endereco: "Av. 22 de Julho, 1050 - Centro", cidade: "Irineópolis", status: "pendente", entregue: false },
      { id: "PED-9815", clienteNome: "Lanchonete Parada Obrigatória", endereco: "Rodovia BR-280, Km 220", cidade: "Irineópolis", status: "pendente", entregue: false }
    ]
  },
  {
    id: "jornada-003",
    usuarioId: "ENTR-329",
    motoristaNome: "Rafael Oliveira",
    usuarioNome: "Rafael Oliveira (Amiguinho Express)",
    veiculoId: "VAN-02 (Fiat Ducato - PLACA: BEB9D45)",
    dataInicio: "2026-11-11T09:00:00Z",
    dataFim: null,
    status: "EM ANDAMENTO",
    distanciaTotalKm: 14.5,
    velocidadeMediaKmH: 29,
    velocidadeMaximaKmH: 38,
    totalPedidos: 8,
    totalEntregas: 8,
    entregasRealizadas: 1,
    percentualEntregue: 13,
    clientesAusentes: 1,
    pedidos: [
      { id: "PED-9820", clienteNome: "Distribuidora Express Bebidas", endereco: "Rua Duque de Caxias, 55", cidade: "Três Barras", status: "entregue", entregue: true },
      { id: "PED-9822", clienteNome: "Conveniência Posto Ipiranga", endereco: "Av. Rigesa, 1400 - São Cristóvão", cidade: "Três Barras", status: "pendente", entregue: false }
    ]
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
    veiculoId: "VAN-02 (Fiat Ducato - PLACA: BEB9D45)",
    coordenadas: [
      { latitude: -23.54500, longitude: -46.63800, dataHora: "2026-11-11T09:00:00Z", velocidadeKmH: 0 },
      { latitude: -23.54820, longitude: -46.64250, dataHora: "2026-11-11T09:18:20Z", velocidadeKmH: 34 },
      { latitude: -23.55400, longitude: -46.64900, dataHora: "2026-11-11T09:40:00Z", velocidadeKmH: 27 },
      { latitude: -23.56010, longitude: -46.65500, dataHora: "2026-11-11T10:10:45Z", velocidadeKmH: 38 },
      { latitude: -23.56700, longitude: -46.66200, dataHora: "2026-11-11T10:45:00Z", velocidadeKmH: 15 }
    ],
    eventos: [
      {
        id: "evt-301",
        pedidoId: "PED-7601",
        tipoEvento: "ENTREGA_REALIZADA",
        descricao: "Baixa realizada - 12 caixas Cerveja Premium",
        dataHora: "2026-11-11T09:42:10Z",
        clienteNome: "Conveniência Posto Central",
        latitude: -23.55400,
        longitude: -46.64900
      },
      {
        id: "evt-302",
        pedidoId: "PED-7605",
        tipoEvento: "CLIENTE_AUSENTE",
        descricao: "Local fechado para almoço, retornar às 14h",
        dataHora: "2026-11-11T10:46:00Z",
        clienteNome: "Mercadinho São Judas",
        latitude: -23.56700,
        longitude: -46.66200
      }
    ]
  }
};
