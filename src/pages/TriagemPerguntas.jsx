// src/pages/TriagemPerguntas.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  buscarCenarioDemo,
  cenariosDemo,
  perguntasDemo,
} from "../data/triagemDemo";

import "./TriagemTeste.css";

export default function TriagemPerguntas() {
  const navigate = useNavigate();

  const [cenarioId, setCenarioId] = useState("");
  const [etapa, setEtapa] = useState(0);

  const cenario = buscarCenarioDemo(cenarioId);
  const revisando = etapa === perguntasDemo.length;
  const pergunta = perguntasDemo[etapa];

  const progresso = cenario
    ? Math.round(
        (Math.min(etapa + 1, perguntasDemo.length) /
          perguntasDemo.length) *
          100
      )
    : 0;

  function escolherCenario(id) {
    setCenarioId(id);
    setEtapa(0);
  }

  function avancar() {
    setEtapa((atual) =>
      Math.min(atual + 1, perguntasDemo.length)
    );
  }

  function voltar() {
    if (etapa === 0) {
      setCenarioId("");
      return;
    }

    setEtapa((atual) => atual - 1);
  }

  function abrirResumo() {
    if (!cenario) return;

    // A URL identifica apenas um exemplo fictício.
    // Nenhuma resposta pessoal é enviada ou armazenada.
    navigate(`/triagem/resumo?cenario=${cenario.id}`);
  }

  return (
    <div className="tt-page">
      <header className="tt-header">
        <Link to="/" className="tt-brand" aria-label="Elora — início">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link to="/triagem" className="tt-header-link">
          Sair da demonstração
        </Link>
      </header>

      <main className="tt-main">
        <aside className="tt-sidebar">
          <p className="tt-eyebrow">NO SEU TEMPO</p>

          <h1>Um espaço para entender seu momento.</h1>

          <p className="tt-description">
            Uma pergunta de cada vez, com espaço para conhecer
            o que a pessoa deseja compartilhar.
          </p>

          <div className="tt-sidebar-symbol" aria-hidden="true">
            <span>e</span>
          </div>

          <div className="tt-demo-note">
            <strong>Modo de demonstração</strong>
            <p>
              Todas as respostas desta tela são fictícias.
              Nenhuma informação pessoal é coletada.
            </p>
          </div>
        </aside>

        <section
          className="tt-content"
          aria-label="Demonstração da triagem"
        >
          {!cenario ? (
            <>
              <p className="tt-eyebrow">ANTES DE COMEÇAR</p>

              <h2>Escolha um exemplo para testar</h2>

              <p className="tt-description">
                Cada exemplo mostra uma situação diferente para
                conferir como as respostas aparecem no resumo.
              </p>

              <div className="tt-scenarios">
                {cenariosDemo.map((item) => (
                  <button
                    type="button"
                    className="tt-scenario"
                    key={item.id}
                    onClick={() => escolherCenario(item.id)}
                  >
                    <span>
                      <strong>{item.nome}</strong>
                      <small>{item.descricao}</small>
                    </span>

                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>

              <Link to="/triagem" className="tt-text-link">
                ← Voltar para a apresentação
              </Link>
            </>
          ) : (
            <>
              <div className="tt-step-heading">
                <span>{cenario.nome}</span>

                <span>
                  {revisando
                    ? "Revisão"
                    : `${etapa + 1} de ${perguntasDemo.length}`}
                </span>
              </div>

              <div
                className="tt-progress"
                role="progressbar"
                aria-label="Progresso da demonstração"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progresso}
              >
                <span style={{ width: `${progresso}%` }} />
              </div>

              <div
                className="tt-question-area"
                aria-live="polite"
                aria-atomic="true"
              >
                {revisando ? (
                  <>
                    <p className="tt-eyebrow">ANTES DO RESUMO</p>

                    <h2>Vamos conferir o relato?</h2>

                    <p className="tt-description">
                      Estas são as respostas do exemplo escolhido.
                    </p>

                    <div className="tt-review-list">
                      {perguntasDemo.map((item) => (
                        <article
                          className="tt-review-item"
                          key={item.id}
                        >
                          <h3>{item.titulo}</h3>

                          <p>
                            {cenario.respostas[item.id] ||
                              "Resposta não informada."}
                          </p>
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="tt-eyebrow">
                      EXEMPLO DE CONVERSA
                    </p>

                    <h2 id="tt-question-title">
                      {pergunta.titulo}
                    </h2>

                    <p
                      className="tt-description"
                      id="tt-question-description"
                    >
                      {pergunta.descricao}
                    </p>

                    <label
                      className="tt-answer-label"
                      htmlFor="tt-demo-answer"
                    >
                      Resposta fictícia
                    </label>

                    <textarea
                      id="tt-demo-answer"
                      className="tt-answer"
                      value={cenario.respostas[pergunta.id]}
                      placeholder="Resposta não informada neste exemplo."
                      readOnly
                      rows={6}
                      aria-labelledby="tt-question-title"
                      aria-describedby="tt-question-description"
                    />

                    <p className="tt-answer-help">
                      O texto está bloqueado porque estamos
                      testando apenas situações fictícias.
                    </p>
                  </>
                )}
              </div>

              <div className="tt-actions">
                <button
                  type="button"
                  className="tt-button tt-button-secondary"
                  onClick={voltar}
                >
                  ← Voltar
                </button>

                <button
                  type="button"
                  className="tt-button tt-button-primary"
                  onClick={revisando ? abrirResumo : avancar}
                >
                  {revisando ? "Ver resumo" : "Continuar"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <button
                type="button"
                className="tt-reset-button"
                onClick={() => {
                  setCenarioId("");
                  setEtapa(0);
                }}
              >
                Escolher outro exemplo
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}