
import { normalizar } from "./biblioteca/busca.mjs";

import {
  BENJAMIN_CHAPTER_05,
} from "./biblioteca/ai/knowledge/benjamin/chapter-05.mjs";

import {
  BENJAMIN_INTERVIEW_RULES,
} from "./biblioteca/ai/prompts/benjamin-rules.mjs";


// ======================================================
// 1. CONHECIMENTO METODOLÓGICO DE BENJAMIN
// ======================================================

function montarConhecimentoBenjamin() {
  const principios = (
    BENJAMIN_CHAPTER_05.principles ?? []
  ).map((item) => {
    return `
Princípio: ${item.title}
Conceito: ${item.concept}
Orientações: ${(item.rules ?? []).join("; ")}
Referência: página ${item.sourcePages ?? "não informada"}
`;
  }).join("\n");

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
// 2. CONTROLE DE REPETIÇÃO
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
]);

function palavrasRelevantes(texto) {
  return new Set(
    (normalizar(texto).match(/[a-z]{3,}/g) ?? [])
      .filter((p) => !PALAVRAS_COMUNS.has(p))
  );
}

function semelhanca(a, b) {
  const pa = palavrasRelevantes(a);
  const pb = palavrasRelevantes(b);

  if (!pa.size || !pb.size) return 0;

  const comuns = [...pa].filter(
    (p) => pb.has(p)
  ).length;

  const uniao = new Set([...pa, ...pb]).size;

  return comuns / uniao;
}

function jaFoiPerguntado(pergunta, historico) {
  return historico
    .filter((item) => item.papel === "elora")
    .some((item) =>
      semelhanca(pergunta, item.texto) >= 0.55
    );
}


// ======================================================
// 3. EXTRAÇÃO DA MENSAGEM DA IA
// ======================================================

function limparMensagem(saida) {
  const original = String(saida ?? "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();

  const risco =
    /\bRISCO\s*:\s*(SIM|POSSIVEL)\b/i.test(original)
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
    .replace(/^\s*["'“”•*-]+\s*/, "")
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

function extrairPergunta(mensagem) {
  const indice = mensagem.lastIndexOf("?");

  if (indice === -1) return null;

  const inicio = Math.max(
    mensagem.lastIndexOf(".", indice),
    mensagem.lastIndexOf("!", indice)
  );

  return mensagem
    .slice(inicio + 1, indice + 1)
    .trim();
}


// ======================================================
// 4. ALTERNATIVAS PARA FALHAS DO MODELO
// ======================================================

function mensagemDeReserva(historico) {
  const ultimo = [...historico]
    .reverse()
    .find((item) => item.papel === "paciente")
    ?.texto ?? "";

  const t = normalizar(ultimo);

  const candidatos = [];

  if (/triste|solidao|sozinh|saudade/.test(t)) {
    candidatos.push(
      "Você mencionou que a solidão tem sido difícil. O que mais tem pesado nessa experiência para você?"
    );
  }

  if (/cans|exaust|energia|esgot/.test(t)) {
    candidatos.push(
      "Você comentou sobre o cansaço que vem sentindo. Quando começou a perceber essa mudança?"
    );
  }

  if (/trabalh|empreg|chef|servico/.test(t)) {
    candidatos.push(
      "Parece que o trabalho tem ocupado um espaço importante nesse relato. O que mais gostaria de compartilhar sobre isso?"
    );
  }

  if (/sono|dorm|descans/.test(t)) {
    candidatos.push(
      "Você comentou sobre suas dificuldades com o sono. Como isso tem afetado seus dias?"
    );
  }

  if (/famil|relacion|namor|parceir/.test(t)) {
    candidatos.push(
      "Você trouxe uma questão importante sobre seus relacionamentos. O que gostaria de explorar melhor nessa situação?"
    );
  }

  candidatos.push(
    "Podemos continuar olhando com calma para o que você considera mais importante neste momento."
  );

  return candidatos.find(
    (p) => {
      const pergunta = extrairPergunta(p);

      return !pergunta ||
        !jaFoiPerguntado(pergunta, historico);
    }
  ) ?? candidatos[candidatos.length - 1];
}


// ======================================================
// 5. COMUNICAÇÃO COM O OLLAMA
// ======================================================

async function conversarComOllama({
  historico,
  conhecimentos,
  model,
  ollamaUrl,
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

    const anteriores = historico
      .filter((item) => item.papel === "elora")
      .slice(-5)
      .map((item) => item.texto);

    const instrucoes = `
# IDENTIDADE

Você é Elora, uma assistente virtual experimental
de triagem psicológica.

Converse em português brasileiro.

Seu objetivo é conduzir uma conversa exploratória
natural, respeitosa e contextualizada.

# METODOLOGIA DE ENTREVISTA

Utilize os princípios metodológicos de
A Entrevista de Ajuda, de Alfred Benjamin.

${BENJAMIN_INTERVIEW_RULES}

# CONHECIMENTO METODOLÓGICO ESTRUTURADO

${CONHECIMENTO_BENJAMIN}

# CONDUÇÃO DA CONVERSA

Leia todo o histórico antes de responder.

Não trate cada resposta como uma conversa independente.

Identifique o que a pessoa realmente acrescentou
ao relato anterior.

Sua resposta deve:

1. Reconhecer brevemente algo relevante do relato.
2. Demonstrar que considerou o contexto anterior.
3. Aprofundar um aspecto que ainda não foi esclarecido,
   quando isso for útil.
4. Fazer no máximo uma pergunta por mensagem.

Você NÃO precisa fazer uma pergunta em todas as respostas.

Às vezes, uma reflexão ou um convite para continuar
é mais adequado do que outra pergunta.

# NATURALIDADE

Não utilize sempre a mesma estrutura.

Evite começar todas as respostas com:
- Entendo.
- Compreendo.
- Obrigado por compartilhar.
- Imagino como deve ser difícil.

Não repita o relato inteiro da pessoa.

Não faça comentários artificiais ou excessivamente formais.

Não transforme a conversa em um formulário.

Não siga uma sequência fixa de perguntas.

Escolha o próximo assunto de acordo com o que
a pessoa já compartilhou.

# LIMITES

Não atribua diagnósticos.

Não presuma causas.

Não invente sintomas.

Não apresente interpretações como fatos.

Não sugira que a pessoa possui determinada condição
psicológica.

As referências clínicas ainda não devem ser utilizadas
para estabelecer hipóteses nesta etapa.

# SEGURANÇA

Se houver indicação de ideação suicida,
automutilação ou perigo imediato:

- Marque RISCO: SIM.
- Priorize o protocolo de segurança.
- Não continue a entrevista comum como se nada
  tivesse acontecido.
- Utilize perguntas diretas quando necessárias.

Não confunda tristeza ou cansaço isolados
com confirmação de risco.

# HISTÓRICO DE PERGUNTAS

Não repita perguntas anteriores:

${JSON.stringify(anteriores)}

# CONHECIMENTOS COMPLEMENTARES

${notas}

# FORMATO DA RESPOSTA

Retorne exatamente:

MENSAGEM: [resposta natural, breve, com no máximo uma pergunta]

RISCO: SIM ou NAO

Não inclua explicações sobre as instruções.
Não gere listas ou JSON.
`;

    const mensagens = [
      {
        role: "system",
        content: instrucoes,
      },

      ...historico.slice(-10).map((item) => ({
        role:
          item.papel === "paciente"
            ? "user"
            : "assistant",

        content: String(item.texto ?? "").slice(0, 900),
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
            temperature: 0.55,
            num_ctx: 4096,
            num_predict: 180,
          },

          keep_alive: "2m",
        }),
      }
    );

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();

    return dados?.message?.content ?? "";

  } finally {
    clearTimeout(temporizador);
  }
}


// ======================================================
// 6. GERAÇÃO DA RESPOSTA DA ELORA
// ======================================================

export async function gerarPergunta({
  historico = [],
  conhecimentos = [],
  model,
  ollamaUrl,
  demo = false,
}) {
  if (demo) {
    return {
      mensagem: mensagemDeReserva(historico),
      risco: "nao_identificado",
      origem: "demo",
    };
  }

  try {
    const texto = await conversarComOllama({
      historico,
      conhecimentos,
      model,
      ollamaUrl,
    });

    const resultado = limparMensagem(texto);

    if (resultado.risco === "possivel") {
      return {
        mensagem:
          resultado.mensagem ??
          mensagemDeReserva(historico),

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
        !jaFoiPerguntado(pergunta, historico)
      ) {
        return {
          mensagem: resultado.mensagem,
          risco: "nao_identificado",
          origem: "ollama",
        };
      }
    }

    console.warn(
      "Elora: mensagem inválida ou repetitiva. Utilizando alternativa."
    );

  } catch (erro) {
    console.warn(
      "Elora: falha na comunicação com Ollama:",
      erro?.message
    );
  }

  return {
    mensagem: mensagemDeReserva(historico),
    risco: "nao_identificado",
    origem: "fallback",
  };
}


// ======================================================
// 7. GERAÇÃO DO RESUMO
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

    manifestacoes: relatos.map((texto, indice) => ({
      descricao:
        `Experiência relatada na resposta ${indice + 1}`,

      evidenciasDoRelato: [texto],

      ressalva:
        "Registro literal do relato, sem interpretação ou confirmação clínica.",
    })),

    contexto:
      "As observações foram extraídas exclusivamente da conversa fictícia. Não foi verificada relação de causa e efeito entre as experiências relatadas.",

    lacunas: [
      "Duração e frequência das experiências, quando não esclarecidas na conversa.",
      "Impactos e circunstâncias relevantes, quando não informados pela pessoa.",
    ],
  };
}
