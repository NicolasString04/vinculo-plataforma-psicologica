
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import "./Triagem.css";

const etapas = [
  "Seu relato, com suas palavras",
  "Perguntas conforme o contexto",
  "Resumo sem diagnóstico",
];

export default function Triagem() {
  const destinoInicio = auth.currentUser ? "/cliente" : "/";

  return (
    <div className="triagem-page">
      <header className="triagem-header">
        <Link
          className="triagem-brand"
          to="/"
          aria-label="Elora — página inicial"
        >
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link className="triagem-sair" to={destinoInicio}>
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>
      </header>

      <main className="triagem-layout">
        <section
          className="triagem-intro"
          aria-labelledby="triagem-titulo-inicio"
        >
          <div
            className="triagem-marca-dagua"
            aria-hidden="true"
          />

          <p className="triagem-eyebrow">
            UM ESPAÇO PARA VOCÊ
          </p>

          <h1 id="triagem-titulo-inicio">
            Vamos começar
            <br />
            pelo que <em>você sente.</em>
          </h1>

          <p className="triagem-descricao">
            A triagem é opcional. Seu relato pode ajudar
            o psicólogo a compreender o que você precisa
            neste momento.
          </p>

          <div className="triagem-tempo">
            <span
              className="triagem-tempo-icone"
              aria-hidden="true"
            >
              ◷
            </span>

            <div>
              <strong>Sem tempo fixo</strong>
              <small>
                Você pode interromper quando quiser.
              </small>
            </div>
          </div>

          <p className="triagem-nota">
            <span aria-hidden="true">✳</span>
            Versão experimental do TCC. Use somente
            exemplos fictícios. Não substitui avaliação
            psicológica.
          </p>
        </section>

        <section
          className="triagem-caminho"
          aria-labelledby="triagem-titulo"
        >
          <div
            className="triagem-progresso"
            aria-label="Etapa 1 de 3"
          >
            <strong>01</strong>
            <span aria-hidden="true" />
            <small>03 momentos</small>
          </div>

          <p className="triagem-eyebrow">
            SEU MOMENTO
          </p>

          <h2 id="triagem-titulo">
            Quer começar sua triagem agora?
          </h2>

          <div className="triagem-temas">
            {etapas.map((etapa, index) => (
              <div
                className="triagem-tema"
                key={etapa}
              >
                <span>0{index + 1}</span>
                <p>{etapa}</p>
              </div>
            ))}
          </div>

          <div className="triagem-acoes">
            <Link
              className="triagem-continuar"
              to="/triagem/perguntas"
            >
              Começar triagem
              <span aria-hidden="true">→</span>
            </Link>


<Link
  className="triagem-pular"
  to="/cliente"
>
  Pular por enquanto
</Link>

          </div>

          <p className="triagem-rodape-acao">
            Você também pode fazer depois, na área do
            paciente.
          </p>
        </section>
      </main>
    </div>
  );
}
