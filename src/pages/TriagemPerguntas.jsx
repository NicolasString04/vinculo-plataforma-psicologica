import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TriagemCientifica.css";

const PRIMEIRA =
  "Olá. Este é um protótipo acadêmico da Elora. Com suas palavras, o que você gostaria de compartilhar?";

async function requisitar(rota, dados) {
  let resposta;

  try {
    resposta = await fetch(`/api/triagem/${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error(
      "Backend indisponível. Abra INICIAR_BACKEND.bat e mantenha o terminal aberto."
    );
  }

  const payload = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      payload.erro || `Falha na solicitação (${resposta.status}).`
    );
  }

  return payload;
}

export default function TriagemPerguntas() {
  const navigate = useNavigate();

  const [aceite, setAceite] = useState(false);
  const [sessao, setSessao] = useState(null);
  const [modo, setModo] = useState("demo");
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [risco, setRisco] = useState(false);
  const [numeroRespostas, setNumeroRespostas] = useState(0);

  const campo = useRef(null);

  async function iniciar() {
    if (!aceite || ocupado) return;

    setOcupado(true);
    setErro("");

    try {
      const resposta = await requisitar("iniciar", {});

      setSessao(resposta.sessaoId);
      setModo(resposta.modo);
      setMensagens([
        {
          papel: "elora",
          texto: resposta.mensagem || PRIMEIRA,
        },
      ]);

      setRisco(false);
      setNumeroRespostas(0);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  async function enviar(evento) {
    evento.preventDefault();

    const mensagem = texto.trim();

    if (!sessao || ocupado || risco || mensagem.length < 2) return;

    setOcupado(true);
    setErro("");

    try {
      const resposta = await requisitar("mensagem", {
        sessaoId: sessao,
        texto: mensagem,
      });

      setMensagens((atual) => [
        ...atual,
        { papel: "paciente", texto: mensagem },
        { papel: "elora", texto: resposta.mensagem },
      ]);

      setTexto("");

      if (resposta.tipo === "risco") {
        setRisco(true);
      } else {
        setNumeroRespostas(resposta.numeroRespostas);
      }

      requestAnimationFrame(() => campo.current?.focus());
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  async function finalizar() {
    if (!sessao || ocupado || risco || numeroRespostas < 1) return;

    setOcupado(true);
    setErro("");

    try {
      const resumo = await requisitar("finalizar", {
        sessaoId: sessao,
      });

      setSessao(null);

      navigate("/triagem/resumo", {
        state: { resumo },
      });
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }

  async function encerrar() {
    if (sessao) {
      await requisitar("encerrar", {
        sessaoId: sessao,
      }).catch(() => {});
    }

    setSessao(null);
    setMensagens([]);
    setRisco(false);
    setNumeroRespostas(0);
    setTexto("");
  }

  return (
    <div className="ec-page">
      <header className="ec-header">
        <Link to="/" className="ec-brand">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link
          to="/triagem"
          className="ec-link"
          onClick={() => {
            if (sessao) {
              void requisitar("encerrar", {
                sessaoId: sessao,
              }).catch(() => {});
            }
          }}
        >
          Sair da triagem
        </Link>
      </header>

      <main className="ec-shell">
        <aside className="ec-aside">
          <span className="ec-eyebrow">ELORA · TCC</span>

          <h1>
            Um espaço para <em>ser ouvido.</em>
          </h1>

          <p>
            A conversa parte do seu relato, não de um questionário
            sobre uma condição escolhida previamente.
          </p>

          <div className="ec-steps">
            <div>
              <strong>01</strong>
              <span>Compartilhar com suas palavras</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Esclarecer o que for relevante</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Organizar o relato sem diagnóstico</span>
            </div>
          </div>

          <p className="ec-legal">
            Protótipo acadêmico sem validação clínica. Não é atendimento
            psicológico, não monitora emergências e não avisa
            profissionais automaticamente.
          </p>
        </aside>

        <section className="ec-panel" aria-label="Triagem conversacional">
          <div className="ec-panel-head">
            <div>
              <span className="ec-eyebrow">
                CONVERSA EXPLORATÓRIA
              </span>

              <h2>Como você tem se sentido?</h2>
            </div>

            <span className="ec-mode">
              {modo === "demo" ? "Simulação" : "OpenAI"}
            </span>
          </div>

          {!sessao ? (
            <div className="ec-welcome">
              <div className="ec-orb" aria-hidden="true">
                ✳
              </div>

              <h3>Começar a triagem</h3>

              <p>
                Esta versão é exclusiva para testes com{" "}
                <strong>relatos inventados</strong>. No modo OpenAI,
                as mensagens são enviadas à API externa para gerar
                perguntas e resumos.
              </p>

              <label className="ec-consent">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)}
                />

                <span>
                  Entendi que devo utilizar apenas informações
                  fictícias e que este sistema não realiza diagnósticos.
                </span>
              </label>

              <button
                className="ec-primary"
                type="button"
                disabled={!aceite || ocupado}
                onClick={iniciar}
              >
                {ocupado ? "Iniciando..." : "Começar conversa →"}
              </button>
            </div>
          ) : (
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
                      m.papel === "paciente" ? "ec-user" : "ec-ai"
                    }`}
                    key={i}
                  >
                    <small>
                      {m.papel === "paciente"
                        ? "Relato fictício"
                        : "Elora"}
                    </small>

                    <p>{m.texto}</p>
                  </div>
                ))}

                {ocupado && (
                  <p className="ec-thinking">
                    Aguarde, processando...
                  </p>
                )}
              </div>

              {risco ? (
                <div className="ec-risk" role="alert">
                  A conversa automática foi interrompida.
                  A Elora não monitora emergências.
                  Para recomeçar com outro exemplo fictício,
                  encerre esta sessão.
                </div>
              ) : (
                <form onSubmit={enviar} className="ec-compose">
                  <label htmlFor="ec-text">
                    Seu relato fictício
                  </label>

                  <textarea
                    ref={campo}
                    id="ec-text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    maxLength={1800}
                    rows={3}
                    disabled={ocupado || numeroRespostas >= 12}
                    placeholder="Ex.: Ultimamente tenho me preocupado com a faculdade..."
                  />

                  <div className="ec-compose-bottom">
                    <small>
                      {texto.length}/1800 · {numeroRespostas}/12 respostas
                    </small>

                    <button
                      className="ec-primary"
                      type="submit"
                      disabled={
                        ocupado ||
                        texto.trim().length < 2 ||
                        numeroRespostas >= 12
                      }
                    >
                      Enviar →
                    </button>
                  </div>
                </form>
              )}

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
                    disabled={ocupado || numeroRespostas < 1}
                    onClick={finalizar}
                  >
                    Gerar resumo →
                  </button>
                )}
              </div>
            </>
          )}

          {erro && (
            <p className="ec-error" role="alert">
              {erro}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}