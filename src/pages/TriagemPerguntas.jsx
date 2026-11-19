
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { auth } from "../firebase";

import "./TriagemCientifica.css";

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const LIMITE_PADRAO = 5;

const PRIMEIRA =
  "Olá, tudo bem? Seja bem-vindo(a) à Elora. " +
  "O que fez você procurar a Elora hoje? " +
  "Me conte um pouco sobre você e sobre o que " +
  "está acontecendo, com suas próprias palavras.";

// ======================================================
// COMUNICAÇÃO COM O BACKEND
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
      "Backend indisponível. Inicie o servidor " +
      "da triagem e tente novamente."
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
// COMPONENTE PRINCIPAL
// ======================================================

export default function TriagemPerguntas() {
  const navigate = useNavigate();

  const campo = useRef(null);
  const chatRef = useRef(null);
  const contadorMensagens = useRef(0);

  // ====================================================
  // ESTADOS
  // ====================================================

  const [aceite, setAceite] = useState(false);
  const [sessao, setSessao] = useState(null);

  const [modo, setModo] = useState("demo");

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");

  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [aguardandoIA, setAguardandoIA] =
    useState(false);

  const [risco, setRisco] = useState(false);

  const [
    numeroRespostas,
    setNumeroRespostas,
  ] = useState(0);

  const [
    limiteRespostas,
    setLimiteRespostas,
  ] = useState(LIMITE_PADRAO);

  // ====================================================
  // IDENTIFICAR O MODO DA IA
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
        if (ativo && dados?.modo) {
          setModo(dados.modo);
        }
      })
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, []);

  // ====================================================
  // ROLAGEM AUTOMÁTICA DO CHAT
  //
  // Rola somente o elemento do histórico.
  // Não movimenta a página inteira.
  // ====================================================

  useLayoutEffect(() => {
    const chat = chatRef.current;

    if (!chat) return;

    chat.scrollTop = chat.scrollHeight;
  }, [
    mensagens,
    aguardandoIA,
    sessao,
  ]);

  // ====================================================
  // INICIAR TRIAGEM
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

      if (!resposta.sessaoId) {
        throw new Error(
          "O backend não retornou uma sessão válida."
        );
      }

      const limite = Number(resposta.limite);

      setSessao(resposta.sessaoId);

      setModo(
        resposta.modo || "demo"
      );

      setLimiteRespostas(
        Number.isInteger(limite) && limite > 0
          ? limite
          : LIMITE_PADRAO
      );

      // A abertura já entra como primeira
      // mensagem do histórico da conversa.

      setMensagens([
        {
          id: "abertura",
          papel: "elora",
          texto: resposta.mensagem || PRIMEIRA,
        },
      ]);

      setNumeroRespostas(0);
      setRisco(false);
      setTexto("");
      setAguardandoIA(false);

      requestAnimationFrame(() => {
        campo.current?.focus();
      });

    } catch (e) {
      setErro(e.message);

    } finally {
      setOcupado(false);
    }
  }

  // ====================================================
  // ENVIAR RESPOSTA
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
    setAguardandoIA(true);
    setErro("");

    const id = ++contadorMensagens.current;

    // Mostra o relato do paciente imediatamente,
    // sem aguardar o processamento da IA.

    setMensagens((atual) => [
      ...atual,
      {
        id: `paciente-${id}`,
        papel: "paciente",
        texto: mensagem,
      },
    ]);

    setTexto("");

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
        Number.isInteger(resposta.limite) &&
        resposta.limite > 0
          ? resposta.limite
          : limiteRespostas;

      // A resposta da IA também entra
      // no chat, como qualquer outra mensagem.

      setMensagens((atual) => [
        ...atual,
        {
          id: `elora-${id}`,
          papel: "elora",
          texto:
            resposta.mensagem ||
            "Não foi possível gerar uma resposta.",
        },
      ]);

      setLimiteRespostas(novoLimite);

      if (ocorreuRisco) {
        setRisco(true);
      } else {
        setNumeroRespostas(novoNumero);
      }

      // O foco retorna ao campo quando
      // ainda existem respostas disponíveis.

      if (
        !ocorreuRisco &&
        novoNumero < novoLimite
      ) {
        requestAnimationFrame(() => {
          campo.current?.focus();
        });
      }

    } catch (e) {
      // Se a solicitação falhar, restauramos
      // o texto e retiramos a mensagem visual
      // que ainda não recebeu confirmação.

      setMensagens((atual) =>
        atual.filter(
          (item) =>
            item.id !== `paciente-${id}`
        )
      );

      setTexto(mensagem);
      setErro(e.message);

    } finally {
      setAguardandoIA(false);
      setOcupado(false);
    }
  }

  // ====================================================
  // GERAR RESUMO
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

      navigate("/triagem/resumo", {
        state: { resumo },
        replace: true,
      });

    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }

  // ====================================================
  // ENCERRAR A SESSÃO
  // ====================================================

  async function encerrar() {
    const sessaoAtual = sessao;

    if (sessaoAtual) {
      await requisitar(
        "encerrar",
        {
          sessaoId: sessaoAtual,
        }
      ).catch(() => {});
    }

    setSessao(null);
    setMensagens([]);
    setTexto("");
    setErro("");
    setRisco(false);
    setAguardandoIA(false);
    setNumeroRespostas(0);
    setLimiteRespostas(LIMITE_PADRAO);
  }

  // ====================================================
  // VOLTAR AO INÍCIO
  // ====================================================

  async function voltarAoInicio() {
    if (ocupado) return;

    await encerrar();

    navigate(
      auth.currentUser
        ? "/cliente"
        : "/"
    );
  }

  // ====================================================
  // VOLTAR À APRESENTAÇÃO DA TRIAGEM
  // ====================================================

  function voltarParaTriagem() {
    if (ocupado || sessao) return;

    navigate("/triagem");
  }

  // ====================================================
  // ESTADOS DERIVADOS
  // ====================================================

  const limiteAtingido =
    numeroRespostas >= limiteRespostas;

  const nomeModo =
    modo === "ollama"
      ? "Ollama local"
      : modo === "demo"
        ? "Simulação"
        : "IA experimental";

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <div className="ec-page">

      {/* CABEÇALHO */}

      <header className="ec-header">
        <Link
          to="/"
          className="ec-brand"
          aria-label="Elora — início"
        >
          <img
            src="/images/logo-elora.png"
            alt=""
          />

          <span>elora</span>
        </Link>

        <button
          type="button"
          className="ec-header-exit"
          onClick={voltarAoInicio}
          disabled={ocupado}
        >
          <span aria-hidden="true">←</span>
          Voltar ao início
        </button>
      </header>

      <main className="ec-shell">

        {/* COLUNA ESQUERDA */}

        <aside className="ec-aside">
          <div
            className="ec-watermark"
            aria-hidden="true"
          />

          <p className="ec-eyebrow">
            UM ESPAÇO PARA VOCÊ
          </p>

          <h1>
            Uma conversa
            <br />
            no seu <em>tempo.</em>
          </h1>

          <p className="ec-aside-description">
            Conte com suas palavras o que está
            vivendo. A conversa se adapta ao relato
            e organiza as informações sem atribuir
            diagnósticos.
          </p>

          <div className="ec-aside-tempo">
            <span aria-hidden="true">
              ◷
            </span>

            <div>
              <strong>
                Triagem opcional{" "}
                {sessao
                  ? "em andamento"
                  : ""}
              </strong>

              <small>
                Você pode interromper quando quiser.
              </small>
            </div>
          </div>

          <p className="ec-aside-note">
            <span aria-hidden="true">
              ✳
            </span>

            Protótipo do TCC. Use apenas relatos
            fictícios. Não substitui atendimento
            psicológico e não monitora emergências.
          </p>
        </aside>

        {/* COLUNA DIREITA */}

        <section
          className={`ec-content ${
            sessao ? "ec-content-live" : ""
          }`}
          aria-label="Triagem conversacional"
        >

          {/* STATUS */}

          <div className="ec-top-row">
            <span className="ec-status">
              {sessao
                ? "Em andamento"
                : "Antes de começar"}
            </span>

            <span className="ec-mode">
              {nomeModo}
            </span>
          </div>

          <p className="ec-eyebrow">
            SUA CONVERSA
          </p>

          {/* ANTES DE COMEÇAR */}

          {!sessao ? (
            <>
              <h2>
                Vamos iniciar sua conversa?
              </h2>

              <div className="ec-before">
                <p>
                  Esta versão é destinada
                  exclusivamente a testes
                  acadêmicos com exemplos
                  fictícios. Ao continuar, uma
                  sessão temporária será iniciada
                  no backend da triagem.
                </p>

                <label className="ec-consent">
                  <input
                    type="checkbox"
                    checked={aceite}
                    onChange={(evento) =>
                      setAceite(
                        evento.target.checked
                      )
                    }
                  />

                  <span>
                    Entendi que devo usar somente
                    relatos fictícios e que a Elora
                    não realiza diagnósticos.
                  </span>
                </label>

                <div className="ec-before-actions">
                  <button
                    type="button"
                    className="ec-secondary ec-before-back"
                    onClick={voltarParaTriagem}
                    disabled={ocupado}
                  >
                    <span aria-hidden="true">
                      ←
                    </span>

                    Voltar
                  </button>

                  <button
                    type="button"
                    className="ec-primary ec-before-start"
                    onClick={iniciar}
                    disabled={!aceite || ocupado}
                  >
                    {ocupado
                      ? "Iniciando..."
                      : "Começar triagem"}

                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </>

          ) : (

            /* CONVERSA EM ANDAMENTO */

            <>

              {/* HISTÓRICO COMPLETO */}

              <div
                ref={chatRef}
                className="ec-chat ec-chat-expanded"
                role="log"
                aria-label="Histórico da conversa"
                aria-live="polite"
                aria-relevant="additions"
                aria-busy={aguardandoIA}
              >
                {mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`ec-bubble ${
                      mensagem.papel === "paciente"
                        ? "ec-user"
                        : "ec-ai"
                    }`}
                  >
                    <small>
                      {mensagem.papel === "paciente"
                        ? "Seu relato fictício"
                        : "Elora"}
                    </small>

                    <p>{mensagem.texto}</p>
                  </div>
                ))}

                {/* INDICADOR DE RESPOSTA */}

                {aguardandoIA && (
                  <div
                    className="ec-bubble ec-ai ec-thinking-bubble"
                    role="status"
                  >
                    <small>Elora</small>

                    <p>
                      Preparando sua resposta
                      <span
                        className="ec-thinking-dots"
                        aria-hidden="true"
                      >
                        <i />
                        <i />
                        <i />
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* SITUAÇÃO DE RISCO */}

              {risco ? (
                <div
                  className="ec-risk"
                  role="alert"
                >
                  <strong>
                    A conversa automática foi
                    interrompida.
                  </strong>

                  <p>
                    A Elora não acompanha emergências
                    nem comunica profissionais
                    automaticamente. Se houver risco
                    real e imediato, procure
                    atendimento de emergência.

                    No Brasil, SAMU: 192; apoio
                    emocional CVV: 188.
                  </p>
                </div>

              ) : limiteAtingido ? (

                /* LIMITE ATINGIDO */

                <p className="ec-complete">
                  Você concluiu as respostas desta
                  etapa. Pode gerar seu resumo.
                </p>

              ) : (

                /* CAMPO DE RESPOSTA */

                <form
                  className="ec-compose"
                  onSubmit={enviar}
                >
                  <label htmlFor="ec-text">
                    Sua resposta
                  </label>

                  <textarea
                    id="ec-text"
                    ref={campo}
                    rows={3}
                    maxLength={1800}
                    value={texto}
                    onChange={(evento) =>
                      setTexto(
                        evento.target.value
                      )
                    }
                    disabled={ocupado}
                    placeholder="Digite sua resposta..."
                  />

                  <div className="ec-compose-bottom">
                    <small>
                      {texto.length}/1800 caracteres
                      {" · "}
                      {numeroRespostas}/{limiteRespostas}
                      {" respostas"}
                    </small>

                    <button
                      type="submit"
                      className="ec-primary"
                      disabled={
                        ocupado ||
                        texto.trim().length < 2
                      }
                    >
                      {ocupado
                        ? "Processando..."
                        : "Enviar"}

                      <span aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* AÇÕES DA SESSÃO */}

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
                    className="ec-primary"
                    disabled={
                      ocupado ||
                      numeroRespostas < 1
                    }
                    onClick={finalizar}
                  >
                    {ocupado
                      ? "Gerando resumo..."
                      : "Gerar resumo"}

                    <span aria-hidden="true">
                      →
                    </span>
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
