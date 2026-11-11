import { normalizar } from "./biblioteca/busca.mjs";

import {
  BENJAMIN_CHAPTER_05,
} from "./biblioteca/ai/knowledge/benjamin/chapter-05.mjs";

import {
  BENJAMIN_INTERVIEW_RULES,
} from "./biblioteca/ai/prompts/benjamin-rules.mjs";

// ======================================================
// 1. CONFIGURAÇÕES
// ======================================================

const MAX_RESPOSTAS = 5;

const MENSAGEM_ENCERRAMENTO =
  "Obrigado por compartilhar um pouco da sua experiência. " +
  "Com o que conversamos até aqui, já podemos organizar " +
  "um resumo para apoiar uma futura conversa com um profissional. " +
  "Você pode gerar seu resumo quando quiser.";

// ======================================================
// 2. CONHECIMENTO METODOLÓGICO DE BENJAMIN
// ======================================================

function montarConhecimentoBenjamin() {
  const principios = (
    BENJAMIN_CHAPTER_05.principles ?? []
  ).map((item) => `
Princípio: ${item.title}
Conceito: ${item.concept}
Orientações: ${(item.rules ?? []).join("; ")}
Referência: página ${item.sourcePages ?? "não informada"}
`).join("\n");

  return `
REFERÊNCIA METODOLÓGICA:
${BENJAMIN_CHAPTER_05.metadata.book}

Autor: ${BENJAMIN_CHAPTER_05.metadata.author}

Capítulo: ${BENJAMIN_CHAPTER_05.metadata.chapterTitle}

OBJETIVO:
${BENJAMIN_CHAPTER_05.purpose}

PRINCÍPIOS:
${principios}

REGRAS GERAIS:
${(BENJAMIN_CHAPTER_05.globalRules ?? []).join("\n")}
`;
}

const CONHECIMENTO_BENJAMIN =
  montarConhecimentoBenjamin();

// ======================================================
// 3. IDENTIFICAÇÃO DE PERGUNTAS REPETIDAS
// ======================================================

const PALAVRAS_COMUNS = new Set([
  "como", "voce", "sente", "sentindo",
  "sobre", "isso", "essa", "esse",
  "seu", "sua", "seus", "suas",
  "para", "pode", "contar", "mais",
  "quando", "qual", "quais", "tem",
  "tido", "com", "uma", "que",
  "estou", "esta", "estao",
  "alguma", "algum", "notou",
  "percebe", "percebido",
  "ultimamente", "relacao",
  "dia", "dias", "rotina",
  "sentimento", "sensacao",
  "voce", "gostaria", "pouco",
  "experiencia", "momento", "maneira",
  "sobre", "acontecendo", "pessoa",
]);

// Palavras diferentes que representam conceitos próximos.
const SINONIMOS = new Map([
  ["sozinho", "solidao"],
  ["sozinha", "solidao"],
  ["isolado", "solidao"],
  ["isolada", "solidao"],
  ["isolamento", "solidao"],

  ["cansado", "cansaco"],
  ["cansada", "cansaco"],
  ["exausto", "cansaco"],
  ["exausta", "cansaco"],
  ["esgotado", "cansaco"],
  ["esgotada", "cansaco"],

  ["dificil", "dificuldade"],
  ["dificuldade", "dificuldade"],
  ["complicado", "dificuldade"],
  ["complicada", "dificuldade"],
  ["pesado", "dificuldade"],
  ["pesando", "dificuldade"],

  ["emprego", "trabalho"],
  ["profissional", "trabalho"],
  ["expediente", "trabalho"],

  ["namoro", "relacionamento"],
  ["namorando", "relacionamento"],
  ["parceiro", "relacionamento"],
  ["parceira", "relacionamento"],
  ["companheiro", "relacionamento"],
  ["companheira", "relacionamento"],

  ["preocupado", "preocupacao"],
  ["preocupada", "preocupacao"],
  ["ansioso", "ansiedade"],
  ["ansiosa", "ansiedade"],
]);

function palavrasRelevantes(texto) {
  const palavras =
    normalizar(String(texto ?? ""))
      .match(/[a-z]{3,}/g) ?? [];

  return new Set(
    palavras
      .filter((palavra) =>
        !PALAVRAS_COMUNS.has(palavra)
      )
      .map((palavra) =>
        SINONIMOS.get(palavra) ?? palavra
      )
  );
}

function semelhanca(a, b) {
  const pa = palavrasRelevantes(a);
  const pb = palavrasRelevantes(b);

  if (!pa.size || !pb.size) return 0;

  const comuns = [...pa].filter(
    (palavra) => pb.has(palavra)
  ).length;

  const uniao = new Set([
    ...pa,
    ...pb,
  ]).size;

  const jaccard = comuns / uniao;

  const cobertura =
    comuns / Math.min(pa.size, pb.size);

  return Math.max(
    jaccard,
    cobertura * 0.65
  );
}

// Extrai somente a pergunta, sem o texto de acolhimento.

function extrairPergunta(mensagem) {
  const texto = String(mensagem ?? "");

  const indice = texto.lastIndexOf("?");

  if (indice === -1) return null;

  const antes = texto.slice(0, indice);

  const inicio = Math.max(
    antes.lastIndexOf("."),
    antes.lastIndexOf("!"),
    antes.lastIndexOf("\n")
  );

  return texto
    .slice(inicio + 1, indice + 1)
    .trim();
}

function perguntasAnteriores(historico) {
  return historico
    .filter(
      (item) => item.papel === "elora"
    )
    .map(
      (item) => extrairPergunta(item.texto)
    )
    .filter(Boolean);
}

function jaFoiPerguntado(pergunta, historico) {
  const anteriores =
    perguntasAnteriores(historico);

  return anteriores.some((anterior) => {
    const atualNormalizada =
      normalizar(pergunta);

    const anteriorNormalizada =
      normalizar(anterior);

    if (
      atualNormalizada === anteriorNormalizada
    ) {
      return true;
    }

    return semelhanca(
      pergunta,
      anterior
    ) >= 0.50;
  });
}

// ======================================================
// 4. ALTERNATIVAS INTELIGENTES
// ======================================================

// Utilizadas somente quando o Ollama falha,
// retorna conteúdo inválido ou repete uma pergunta.

const DIMENSOES_RESERVA = [
  {
    nome: "inicio",

    pergunta:
      "Você lembra quando começou a perceber essa mudança?",

    perguntaAnterior:
      /quando comecou|desde quando|ha quanto tempo|lembra quando|inicio da situacao/,

    respostaAnterior:
      /ultimamente|recentemente|desde que|ha meses|ha semanas|ha dias|faz tempo|comecou|iniciou|depois que|apos/,
  },

  {
    nome: "impacto",

    pergunta:
      "De que maneira essa situação tem aparecido na sua rotina, como no trabalho, nos estudos, no sono ou nas relações?",

    perguntaAnterior:
      /impacto|afeta|rotina|dia a dia|trabalho|estudos|sono|relacoes/,

    respostaAnterior:
      /trabalho|faculdade|estudo|sono|dorm|rotina|tarefas|relacion|familia|energia|concentr/,
  },

  {
    nome: "frequencia",

    pergunta:
      "Isso acontece com frequência ou costuma aparecer em situações específicas?",

    perguntaAnterior:
      /frequencia|todos os dias|quantas vezes|momentos especificos|constantemente/,

    respostaAnterior:
      /todos os dias|todo dia|sempre|as vezes|de vez em quando|frequentemente|constantemente|com frequencia/,
  },

  {
    nome: "apoio",

    pergunta:
      "Quando essa situação fica mais difícil, existe algo ou alguém que costuma ajudar você?",

    perguntaAnterior:
      /ajuda|apoio|alguem que|costuma ajudar|pessoa com quem/,

    respostaAnterior:
      /apoio|ajuda|converso|falo com|amigo|familia|terapia|psicologo/,
  },
];

function mensagemDeReserva(historico) {
  const respostas = historico
    .filter(
      (item) => item.papel === "paciente"
    )
    .map((item) => item.texto);

  const perguntas = perguntasAnteriores(
    historico
  );

  const textoRespostas = normalizar(
    respostas.join(" ")
  );

  const textoPerguntas = normalizar(
    perguntas.join(" ")
  );

  const proximaDimensao =
    DIMENSOES_RESERVA.find((dimensao) => {
      const jaPerguntou =
        dimensao.perguntaAnterior.test(
          textoPerguntas
        );

      const jaFoiInformado =
        dimensao.respostaAnterior.test(
          textoRespostas
        );

      const repetida = jaFoiPerguntado(
        dimensao.pergunta,
        historico
      );

      return (
        !jaPerguntou &&
        !jaFoiInformado &&
        !repetida
      );
    });

  if (proximaDimensao) {
    return (
      "Quero compreender um pouco melhor " +
      "esse aspecto do que você compartilhou. " +
      proximaDimensao.pergunta
    );
  }

  return MENSAGEM_ENCERRAMENTO;
}

// ======================================================
// 5. TRATAMENTO DA RESPOSTA DO MODELO
// ======================================================

function limparMensagem(saida) {
  const original = String(saida ?? "")
    .replace(
      /<think>[\s\S]*?<\/think>/gi,
      ""
    )
    .trim();

  const risco =
    /\bRISCO\s*:\s*(SIM|POSSIVEL)\b/i.test(
      original
    )
      ? "possivel"
      : "nao_identificado";

  let mensagem = original
    .replace(
      /^\s*RISCO\s*:\s*(?:SIM|NAO|NÃO|POSSIVEL)\s*$/gim,
      ""
    )
    .replace(
      /\bRISCO\s*:\s*(?:SIM|NAO|NÃO|POSSIVEL)\b/gi,
      ""
    )
    .replace(
      /^\s*(?:MENSAGEM|PERGUNTA|RESPOSTA)\s*:\s*/i,
      ""
    )
    .replace(
      /^\s*["'“”•*-]+\s*/,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  const quantidadePerguntas =
    (mensagem.match(/\?/g) ?? []).length;

  if (
    !mensagem ||
    mensagem.length < 12 ||
    mensagem.length > 450 ||
    quantidadePerguntas > 1
  ) {
    return {
      mensagem: null,
      risco,
    };
  }

  return {
    mensagem,
    risco,
  };
}

// ======================================================
// 6. COMUNICAÇÃO COM O OLLAMA
// ======================================================

async function conversarComOllama({
  historico,
  conhecimentos,
  model,
  ollamaUrl,
  respostaRejeitada = "",
}) {
  const controle = new AbortController();

  const temporizador = setTimeout(
    () => controle.abort(),
    65000
  );

  try {
    const notas = conhecimentos
      .slice(0, 3)
      .map((item) => item.conteudo)
      .filter(Boolean)
      .join("\n")
      .slice(0, 900);

    const anteriores =
      perguntasAnteriores(historico);

    const instrucoes = `
# IDENTIDADE

Você é Elora, uma assistente virtual experimental
de triagem psicológica.

Converse em português brasileiro.

Seu objetivo é conduzir uma conversa exploratória
natural, respeitosa, individualizada e contextualizada.

# METODOLOGIA DE ENTREVISTA

Utilize os princípios metodológicos de
A Entrevista de Ajuda, de Alfred Benjamin.

${BENJAMIN_INTERVIEW_RULES}

# CONHECIMENTO METODOLÓGICO

${CONHECIMENTO_BENJAMIN}

# REGRA MAIS IMPORTANTE: ESCUTAR ANTES DE PERGUNTAR

Leia todo o histórico antes de responder.

A pessoa não está preenchendo um formulário.

Você está conduzindo uma conversa.

Não trate cada resposta como uma conversa independente.

Não ignore informações que a pessoa já compartilhou.

Não faça perguntas automáticas apenas para preencher
uma quantidade de perguntas.

Identifique o que a pessoa realmente quis comunicar.

Considere o contexto emocional e os acontecimentos
relatados anteriormente.

# COMO RESPONDER

Sua resposta deve:

1. Demonstrar que compreendeu o relato mais recente.
2. Considerar o que já foi compartilhado.
3. Reconhecer aspectos relevantes sem repetir
   literalmente a fala da pessoa.
4. Aprofundar somente algo que ainda não esteja
   suficientemente esclarecido.
5. Fazer no máximo uma pergunta aberta.

Você não precisa perguntar em todas as respostas.

Se a pessoa já explicou suficientemente determinado
aspecto, não volte a perguntar sobre ele.

Se uma reflexão ou um acolhimento forem mais adequados,
responda naturalmente sem fazer outra pergunta.

# PROIBIÇÃO DE REPETIÇÃO

As perguntas abaixo já foram realizadas:

${JSON.stringify(anteriores)}

Não repita nenhuma delas.

Não reformule uma pergunta anterior apenas
trocando algumas palavras.

Não pergunte novamente algo que a pessoa
já explicou espontaneamente.

Não volte ao mesmo assunto sem uma razão relevante.

Evite especialmente repetir perguntas genéricas como:

- O que mais tem pesado nessa experiência?
- Como isso tem afetado você?
- Pode me contar mais sobre isso?
- Como você se sente em relação a isso?

Se precisar aprofundar um assunto, escolha um aspecto
novo e específico do relato.

${
  respostaRejeitada
    ? `
# CORREÇÃO OBRIGATÓRIA

Sua tentativa anterior foi rejeitada porque produziu
uma resposta repetitiva ou inválida.

Não reproduza a resposta abaixo:

${respostaRejeitada}

Crie uma resposta diferente, considerando todo
o histórico e escolhendo outro aspecto ainda
não explorado.
`
    : ""
}

# NATURALIDADE

Não comece todas as respostas com:

- Entendo.
- Compreendo.
- Obrigado por compartilhar.
- Imagino como deve ser difícil.

Não utilize sempre a mesma estrutura.

Não transforme a conversa em uma entrevista mecânica.

Não faça listas para conversar com a pessoa.

Não use linguagem excessivamente técnica.

Não presuma emoções ou acontecimentos que
não foram relatados.

# CONHECIMENTOS COMPLEMENTARES

${notas}

Utilize o conhecimento metodológico para orientar
sua escuta e a condução da conversa.

Não invente informações que não estejam presentes
nas referências.

# LIMITES CLÍNICOS

Você não realiza diagnósticos.

Não confirme transtornos.

Não atribua causas psicológicas aos relatos.

Não apresente hipóteses clínicas como fatos.

As referências clínicas são utilizadas como apoio
ao desenvolvimento da triagem, não como autorização
para diagnosticar.

# SEGURANÇA

Se houver indicação de ideação suicida,
automutilação ou perigo imediato:

- Marque RISCO: SIM.
- Priorize o protocolo de segurança.
- Não continue a entrevista comum.
- Não confunda tristeza ou cansaço isolados
  com confirmação de risco.

# FORMATO OBRIGATÓRIO

Retorne exatamente:

MENSAGEM: [resposta natural e breve, com no máximo uma pergunta]

RISCO: SIM ou NAO

Não inclua explicações sobre as instruções.
Não gere JSON.
`;

    const mensagens = [
      {
        role: "system",
        content: instrucoes,
      },

      ...historico.slice(-12).map((item) => ({
        role:
          item.papel === "paciente"
            ? "user"
            : "assistant",

        content: String(
          item.texto ?? ""
        ).slice(0, 900),
      })),
    ];

    const resposta = await fetch(
      `${ollamaUrl.replace(/\/+$/, "")}/api/chat`,
      {
        method: "POST",
        signal: controle.signal,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model,
          stream: false,
          messages,

          options: {
            temperature: 0.45,
            top_p: 0.85,
            repeat_penalty: 1.18,
            num_ctx: 4096,
            num_predict: 180,
          },

          keep_alive: "10m",
        }),
      }
    );

    if (!resposta.ok) {
      throw new Error(
        `Ollama retornou HTTP ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    return dados?.message?.content ?? "";

  } finally {
    clearTimeout(temporizador);
  }
}

// ======================================================
// 7. GERAÇÃO DA RESPOSTA DA ELORA
// ======================================================

export async function gerarPergunta({
  historico = [],
  conhecimentos = [],
  model,
  ollamaUrl,
  demo = false,
}) {
  const totalRespostas = historico.filter(
    (item) => item.papel === "paciente"
  ).length;

  // A quinta resposta encerra a entrevista.
  // Não será criada uma sexta pergunta.

  if (totalRespostas >= MAX_RESPOSTAS) {
    return {
      mensagem: MENSAGEM_ENCERRAMENTO,
      risco: "nao_identificado",
      origem: "encerramento",
    };
  }

  // Modo de demonstração.

  if (demo) {
    return {
      mensagem: mensagemDeReserva(historico),
      risco: "nao_identificado",
      origem: "demo",
    };
  }

  // Duas tentativas: a segunda recebe instruções
  // específicas para corrigir uma resposta repetitiva.

  let respostaRejeitada = "";

  for (let tentativa = 0; tentativa < 2; tentativa++) {
    try {
      const texto = await conversarComOllama({
        historico,
        conhecimentos,
        model,
        ollamaUrl,
        respostaRejeitada:
          tentativa === 1
            ? respostaRejeitada
            : "",
      });

      const resultado = limparMensagem(texto);

      if (resultado.risco === "possivel") {
        return {
          mensagem:
            resultado.mensagem ??
            "Precisamos priorizar sua segurança neste momento.",

          risco: "possivel",
          origem: "ollama",
        };
      }

      if (resultado.mensagem) {
        const pergunta = extrairPergunta(
          resultado.mensagem
        );

        if (
          !pergunta ||
          !jaFoiPerguntado(
            pergunta,
            historico
          )
        ) {
          return {
            mensagem: resultado.mensagem,
            risco: "nao_identificado",
            origem: "ollama",
          };
        }
      }

      respostaRejeitada =
        resultado.mensagem ?? texto;

      console.warn(
        `Elora: tentativa ${tentativa + 1} repetitiva ou inválida.`
      );

    } catch (erro) {
      console.warn(
        "Elora: falha na comunicação com Ollama:",
        erro?.message
      );

      break;
    }
  }

  // Última alternativa caso o modelo não consiga
  // gerar uma resposta adequada.

  return {
    mensagem: mensagemDeReserva(historico),
    risco: "nao_identificado",
    origem: "fallback",
  };
}

// ======================================================
// 8. GERAÇÃO DO RESUMO
// ======================================================

export async function gerarResumo({
  historico = [],
}) {
  const relatos = historico
    .filter(
      (item) =>
        item.papel === "paciente" &&
        typeof item.texto === "string"
    )
    .map((item) =>
      item.texto.trim().replace(/\s+/g, " ")
    )
    .filter(Boolean);

  if (!relatos.length) {
    return {
      sintese: "Nenhum relato foi informado.",
      manifestacoes: [],
      contexto: "Não informado.",
      lacunas: [],
    };
  }

  const trechos = relatos
    .map((texto) =>
      texto.length > 140
        ? `${texto.slice(0, 137)}...`
        : texto
    )
    .join(" | ");

  const sintese =
    `Ao longo de ${relatos.length} resposta(s), a pessoa compartilhou: ` +
    trechos.slice(0, 1050) +
    (trechos.length > 1050 ? "..." : "") +
    ". Esta síntese reproduz informações fornecidas, sem inferir causas ou diagnósticos.";

  return {
    sintese,

    manifestacoes: relatos.map(
      (texto, indice) => ({
        descricao:
          `Experiência relatada na resposta ${indice + 1}`,

        evidenciasDoRelato: [texto],

        ressalva:
          "Registro literal do relato, sem interpretação ou confirmação clínica.",
      })
    ),

    contexto:
      "As observações foram extraídas exclusivamente da conversa fictícia. Não foi verificada relação de causa e efeito entre as experiências relatadas.",

    lacunas: [
      "Duração e frequência das experiências, quando não esclarecidas na conversa.",
      "Impactos e circunstâncias relevantes, quando não informados pela pessoa.",
    ],
  };
}