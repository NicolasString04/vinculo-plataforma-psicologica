import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../HomesElora.css";

const CHAVE_SESSAO = "elora-psychologist-demo-session";
const horariosDemo = ["09:00", "11:30", "15:00"];

const solicitacoes = [
  { id: "julia", nome: "Júlia", detalhe: "Solicitou um primeiro atendimento online." },
  { id: "rafael", nome: "Rafael", detalhe: "Solicitou um horário para esta semana." },
];

function lerSessao() {
  try {
    const sessao = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
    return sessao?.demonstracao === true && sessao.tipo === "psicologo"
      ? sessao
      : null;
  } catch {
    return null;
  }
}

function formatarData(deslocamento) {
  const data = new Date();
  data.setDate(data.getDate() + deslocamento);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(data);
}

export default function PsicologoHome() {
  const navigate = useNavigate();
  const sessao = lerSessao();
  const [dia, setDia] = useState(0);
  const [solicitacaoAberta, setSolicitacaoAberta] = useState(null);
  const [mostrarDisponibilidade, setMostrarDisponibilidade] = useState(false);
  const [disponibilidade, setDisponibilidade] = useState(["11:30"]);

  if (!sessao) {
    return <Navigate to="/login/psicologo" replace />;
  }

  const primeiroNome = String(sessao.nome || "profissional").split(/[.\s_-]/)[0];
  const nome = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1);
  const agenda = dia === 0 ? horariosDemo : [];

  function sair() {
    sessionStorage.removeItem(CHAVE_SESSAO);
    navigate("/login/psicologo", { replace: true });
  }

  function alternarHorario(horario) {
    setDisponibilidade((atual) =>
      atual.includes(horario)
        ? atual.filter((item) => item !== horario)
        : [...atual, horario]
    );
  }

  return (
    <div className="eh-page eh-psicologo">
      <header className="eh-header">
        <Link className="eh-brand" to="/" aria-label="Elora — página inicial">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <nav className="eh-nav" aria-label="Área do psicólogo">
          <Link to="/psicologo" aria-current="page">Visão geral</Link>
          <a href="#eh-agenda">Agenda</a>
          <a href="#eh-solicitacoes">Solicitações</a>
          <a href="#eh-perfil-profissional">Meu perfil</a>
        </nav>

        <button type="button" className="eh-button eh-branco" onClick={sair}>
          Sair
        </button>
      </header>

      <main className="eh-container">
        <section className="eh-boas-vindas">
          <div>
            <h1>Olá, {nome}</h1>
            <p>Organize seus atendimentos em um só lugar.</p>
          </div>

          <button
            type="button"
            className="eh-button eh-lilas"
            aria-expanded={mostrarDisponibilidade}
            aria-controls="eh-disponibilidade"
            onClick={() => setMostrarDisponibilidade((atual) => !atual)}
          >
            Gerenciar disponibilidade
          </button>
        </section>

        <section
          id="eh-disponibilidade"
          className="eh-painel eh-disponibilidade"
          hidden={!mostrarDisponibilidade}
        >
          <h2>Disponibilidade de exemplo</h2>
          <p>Selecione os horários para testar a interface.</p>

          <div className="eh-horarios">
            {horariosDemo.map((horario) => (
              <label key={horario}>
                <input
                  type="checkbox"
                  checked={disponibilidade.includes(horario)}
                  onChange={() => alternarHorario(horario)}
                />
                {horario}
              </label>
            ))}
          </div>
        </section>

        <div className="eh-faixa">
          <img src="/images/logo-elora.png" alt="" />
          <p>Sua agenda de hoje tem <strong>3 atendimentos confirmados</strong>.</p>
        </div>

        <div className="eh-painel-grid">
          <section id="eh-agenda" className="eh-painel">
            <h2>{dia === 0 ? "Agenda de hoje" : "Agenda do dia"}</h2>

            <div className="eh-data">
              <button
                type="button"
                aria-label="Dia anterior"
                onClick={() => setDia((atual) => atual - 1)}
              >
                ‹
              </button>

              <span aria-live="polite">{formatarData(dia)}</span>

              <button
                type="button"
                aria-label="Próximo dia"
                onClick={() => setDia((atual) => atual + 1)}
              >
                ›
              </button>

              {dia !== 0 && (
                <button type="button" onClick={() => setDia(0)}>Hoje</button>
              )}
            </div>

            {agenda.length > 0 ? (
              <ul className="eh-agenda-lista">
                {agenda.map((horario) => (
                  <li key={horario}>
                    <strong>{horario}</strong>
                    <span>Sessão online</span>
                    <span className="eh-status">✓ Confirmada</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="eh-vazio">Nenhuma sessão demonstrativa para este dia.</p>
            )}
          </section>

          <section id="eh-solicitacoes" className="eh-painel">
            <h2>Solicitações recentes</h2>

            <ul className="eh-solicitacoes">
              {solicitacoes.map((item) => {
                const aberta = solicitacaoAberta === item.id;

                return (
                  <li key={item.id}>
                    <div className="eh-solicitacao-linha">
                      <span className="eh-avatar eh-avatar-menor" aria-hidden="true">
                        {item.nome.charAt(0)}
                      </span>

                      <div>
                        <strong>{item.nome}</strong>
                        <p>Solicitação de atendimento</p>
                      </div>

                      <button
                        type="button"
                        className="eh-button eh-lilas"
                        aria-expanded={aberta}
                        aria-controls={`eh-solicitacao-${item.id}`}
                        onClick={() => setSolicitacaoAberta(aberta ? null : item.id)}
                      >
                        {aberta ? "Fechar" : "Revisar"}
                      </button>
                    </div>

                    <p id={`eh-solicitacao-${item.id}`} className="eh-detalhe" hidden={!aberta}>
                      {item.detalhe}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section id="eh-perfil-profissional" className="eh-painel eh-meu-perfil">
          <h2>Meu perfil</h2>
          <p><strong>E-mail:</strong> {sessao.email}</p>
          <p><strong>CRP:</strong> a cadastrar.</p>
        </section>

        <p className="eh-nota">Agenda e solicitações fictícias para demonstração.</p>
      </main>
    </div>
  );
}