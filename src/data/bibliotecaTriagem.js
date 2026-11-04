export const fontesTriagem = {
  dsm5tr: {
    titulo: "DSM-5-TR",
    autor: "American Psychiatric Association",
    ano: 2022,
    url: "https://www.psychiatry.org/patients-families/what-is-the-dsm/",
    papel: "Referência para estudar descrições clínicas e impacto na rotina.",
  },

  cid11: {
    titulo: "CID-11 — descrições clínicas e requisitos diagnósticos (CDDR)",
    autor: "Organização Mundial da Saúde",
    ano: 2024,
    url: "https://www.who.int/publications/i/item/9789240077263",
    papel: "Referência para comparar descrições clínicas e terminologia.",
  },

  entrevistaDeAjuda: {
    titulo: "A Entrevista de Ajuda",
    autor: "Alfred Benjamin",
    edicao: null,
    ano: null,
    papel: "Referência para formular perguntas e conduzir a conversa.",
  },
};

export const bibliotecaTriagem = [
  {
    id: "ansiedade-rotina",
    tema: "Ansiedade e impacto na rotina",
    versao: 2,
    status: "rascunho",

    objetivo:
      "Entender o que a pessoa relata sobre suas preocupações e se elas interferem no dia a dia.",

    referencias: [
      {
        fonteId: "dsm5tr",
        localizador: null,
        pendencia: "Conferir e registrar a seção pertinente no manual.",
      },
      {
        fonteId: "cid11",
        localizador: null,
        pendencia: "Conferir e registrar a seção pertinente no CDDR.",
      },
      {
        fonteId: "entrevistaDeAjuda",
        localizador:
          "Cap. 5 — A pergunta; seção Perguntas abertas vs. perguntas fechadas",
        pendencia: "Confirmar a edição e a paginação da cópia usada no TCC.",
      },
    ],

    // Perguntas autorais da Elora, ainda sem revisão clínica.
    perguntasRascunho: [
      "O que tem te preocupado ultimamente?",
      "Em que situações essa preocupação costuma aparecer?",
      "Como isso tem aparecido no seu dia a dia, se é que tem?",
    ],

    orientacaoDeConversa:
      "Comece com uma pergunta aberta. Use o que a pessoa já contou e só faça outra pergunta se faltar algo útil para entender o relato.",

    regraDeResumo:
      "Resuma apenas o que a pessoa relatou. Se ela disser que não percebeu impacto na rotina, registre isso. Se o impacto não tiver sido mencionado, registre como não informado.",

    limites: [
      "Não atribuir diagnóstico, código clínico ou nível de gravidade.",
      "Não apresentar as perguntas como uma escala validada.",
      "Não inferir sintomas ou prejuízos que a pessoa não descreveu.",
    ],

    revisao: {
      revisadoPor: null,
      revisadoEm: null,
    },
  },
];

export function buscarFichasAprovadas(temaId) {
  return bibliotecaTriagem.filter(
    (ficha) =>
      ficha.status === "aprovada" && (!temaId || ficha.id === temaId)
  );
}