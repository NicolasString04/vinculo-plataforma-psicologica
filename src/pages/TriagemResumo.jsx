import { Link, useLocation } from "react-router-dom";
import "./TriagemCientifica.css";

export default function TriagemResumo() {
  const { state } = useLocation();
  const resumo = state?.resumo;

  if (!resumo) {
    return (
      <main className="ec-empty">
        <h1>O resumo não está disponível.</h1>

        <p>
          Por privacidade, ele não fica salvo no navegador.
          Inicie uma nova conversa de teste.
        </p>

        <Link className="ec-primary" to="/triagem/perguntas">
          Voltar à triagem
        </Link>
      </main>
    );
  }

  function baixarTxt() {
    const texto = [
      "ELORA — RESUMO DE TRIAGEM (PROTÓTIPO)",
      resumo.sintese,

      "\nMANIFESTAÇÕES MENCIONADAS",

      ...resumo.manifestacoes.map(
        (m) =>
          `${m.descricao}\nEvidências: ${(
            m.evidenciasDoRelato || []
          ).join("; ")}\nRessalva: ${m.ressalva}`
      ),

      "\nCONTEXTO",
      resumo.contexto,

      "\nINFORMAÇÕES A ESCLARECER",
      ...(resumo.lacunas || []),

      "\nREFERÊNCIAS BIBLIOGRÁFICAS RELACIONADAS",

      ...(resumo.fontes || []).map(
        (f) => `${f.titulo}: ${f.url || "sem link cadastrado"}`
      ),

      "\n" + resumo.aviso,
      resumo.avisoTeste,
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([texto], {
        type: "text/plain;charset=utf-8",
      })
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "elora-resumo-ficticio.txt";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="ec-page">
      <header className="ec-header">
        <Link to="/" className="ec-brand">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link className="ec-link" to="/triagem">
          Início
        </Link>
      </header>

      <main className="ec-report">
        <span className="ec-eyebrow">
          ELORA · TRIAGEM EXPERIMENTAL
        </span>

        <h1>Um olhar sobre o que foi compartilhado.</h1>

        <p className="ec-lead">
          Resumo automatizado de um relato fictício.
          Não constitui avaliação clínica.
        </p>

        <span className="ec-mode">
          {resumo.modo === "demo"
            ? "Simulação sem IA"
            : "Gerado com OpenAI"}
        </span>

        <section className="ec-report-card">
          <h2>Síntese do relato</h2>
          <p>{resumo.sintese}</p>
        </section>

        <section className="ec-report-card">
          <h2>Manifestações mencionadas</h2>

          {resumo.manifestacoes?.length ? (
            resumo.manifestacoes.map((m, i) => (
              <article key={i} className="ec-finding">
                <h3>{m.descricao}</h3>

                <p>
                  <strong>
                    Relato que sustenta a observação:
                  </strong>
                </p>

                <ul>
                  {(m.evidenciasDoRelato || []).map((e, j) => (
                    <li key={j}>{e}</li>
                  ))}
                </ul>

                <p className="ec-muted">{m.ressalva}</p>
              </article>
            ))
          ) : (
            <p>
              Nenhuma manifestação foi registrada de forma suficiente.
            </p>
          )}
        </section>

        <section className="ec-report-card">
          <h2>Contexto relatado</h2>
          <p>{resumo.contexto || "Não informado."}</p>

          <h2>Informações que podem ser esclarecidas</h2>

          <ul>
            {(resumo.lacunas || []).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>

        <section className="ec-report-card">
          <h2>Materiais disponibilizados à IA</h2>

          <p className="ec-muted">
            As fontes abaixo estão relacionadas às notas autorais
            recuperadas. Não significa que o sistema tenha consultado
            os textos completos do DSM, CID ou do livro.
          </p>

          <ul>
            {(resumo.fontes || []).map((f) => (
              <li key={f.id}>
                {f.url ? (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {f.titulo}
                  </a>
                ) : (
                  f.titulo
                )}
                {" — "}
                {f.status}
              </li>
            ))}
          </ul>
        </section>

        <div className="ec-disclaimer">
          <strong>Aviso importante</strong>
          <p>{resumo.aviso}</p>
          <p>{resumo.avisoTeste}</p>
        </div>

        <div className="ec-report-actions">
          <button
            className="ec-primary"
            type="button"
            onClick={baixarTxt}
          >
            Baixar TXT do exemplo
          </button>

          <Link className="ec-secondary" to="/triagem/perguntas">
            Nova conversa fictícia
          </Link>
        </div>
      </main>
    </div>
  );
}