import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./ClienteHome.css";

// ======================================================
// DADOS DOS FILTROS
// ======================================================

const especialidades = [
  "Ansiedade",
  "Depressão",
  "Relacionamentos",
  "Autoestima",
  "Estresse / Burnout",
  "Outros",
];

const abordagens = [
  "TCC (Terapia Cognitivo-Comportamental)",
  "Psicanálise",
  "Humanista",
  "Sistêmica",
  "Analítico-Comportamental",
  "Outras",
];

const formatos = ["Online", "Presencial", "Híbrido"];

// A vitrine permanece vazia até existirem profissionais
// cadastrados, verificados e disponíveis para exibição.
const profissionais = [];

const filtrosVazios = {
  especialidades: [],
  abordagens: [],
  formatos: [],
};

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function iniciais(nome = "") {
  return (
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase() || "EL"
  );
}

// ======================================================
// ÍCONES
// ======================================================

function Icone({ tipo }) {
  const desenhos = {
    inicio: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-7h6v7" />
      </>
    ),

    busca: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),

    calendario: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),

    coracao: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),

    usuario: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    sino: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    filtro: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),

    sair: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
  };

  return (
    <svg
      className="eh-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {desenhos[tipo]}
    </svg>
  );
}

// ======================================================
// ILUSTRAÇÃO DA SALA ELORA
// ======================================================

function SalaElora() {
  return (
    <svg
      className="eh-sala"
      viewBox="0 0 650 290"
      aria-hidden="true"
    >
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

      <ellipse
        cx="344"
        cy="270"
        rx="270"
        ry="13"
        fill="#e8dcd4"
      />

      {/* Planta esquerda */}

      <path
        d="M119 210Q105 144 86 98M116 207Q129 146 148 118"
        fill="none"
        stroke="#54754b"
        strokeWidth="4"
      />

      <g fill="#789965">
        <ellipse cx="79" cy="104" rx="14" ry="33" transform="rotate(-37 79 104)" />
        <ellipse cx="104" cy="137" rx="14" ry="28" transform="rotate(-25 104 137)" />
        <ellipse cx="147" cy="121" rx="14" ry="29" transform="rotate(34 147 121)" />
        <ellipse cx="133" cy="158" rx="13" ry="25" transform="rotate(40 133 158)" />
      </g>

      <path d="M92 208h53l-8 54h-37z" fill="#d5a181" />
      <rect x="88" y="203" width="61" height="12" rx="5" fill="#e8b89a" />

      {/* Sofá */}

      <path
        d="M206 229l-9 35m269-35 9 35"
        stroke="#865a49"
        strokeWidth="11"
        strokeLinecap="round"
      />

      <rect
        x="189"
        y="94"
        width="295"
        height="132"
        rx="37"
        fill="url(#eh-sofa)"
      />

      <rect
        x="174"
        y="175"
        width="327"
        height="66"
        rx="24"
        fill="#ae8bce"
      />

      <rect
        x="196"
        y="171"
        width="279"
        height="46"
        rx="17"
        fill="#ceb3e7"
      />

      <rect
        x="171"
        y="150"
        width="49"
        height="87"
        rx="22"
        fill="#c3a6df"
      />

      <rect
        x="458"
        y="150"
        width="49"
        height="87"
        rx="22"
        fill="#c3a6df"
      />

      <rect
        x="223"
        y="119"
        width="70"
        height="55"
        rx="12"
        fill="#f9dfbc"
        transform="rotate(-10 258 147)"
      />

      <rect
        x="373"
        y="117"
        width="68"
        height="55"
        rx="12"
        fill="#91a9dc"
        transform="rotate(9 407 145)"
      />

      {/* Mesa e chá */}

      <path
        d="M496 226l-10 40m79-40 12 40"
        stroke="#996649"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <ellipse cx="532" cy="224" rx="51" ry="10" fill="#b47b55" />
      <ellipse cx="532" cy="219" rx="51" ry="10" fill="#d8a47d" />

      <path
        d="M538 194h11a6 6 0 0 1 0 12h-11"
        fill="none"
        stroke="#faf2e4"
        strokeWidth="4"
      />

      <path
        d="M514 190h29l-3 19a5 5 0 0 1-5 5h-13a5 5 0 0 1-5-5z"
        fill="#fff7e8"
      />

      <ellipse cx="528.5" cy="190" rx="14.5" ry="4" fill="#ca9659" />

      <path
        d="M526 182c-12-12 13-12 4-27"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Planta direita */}

      <path
        d="M600 221q0-59-16-95m16 95q8-57 28-80"
        fill="none"
        stroke="#54754b"
        strokeWidth="4"
      />

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

// ======================================================
// COMPONENTE DE FILTROS
// ======================================================

function GrupoFiltro({
  titulo,
  opcoes,
  selecionados,
  onToggle,
}) {
  return (
    <fieldset className="eh-filtro-grupo">
      <legend>{titulo}</legend>

      <div className="eh-opcoes">
        {opcoes.map((opcao) => (
          <label className="eh-opcao" key={opcao}>
            <input
              type="checkbox"
              checked={selecionados.includes(opcao)}
              onChange={() => onToggle(opcao)}
            />

            <span>{opcao}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ======================================================
// PÁGINA PRINCIPAL DO PACIENTE
// ======================================================

export default function ClienteHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const especialidadeInicial = especialidades.includes(
    location.state?.especialidade
  )
    ? location.state.especialidade
    : "";

  const filtrosIniciais = useMemo(
    () => ({
      ...filtrosVazios,
      especialidades: especialidadeInicial
        ? [especialidadeInicial]
        : [],
    }),
    [especialidadeInicial]
  );

  // Dados do usuário
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [erroPerfil, setErroPerfil] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  // Busca e ordenação
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("relevantes");

  // Filtros
  const [filtrosSelecionados, setFiltrosSelecionados] =
    useState(filtrosIniciais);

  const [filtrosAplicados, setFiltrosAplicados] =
    useState(filtrosIniciais);

  // Menus
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] =
    useState(false);

  const [perfilAberto, setPerfilAberto] = useState(null);

  // ====================================================
  // AUTENTICAÇÃO E FIRESTORE
  // ====================================================

  useEffect(() => {
    let ativo = true;

    const cancelarObservacao = onAuthStateChanged(
      auth,
      async (usuarioFirebase) => {
        if (!usuarioFirebase) {
          if (ativo) {
            setCarregando(false);
          }

          navigate("/login", { replace: true });
          return;
        }

        try {
          const referencia = doc(
            db,
            "usuarios",
            usuarioFirebase.uid
          );

          const documento = await getDoc(referencia);

          if (!ativo) return;

          if (!documento.exists()) {
            setErroPerfil(
              "Não encontramos seu cadastro no Elora."
            );
            return;
          }

          const dados = documento.data();

          // Somente pacientes acessam esta página.
          if (dados.tipo !== "paciente") {
            navigate("/login/psicologo", {
              replace: true,
            });
            return;
          }

          setUsuario({
            ...dados,
            uid: usuarioFirebase.uid,
            email:
              dados.email ||
              usuarioFirebase.email ||
              "",
          });
        } catch (erro) {
          console.error(
            "Erro ao carregar perfil:",
            erro
          );

          if (ativo) {
            setErroPerfil(
              "Não foi possível carregar seus dados. Verifique sua conexão e tente novamente."
            );
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }
    );

    return () => {
      ativo = false;
      cancelarObservacao();
    };
  }, [navigate]);

  // ====================================================
  // CONTROLE DOS FILTROS
  // ====================================================

  function alternarFiltro(grupo, valor) {
    setFiltrosSelecionados((atual) => ({
      ...atual,

      [grupo]: atual[grupo].includes(valor)
        ? atual[grupo].filter((item) => item !== valor)
        : [...atual[grupo], valor],
    }));
  }

  function aplicarFiltros(evento) {
    evento.preventDefault();

    setFiltrosAplicados({
      especialidades: [
        ...filtrosSelecionados.especialidades,
      ],

      abordagens: [
        ...filtrosSelecionados.abordagens,
      ],

      formatos: [
        ...filtrosSelecionados.formatos,
      ],
    });

    setPerfilAberto(null);
  }

  function limparFiltros() {
    const limpos = {
      especialidades: [],
      abordagens: [],
      formatos: [],
    };

    setFiltrosSelecionados(limpos);
    setFiltrosAplicados(limpos);

    setBusca("");
    setOrdenacao("relevantes");

    setPerfilAberto(null);
  }

  // ====================================================
  // BUSCA E ORDENAÇÃO DOS PROFISSIONAIS
  // ====================================================

  const resultados = useMemo(() => {
    const termo = busca
      .trim()
      .toLocaleLowerCase("pt-BR");

    const corresponde = (selecionados, disponiveis) => {
      if (!selecionados.length) return true;

      const valores = Array.isArray(disponiveis)
        ? disponiveis
        : [];

      return selecionados.some((item) =>
        valores.includes(item)
      );
    };

    const lista = profissionais.filter((profissional) => {
      const temas = Array.isArray(
        profissional.especialidades
      )
        ? profissional.especialidades
        : profissional.temas || [];

      const metodos = Array.isArray(
        profissional.abordagens
      )
        ? profissional.abordagens
        : [];

      const modalidades = Array.isArray(
        profissional.formatos
      )
        ? profissional.formatos
        : profissional.formatoAtendimento
          ? [profissional.formatoAtendimento]
          : [];

      const texto = [
        profissional.nome,
        profissional.crp,
        profissional.biografia,
        profissional.descricao,
        ...temas,
        ...metodos,
        ...modalidades,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return (
        (!termo || texto.includes(termo)) &&
        corresponde(
          filtrosAplicados.especialidades,
          temas
        ) &&
        corresponde(
          filtrosAplicados.abordagens,
          metodos
        ) &&
        corresponde(
          filtrosAplicados.formatos,
          modalidades
        )
      );
    });

    if (ordenacao === "nome") {
      lista.sort((a, b) =>
        (a.nome || "").localeCompare(
          b.nome || "",
          "pt-BR"
        )
      );
    }

    return lista;
  }, [busca, filtrosAplicados, ordenacao]);

  // ====================================================
  // SAIR DA CONTA
  // ====================================================

  async function sair() {
    setErroAcao("");

    try {
      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch (erro) {
      console.error("Erro ao sair:", erro);

      setErroAcao(
        "Não foi possível encerrar sua sessão."
      );
    }
  }

  // ====================================================
  // CARREGAMENTO
  // ====================================================

  if (carregando) {
    return (
      <main className="eh-page eh-cliente">
        <div className="eh-loading">
          <div className="eh-loading-logo">e</div>

          <p>
            Preparando seu espaço na Elora...
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // ERRO DE ACESSO
  // ====================================================

  if (erroPerfil || !usuario) {
    return (
      <main className="eh-page eh-cliente">
        <div className="eh-feedback">
          <img
            src="/images/logo-elora.png"
            alt="Elora"
          />

          <h1>
            Não conseguimos acessar sua conta.
          </h1>

          <p>
            {erroPerfil || "Faça login para continuar."}
          </p>

          <button
            className="eh-button eh-button-primary"
            type="button"
            onClick={() => navigate("/login")}
          >
            Voltar ao login
          </button>
        </div>
      </main>
    );
  }

  const nomeUsuario =
    usuario.nome ||
    usuario.email?.split("@")[0] ||
    "Paciente";

  const primeiroNome = nomeUsuario.split(" ")[0];

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <div className="eh-page eh-cliente">

      {/* ==============================================
          TOPO: CABEÇALHO SOBREPOSTO AO BANNER
      ============================================== */}

      <div className="eh-topo">

        {/* CABEÇALHO */}

        <header className="eh-header">
          <div className="eh-header-inner">

            <Link
              className="eh-brand"
              to="/cliente"
              aria-label="Elora — início"
            >
              <img
                src="/images/logo-elora.png"
                alt=""
              />

              <span>elora</span>
            </Link>

            <nav
              className="eh-nav"
              aria-label="Área do paciente"
            >

              <Link to="/cliente">
                <Icone tipo="inicio" />
                Início
              </Link>

              <a
                href="#eh-profissionais"
                className="eh-nav-ativo"
                aria-current="page"
              >
                <Icone tipo="busca" />
                Buscar Psicólogo(a)
              </a>

              <a href="#eh-atendimentos">
                <Icone tipo="calendario" />
                Meus Atendimentos
              </a>

              <Link to="/triagem">
                <Icone tipo="coracao" />
                Triagem
              </Link>

              <Link to="/minha-conta">
                <Icone tipo="usuario" />
                Minha Conta
              </Link>

            </nav>

            {/* AÇÕES DO CABEÇALHO */}

            <div className="eh-header-actions">

              {/* NOTIFICAÇÕES */}

              <div className="eh-popover-wrap">

                <button
                  className="eh-icon-button"
                  type="button"
                  aria-label="Notificações"
                  aria-expanded={notificacoesAbertas}
                  onClick={() => {
                    setNotificacoesAbertas(
                      (atual) => !atual
                    );

                    setMenuPerfilAberto(false);
                  }}
                >
                  <Icone tipo="sino" />

                  <span className="eh-notificacao-ponto" />
                </button>

                {notificacoesAbertas && (
                  <div className="eh-popover">
                    <strong>Notificações</strong>

                    <p>
                      Você está em dia! Quando houver
                      novidades sobre seus atendimentos,
                      elas aparecerão aqui.
                    </p>
                  </div>
                )}

              </div>

              {/* PERFIL */}

              <div className="eh-popover-wrap">

                <button
                  className="eh-avatar-button"
                  type="button"
                  aria-label="Abrir menu da conta"
                  aria-expanded={menuPerfilAberto}
                  onClick={() => {
                    setMenuPerfilAberto(
                      (atual) => !atual
                    );

                    setNotificacoesAbertas(false);
                  }}
                >
                  <span className="eh-avatar-header">
                    {iniciais(nomeUsuario)}
                  </span>

                  <span className="eh-chevron">
                    ⌄
                  </span>
                </button>

                {menuPerfilAberto && (
                  <div className="eh-popover eh-menu-perfil">

                    <strong>{primeiroNome}</strong>

                    <span>{usuario.email}</span>

                    <Link to="/minha-conta">
                      <Icone tipo="usuario" />
                      Minha conta
                    </Link>

                    <button
                      type="button"
                      onClick={sair}
                    >
                      <Icone tipo="sair" />
                      Sair da conta
                    </button>

                  </div>
                )}

              </div>

            </div>
          </div>
        </header>

        {/* BANNER FULL WIDTH */}

        <section
          className="eh-hero"
          aria-labelledby="eh-hero-titulo"
        >
          <div className="eh-hero-conteudo">

            <p className="eh-eyebrow">
              SEU ESPAÇO DE ACOLHIMENTO
            </p>

            <h1 id="eh-hero-titulo">
              Encontre o profissional ideal
              <br />
              para a sua <em>jornada.</em>
            </h1>

            <p>
              Psicólogos qualificados, verificados e prontos
              para caminhar com você, no seu tempo e com acolhimento.
            </p>

          </div>
        </section>

      </div>

      {/* ==============================================
          CONTEÚDO PRINCIPAL
      ============================================== */}

      <main className="eh-container">

        {/* BUSCA E FILTROS */}

        <div className="eh-discovery-layout">

          {/* SIDEBAR */}

          <aside className="eh-sidebar">
            <form onSubmit={aplicarFiltros}>

              <div className="eh-sidebar-top">
                <h2>
                  <Icone tipo="filtro" />
                  Filtros
                </h2>

                <button
                  type="button"
                  className="eh-limpar"
                  onClick={limparFiltros}
                >
                  Limpar
                </button>
              </div>

              <GrupoFiltro
                titulo="Especialidade"
                opcoes={especialidades}
                selecionados={
                  filtrosSelecionados.especialidades
                }
                onToggle={(valor) =>
                  alternarFiltro("especialidades", valor)
                }
              />

              <GrupoFiltro
                titulo="Abordagem"
                opcoes={abordagens}
                selecionados={
                  filtrosSelecionados.abordagens
                }
                onToggle={(valor) =>
                  alternarFiltro("abordagens", valor)
                }
              />

              <GrupoFiltro
                titulo="Formato do atendimento"
                opcoes={formatos}
                selecionados={
                  filtrosSelecionados.formatos
                }
                onToggle={(valor) =>
                  alternarFiltro("formatos", valor)
                }
              />

              <button
                type="submit"
                className="eh-button eh-button-primary eh-aplicar"
              >
                <Icone tipo="filtro" />
                Aplicar filtros
              </button>

            </form>
          </aside>

          {/* RESULTADOS */}

          <section
            id="eh-profissionais"
            className="eh-resultados"
            aria-labelledby="eh-titulo-profissionais"
          >

            {/* BUSCA */}

            <div className="eh-busca-linha">

              <div className="eh-busca">
                <Icone tipo="busca" />

                <input
                  type="search"
                  placeholder="Buscar por nome, abordagem, especialidade..."
                  value={busca}
                  onChange={(evento) =>
                    setBusca(evento.target.value)
                  }
                  aria-label="Buscar psicólogos"
                />
              </div>

              <label className="eh-ordenar">
                <span>Ordenar por:</span>

                <select
                  value={ordenacao}
                  onChange={(evento) =>
                    setOrdenacao(evento.target.value)
                  }
                >
                  <option value="relevantes">
                    Mais relevantes
                  </option>

                  <option value="nome">
                    Nome A-Z
                  </option>
                </select>
              </label>

            </div>

            {/* TÍTULO DOS RESULTADOS */}

            <div className="eh-lista-topo">
              <h2 id="eh-titulo-profissionais">
                Psicólogos(as)
              </h2>

              <p role="status">
                {resultados.length} profissional(is) disponível(is)
              </p>
            </div>

            {/* ESTADO VAZIO */}

            {resultados.length === 0 ? (

              <div className="eh-empty">

                <div className="eh-empty-art">
                  <SalaElora />
                </div>

                <div className="eh-empty-conteudo">

                  <span className="eh-empty-etiqueta">
                    NOSSA REDE ESTÁ CRESCENDO
                  </span>

                  <h3>
                    Estamos preparando este espaço para você.
                  </h3>

                  <p>
                    Em breve, você encontrará aqui profissionais
                    cadastrados e verificados pela Elora.
                    Queremos que você escolha com calma
                    quem poderá acompanhar sua jornada.
                  </p>

                  <Link
                    to="/triagem"
                    className="eh-button eh-button-secondary"
                  >
                    Conhecer a triagem
                  </Link>

                </div>
              </div>

            ) : (

              /* LISTA DE PROFISSIONAIS */

              <div className="eh-lista">

                {resultados.map((profissional) => {
                  const aberto =
                    perfilAberto === profissional.id;

                  const temas =
                    profissional.especialidades ||
                    profissional.temas ||
                    [];

                  return (
                    <article
                      className="eh-profissional"
                      key={profissional.id}
                    >

                      <div className="eh-profissional-linha">

                        <div className="eh-avatar-profissional">
                          {iniciais(profissional.nome)}
                        </div>

                        <div className="eh-profissional-info">

                          <h3>{profissional.nome}</h3>

                          <p>
                            {profissional.crp
                              ? `CRP ${profissional.crp}`
                              : "Profissional verificado"}
                          </p>

                          <div className="eh-tags">
                            {temas.map((tema) => (
                              <span key={tema}>
                                {tema}
                              </span>
                            ))}
                          </div>

                          <p>
                            {profissional.biografia ||
                              profissional.descricao ||
                              "Conheça o perfil deste profissional."}
                          </p>

                        </div>

                        <button
                          className="eh-button eh-button-secondary"
                          type="button"
                          aria-expanded={aberto}
                          onClick={() =>
                            setPerfilAberto(
                              aberto ? null : profissional.id
                            )
                          }
                        >
                          {aberto
                            ? "Fechar perfil"
                            : "Ver perfil"}
                        </button>

                      </div>

                      {aberto && (
                        <div className="eh-detalhe">

                          <p>
                            <strong>Abordagens:</strong>{" "}
                            {(profissional.abordagens || []).join(", ") ||
                              "Não informado"}
                          </p>

                          <p>
                            <strong>Atendimento:</strong>{" "}
                            {profissional.formatoAtendimento ||
                              "Não informado"}
                          </p>

                        </div>
                      )}

                    </article>
                  );
                })}

              </div>

            )}

          </section>
        </div>

        {/* ============================================
            MEUS ATENDIMENTOS
        ============================================ */}

        <section
          id="eh-atendimentos"
          className="eh-atendimentos"
        >

          <div className="eh-atendimentos-topo">

            <div>
              <p className="eh-eyebrow">
                SUA JORNADA
              </p>

              <h2>Meus atendimentos</h2>

              <p>
                Acompanhe suas consultas e compromissos.
              </p>
            </div>

            <Icone tipo="calendario" />

          </div>

          <div className="eh-atendimentos-vazio">

            <div className="eh-atendimento-icone">
              <Icone tipo="calendario" />
            </div>

            <div>
              <strong>
                Nenhum atendimento agendado.
              </strong>

              <p>
                Quando você agendar sua primeira sessão,
                os detalhes aparecerão aqui.
              </p>
            </div>

          </div>
        </section>

        {/* ERROS */}

        {erroAcao && (
          <p className="eh-erro-acao" role="alert">
            {erroAcao}
          </p>
        )}

        {/* RODAPÉ */}

        <footer className="eh-footer">
          <span>elora</span>

          <p>
            Seu espaço de cuidado e bem-estar.
          </p>
        </footer>

      </main>
    </div>
  );
}