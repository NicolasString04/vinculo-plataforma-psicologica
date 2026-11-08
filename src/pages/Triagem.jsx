import { Link } from "react-router-dom";
import "./Triagem.css";

const etapas = [
  "Seu relato, com suas palavras",
  "Perguntas conforme o contexto",
  "Resumo sem diagnóstico",
];

export default function Triagem() {
  return (
    <main className="triagem-page">
      <header className="triagem-header">
        <Link className="triagem-brand" to="/" aria-label="Elora — início">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link className="triagem-sair" to="/">
          Sair da triagem <span aria-hidden="true">×</span>
        </Link>
      </header>

      <div className="triagem-layout">
        <section className="triagem-intro">
          <div className="triagem-forma forma-azul" aria-hidden="true" />
          <div className="triagem-forma forma-lilas" aria-hidden="true" />
          <div className="triagem-forma forma-rosa" aria-hidden="true" />

          <div className="triagem-intro-conteudo">
            <p className="triagem-eyebrow">UM ESPAÇO PARA VOCÊ</p>

            <h1>
              Vamos começar
              <br />
              pelo que <em>você sente.</em>
            </h1>

            <p className="triagem-descricao">
              Conte com suas palavras o que está vivendo. A conversa
              se adapta ao relato e organiza as informações sem
              atribuir diagnósticos.
            </p>

            <div className="triagem-tempo">
              <span className="triagem-tempo-icone" aria-hidden="true">
                ◷
              </span>
              <span>
                <strong>Sem tempo fixo</strong>
                <small>Você pode interromper quando quiser.</small>
              </span>
            </div>

            <div className="triagem-nota">
              <span aria-hidden="true">✳</span>
              <p>
                Versão experimental do TCC. Use somente exemplos
                fictícios. Não substitui avaliação psicológica.
              </p>
            </div>
          </div>
        </section>

        <section className="triagem-caminho" aria-labelledby="triagem-titulo">
          <div className="triagem-progresso">
            <span className="triagem-progresso-numero">01</span>
            <span className="triagem-progresso-linha" />
            <span className="triagem-progresso-total">03 momentos</span>
          </div>

          <p className="triagem-etapa-label">SEU MOMENTO</p>
          <h2 id="triagem-titulo">Como funciona a conversa</h2>

          <p className="triagem-etapa-descricao">
            Não há um tema clínico escolhido antecipadamente.
          </p>

          <div className="triagem-temas">
            {etapas.map((etapa, index) => (
              <div className="triagem-tema" key={etapa}>
                <span className="triagem-tema-numero">0{index + 1}</span>
                <span>{etapa}</span>
                <span className="triagem-tema-simbolo" aria-hidden="true">
                  {index === 0 ? "↗" : "·"}
                </span>
              </div>
            ))}
          </div>

          <div className="triagem-acao">
            <Link
              to="/triagem/perguntas"
              className="triagem-continuar"
              style={{ textDecoration: "none" }}
            >
              Começar com calma <span aria-hidden="true">→</span>
            </Link>

            <p>Somente para testar com relatos inventados.</p>

            <Link className="triagem-pular" to="/triagem/concluida">
              Prévia da tela de conclusão →
            </Link>
          </div>
        </section>
      </div>

      <footer className="triagem-footer">
        <span>Elora · Psicologia online</span>
        <span>Protótipo acadêmico em desenvolvimento</span>
      </footer>
    </main>
  );
}