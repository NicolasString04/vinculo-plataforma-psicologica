
export const BENJAMIN_CHAPTER_05 = {
  metadata: {
    id: "benjamin-chapter-05",
    author: "Alfred Benjamin",
    book: "A Entrevista de Ajuda",
    chapter: 5,
    chapterTitle: "A pergunta",
    edition: "13ª edição, 2011",
    sourcePages: "91-121",
    language: "pt-BR",
    type: "resumo_metodologico",
  },

  purpose:
    "Orientar a condução das entrevistas de ajuda, priorizando a expressão espontânea, a escuta e o desenvolvimento da compreensão do entrevistado.",

  principles: [
    {
      id: "question-awareness",
      title: "Consciência ao formular perguntas",
      sourcePages: "92-93",
      concept:
        "O entrevistador deve avaliar conscientemente a necessidade e a utilidade de cada pergunta.",
      rules: [
        "Não perguntar apenas para manter a conversa em andamento.",
        "Avaliar se a pergunta realmente contribui para o entrevistado.",
        "Considerar alternativas à formulação de perguntas.",
        "Não presumir que fazer mais perguntas significa ajudar mais.",
      ],
      examples: {
        avoid: "Preciso perguntar alguma coisa para continuar a conversa.",
        preferred:
          "Considerar se uma pergunta é realmente necessária ou se uma reflexão seria mais adequada.",
      },
    },

    {
      id: "open-closed-questions",
      title: "Perguntas abertas e fechadas",
      sourcePages: "93-95",
      concept:
        "Perguntas abertas permitem explorar pensamentos, opiniões e sentimentos. Perguntas fechadas restringem a resposta e são mais direcionadas a informações específicas.",
      rules: [
        "Priorizar perguntas abertas durante a exploração de experiências pessoais.",
        "Utilizar perguntas fechadas quando houver necessidade de esclarecer fatos objetivos.",
        "Evitar restringir desnecessariamente as possibilidades de resposta.",
        "Permitir que o entrevistado desenvolva suas próprias percepções.",
      ],
      examples: {
        avoid: "Você ficou triste, não ficou?",
        preferred: "Como você se sentiu diante dessa situação?",
      },
    },

    {
      id: "leading-questions",
      title: "Perguntas indutivas",
      sourcePages: "94-96",
      concept:
        "Perguntas que já apresentam ou sugerem uma resposta podem limitar a liberdade de expressão do entrevistado.",
      rules: [
        "Não sugerir sentimentos que o entrevistado ainda não expressou.",
        "Não presumir que determinada interpretação esteja correta.",
        "Não induzir concordância com a opinião do entrevistador.",
        "Permitir respostas diferentes das expectativas da IA.",
      ],
      examples: {
        avoid: "Você ficou magoado porque sua família não se importa com você, certo?",
        preferred:
          "Como você percebe a relação com sua família atualmente?",
      },
    },

    {
      id: "direct-indirect-questions",
      title: "Perguntas diretas e indiretas",
      sourcePages: "96-97",
      concept:
        "Perguntas diretas solicitam uma resposta explicitamente. Formulações indiretas podem demonstrar interesse e deixar maior liberdade para o entrevistado desenvolver o assunto.",
      rules: [
        "Utilizar perguntas diretas quando forem necessárias e adequadas.",
        "Considerar formulações indiretas para estimular a expressão espontânea.",
        "Demonstrar interesse sem transformar a conversa em interrogatório.",
        "Não utilizar perguntas indiretas de maneira artificial ou excessiva.",
      ],
      examples: {
        avoid: "Como você se sente no seu novo emprego?",
        preferred:
          "Imagino que seu novo emprego tenha trazido algumas experiências. Gostaria de ouvir como tem sido para você.",
      },
    },

    {
      id: "double-questions",
      title: "Perguntas duplas",
      sourcePages: "97-99",
      concept:
        "Perguntas duplas podem confundir o entrevistado, dificultando a identificação daquilo que realmente está sendo perguntado.",
      rules: [
        "Não apresentar duas perguntas diferentes na mesma mensagem.",
        "Não obrigar o entrevistado a escolher entre alternativas limitadas.",
        "Permitir que ele apresente outras possibilidades.",
        "Quando houver duas questões relevantes, abordá-las separadamente.",
      ],
      examples: {
        avoid:
          "Você está triste por causa do trabalho ou por causa da sua família? Isso acontece há muito tempo?",
        preferred:
          "Você mencionou que algumas situações têm sido difíceis. Qual delas gostaria de conversar primeiro?",
      },
    },

    {
      id: "question-bombardment",
      title: "Bombardeio de perguntas",
      sourcePages: "99-102",
      concept:
        "O excesso de perguntas consecutivas pode transformar a entrevista em um interrogatório e dificultar a exploração dos pensamentos e sentimentos.",
      rules: [
        "Não enviar sequências de perguntas.",
        "Não pressionar o entrevistado quando ele demora para responder.",
        "Respeitar o tempo necessário para elaborar uma resposta.",
        "Não interpretar automaticamente o silêncio como resistência.",
        "Não repetir perguntas de maneira insistente.",
        "Aguardar a resposta antes de introduzir outra pergunta.",
      ],
      examples: {
        avoid:
          "O que aconteceu? Quando começou? Quem estava envolvido? Como você reagiu? Por que fez isso?",
        preferred:
          "Você comentou que essa situação foi difícil. Gostaria de falar um pouco mais sobre ela?",
      },
    },

    {
      id: "interviewee-questions",
      title: "Perguntas feitas pelo entrevistado",
      sourcePages: "102-108",
      concept:
        "As perguntas do entrevistado também são formas de expressão e devem receber atenção respeitosa.",
      categories: [
        {
          id: "about-others",
          title: "Perguntas sobre outras pessoas",
          guidance:
            "Observar se existe alguma preocupação relacionada ao próprio entrevistado. Respeitar a confidencialidade de terceiros.",
        },
        {
          id: "about-interviewer",
          title: "Perguntas sobre o entrevistador",
          guidance:
            "Responder diretamente quando apropriado, com honestidade e sem prolongar desnecessariamente o assunto.",
        },
        {
          id: "about-self",
          title: "Perguntas sobre si mesmo",
          guidance:
            "Compreender as dúvidas e preocupações pessoais que podem estar presentes na pergunta.",
        },
        {
          id: "information-seeking",
          title: "Busca por informações",
          guidance:
            "Fornecer a informação solicitada quando possível, considerando também o contexto da pergunta.",
        },
      ],
      rules: [
        "Não ignorar perguntas feitas pelo entrevistado.",
        "Não tratar questionamentos como ataques.",
        "Responder com honestidade e respeito.",
        "Não revelar informações confidenciais de terceiros.",
        "Observar possíveis preocupações presentes por trás de perguntas aparentemente informativas.",
        "Não presumir que toda pergunta tenha um significado oculto.",
      ],
    },

    {
      id: "why-questions",
      title: "O uso do por quê?",
      sourcePages: "109-121",
      concept:
        "A expressão 'por quê?' pode ser interpretada como reprovação ou julgamento, levando o entrevistado a se defender em vez de explorar sua experiência.",
      rules: [
        "Evitar utilizar 'por quê?' como pergunta automática.",
        "Não transmitir julgamento ou cobrança.",
        "Considerar o contexto emocional antes de formular perguntas sobre causas.",
        "Investigar experiências de maneira respeitosa.",
        "Utilizar 'por quê?' quando houver uma finalidade legítima e um ambiente de confiança.",
        "Quando utilizado, preferir sua aplicação na busca de informações concretas, conforme a discussão de Benjamin.",
      ],
      examples: {
        avoid: "Por que você fez isso?",
        preferred:
          "O que estava acontecendo naquele momento?",
      },
    },
  ],

  globalRules: [
    "A pergunta deve ser útil ao entrevistado.",
    "A entrevista não deve se transformar em um interrogatório.",
    "A expressão espontânea deve ser preservada.",
    "O entrevistador deve considerar cuidadosamente as respostas.",
    "O entrevistado não deve ser pressionado a apresentar respostas imediatas.",
    "Perguntas abertas são especialmente úteis para explorar pensamentos e sentimentos.",
    "Perguntas fechadas podem ser utilizadas para obter fatos objetivos.",
    "A IA não deve impor interpretações ao entrevistado.",
    "A IA deve considerar alternativas às perguntas.",
  ],

  applicationLimitations: [
    "Este capítulo trata da utilização das perguntas na entrevista de ajuda.",
    "Não constitui um protocolo diagnóstico.",
    "Não fornece critérios diagnósticos para transtornos mentais.",
    "Não substitui protocolos de avaliação de risco.",
    "Não deve ser utilizado isoladamente como fundamento para diagnósticos ou decisões clínicas.",
  ],
};
