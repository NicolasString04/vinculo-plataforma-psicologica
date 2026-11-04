import { Link } from "react-router-dom";
import "./Triagem.css";

const temas = [
  "Como tenho me sentido",
  "Minha rotina",
  "O que estou buscando",
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
              Este é um momento para olhar com calma para o que você está
              vivendo. Responda no seu tempo — não existe resposta certa ou
              errada.
            </p>

            <div className="triagem-tempo">
              <span className="triagem-tempo-icone" aria-hidden="true">
                ◷
              </span>
              <span>
                <strong>Leva cerca de 3 minutos</strong>
                <small>Você pode parar quando quiser.</small>
              </span>
            </div>

            <div className="triagem-nota">
              <span aria-hidden="true">✳</span>
              <p>
                A triagem é opcional e serve para apoiar a busca por
                atendimento. Ela não faz diagnóstico.
              </p>
            </div>
          </div>
        </section>

        <section className="triagem-caminho" aria-labelledby="triagem-titulo">
          <div className="triagem-progresso">
            <span className="triagem-progresso-numero">01</span>
            <span className="triagem-progresso-linha" />
            <span className="triagem-progresso-total">03 etapas</span>
          </div>

          <p className="triagem-etapa-label">SEU MOMENTO</p>
          <h2 id="triagem-titulo">Por onde vamos passar</h2>
          <p className="triagem-etapa-descricao">
            A conversa está organizada em três partes simples.
          </p>

          <div className="triagem-temas">
            {temas.map((tema, index) => (
              <div className="triagem-tema" key={tema}>
                <span className="triagem-tema-numero">0{index + 1}</span>
                <span>{tema}</span>
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

<p>
  Nesta versão, você vai percorrer exemplos fictícios
  para testar a triagem.
</p>

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