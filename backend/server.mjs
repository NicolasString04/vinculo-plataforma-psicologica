
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import {
  buscarConhecimento,
  fontesDisponibilizadas,
} from "./biblioteca/busca.mjs";

import {
  CONHECIMENTOS,
} from "./biblioteca/conhecimentos.mjs";

import {
  gerarPergunta,
  gerarResumo,
} from "./ia.mjs";

import {
  AVISO,
  AVISO_TESTE,
  ORIENTACAO_CRITICA,
  sinalDeRisco,
} from "./seguranca.mjs";

const RAIZ = dirname(
  fileURLToPath(import.meta.url)
);

function carregarEnv() {
  const caminho = join(RAIZ, ".env");

  if (!existsSync(caminho)) return;

  for (
    const linha of readFileSync(
      caminho,
      "utf8"
    ).split(/\r?\n/)
  ) {
    const par = linha.match(
      /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/
    );

    if (
      !par ||
      par[2].startsWith("#") ||
      process.env[par[1]] !== undefined
    ) {
      continue;
    }

    process.env[par[1]] = par[2].replace(
      /^(['"])(.*)\1$/,
      "$2"
    );
  }
}

carregarEnv();

const PORTA = Number(
  process.env.ELORA_PORT ?? 8787
);

const MODO = (
  process.env.ELORA_MODO ?? "demo"
).toLowerCase();

const MODELO =
  process.env.OLLAMA_MODEL ??
  "qwen2.5:1.5b";

const OLLAMA_URL =
  process.env.OLLAMA_URL ??
  "http://127.0.0.1:11434";

if (!["demo", "ollama"].includes(MODO)) {
  throw new Error(
    "ELORA_MODO deve ser 'demo' ou 'ollama'."
  );
}

const TEMPO_SESSAO = 30 * 60 * 1000;
const MAX_RESPOSTAS = 5;

const sessoes = new Map();
const limites = new Map();

function enviarJson(res, codigo, dados) {
  res.writeHead(codigo, {
    "Content-Type":
      "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });

  res.end(JSON.stringify(dados));
}

async function lerJson(req) {
  let texto = "";

  for await (const parte of req) {
    texto += parte.toString("utf8");

    if (texto.length > 12000) {
      throw Object.assign(
        new Error("Mensagem muito longa."),
        { status: 413 }
      );
    }
  }

  try {
    return JSON.parse(texto || "{}");
  } catch {
    throw Object.assign(
      new Error("JSON inválido."),
      { status: 400 }
    );
  }
}

function limparExpirados() {
  const agora = Date.now();

  for (const [id, sessao] of sessoes) {
    if (
      agora - sessao.atualizadaEm >
      TEMPO_SESSAO
    ) {
      sessoes.delete(id);
    }
  }

  for (const [ip, limite] of limites) {
    if (agora - limite.inicio > 60000) {
      limites.delete(ip);
    }
  }
}

function excedeuLimite(req) {
  const ip =
    req.socket.remoteAddress ?? "local";

  const agora = Date.now();
  let registro = limites.get(ip);

  if (
    !registro ||
    agora - registro.inicio > 60000
  ) {
    registro = {
      inicio: agora,
      total: 0,
    };
  }

  registro.total += 1;
  limites.set(ip, registro);

  return registro.total > 35;
}

function obterSessao(id) {
  const sessao =
    typeof id === "string"
      ? sessoes.get(id)
      : null;

  if (!sessao) {
    throw Object.assign(
      new Error(
        "Sessão encerrada ou expirada. Recomece a triagem."
      ),
      { status: 404 }
    );
  }

  sessao.atualizadaEm = Date.now();

  return sessao;
}

function conhecimentosUsados(sessao) {
  return CONHECIMENTOS.filter(
    (item) =>
      sessao.idsConhecimento.has(item.id)
  );
}

async function conferirOllama() {
  if (MODO === "demo") return;

  try {
    const resposta = await fetch(
      `${OLLAMA_URL.replace(/\/+$/, "")}/api/tags`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!resposta.ok) {
      throw new Error(
        "O serviço Ollama não respondeu corretamente."
      );
    }

    const dados = await resposta.json();

    const instalado = (
      dados.models ?? []
    ).some(
      (item) =>
        item.name === MODELO ||
        item.model === MODELO
    );

    if (!instalado) {
      throw new Error(
        `O modelo ${MODELO} não está instalado. ` +
        `Execute: ollama pull ${MODELO}`
      );
    }
  } catch (erro) {
    if (
      erro.message?.includes(
        "não está instalado"
      )
    ) {
      throw erro;
    }

    throw new Error(
      "Não foi possível acessar o Ollama local. " +
      "Abra o aplicativo e confira a porta 11434."
    );
  }
}

export function criarServidor() {
  return http.createServer(
    async (req, res) => {
      limparExpirados();

      if (excedeuLimite(req)) {
        return enviarJson(res, 429, {
          erro:
            "Muitas solicitações. Aguarde um minuto.",
        });
      }

      const origem = req.headers.origin;

      if (
        origem &&
        !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
          origem
        )
      ) {
        return enviarJson(res, 403, {
          erro: "Origem não autorizada.",
        });
      }

      if (
        req.method === "GET" &&
        req.url === "/api/triagem/saude"
      ) {
        return enviarJson(res, 200, {
          ok: true,
          modo: MODO,

          modelo:
            MODO === "ollama"
              ? MODELO
              : null,

          aviso: AVISO_TESTE,
        });
      }

      if (
        !req.url?.startsWith(
          "/api/triagem/"
        )
      ) {
        return enviarJson(res, 404, {
          erro: "Rota não encontrada.",
        });
      }

      if (req.method !== "POST") {
        return enviarJson(res, 405, {
          erro: "Método não permitido.",
        });
      }

      try {
        const dados = await lerJson(req);

        // INICIAR TRIAGEM

        if (
          req.url ===
          "/api/triagem/iniciar"
        ) {
          await conferirOllama();

          const id = randomUUID();

          sessoes.set(id, {
            historico: [],
            idsConhecimento: new Set(),
            atualizadaEm: Date.now(),
            risco: false,
            ocupado: false,
          });

          return enviarJson(res, 200, {
            sessaoId: id,

            mensagem:
              "Olá. Este é um protótipo acadêmico da Elora. " +
              "Com suas palavras, o que você gostaria de compartilhar?",

            modo: MODO,
            aviso: AVISO_TESTE,
          });
        }

        // ENCERRAR E APAGAR SESSÃO

        if (
          req.url ===
          "/api/triagem/encerrar"
        ) {
          obterSessao(dados.sessaoId);

          sessoes.delete(
            dados.sessaoId
          );

          return enviarJson(res, 200, {
            encerrada: true,
          });
        }

        // CONVERSAR

        if (
          req.url ===
          "/api/triagem/mensagem"
        ) {
          const sessao = obterSessao(
            dados.sessaoId
          );

          if (sessao.ocupado) {
            return enviarJson(res, 409, {
              erro:
                "Aguarde a resposta anterior.",
            });
          }

          if (sessao.risco) {
            return enviarJson(res, 200, {
              tipo: "risco",
              mensagem:
                ORIENTACAO_CRITICA,
            });
          }

          const texto = dados.texto;

          if (
            typeof texto !== "string" ||
            texto.trim().length < 2 ||
            texto.length > 1800
          ) {
            return enviarJson(res, 400, {
              erro:
                "Escreva uma mensagem entre 2 e 1800 caracteres.",
            });
          }

          const total =
            sessao.historico.filter(
              (m) =>
                m.papel === "paciente"
            ).length;

          if (
            total >= MAX_RESPOSTAS
          ) {
            return enviarJson(res, 400, {
              erro:
                "Limite de mensagens atingido. Finalize o resumo.",
            });
          }

          sessao.ocupado = true;

          try {
            if (sinalDeRisco(texto)) {
              sessao.risco = true;

              return enviarJson(
                res,
                200,
                {
                  tipo: "risco",
                  mensagem:
                    ORIENTACAO_CRITICA,
                }
              );
            }

            const historico = [
              ...sessao.historico,
              {
                papel: "paciente",
                texto: texto.trim(),
              },
            ];

            const busca = historico
              .filter(
                (m) =>
                  m.papel === "paciente"
              )
              .slice(-3)
              .map((m) => m.texto)
              .join(" ");

            const conhecimentos =
              buscarConhecimento(busca);

            const resposta =
              await gerarPergunta({
                historico,
                conhecimentos,
                model: MODELO,
                ollamaUrl: OLLAMA_URL,
                demo:
                  MODO === "demo",
              });

            if (
              resposta.risco ===
              "possivel"
            ) {
              sessao.risco = true;

              return enviarJson(
                res,
                200,
                {
                  tipo: "risco",
                  mensagem:
                    ORIENTACAO_CRITICA,
                }
              );
            }

            sessao.historico = [
              ...historico,
              {
                papel: "elora",
                texto:
                  resposta.mensagem.slice(
                    0,
                    1500
                  ),
              },
            ];

            for (
              const item of conhecimentos
            ) {
              sessao.idsConhecimento.add(
                item.id
              );
            }

            return enviarJson(
              res,
              200,
              {
                tipo: "pergunta",

                mensagem:
                  resposta.mensagem.slice(
                    0,
                    1500
                  ),

                numeroRespostas:
                  total + 1,

                limite: MAX_RESPOSTAS,
              }
            );
          } finally {
            sessao.ocupado = false;
          }
        }

        // GERAR RELATÓRIO

        if (
          req.url ===
          "/api/triagem/finalizar"
        ) {
          const sessao = obterSessao(
            dados.sessaoId
          );

          if (sessao.ocupado) {
            return enviarJson(res, 409, {
              erro:
                "Aguarde a resposta anterior.",
            });
          }

          if (sessao.risco) {
            return enviarJson(res, 403, {
              erro:
                "Em situação de risco, o resumo automático está indisponível.",
            });
          }

          if (
            !sessao.historico.some(
              (m) =>
                m.papel === "paciente"
            )
          ) {
            return enviarJson(res, 400, {
              erro:
                "Compartilhe ao menos um relato fictício antes de finalizar.",
            });
          }

          sessao.ocupado = true;

          try {
            const conhecimentos =
              conhecimentosUsados(
                sessao
              );

            const resumo =
              await gerarResumo({
                historico:
                  sessao.historico,

                conhecimentos,

                model: MODELO,

                ollamaUrl: OLLAMA_URL,

                demo:
                  MODO === "demo",
              });

            const resultado = {
              ...resumo,

              aviso: AVISO,
              avisoTeste: AVISO_TESTE,

              fontes:
                fontesDisponibilizadas(
                  conhecimentos
                ).map((fonte) => ({
                  ...fonte,

                  observacao:
                    "Referência catalogada; não significa que o texto integral tenha sido consultado.",
                })),

              status:
                "prototipo_sem_validacao_clinica",

              modo: MODO,
            };

            sessoes.delete(
              dados.sessaoId
            );

            return enviarJson(
              res,
              200,
              resultado
            );
          } finally {
            sessao.ocupado = false;
          }
        }

        return enviarJson(res, 404, {
          erro: "Rota não encontrada.",
        });
      } catch (erro) {
        // Não registrar relatos nem dados
        // pessoais no terminal.

        const codigo =
          Number.isInteger(erro.status)
            ? erro.status
            : 502;

        return enviarJson(res, codigo, {
          erro:
            erro.message ||
            "Falha ao processar a solicitação.",
        });
      }
    }
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) ===
    process.argv[1]
) {
  criarServidor().listen(
    PORTA,
    "127.0.0.1",
    () => {
      console.log(
        `Elora backend local: http://127.0.0.1:${PORTA} | modo ${MODO.toUpperCase()}`
      );

      if (MODO === "ollama") {
        console.log(
          `Modelo local: ${MODELO}`
        );
      }

      console.log(
        "Use somente relatos fictícios. Encerre com Ctrl+C."
      );
    }
  );
}
