import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./TriagemCientifica.css";

// ======================================================
// 1. CONFIGURAÇÕES
// ======================================================

const LIMITE_PADRAO = 5;

const PRIMEIRA =
  "Olá, tudo bem? Seja bem-vindo(a) à Elora. " +
  "O que fez você procurar a Elora hoje? " +
  "Me conte um pouco sobre você e sobre o que está acontecendo. " +
  "Pode compartilhar com suas próprias palavras, no seu tempo.";

// ======================================================
// 2. COMUNICAÇÃO COM O BACKEND
// ======================================================

async function requisitar(rota, dados) {
  let resposta;

  try {
    resposta = await fetch(
      `/api/triagem/${rota}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        cache: "no-store",

        body: JSON.stringify(dados),
      }
    );

  } catch {
    throw new Error(
      "Backend indisponível. Abra INICIAR_BACKEND.bat e mantenha o terminal aberto."
    );
  }

  const payload = await resposta
    .json()
    .catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      payload.erro ||
      `Falha na solicitação (${resposta.status}).`
    );
  }

  return payload;
}

// ======================================================
// 3. COMPONENTE
// ======================================================

export default function TriagemPerguntas() {
  const navigate = useNavigate();

  const [aceite, setAceite] =
    useState(false);

  const [sessao, setSessao] =
    useState(null);

  const [modo, setModo] =
    useState("demo");

  const [mensagens, setMensagens] =
    useState([]);

  const [texto, setTexto] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [ocupado, setOcupado] =
    useState(false);

  const [risco, setRisco] =
    useState(false);

  const [numeroRespostas, setNumeroRespostas] =
    useState(0);

  const [limiteRespostas, setLimiteRespostas] =
    useState(LIMITE_PADRAO);

  const campo = useRef(null);

  // ====================================================
  // 4. IDENTIFICAR O MODELO EM EXECUÇÃO
  // ====================================================

  useEffect(() => {
    let ativo = true;

    fetch("/api/triagem/saude", {
      cache: "no-store",
    })
      .then((resposta) => {
        if (!resposta.ok) return null;

        return resposta.json();
      })
      .then((dados) => {
        if (
          ativo &&
          dados?.modo
        ) {
          setModo(dados.modo);
        }
      })
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, []);

  // ====================================================
  // 5. INICIAR TRIAGEM
  // ====================================================

  async function iniciar() {
    if (!aceite || ocupado) return;

    setOcupado(true);
    setErro("");

    try {
      const resposta = await requisitar(
        "iniciar",
        {}
      );

      setSessao(resposta.sessaoId);

      setModo(
        resposta.modo || "demo"
      );

      const limite = Number(
        resposta.limite
      );

      setLimiteRespostas(
        Number.isInteger(limite) && limite > 0
          ? limite
          : LIMITE_PADRAO
      );

      setMensagens([
        {
          papel: "elora",
          texto:
            resposta.mensagem || PRIMEIRA,
        },
      ]);

      setRisco(false);
      setNumeroRespostas(0);
      setTexto("");

    } catch (e) {
      setErro(e.message);

    } finally {
      setOcupado(false);
    }
  }

  // ====================================================
  // 6. ENVIAR RESPOSTA
  // ====================================================

  async function enviar(evento) {
    evento.preventDefault();

    const mensagem = texto.trim();

    if (
      !sessao ||
      ocupado ||
      risco ||
      mensagem.length < 2 ||
      numeroRespostas >= limiteRespostas
    ) {
      return;
    }

    setOcupado(true);
    setErro("");

    try {
      const resposta = await requisitar(
        "mensagem",
        {
          sessaoId: sessao,
          texto: mensagem,
        }
      );

      const ocorreuRisco =
        resposta.tipo === "risco";

      const novoNumero =
        Number.isInteger(
          resposta.numeroRespostas
        )
          ? resposta.numeroRespostas
          : numeroRespostas + 1;

      const novoLimite =
        Number.isInteger(resposta.limite)
          ? resposta.limite
          : limiteRespostas;

      // Atualizar histórico visual.

      setMensagens((atual) => [
        ...atual,

        {
          papel: "paciente",
          texto: mensagem,
        },

        {
          papel: "elora",
          texto:
            resposta.mensagem ||
            "Não foi possível gerar uma resposta.",
        },
      ]);

      setTexto("");

      setLimiteRespostas(novoLimite);

      if (ocorreuRisco) {
        setRisco(true);
      } else {
        setNumeroRespostas(novoNumero);
      }

      // Não focar novamente se o limite foi atingido.

      if (
        !ocorreuRisco &&
        novoNumero < novoLimite
      ) {
        requestAnimationFrame(() => {
          campo.current?.focus();
        });
      }

    } catch (e) {
      setErro(e.message);

    } finally {
      setOcupado(false);
    }
  }

  // ====================================================
  // 7. GERAR RESUMO
  // ====================================================

  async function finalizar() {
    if (
      !sessao ||
      ocupado ||
      risco ||
      numeroRespostas < 1
    ) {
      return;
    }

    setOcupado(true);
    setErro("");

    try {
      const resumo = await requisitar(
        "finalizar",
        {
          sessaoId: sessao,
        }
      );

      setSessao(null);

      navigate(
        "/triagem/resumo",
        {
          state: {
            resumo,
          },
        }
      );

    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }

  // ====================================================
  // 8. ENCERRAR E APAGAR SESSÃO
  // ====================================================

  async function encerrar() {
    if (sessao) {
      await requisitar(
        "encerrar",
        {
          sessaoId: sessao,
        }
      ).catch(() => {});
    }

    setSessao(null);
    setMensagens([]);
    setRisco(false);
    setNumeroRespostas(0);
    setLimiteRespostas(LIMITE_PADRAO);
    setTexto("");
    setErro("");
  }

  // ====================================================
  // 9. IDENTIFICAÇÃO DO MODELO
  // ====================================================

  const nomeModo =
    modo === "ollama"
      ? "Ollama local"
      : "Simulação";

  const limiteAtingido =
    numeroRespostas >= limiteRespostas;

  // ====================================================
  // 10. INTERFACE
  // ====================================================

  return (
    <div className="ec-page">

      <header className="ec-header">

        <Link
          to="/"
          className="ec-brand"
        >
          <img
            src="/images/logo-elora.png"
            alt=""
          />

          <span>elora</span>
        </Link>

        <Link
          to="/triagem"
          className="ec-link"
          onClick={() => {
            if (sessao) {
              void requisitar(
                "encerrar",
                {
                  sessaoId: sessao,
                }
              ).catch(() => {});
            }
          }}
        >
          Sair da triagem
        </Link>

      </header>

      <main className="ec-shell">

        {/* LATERAL */}

        <aside className="ec-aside">

          <span className="ec-eyebrow">
            ELORA · TCC
          </span>

          <h1>
            Um espaço para <em>ser ouvido.</em>
          </h1>

          <p>
            A conversa parte do seu relato,
            não de um questionário sobre uma
            condição escolhida previamente.
          </p>

          <div className="ec-steps">

            <div>
              <strong>01</strong>
              <span>
                Compartilhar com suas palavras
              </span>
            </div>

            <div>
              <strong>02</strong>
              <span>
                Esclarecer o que for relevante
              </span>
            </div>

            <div>
              <strong>03</strong>
              <span>
                Organizar o relato sem diagnóstico
              </span>
            </div>

          </div>

          <p className="ec-legal">
            Protótipo acadêmico sem validação clínica.
            Não é atendimento psicológico, não monitora
            emergências e não avisa profissionais
            automaticamente.
          </p>

        </aside>

        {/* PAINEL PRINCIPAL */}

        <section
          className="ec-panel"
          aria-label="Triagem conversacional"
        >

          <div className="ec-panel-head">

            <div>

              <span className="ec-eyebrow">
                CONVERSA EXPLORATÓRIA
              </span>

              <h2>
                Como você tem se sentido?
              </h2>

            </div>

            <span className="ec-mode">
              {nomeModo}
            </span>

          </div>

          {!sessao ? (

            // ==========================================
            // TELA INICIAL
            // ==========================================

            <div className="ec-welcome">

              <div
                className="ec-orb"
                aria-hidden="true"
              >
                ✳
              </div>

              <h3>
                Começar a triagem
              </h3>

              <p>
                Esta versão é exclusiva para testes
                com <strong>relatos inventados</strong>.
                A Elora utiliza o contexto da conversa
                para formular perguntas e organizar
                as informações compartilhadas.

                Quando o Ollama está ativo, o processamento
                acontece localmente pelo modelo instalado.
              </p>

              <label className="ec-consent">

                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) =>
                    setAceite(e.target.checked)
                  }
                />

                <span>
                  Entendi que devo utilizar apenas
                  informações fictícias e que este
                  sistema não realiza diagnósticos.
                </span>

              </label>

              <button
                className="ec-primary"
                type="button"
                disabled={!aceite || ocupado}
                onClick={iniciar}
              >
                {ocupado
                  ? "Iniciando..."
                  : "Começar conversa →"}
              </button>

            </div>

          ) : (

            // ==========================================
            // CONVERSA
            // ==========================================

            <>

              <div
                className="ec-chat"
                role="log"
                aria-live="polite"
                aria-label="Mensagens da triagem"
              >

                {mensagens.map((m, i) => (

                  <div
                    className={`ec-bubble ${
                      m.papel === "paciente"
                        ? "ec-user"
                        : "ec-ai"
                    }`}
                    key={i}
                  >

                    <small>
                      {m.papel === "paciente"
                        ? "Relato fictício"
                        : "Elora"}
                    </small>

                    <p>
                      {m.texto}
                    </p>

                  </div>

                ))}

                {ocupado && (
                  <p className="ec-thinking">
                    Aguarde, processando...
                  </p>
                )}

              </div>

              {/* SITUAÇÃO DE RISCO */}

              {risco ? (

                <div
                  className="ec-risk"
                  role="alert"
                >
                  A conversa automática foi interrompida.

                  A Elora não monitora emergências.

                  Para recomeçar com outro exemplo fictício,
                  encerre esta sessão.
                </div>

              ) : (

                // ======================================
                // CAMPO DE RESPOSTA
                // ======================================

                <form
                  onSubmit={enviar}
                  className="ec-compose"
                >

                  <label htmlFor="ec-text">
                    Seu relato fictício
                  </label>

                  <textarea
                    ref={campo}
                    id="ec-text"
                    value={texto}
                    onChange={(e) =>
                      setTexto(e.target.value)
                    }
                    maxLength={1800}
                    rows={3}
                    disabled={
                      ocupado ||
                      limiteAtingido
                    }
                    placeholder={
                      limiteAtingido
                        ? "Limite atingido. Gere seu resumo para concluir."
                        : "Ex.: Ultimamente tenho me preocupado com a faculdade..."
                    }
                  />

                  <div className="ec-compose-bottom">

                    <small>
                      {texto.length}/1800 ·{" "}
                      {numeroRespostas}/{limiteRespostas} respostas
                    </small>

                    <button
                      className="ec-primary"
                      type="submit"
                      disabled={
                        ocupado ||
                        texto.trim().length < 2 ||
                        limiteAtingido
                      }
                    >
                      Enviar →
                    </button>

                  </div>

                </form>

              )}

              {/* LIMITE ATINGIDO */}

              {limiteAtingido && !risco && (

                <p className="ec-legal">
                  Você chegou ao limite de respostas
                  desta etapa. Já pode gerar seu resumo.
                </p>

              )}

              {/* AÇÕES */}

              <div className="ec-bottom-actions">

                <button
                  type="button"
                  className="ec-secondary"
                  disabled={ocupado}
                  onClick={encerrar}
                >
                  Encerrar e apagar sessão
                </button>

                {!risco && (

                  <button
                    type="button"
                    className="ec-secondary"
                    disabled={
                      ocupado ||
                      numeroRespostas < 1
                    }
                    onClick={finalizar}
                  >
                    Gerar resumo →
                  </button>

                )}

              </div>

            </>

          )}

          {/* ERROS */}

          {erro && (

            <p
              className="ec-error"
              role="alert"
            >
              {erro}
            </p>

          )}

        </section>

      </main>

    </div>
  );
}