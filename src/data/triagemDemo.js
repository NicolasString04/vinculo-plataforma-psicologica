// src/data/triagemDemo.js

export const perguntasDemo = [
  {
    id: "preocupacao",
    titulo: "O que tem te preocupado ultimamente?",
    descricao:
      "Este exemplo mostra uma resposta fictícia. Na versão final, a pessoa poderá escrever seu próprio relato.",
  },
  {
    id: "contexto",
    titulo: "Em que situações essa preocupação costuma aparecer?",
    descricao:
      "Queremos entender o contexto descrito pela pessoa, sem tirar conclusões além do relato.",
  },
  {
    id: "rotina",
    titulo: "Como isso tem aparecido no seu dia a dia, se é que tem?",
    descricao:
      "A pessoa pode perceber mudanças na rotina, dizer que não percebeu mudanças ou não informar esse ponto.",
  },
];

export const cenariosDemo = [
  {
    id: "impacto-relatado",
    nome: "Preocupação com o trabalho",
    descricao: "Exemplo com mudança na rotina relatada.",

    respostas: {
      preocupacao:
        "Tenho ficado preocupado com as entregas e os prazos do trabalho.",
      contexto:
        "Isso costuma aparecer no fim do expediente, quando penso no que ficou pendente.",
      rotina:
        "Algumas noites demoro para pegar no sono porque continuo pensando no trabalho.",
    },

    resumo: {
      assunto:
        "Relatou preocupação com entregas e prazos do trabalho.",
      contexto:
        "Disse que a preocupação costuma aparecer no fim do expediente, ao pensar nas pendências.",
      impacto:
        "Relatou que, em algumas noites, demora para pegar no sono enquanto pensa no trabalho.",
      situacaoImpacto: "Impacto relatado",
    },
  },

  {
    id: "sem-impacto-relatado",
    nome: "Preocupação sem mudança percebida",
    descricao: "Exemplo em que a pessoa nega mudanças na rotina.",

    respostas: {
      preocupacao:
        "Tenho me preocupado com uma apresentação que vou fazer.",
      contexto:
        "Penso nisso quando estou preparando o material da apresentação.",
      rotina:
        "Não percebi mudanças na minha rotina. Continuo dormindo e fazendo minhas atividades como antes.",
    },

    resumo: {
      assunto:
        "Relatou preocupação com uma apresentação que vai realizar.",
      contexto:
        "Disse que pensa na apresentação enquanto prepara o material.",
      impacto:
        "Disse que não percebeu mudanças na rotina, no sono ou nas atividades.",
      situacaoImpacto: "Sem mudança percebida",
    },
  },

  {
    id: "impacto-nao-informado",
    nome: "Informação incompleta",
    descricao: "Exemplo em que o impacto na rotina não foi informado.",

    respostas: {
      preocupacao:
        "Tenho me preocupado com dinheiro.",
      contexto:
        "Essa preocupação aparece quando vejo as contas do mês.",
      rotina: "",
    },

    resumo: {
      assunto:
        "Relatou preocupação com dinheiro.",
      contexto:
        "Disse que a preocupação aparece ao consultar as contas do mês.",
      impacto:
        "O impacto na rotina não foi informado.",
      situacaoImpacto: "Não informado",
    },
  },
];

export function buscarCenarioDemo(id) {
  return cenariosDemo.find((cenario) => cenario.id === id) ?? null;
}