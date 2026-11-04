// src/pages/TriagemResumo.jsx

import { Link, useSearchParams } from "react-router-dom";

import { buscarCenarioDemo } from "../data/triagemDemo";

import "./TriagemTeste.css";

export default function TriagemResumo() {
  const [searchParams] = useSearchParams();

  const cenarioId = searchParams.get("cenario");
  const cenario = buscarCenarioDemo(cenarioId);

  if (!cenario) {
    return (
      <main className="tt-empty">
        <p className="tt-eyebrow">DEMONSTRAÇÃO ELORA</p>

        <h1>Escolha um exemplo primeiro.</h1>

        <p>
          Para visualizar um resumo, comece pela demonstração
          da triagem.
        </p>

        <Link
          to="/triagem/perguntas"
          className="tt-button tt-button-primary"
        >
          Escolher exemplo →
        </Link>
      </main>
    );
  }

  return (
    <div className="tt-page">
      <header className="tt-header">
        <Link to="/" className="tt-brand" aria-label="Elora — início">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link
          to="/triagem/perguntas"
          className="tt-header-link"
        >
          Testar outro exemplo
        </Link>
      </header>

      <main className="tt-summary-main">
        <p className="tt-eyebrow">RELATO ORGANIZADO</p>

        <h1>Um olhar sobre o que foi compartilhado.</h1>

        <p className="tt-description">
          Este resumo foi escrito previamente para o exemplo
          “{cenario.nome}”. Ele demonstra como queremos organizar
          o relato, sem atribuir diagnóstico.
        </p>

        <div className="tt-summary-badge">
          Resumo demonstrativo · sem uso de IA
        </div>

        <section
          className="tt-summary-list"
          aria-label="Resumo do exemplo fictício"
        >
          <article className="tt-summary-item">
            <span className="tt-summary-number">01</span>

            <div>
              <h2>O que foi compartilhado</h2>
              <p>{cenario.resumo.assunto}</p>
            </div>
          </article>

          <article className="tt-summary-item">
            <span className="tt-summary-number">02</span>

            <div>
              <h2>Quando costuma aparecer</h2>
              <p>{cenario.resumo.contexto}</p>
            </div>
          </article>

          <article className="tt-summary-item">
            <span className="tt-summary-number">03</span>

            <div>
              <h2>Como aparece na rotina</h2>
              <p>{cenario.resumo.impacto}</p>

              <span className="tt-impact-tag">
                {cenario.resumo.situacaoImpacto}
              </span>
            </div>
          </article>
        </section>

        <div className="tt-summary-note">
          <strong>O que estamos conferindo neste teste?</strong>

          <p>
            Se a interface diferencia uma mudança relatada,
            uma mudança negada e uma informação que não foi
            fornecida. Esses exemplos não são uma avaliação clínica.
          </p>
        </div>

        <div className="tt-actions">
          <Link
            to="/triagem/perguntas"
            className="tt-button tt-button-secondary"
          >
            ← Testar outro exemplo
          </Link>

          <Link
            to="/triagem/concluida"
            className="tt-button tt-button-primary"
          >
            Concluir demonstração →
          </Link>
        </div>
      </main>
    </div>
  );
}