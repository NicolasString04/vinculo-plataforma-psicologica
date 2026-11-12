import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../HomesElora.css";

const profissionais = [
  {
    id: "felipe",
    nome: "Felipe Almeida",
    iniciais: "FA",
    temas: ["Ansiedade", "Estresse", "Autoconhecimento"],
    disponivelHoje: true,
    horario: "Hoje, às 19h",
    cor: "#dceafb",
  },
  {
    id: "amanda",
    nome: "Amanda Martins",
    iniciais: "AM",
    temas: ["Relacionamentos", "Autoestima", "Regulação emocional"],
    disponivelHoje: false,
    horario: "Amanhã, às 10h",
    cor: "#efdef7",
  },
  {
    id: "penelope",
    nome: "Penelope Souza",
    iniciais: "PS",
    temas: ["Luto", "Transições de vida", "Bem-estar emocional"],
    disponivelHoje: true,
    horario: "Hoje, às 20h",
    cor: "#f8e4d7",
  },
  {
    id: "vanessa",
    nome: "Vanessa Barros",
    iniciais: "VB",
    temas: ["Luto", "Relacionamentos"],
    disponivelHoje: false,
    horario: "Amanhã, às 14h",
    cor: "#dceee5",
  },
  {
    id: "rafael",
    nome: "Rafael Andrade",
    iniciais: "RA",
    temas: ["Estresse", "Ansiedade"],
    disponivelHoje: false,
    horario: "Sexta-feira, às 9h",
    cor: "#e7e5fa",
  },
];

const especialidades = [...new Set(profissionais.flatMap((p) => p.temas))]
  .sort((a, b) => a.localeCompare(b, "pt-BR"));

function SalaElora() {
  return (
    <svg className="eh-sala" viewBox="0 0 650 290" aria-hidden="true">
      <defs>
        <linearGradient id="eh-sofa" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#dbc6f1" />
          <stop offset="1" stopColor="#a888cb" />
        </linearGradient>
        <linearGradient id="eh-fita">
          <stop stopColor="#d8bdf0" />
          <stop offset="1" stopColor="#a9d8f5" />
        </linearGradient>
      </defs>

      <path
        d="M3 208C100 249 154 89 272 148S485 180 647 68"
        fill="none"
        stroke="url(#eh-fita)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <ellipse cx="344" cy="270" rx="270" ry="13" fill="#e8dcd4" />

      {/* Planta à esquerda */}
      <path d="M119 210Q105 144 86 98M116 207Q129 146 148 118"
        fill="none" stroke="#54754b" strokeWidth="4" />
      <g fill="#789965">
        <ellipse cx="79" cy="104" rx="14" ry="33" transform="rotate(-37 79 104)" />
        <ellipse cx="104" cy="137" rx="14" ry="28" transform="rotate(-25 104 137)" />
        <ellipse cx="147" cy="121" rx="14" ry="29" transform="rotate(34 147 121)" />
        <ellipse cx="133" cy="158" rx="13" ry="25" transform="rotate(40 133 158)" />
      </g>
      <path d="M92 208h53l-8 54h-37z" fill="#d5a181" />
      <rect x="88" y="203" width="61" height="12" rx="5" fill="#e8b89a" />

      {/* Sofá lilás */}
      <path d="M206 229l-9 35m269-35 9 35" stroke="#865a49" strokeWidth="11" strokeLinecap="round" />
      <rect x="189" y="94" width="295" height="132" rx="37" fill="url(#eh-sofa)" />
      <rect x="174" y="175" width="327" height="66" rx="24" fill="#ae8bce" />
      <rect x="196" y="171" width="279" height="46" rx="17" fill="#ceb3e7" />
      <rect x="171" y="150" width="49" height="87" rx="22" fill="#c3a6df" />
      <rect x="458" y="150" width="49" height="87" rx="22" fill="#c3a6df" />
      <rect x="223" y="119" width="70" height="55" rx="12" fill="#f9dfbc" transform="rotate(-10 258 147)" />
      <rect x="373" y="117" width="68" height="55" rx="12" fill="#91a9dc" transform="rotate(9 407 145)" />

      {/* Mesa e chá */}
      <path d="M496 226l-10 40m79-40 12 40" stroke="#996649" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="532" cy="224" rx="51" ry="10" fill="#b47b55" />
      <ellipse cx="532" cy="219" rx="51" ry="10" fill="#d8a47d" />
      <path d="M538 194h11a6 6 0 0 1 0 12h-11" fill="none" stroke="#faf2e4" strokeWidth="4" />
      <path d="M514 190h29l-3 19a5 5 0 0 1-5 5h-13a5 5 0 0 1-5-5z" fill="#fff7e8" />
      <ellipse cx="528.5" cy="190" rx="14.5" ry="4" fill="#ca9659" />
      <path d="M526 182c-12-12 13-12 4-27" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />

      {/* Planta à direita */}
      <path d="M600 221q0-59-16-95m16 95q8-57 28-80"
        fill="none" stroke="#54754b" strokeWidth="4" />
      <g fill="#698e55">
        <ellipse cx="582" cy="127" rx="14" ry="29" transform="rotate(-29 582 127)" />
        <ellipse cx="625" cy="145" rx="14" ry="28" transform="rotate(31 625 145)" />
        <ellipse cx="583" cy="168" rx="13" ry="22" transform="rotate(-45 583 168)" />
      </g>
      <path d="M576 218h48l-7 45h-34z" fill="#dfc0ab" />
      <rect x="572" y="213" width="56" height="11" rx="5" fill="#ebd3bf" />
    </svg>
  );
}

export default function ClienteHome() {
  const { state } = useLocation();
  const especialidadeInicial = especialidades.includes(state?.especialidade)
    ? state.especialidade
    : "";

  const [especialidade, setEspecialidade] = useState(especialidadeInicial);
  const [disponibilidade, setDisponibilidade] = useState("");
  const [filtros, setFiltros] = useState({
    especialidade: especialidadeInicial,
    disponibilidade: "",
  });
  const [perfilAberto, setPerfilAberto] = useState(null);

  const resultados = profissionais.filter((p) => {
    const temaCombina =
      !filtros.especialidade || p.temas.includes(filtros.especialidade);
    const horarioCombina =
      filtros.disponibilidade !== "hoje" || p.disponivelHoje;

    return temaCombina && horarioCombina;
  });

  function buscar(event) {
    event.preventDefault();
    setFiltros({ especialidade, disponibilidade });
    setPerfilAberto(null);
  }

  function limparFiltros() {
    setEspecialidade("");
    setDisponibilidade("");
    setFiltros({ especialidade: "", disponibilidade: "" });
    setPerfilAberto(null);
  }

  return (
    <div className="eh-page eh-cliente">
      <header className="eh-header">
        <Link className="eh-brand" to="/" aria-label="Elora — página inicial">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <nav className="eh-nav" aria-label="Área do paciente">
          <Link to="/cliente" aria-current="page">Início</Link>
          <a href="#eh-profissionais">Encontrar psicólogos</a>
          <Link to="/minha-conta">Minha conta</Link>
        </nav>
      </header>

      <main className="eh-container">
        <section className="eh-hero" aria-labelledby="eh-cliente-titulo">
          <div>
            <p className="eh-eyebrow">NO SEU TEMPO</p>
            <h1 id="eh-cliente-titulo">Encontre um psicólogo</h1>
            <p>Escolha com calma quem pode te acompanhar.</p>
          </div>

          <SalaElora />
        </section>

        <form className="eh-filtros" onSubmit={buscar}>
          <label>
            <span>Especialidade</span>
            <select
              value={especialidade}
              onChange={(event) => setEspecialidade(event.target.value)}
            >
              <option value="">Todas as especialidades</option>
              {especialidades.map((tema) => (
                <option key={tema} value={tema}>{tema}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Disponibilidade</span>
            <select
              value={disponibilidade}
              onChange={(event) => setDisponibilidade(event.target.value)}
            >
              <option value="">Qualquer dia</option>
              <option value="hoje">Disponível hoje</option>
            </select>
          </label>

          <button className="eh-button eh-coral" type="submit">Buscar</button>
        </form>

        <section id="eh-profissionais" className="eh-lista">
          <div className="eh-lista-topo">
            <h2>Psicólogos</h2>
            <p role="status">{resultados.length} perfil(is) demonstrativo(s)</p>
          </div>

          {resultados.length === 0 && (
            <div className="eh-vazio">
              <p>Nenhum profissional corresponde aos filtros selecionados.</p>
              <button className="eh-button eh-lilas" type="button" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          )}

          {resultados.map((p) => {
            const aberto = perfilAberto === p.id;

            return (
              <article className="eh-profissional" key={p.id}>
                <div className="eh-profissional-linha">
                  <div className="eh-avatar" style={{ background: p.cor }} aria-hidden="true">
                    {p.iniciais}
                  </div>

                  <div className="eh-profissional-info">
                    <h3>{p.nome}</h3>
                    <p>{p.temas.join(" · ")}</p>
                  </div>

                  <button
                    className="eh-button eh-coral"
                    type="button"
                    aria-expanded={aberto}
                    aria-controls={`eh-perfil-${p.id}`}
                    onClick={() => setPerfilAberto(aberto ? null : p.id)}
                  >
                    {aberto ? "Fechar perfil" : "Ver perfil"}
                  </button>
                </div>

                <div id={`eh-perfil-${p.id}`} className="eh-detalhe" hidden={!aberto}>
                  <strong>Atendimento online</strong>
                  <p>Próximo horário de exemplo: {p.horario}.</p>
                </div>
              </article>
            );
          })}

          <p className="eh-nota">Perfis e horários fictícios para demonstração.</p>
        </section>
      </main>
    </div>
  );
}