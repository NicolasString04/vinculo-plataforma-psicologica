
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebase";
import "./ClienteHome.css";

// =====================================================
// OPÇÕES DE FILTROS
// =====================================================

const ESPECIALIDADES = [
  "Ansiedade",
  "Depressão",
  "Relacionamentos",
  "Autoestima",
  "Estresse / Burnout",
  "Autoconhecimento",
  "Outros",
];

const ABORDAGENS = [
  "TCC (Terapia Cognitivo-Comportamental)",
  "Psicanálise",
  "Humanista",
  "Sistêmica",
  "Analítico-Comportamental",
  "Outras",
];

const FORMATOS = [
  "Online",
  "Presencial",
  "Híbrido",
];

const STATUS_APROVADOS = [
  "aprovado",
  "verificado",
];

const FILTROS_VAZIOS = {
  especialidade: "",
  abordagem: "",
  formatos: [],
  sexo: "",
};

// =====================================================
// ÍCONES
// =====================================================

function Icone({ tipo, tamanho = 20 }) {
  const desenhos = {
    inicio: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9M9 21v-7h6v7" />
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
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),

    coracao: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
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
      <path d="M4 6h16M7 12h10M10 18h4" />
    ),

    sair: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),

    raio: (
      <path d="m13 2-9 12h7l-1 8 10-12h-7V2Z" />
    ),

    monitor: (
      <>
        <rect
          x="3"
          y="4"
          width="18"
          height="14"
          rx="2"
        />
        <path d="M8 22h8M12 18v4" />
      </>
    ),

    check: (
      <path d="m5 12 4 4L19 6" />
    ),

    menu: (
      <path d="M4 6h16M4 12h16M4 18h16" />
    ),
  };

  return (
    <svg
      width={tamanho}
      height={tamanho}
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

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function iniciais(nome = "") {
  return (
    String(nome)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0] || "")
      .join("")
      .toUpperCase() || "EL"
  );
}

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function paraLista(valor) {
  if (Array.isArray(valor)) {
    return valor.filter(
      (item) =>
        typeof item === "string" &&
        item.trim()
    );
  }

  if (
    typeof valor === "string" &&
    valor.trim()
  ) {
    return [valor.trim()];
  }

  return [];
}

function sexoNormalizado(valor) {
  const sexo = normalizar(valor);

  if (
    ["masculino", "homem", "m"].includes(sexo)
  ) {
    return "Homem";
  }

  if (
    ["feminino", "mulher", "f"].includes(sexo)
  ) {
    return "Mulher";
  }

  return "";
}

// =====================================================
// ADAPTAÇÃO DE PERFIS EXISTENTES
// =====================================================

function prepararProfissional(documento) {
  const dados = documento.data();

  const status = normalizar(
    dados.statusVerificacao
  );

  // Não apresentar cadastros não aprovados.
  if (!STATUS_APROVADOS.includes(status)) {
    return null;
  }

  if (
    dados.contaTeste === true ||
    dados.publicarPerfil === false ||
    dados.ativo === false
  ) {
    return null;
  }

  const nome = (
    dados.nomePublico ||
    dados.nomeProfissional ||
    dados.nomeCompleto ||
    dados.nome ||
    ""
  ).trim();

  if (!nome || !dados.crp) {
    return null;
  }

  return {
    id: documento.id,
    nome,
    crp: String(dados.crp),

    fotoURL:
      dados.fotoURL ||
      dados.fotoPerfilURL ||
      "",

    biografia:
      dados.biografia ||
      dados.descricao ||
      "",

    especialidades: paraLista(
      dados.especialidades || dados.temas
    ),

    abordagens: paraLista(
      dados.abordagens
    ),

    formatos: paraLista(
      dados.modalidades ||
      dados.formatos ||
      dados.formatoAtendimento
    ),

    sexo: sexoNormalizado(
      dados.sexo || dados.genero
    ),

    aceitaAgendamentos:
      dados.aceitaAgendamentos !== false,

    atendeEspontaneo:
      dados.atendimentoEspontaneo === true ||
      dados.aceitaEspontaneo === true,

    disponivelAgora:
      dados.disponivelAgora === true,

    proximosHorarios: paraLista(
      dados.agendaPublica?.proximosHorarios ||
      dados.proximosHorarios
    ).slice(0, 3),
  };
}

// =====================================================
// HOME DO PACIENTE
// =====================================================

export default function ClienteHome() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===================================================
  // ESTADOS DA CONTA
  // ===================================================

  const [usuario, setUsuario] = useState(null);

  const [
    carregandoConta,
    setCarregandoConta,
  ] = useState(true);

  const [erroConta, setErroConta] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  // ===================================================
  // ESTADOS DOS PROFISSIONAIS
  // ===================================================

  const [
    profissionais,
    setProfissionais,
  ] = useState([]);

  const [
    carregandoProfissionais,
    setCarregandoProfissionais,
  ] = useState(true);

  const [
    erroProfissionais,
    setErroProfissionais,
  ] = useState("");

  const [atualizacao, setAtualizacao] =
    useState(0);

  // ===================================================
  // FILTROS INICIAIS
  // ===================================================

  const especialidadeInicial =
    ESPECIALIDADES.includes(
      location.state?.especialidade
    )
      ? location.state.especialidade
      : "";

  const [rascunho, setRascunho] = useState({
    ...FILTROS_VAZIOS,
    especialidade: especialidadeInicial,
  });

  const [filtros, setFiltros] = useState({
    ...FILTROS_VAZIOS,
    especialidade: especialidadeInicial,
  });

  // ===================================================
  // BUSCA E ORDENAÇÃO
  // ===================================================

  const [busca, setBusca] = useState("");

  const [ordenacao, setOrdenacao] =
    useState("relevantes");

  const [
    tipoAtendimento,
    setTipoAtendimento,
  ] = useState("agendamento");

  const [
    perfilAberto,
    setPerfilAberto,
  ] = useState(null);

  // ===================================================
  // NAVEGAÇÃO
  // ===================================================

  const [
    notificacoesAbertas,
    setNotificacoesAbertas,
  ] = useState(false);

  const [
    menuContaAberto,
    setMenuContaAberto,
  ] = useState(false);

  const [
    menuMobileAberto,
    setMenuMobileAberto,
  ] = useState(false);

  // ===================================================
  // AUTENTICAÇÃO DO PACIENTE
  // ===================================================

  useEffect(() => {
    let ativo = true;

    const cancelar = onAuthStateChanged(
      auth,

      async (conta) => {
        if (!conta) {
          if (ativo) {
            setCarregandoConta(false);

            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        try {
          const registro = await getDoc(
            doc(db, "usuarios", conta.uid)
          );

          if (!ativo) return;

          if (!registro.exists()) {
            throw new Error(
              "Seu cadastro não foi encontrado na Elora."
            );
          }

          const dados = registro.data();

          if (dados.tipo !== "paciente") {
            navigate("/login/psicologo", {
              replace: true,
            });

            return;
          }

          setUsuario({
            nome: dados.nome || "",
            email:
              dados.email ||
              conta.email ||
              "",
          });

          setErroConta("");
        } catch (erro) {
          if (ativo) {
            setErroConta(
              erro.message ||
              "Não foi possível carregar sua conta."
            );
          }
        } finally {
          if (ativo) {
            setCarregandoConta(false);
          }
        }
      },

      () => {
        if (ativo) {
          setErroConta(
            "Não foi possível confirmar sua sessão."
          );

          setCarregandoConta(false);
        }
      }
    );

    return () => {
      ativo = false;
      cancelar();
    };
  }, [navigate]);

  // ===================================================
  // CONSULTA DE PSICÓLOGOS
  // ===================================================

  useEffect(() => {
    if (!usuario) return;

    let ativo = true;

    async function carregarProfissionais() {
      setCarregandoProfissionais(true);
      setErroProfissionais("");

      try {
        const consulta = query(
          collection(db, "psicologos"),

          where(
            "statusVerificacao",
            "in",
            STATUS_APROVADOS
          ),

          limit(100)
        );

        const resultado = await getDocs(
          consulta
        );

        const lista = resultado.docs
          .map(prepararProfissional)
          .filter(Boolean);

        if (ativo) {
          setProfissionais(lista);
        }
      } catch (erro) {
        console.error(
          "Falha ao buscar psicólogos:",
          erro
        );

        if (ativo) {
          setProfissionais([]);

          setErroProfissionais(
            erro.code === "permission-denied"
              ? "As regras atuais do Firestore não permitem consultar os perfis profissionais."
              : "Não foi possível carregar os profissionais. Tente novamente."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoProfissionais(false);
        }
      }
    }

    carregarProfissionais();

    return () => {
      ativo = false;
    };
  }, [usuario, atualizacao]);

  // ===================================================
  // FILTRAGEM DOS PROFISSIONAIS
  // ===================================================

  const resultados = useMemo(() => {
    const termo = normalizar(busca);

    const lista = profissionais.filter(
      (profissional) => {
        // Atendimento espontâneo
        if (
          tipoAtendimento === "espontaneo" &&
          !profissional.atendeEspontaneo
        ) {
          return false;
        }

        // Agendamento
        if (
          tipoAtendimento === "agendamento" &&
          !profissional.aceitaAgendamentos
        ) {
          return false;
        }

        // Sexo do profissional
        if (
          filtros.sexo &&
          profissional.sexo !== filtros.sexo
        ) {
          return false;
        }

        // Especialidade
        if (
          filtros.especialidade &&
          !profissional.especialidades.some(
            (item) =>
              normalizar(item).includes(
                normalizar(
                  filtros.especialidade
                )
              )
          )
        ) {
          return false;
        }

        // Abordagem
        if (
          filtros.abordagem &&
          !profissional.abordagens.some(
            (item) =>
              normalizar(item).includes(
                normalizar(
                  filtros.abordagem
                )
              )
          )
        ) {
          return false;
        }

        // Formato de atendimento
        if (
          filtros.formatos.length &&
          !filtros.formatos.some(
            (formato) =>
              profissional.formatos.some(
                (item) =>
                  normalizar(item).includes(
                    normalizar(formato)
                  )
              )
          )
        ) {
          return false;
        }

        // Busca por texto
        if (termo) {
          const texto = normalizar(
            [
              profissional.nome,
              profissional.crp,
              profissional.biografia,
              ...profissional.especialidades,
              ...profissional.abordagens,
            ].join(" ")
          );

          if (!texto.includes(termo)) {
            return false;
          }
        }

        return true;
      }
    );

    // Ordenação por nome
    if (ordenacao === "nome") {
      lista.sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt-BR"
        )
      );
    }

    // Ordenação por disponibilidade
    if (ordenacao === "online") {
      lista.sort(
        (a, b) =>
          Number(b.disponivelAgora) -
          Number(a.disponivelAgora)
      );
    }

    return lista;
  }, [
    profissionais,
    busca,
    filtros,
    ordenacao,
    tipoAtendimento,
  ]);

  // ===================================================
  // AÇÕES DOS FILTROS
  // ===================================================

  function alternarFormato(formato) {
    setRascunho((atual) => ({
      ...atual,

      formatos: atual.formatos.includes(
        formato
      )
        ? atual.formatos.filter(
            (item) => item !== formato
          )
        : [
            ...atual.formatos,
            formato,
          ],
    }));
  }

  function aplicarFiltros(evento) {
    evento.preventDefault();

    setFiltros({
      ...rascunho,
      formatos: [
        ...rascunho.formatos,
      ],
    });
  }

  function limparFiltros() {
    const vazios = {
      ...FILTROS_VAZIOS,
      formatos: [],
    };

    setRascunho(vazios);
    setFiltros(vazios);

    setBusca("");
    setOrdenacao("relevantes");
    setPerfilAberto(null);
  }

  // ===================================================
  // SAIR DA CONTA
  // ===================================================

  async function sair() {
    setErroAcao("");

    try {
      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch {
      setErroAcao(
        "Não foi possível sair da conta. Tente novamente."
      );
    }
  }

  // ===================================================
  // CARREGAMENTO
  // ===================================================

  if (carregandoConta) {
    return (
      <main className="eh-pagina-estado">
        Preparando seu espaço na Elora...
      </main>
    );
  }

  if (erroConta || !usuario) {
    return (
      <main className="eh-pagina-estado">
        <h1>
          Não conseguimos abrir sua conta.
        </h1>

        <p>
          {erroConta ||
            "Faça login para continuar."}
        </p>

        <Link
          to="/login"
          className="eh-botao-roxo"
        >
          Voltar ao login
        </Link>
      </main>
    );
  }

  const primeiroNome =
    usuario.nome.trim().split(/\s+/)[0] ||
    "Paciente";

  // ===================================================
  // INTERFACE
  // ===================================================

  return (
    <div className="eh-page eh-cliente">

      {/* ============================================
          HEADER E BANNER
      ============================================ */}

      <div className="eh-topo">

        <header className="eh-header">
          <div className="eh-header-inner">

            {/* LOGO */}

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

            {/* MENU MOBILE */}

            <button
              type="button"
              className="eh-menu-mobile"
              aria-label={
                menuMobileAberto
                  ? "Fechar menu"
                  : "Abrir menu"
              }
              aria-expanded={
                menuMobileAberto
              }
              onClick={() =>
                setMenuMobileAberto(
                  (atual) => !atual
                )
              }
            >
              <Icone tipo="menu" />
            </button>

            {/* NAVEGAÇÃO */}

            <nav
              className={`eh-nav ${
                menuMobileAberto
                  ? "eh-nav-aberto"
                  : ""
              }`}
              aria-label="Área do paciente"
            >

              {/* INÍCIO */}

              <Link
                to="/cliente"
                className="eh-nav-ativo"
                onClick={() =>
                  setMenuMobileAberto(false)
                }
              >
                <Icone tipo="inicio" />
                Início
              </Link>

              {/* BUSCAR PSICÓLOGO */}

              <a
                href="#eh-profissionais"
                onClick={() =>
                  setMenuMobileAberto(false)
                }
              >
                <Icone tipo="busca" />
                Buscar Psicólogo(a)
              </a>

              {/* MEUS ATENDIMENTOS - CORRIGIDO */}

              <Link
                to="/cliente/atendimentos"
                onClick={() =>
                  setMenuMobileAberto(false)
                }
              >
                <Icone tipo="calendario" />
                Meus Atendimentos
              </Link>

              {/* TRIAGEM */}

              <Link
                to="/triagem"
                onClick={() =>
                  setMenuMobileAberto(false)
                }
              >
                <Icone tipo="coracao" />
                Triagem
              </Link>

              {/* MINHA CONTA */}

              <Link
                to="/minha-conta"
                onClick={() =>
                  setMenuMobileAberto(false)
                }
              >
                <Icone tipo="usuario" />
                Minha Conta
              </Link>

            </nav>

            {/* ====================================
                AÇÕES DO CABEÇALHO
            ==================================== */}

            <div className="eh-header-actions">

              {/* NOTIFICAÇÕES */}

              <div className="eh-popover-wrap">
                <button
                  className="eh-icon-button"
                  type="button"
                  aria-label="Notificações"
                  aria-expanded={
                    notificacoesAbertas
                  }
                  onClick={() => {
                    setNotificacoesAbertas(
                      (atual) => !atual
                    );

                    setMenuContaAberto(false);
                  }}
                >
                  <Icone tipo="sino" />
                </button>

                {notificacoesAbertas && (
                  <div className="eh-popover">
                    <strong>
                      Notificações
                    </strong>

                    <p>
                      Novidades dos seus
                      atendimentos aparecerão aqui.
                    </p>
                  </div>
                )}
              </div>

              {/* MENU DA CONTA */}

              <div className="eh-popover-wrap">
                <button
                  className="eh-avatar-button"
                  type="button"
                  aria-label="Abrir menu da conta"
                  aria-expanded={
                    menuContaAberto
                  }
                  onClick={() => {
                    setMenuContaAberto(
                      (atual) => !atual
                    );

                    setNotificacoesAbertas(
                      false
                    );
                  }}
                >
                  <span className="eh-avatar-header">
                    {iniciais(
                      usuario.nome ||
                      usuario.email
                    )}
                  </span>

                  <span aria-hidden="true">
                    ⌄
                  </span>
                </button>

                {menuContaAberto && (
                  <div className="eh-popover eh-menu-perfil">
                    <strong>
                      {primeiroNome}
                    </strong>

                    <small>
                      {usuario.email}
                    </small>

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

        {/* ====================================
            BANNER PRINCIPAL
        ==================================== */}

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
              para a sua{" "}
              <em>jornada.</em>
            </h1>

            <p>
              Psicólogos qualificados,
              verificados e prontos para
              caminhar com você, no seu
              tempo e com acolhimento.
            </p>
          </div>

          <div
            className="eh-hero-foto"
            aria-hidden="true"
          />
        </section>
      </div>

      {/* ============================================
          CONTEÚDO PRINCIPAL
      ============================================ */}

      <main className="eh-container">
        <div className="eh-discovery-layout">

          {/* ====================================
              FILTROS - COLUNA ESQUERDA
          ==================================== */}

          <aside className="eh-sidebar">
            <form onSubmit={aplicarFiltros}>

              {/* CABEÇALHO DOS FILTROS */}

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
                  Limpar filtros
                </button>
              </div>

              {/* SEXO DO PROFISSIONAL */}

              <fieldset className="eh-filtro-grupo">
                <legend>
                  Sexo do profissional
                </legend>

                <div className="eh-sexo-opcoes">

                  {["Homem", "Mulher"].map(
                    (sexo) => (
                      <button
                        type="button"
                        key={sexo}
                        className={`eh-sexo-opcao ${
                          rascunho.sexo === sexo
                            ? "eh-sexo-ativo"
                            : ""
                        }`}
                        aria-pressed={
                          rascunho.sexo === sexo
                        }
                        onClick={() =>
                          setRascunho(
                            (atual) => ({
                              ...atual,

                              sexo:
                                atual.sexo === sexo
                                  ? ""
                                  : sexo,
                            })
                          )
                        }
                      >
                        <Icone tipo="usuario" />
                        {sexo}
                      </button>
                    )
                  )}

                </div>
              </fieldset>

              {/* ESPECIALIDADE */}

              <label className="eh-filtro-select">
                Especialidade

                <select
                  value={
                    rascunho.especialidade
                  }
                  onChange={(evento) =>
                    setRascunho(
                      (atual) => ({
                        ...atual,

                        especialidade:
                          evento.target.value,
                      })
                    )
                  }
                >
                  <option value="">
                    Todas as especialidades
                  </option>

                  {ESPECIALIDADES.map(
                    (especialidade) => (
                      <option
                        key={especialidade}
                        value={especialidade}
                      >
                        {especialidade}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* ABORDAGEM */}

              <label className="eh-filtro-select">
                Abordagem

                <select
                  value={rascunho.abordagem}
                  onChange={(evento) =>
                    setRascunho(
                      (atual) => ({
                        ...atual,

                        abordagem:
                          evento.target.value,
                      })
                    )
                  }
                >
                  <option value="">
                    Todas as abordagens
                  </option>

                  {ABORDAGENS.map(
                    (abordagem) => (
                      <option
                        key={abordagem}
                        value={abordagem}
                      >
                        {abordagem}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* FORMATO DE ATENDIMENTO */}

              <fieldset className="eh-filtro-grupo">
                <legend>
                  Formato de atendimento
                </legend>

                <div className="eh-checks">

                  {FORMATOS.map((formato) => (
                    <label key={formato}>
                      <input
                        type="checkbox"
                        checked={
                          rascunho.formatos.includes(
                            formato
                          )
                        }
                        onChange={() =>
                          alternarFormato(formato)
                        }
                      />

                      {formato}
                    </label>
                  ))}

                </div>
              </fieldset>

              {/* APLICAR FILTROS */}

              <button
                className="eh-botao-roxo eh-aplicar"
                type="submit"
              >
                <Icone tipo="filtro" />
                Aplicar filtros
              </button>
            </form>
          </aside>

          {/* ====================================
              RESULTADOS - COLUNA DIREITA
          ==================================== */}

          <section
            className="eh-resultados"
            id="eh-profissionais"
            aria-labelledby="eh-titulo-profissionais"
          >

            {/* BUSCA E ORDENAÇÃO */}

            <div className="eh-busca-linha">

              <label className="eh-busca">
                <Icone tipo="busca" />

                <span className="eh-visualmente-oculto">
                  Buscar psicólogos
                </span>

                <input
                  type="search"
                  value={busca}
                  onChange={(evento) =>
                    setBusca(
                      evento.target.value
                    )
                  }
                  placeholder="Buscar por nome, abordagem, especialidade..."
                />
              </label>

              <label className="eh-ordenar">
                Ordenar por:

                <select
                  value={ordenacao}
                  onChange={(evento) =>
                    setOrdenacao(
                      evento.target.value
                    )
                  }
                >
                  <option value="relevantes">
                    Mais relevantes
                  </option>

                  <option value="nome">
                    Nome A-Z
                  </option>

                  <option value="online">
                    Disponíveis agora
                  </option>
                </select>
              </label>
            </div>

            {/* ====================================
                ABAS DE ATENDIMENTO
            ==================================== */}

            <div
              className="eh-abas"
              role="group"
              aria-label="Tipo de atendimento"
            >

              <button
                type="button"
                className={
                  tipoAtendimento ===
                  "agendamento"
                    ? "eh-aba-ativa"
                    : ""
                }
                aria-pressed={
                  tipoAtendimento ===
                  "agendamento"
                }
                onClick={() =>
                  setTipoAtendimento(
                    "agendamento"
                  )
                }
              >
                <Icone tipo="calendario" />
                Agendamento
              </button>

              <button
                type="button"
                className={
                  tipoAtendimento ===
                  "espontaneo"
                    ? "eh-aba-ativa"
                    : ""
                }
                aria-pressed={
                  tipoAtendimento ===
                  "espontaneo"
                }
                onClick={() =>
                  setTipoAtendimento(
                    "espontaneo"
                  )
                }
              >
                <Icone tipo="raio" />
                Plantão Psicológico
              </button>

            </div>

            {/* ====================================
                TÍTULO DOS RESULTADOS
            ==================================== */}

            <div className="eh-lista-topo">

              <h2 id="eh-titulo-profissionais">
                Psicólogos(as)
              </h2>

              <p role="status">
                {carregandoProfissionais
                  ? "Buscando profissionais..."
                  : `${resultados.length} profissional(is) encontrado(s)`}
              </p>
            </div>

            {/* ====================================
                ERRO DE CONSULTA
            ==================================== */}

            {erroProfissionais ? (
              <div
                className="eh-feedback-busca"
                role="alert"
              >
                <h3>
                  Não foi possível consultar
                  a rede da Elora.
                </h3>

                <p>
                  {erroProfissionais}
                </p>

                <button
                  type="button"
                  className="eh-botao-roxo"
                  onClick={() =>
                    setAtualizacao(
                      (valor) => valor + 1
                    )
                  }
                >
                  Tentar novamente
                </button>
              </div>

            ) : carregandoProfissionais ? (

              /* CARREGAMENTO */

              <div
                className="eh-feedback-busca"
                role="status"
              >
                <h3>
                  Buscando profissionais
                  verificados...
                </h3>

                <p>
                  Estamos consultando os perfis
                  disponíveis na Elora.
                </p>
              </div>

            ) : resultados.length === 0 ? (

              /* ====================================
                  ESTADO VAZIO
              ==================================== */

              <div className="eh-empty">

                <div
                  className="eh-empty-ilustracao"
                  aria-hidden="true"
                >
                  <img
                    src="/images/login-paciente.png"
                    alt=""
                  />
                </div>

                <div className="eh-empty-conteudo">

                  <span className="eh-empty-etiqueta">
                    SEU ESPAÇO DE CUIDADO
                  </span>

                  <h3>
                    Nenhum profissional encontrado
                    nesta seleção.
                  </h3>

                  <p>
                    Experimente outros filtros
                    ou volte mais tarde.
                    Somente perfis aprovados
                    para exibição aparecem aqui.
                  </p>

                  <button
                    type="button"
                    className="eh-botao-contorno"
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>

            ) : (

              /* ====================================
                  CARDS DOS PROFISSIONAIS
              ==================================== */

              <div className="eh-lista">

                {resultados.map(
                  (profissional) => {
                    const aberto =
                      perfilAberto ===
                      profissional.id;

                    return (
                      <article
                        className="eh-profissional"
                        key={profissional.id}
                      >

                        {/* FOTO E DADOS */}

                        <div className="eh-perfil-basico">

                          <div className="eh-avatar-profissional">

                            {profissional.fotoURL ? (
                              <img
                                src={
                                  profissional.fotoURL
                                }
                                alt={`Foto de ${profissional.nome}`}
                                loading="lazy"
                              />
                            ) : (
                              <span>
                                {iniciais(
                                  profissional.nome
                                )}
                              </span>
                            )}
                          </div>

                          {/* INFORMAÇÕES */}

                          <div className="eh-profissional-info">

                            <div className="eh-nome-linha">
                              <h3>
                                {profissional.nome}
                              </h3>

                              <span
                                className="eh-verificado"
                                title="Perfil verificado"
                              >
                                <Icone
                                  tipo="check"
                                  tamanho={14}
                                />
                              </span>
                            </div>

                            <p className="eh-crp">
                              CRP{" "}
                              {profissional.crp}
                            </p>

                            {profissional.disponivelAgora && (
                              <span className="eh-online">
                                <i />
                                Disponível agora
                              </span>
                            )}

                            {profissional.abordagens.length >
                              0 && (
                              <p className="eh-abordagem">
                                Abordagem:{" "}
                                {profissional.abordagens.join(
                                  ", "
                                )}
                              </p>
                            )}

                            <div className="eh-tags">

                              {profissional.especialidades
                                .slice(0, 4)
                                .map((tema) => (
                                  <span key={tema}>
                                    {tema}
                                  </span>
                                ))}

                            </div>
                          </div>
                        </div>

                        {/* ====================================
                            DISPONIBILIDADE
                        ==================================== */}

                        <div className="eh-perfil-agenda">

                          <strong>
                            <Icone
                              tipo={
                                tipoAtendimento ===
                                "agendamento"
                                  ? "calendario"
                                  : "raio"
                              }
                            />

                            {tipoAtendimento ===
                            "agendamento"
                              ? "Próximas disponibilidades"
                              : "Atendimento espontâneo"}
                          </strong>

                          {tipoAtendimento ===
                          "agendamento" ? (

                            profissional.proximosHorarios.length >
                            0 ? (

                              <div className="eh-horarios">

                                {profissional.proximosHorarios.map(
                                  (horario) => (
                                    <span key={horario}>
                                      {horario}
                                    </span>
                                  )
                                )}

                              </div>

                            ) : (
                              <p>
                                Horários ainda não
                                divulgados.
                              </p>
                            )

                          ) : (
                            <p>
                              {profissional.disponivelAgora
                                ? "Profissional disponível agora."
                                : "Sem disponibilidade imediata confirmada."}
                            </p>
                          )}

                          {profissional.formatos.length >
                            0 && (
                            <p className="eh-formatos">
                              <Icone
                                tipo="monitor"
                                tamanho={16}
                              />

                              {profissional.formatos.join(
                                " · "
                              )}
                            </p>
                          )}
                        </div>

                        {/* ====================================
                            BOTÕES DOS PROFISSIONAIS
                        ==================================== */}

                        <div className="eh-perfil-acoes">

                          <button
                            type="button"
                            className="eh-botao-roxo"
                            aria-expanded={
                              aberto
                            }
                            onClick={() =>
                              setPerfilAberto(
                                aberto
                                  ? null
                                  : profissional.id
                              )
                            }
                          >
                            {aberto
                              ? "Fechar perfil"
                              : "Ver perfil"}
                          </button>

                          <button
                            type="button"
                            className="eh-botao-contorno"
                            disabled
                            title="Disponível após integração dos atendimentos"
                          >
                            {tipoAtendimento ===
                            "agendamento"
                              ? "Agendar sessão"
                              : "Iniciar conversa"}
                          </button>

                        </div>

                        {/* ====================================
                            PERFIL EXPANDIDO
                        ==================================== */}

                        {aberto && (
                          <div className="eh-detalhe">

                            <p>
                              <strong>
                                Sobre:
                              </strong>{" "}

                              {profissional.biografia ||
                                "Descrição profissional ainda não informada."}
                            </p>

                            <p>
                              <strong>
                                Especialidades:
                              </strong>{" "}

                              {profissional.especialidades.join(
                                ", "
                              ) || "Não informadas"}
                            </p>

                            <p>
                              <strong>
                                Abordagens:
                              </strong>{" "}

                              {profissional.abordagens.join(
                                ", "
                              ) || "Não informadas"}
                            </p>

                            <p>
                              <strong>
                                Modalidades:
                              </strong>{" "}

                              {profissional.formatos.join(
                                ", "
                              ) || "Não informadas"}
                            </p>

                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>

        {/* ============================================
            SEÇÃO DE ATENDIMENTOS
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

              <h2>
                Meus atendimentos
              </h2>

              <p>
                Acompanhe suas consultas
                e compromissos.
              </p>
            </div>

            <Icone
              tipo="calendario"
              tamanho={28}
            />
          </div>

          <div className="eh-atendimentos-vazio">

            <Icone
              tipo="calendario"
              tamanho={24}
            />

            <div>
              <strong>
                Nenhum atendimento agendado.
              </strong>

              <p>
                Quando sua primeira sessão
                for agendada, os detalhes
                aparecerão aqui.
              </p>
            </div>

          </div>
        </section>

        {/* ERROS DE AÇÕES */}

        {erroAcao && (
          <p
            className="eh-erro-acao"
            role="alert"
          >
            {erroAcao}
          </p>
        )}
      </main>

      {/* ============================================
          RODAPÉ
      ============================================ */}

      <footer className="eh-footer">

        <span>
          elora
        </span>

        <p>
          Seu espaço de cuidado
          e bem-estar.
        </p>

      </footer>
    </div>
  );
}
