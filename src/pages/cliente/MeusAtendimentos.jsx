
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./MeusAtendimentos.css";

// =====================================================
// CONFIGURAÇÃO DOS STATUS
// =====================================================

const ABAS = [
  { id: "todos", nome: "Todos", icone: "calendar" },
  { id: "solicitado", nome: "Solicitados", icone: "send" },
  { id: "confirmado", nome: "Confirmados", icone: "calendarCheck" },
  { id: "concluido", nome: "Concluídos", icone: "checkCircle" },
];

const STATUS = {
  solicitado: {
    titulo: "Atendimento solicitado",
    detalhe: "Aguardando confirmação do(a) psicólogo(a).",
    icone: "send",
  },
  confirmado: {
    titulo: "Atendimento confirmado",
    detalhe: "Seu atendimento está confirmado.",
    icone: "calendarCheck",
  },
  concluido: {
    titulo: "Atendimento concluído",
    detalhe: "Atendimento realizado.",
    icone: "checkCircle",
  },
  cancelado: {
    titulo: "Atendimento cancelado",
    detalhe: "Este atendimento foi cancelado.",
    icone: "xCircle",
  },
};

// =====================================================
// ÍCONES
// =====================================================

function Icone({ nome, tamanho = 20 }) {
  const desenhos = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9M9 21v-7h6v7" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),

    calendarCheck: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18m-12 5 3 3 5-5" />
      </>
    ),

    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l7.8-7.5a5.5 5.5 0 0 0 0-7.8Z" />
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    checkCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),

    xCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    monitor: (
      <>
        <rect x="3" y="4" width="18" height="15" rx="2" />
        <path d="M8 22h8M12 19v3" />
      </>
    ),

    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),

    x: <path d="M5 5l14 14M19 5 5 19" />,

    leaf: (
      <>
        <path d="M20 4C12 4 4 8 4 17c7 3 16-1 16-13Z" />
        <path d="M5 20c2-6 6-10 12-13" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10h.01" />
      </>
    ),

    menu: <path d="M4 6h16M4 12h16M4 18h16" />,

    logout: (
      <>
        <path d="m10 17 5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
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
      {desenhos[nome]}
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

function dataRelativa(dias) {
  const data = new Date();
  data.setHours(12, 0, 0, 0);
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

function formatarData(dataISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO || "")) {
    return {
      dia: "--",
      mes: "---",
      semana: "---",
      completa: "Data não informada",
    };
  }

  const data = new Date(`${dataISO}T12:00:00`);

  return {
    dia: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
    }).format(data),

    mes: new Intl.DateTimeFormat("pt-BR", {
      month: "short",
    })
      .format(data)
      .replace(".", ""),

    semana: new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
    })
      .format(data)
      .replace(".", ""),

    completa: new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
    }).format(data),
  };
}

// =====================================================
// DADOS EXCLUSIVOS DE DEMONSTRAÇÃO
// Não são atendimentos reais.
// =====================================================

function criarDadosDemo() {
  return [
    {
      id: "demo-solicitado",
      status: "solicitado",
      data: dataRelativa(3),
      hora: "14:00",
      duracao: 50,
      modalidade: "online",
      psicologo: "Dra. Camila Mendes",
      crp: "CRP demonstrativo",
      local: "",
      fotoURL: "",
    },
    {
      id: "demo-confirmado",
      status: "confirmado",
      data: dataRelativa(7),
      hora: "18:00",
      duracao: 50,
      modalidade: "online",
      psicologo: "Dr. Rafael Antunes",
      crp: "CRP demonstrativo",
      local: "",
      fotoURL: "",
    },
    {
      id: "demo-concluido",
      status: "concluido",
      data: dataRelativa(-8),
      hora: "15:00",
      duracao: 50,
      modalidade: "online",
      psicologo: "Dra. Camila Mendes",
      crp: "CRP demonstrativo",
      local: "",
      fotoURL: "",
    },
  ];
}

// =====================================================
// CARTÃO DE ATENDIMENTO
// =====================================================

function CartaoAtendimento({ atendimento, onDetalhes }) {
  const status =
    STATUS[atendimento.status] || STATUS.solicitado;

  const data = formatarData(atendimento.data);

  return (
    <article
      className={`ma-atendimento ma-status-${atendimento.status}`}
    >
      <span className="ma-linha-ponto" aria-hidden="true" />

      <div className="ma-data-card">
        <span>{data.semana}</span>
        <strong>{data.dia}</strong>
        <span>{data.mes}</span>
      </div>

      <div className="ma-atendimento-profissional">
        <span className="ma-status-chip">
          <Icone nome={status.icone} tamanho={15} />
          {status.titulo}
        </span>

        <div className="ma-profissional-cabecalho">
          <div className="ma-profissional-avatar">
            {atendimento.fotoURL ? (
              <img
                src={atendimento.fotoURL}
                alt=""
                loading="lazy"
              />
            ) : (
              iniciais(atendimento.psicologo)
            )}
          </div>

          <div>
            <h3>{atendimento.psicologo}</h3>
            <p>
              Psicólogo(a) · {atendimento.crp}
            </p>
          </div>
        </div>

        <div className="ma-atendimento-metadados">
          <span>
            <Icone nome="clock" tamanho={16} />
            {atendimento.hora}
          </span>

          <span>
            <Icone
              nome={
                atendimento.modalidade === "online"
                  ? "monitor"
                  : "pin"
              }
              tamanho={16}
            />
            {atendimento.modalidade === "online"
              ? "Online"
              : "Presencial"}
          </span>
        </div>
      </div>

      <div className="ma-status-descricao">
        <Icone nome={status.icone} tamanho={20} />
        <span>{status.detalhe}</span>
      </div>

      <div className="ma-atendimento-acoes">
        <button
          type="button"
          className="ma-botao ma-botao-contorno"
          onClick={() => onDetalhes(atendimento)}
        >
          <Icone nome="eye" tamanho={17} />
          Ver detalhes
        </button>

        {(
          atendimento.status === "solicitado" ||
          atendimento.status === "confirmado"
        ) && (
          <button
            type="button"
            className="ma-botao ma-botao-secundario"
            disabled
            title="Disponível após integração do fluxo de atendimentos"
          >
            <Icone
              nome={
                atendimento.status === "solicitado"
                  ? "x"
                  : "calendar"
              }
              tamanho={16}
            />

            {atendimento.status === "solicitado"
              ? "Solicitar cancelamento"
              : "Solicitar reagendamento"}
          </button>
        )}
      </div>
    </article>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function MeusAtendimentos() {
  const navigate = useNavigate();
  const location = useLocation();

  const demonstracao =
    new URLSearchParams(location.search).get("demo") === "1";

  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [aba, setAba] = useState("todos");
  const [detalheAberto, setDetalheAberto] = useState(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);

  // ===================================================
  // AUTENTICAÇÃO DO PACIENTE
  // ===================================================

  useEffect(() => {
    let ativo = true;

    const cancelar = onAuthStateChanged(
      auth,
      async (conta) => {
        if (!conta) {
          navigate("/login", { replace: true });
          return;
        }

        try {
          const registro = await getDoc(
            doc(db, "usuarios", conta.uid)
          );

          if (!ativo) return;

          if (!registro.exists()) {
            setErro(
              "Seu cadastro não foi encontrado na Elora."
            );
            return;
          }

          const dados = registro.data();

          if (dados.tipo !== "paciente") {
            navigate("/psicologo", { replace: true });
            return;
          }

          setPerfil({
            nome:
              dados.nome ||
              conta.displayName ||
              "Paciente",

            email:
              dados.email ||
              conta.email ||
              "",
          });
        } catch {
          if (ativo) {
            setErro(
              "Não foi possível carregar sua conta. Verifique sua conexão."
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
      cancelar();
    };
  }, [navigate]);

  // ===================================================
  // MODAL DE DETALHES
  // ===================================================

  useEffect(() => {
    if (!detalheAberto) return;

    function fecharTeclado(evento) {
      if (evento.key === "Escape") {
        setDetalheAberto(null);
      }
    }

    window.addEventListener("keydown", fecharTeclado);

    return () => {
      window.removeEventListener("keydown", fecharTeclado);
    };
  }, [detalheAberto]);

  // ===================================================
  // DADOS
  // O Firebase de atendimentos será integrado depois.
  // ===================================================

  const atendimentos = useMemo(
    () => demonstracao ? criarDadosDemo() : [],
    [demonstracao]
  );

  const filtrados = useMemo(() => {
    const lista =
      aba === "todos"
        ? atendimentos
        : atendimentos.filter(
            (item) => item.status === aba
          );

    const prioridade = {
      solicitado: 0,
      confirmado: 1,
      concluido: 2,
      cancelado: 3,
    };

    return [...lista].sort(
      (a, b) =>
        prioridade[a.status] - prioridade[b.status] ||
        `${a.data}T${a.hora}`.localeCompare(
          `${b.data}T${b.hora}`
        )
    );
  }, [atendimentos, aba]);

  const primeiroNome = (
    perfil?.nome || "Paciente"
  ).trim().split(/\s+/)[0];

  // ===================================================
  // SAIR
  // ===================================================

  async function sair() {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch {
      setErro(
        "Não foi possível encerrar sua sessão."
      );
    }
  }

  // ===================================================
  // CARREGAMENTO
  // ===================================================

  if (carregando) {
    return (
      <main className="ma-estado-pagina">
        Preparando seus atendimentos na Elora...
      </main>
    );
  }

  if (erro || !perfil) {
    return (
      <main className="ma-estado-pagina">
        <h1>Não foi possível abrir seus atendimentos</h1>

        <p>
          {erro || "Faça login para continuar."}
        </p>

        <Link
          className="ma-botao ma-botao-roxo"
          to="/login"
        >
          Voltar ao login
        </Link>
      </main>
    );
  }

  return (
    <div className="ma-pagina">

      {/* =============================================
          HEADER
      ============================================= */}

      <header className="ma-header">
        <div className="ma-header-interno">

          <Link
            to="/cliente"
            className="ma-marca"
            aria-label="Elora — área do paciente"
          >
            <img
              src="/images/logo-elora.png"
              alt=""
            />
            <span>elora</span>
          </Link>

          <button
            type="button"
            className="ma-menu-mobile"
            aria-label="Alternar menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <Icone nome="menu" />
          </button>

          <nav
            className={`ma-nav ${
              menuAberto ? "ma-nav-aberto" : ""
            }`}
            aria-label="Área do paciente"
          >
            <Link to="/cliente">
              <Icone nome="home" tamanho={18} />
              Início
            </Link>

            <Link to="/cliente#eh-profissionais">
              <Icone nome="search" tamanho={18} />
              Buscar Psicólogo(a)
            </Link>

            <Link
              to="/cliente/atendimentos"
              className="ma-nav-ativo"
              aria-current="page"
            >
              <Icone nome="calendar" tamanho={18} />
              Meus Atendimentos
            </Link>

            <Link to="/triagem">
              <Icone nome="heart" tamanho={18} />
              Triagem
            </Link>

            <Link to="/minha-conta">
              <Icone nome="user" tamanho={18} />
              Minha Conta
            </Link>
          </nav>

          <div className="ma-conta-wrap">
            <button
              type="button"
              className="ma-conta-botao"
              aria-expanded={contaAberta}
              aria-label="Abrir menu da conta"
              onClick={() =>
                setContaAberta(!contaAberta)
              }
            >
              <span className="ma-iniciais">
                {iniciais(perfil.nome)}
              </span>

              <span aria-hidden="true">⌄</span>
            </button>

            {contaAberta && (
              <div className="ma-conta-popover">
                <strong>{perfil.nome}</strong>
                <small>{perfil.email}</small>

                <Link to="/minha-conta">
                  <Icone nome="user" tamanho={17} />
                  Minha conta
                </Link>

                <button
                  type="button"
                  onClick={sair}
                >
                  <Icone nome="logout" tamanho={17} />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =============================================
          BANNER
      ============================================= */}

      <section
        className="ma-hero"
        aria-labelledby="ma-titulo"
      >
        <div className="ma-hero-conteudo">
          <p className="ma-sobretitulo">
            MEUS ATENDIMENTOS
          </p>

          <h1 id="ma-titulo">
            Meus Atendimentos
          </h1>

          <p>
            Acompanhe, gerencie e organize seus
            atendimentos na Elora,
            <br className="ma-quebra" />
            {" "}com praticidade e tranquilidade.
          </p>
        </div>
      </section>

      {/* =============================================
          CONTEÚDO
      ============================================= */}

      <main className="ma-conteudo">

        {/* IDENTIFICAÇÃO DA DEMONSTRAÇÃO */}

        {demonstracao && (
          <div
            className="ma-aviso-demo"
            role="status"
          >
            <Icone nome="info" tamanho={18} />

            <span>
              <strong>Modo demonstração:</strong>{" "}
              nomes, datas e atendimentos fictícios.
              Nenhuma ação é salva no Firebase.
            </span>

            <Link to="/cliente/atendimentos">
              Sair do modo demo
            </Link>
          </div>
        )}

        <div className="ma-grade">

          {/* =========================================
              COLUNA PRINCIPAL
          ========================================= */}

          <div className="ma-coluna-principal">

            <section
              className="ma-painel-atendimentos"
              aria-label="Lista de atendimentos"
            >
              <div
                className="ma-abas"
                role="group"
                aria-label="Filtrar por status"
              >
                {ABAS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      aba === item.id
                        ? "ma-aba-ativa"
                        : ""
                    }
                    aria-pressed={aba === item.id}
                    onClick={() => setAba(item.id)}
                  >
                    <Icone
                      nome={item.icone}
                      tamanho={19}
                    />
                    {item.nome}
                  </button>
                ))}
              </div>

              {/* ATENDIMENTOS OU ESTADO VAZIO */}

              {filtrados.length > 0 ? (
                <div className="ma-lista">
                  {filtrados.map((atendimento) => (
                    <CartaoAtendimento
                      key={atendimento.id}
                      atendimento={atendimento}
                      onDetalhes={setDetalheAberto}
                    />
                  ))}
                </div>
              ) : (
                <div className="ma-vazio">

                  <div
                    className="ma-vazio-ilustracao"
                    aria-hidden="true"
                  >
                    <Icone
                      nome="calendar"
                      tamanho={68}
                    />

                    <span className="ma-vazio-coracao">
                      ♥
                    </span>
                  </div>

                  <div>
                    <h2>
                      {aba === "todos"
                        ? "Seus atendimentos aparecerão aqui."
                        : `Nenhum atendimento ${
                            aba === "solicitado"
                              ? "solicitado"
                              : aba === "confirmado"
                                ? "confirmado"
                                : "concluído"
                          } por enquanto.`}
                    </h2>

                    <p>
                      {aba === "todos"
                        ? "Quando você solicitar ou agendar uma sessão, poderá acompanhá-la neste espaço."
                        : "Você pode consultar outra categoria ou voltar à busca de profissionais."}
                    </p>

                    <Link
                      to="/cliente#eh-profissionais"
                      className="ma-botao ma-botao-roxo"
                    >
                      <Icone
                        nome="search"
                        tamanho={18}
                      />
                      Buscar psicólogo(a)
                    </Link>

                    {!demonstracao && (
                      <Link
                        to="/cliente/atendimentos?demo=1"
                        className="ma-link-demo"
                      >
                        Pré-visualizar com exemplos fictícios
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* =====================================
                ORIENTAÇÕES
            ===================================== */}

            <section
              className="ma-orientacoes"
              aria-labelledby="ma-orientacoes-titulo"
            >
              <div className="ma-orientacoes-cabecalho">
                <span className="ma-orientacoes-icone">
                  <Icone
                    nome="calendarCheck"
                    tamanho={40}
                  />
                </span>

                <div>
                  <h2 id="ma-orientacoes-titulo">
                    Antes do seu atendimento
                  </h2>

                  <p>
                    Algumas orientações para tornar
                    sua sessão mais tranquila.
                  </p>
                </div>
              </div>

              <div className="ma-dicas">
                <div>
                  <Icone
                    nome="monitor"
                    tamanho={24}
                  />

                  <span>
                    <strong>Atendimento online</strong>
                    Separe um local reservado e confira
                    sua conexão.
                  </span>
                </div>

                <div>
                  <Icone
                    nome="calendar"
                    tamanho={24}
                  />

                  <span>
                    <strong>
                      Alterações de horário
                    </strong>
                    Os prazos para cancelamento
                    e reagendamento serão informados
                    no agendamento.
                  </span>
                </div>

                <div>
                  <Icone
                    nome="clock"
                    tamanho={24}
                  />

                  <span>
                    <strong>Chegue com calma</strong>
                    Reserve alguns minutos antes
                    da sessão para se organizar.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* =========================================
              COLUNA DIREITA
          ========================================= */}

          <aside className="ma-coluna-lateral">

            {/* SUA JORNADA */}

            <section className="ma-card-lateral ma-jornada">
              <div className="ma-titulo-card">
                <Icone
                  nome="heart"
                  tamanho={30}
                />

                <h2>Sua jornada na Elora</h2>
              </div>

              <h3>Olá, {primeiroNome}!</h3>

              <p>
                Este é o seu espaço para acompanhar
                encontros, solicitações e cada passo
                da sua jornada de cuidado.
              </p>

              <div className="ma-proximo-passo">
                <Icone
                  nome="leaf"
                  tamanho={30}
                />

                <div>
                  <strong>Próximo passo</strong>

                  <span>
                    {atendimentos.length > 0
                      ? "Confira os detalhes de seus atendimentos e organize sua rotina."
                      : "Encontre um profissional e escolha como deseja começar."}
                  </span>
                </div>
              </div>
            </section>

            {/* AÇÕES RÁPIDAS */}

            <section className="ma-card-lateral ma-acoes-rapidas">
              <div className="ma-titulo-card">
                <Icone
                  nome="calendarCheck"
                  tamanho={29}
                />

                <h2>Ações rápidas</h2>
              </div>

              <Link
                to="/cliente#eh-profissionais"
                className="ma-botao ma-botao-roxo"
              >
                <Icone nome="search" />
                Buscar Psicólogo(a)
              </Link>

              <Link
                to="/cliente#eh-profissionais"
                className="ma-botao ma-botao-contorno"
              >
                <Icone nome="calendar" />
                Agendar novo atendimento
              </Link>

              <button
                type="button"
                className="ma-botao ma-botao-contorno"
                onClick={() => {
                  setAba("concluido");

                  document
                    .getElementById("ma-titulo")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <Icone nome="calendarCheck" />
                Ver histórico de concluídos
              </button>
            </section>
          </aside>
        </div>
      </main>

      {/* =============================================
          MODAL DE DETALHES
      ============================================= */}

      {detalheAberto && (
        <div
          className="ma-modal-fundo"
          role="presentation"
          onMouseDown={(evento) => {
            if (
              evento.target === evento.currentTarget
            ) {
              setDetalheAberto(null);
            }
          }}
        >
          <section
            className="ma-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ma-modal-titulo"
          >
            <button
              type="button"
              className="ma-modal-fechar"
              aria-label="Fechar detalhes"
              onClick={() =>
                setDetalheAberto(null)
              }
            >
              <Icone nome="x" />
            </button>

            <p className="ma-sobretitulo">
              DETALHES DO ATENDIMENTO
            </p>

            <h2 id="ma-modal-titulo">
              {STATUS[detalheAberto.status]?.titulo}
            </h2>

            <p className="ma-modal-profissional">
              {detalheAberto.psicologo}
              {" · "}
              {detalheAberto.crp}
            </p>

            <dl>
              <div>
                <dt>Data</dt>
                <dd>
                  {formatarData(
                    detalheAberto.data
                  ).completa}
                </dd>
              </div>

              <div>
                <dt>Horário</dt>
                <dd>{detalheAberto.hora}</dd>
              </div>

              <div>
                <dt>Duração</dt>
                <dd>
                  {detalheAberto.duracao} minutos
                </dd>
              </div>

              <div>
                <dt>Modalidade</dt>
                <dd>
                  {detalheAberto.modalidade === "online"
                    ? "Online"
                    : "Presencial"}
                </dd>
              </div>

              <div>
                <dt>Situação</dt>
                <dd>
                  {STATUS[detalheAberto.status]?.detalhe}
                </dd>
              </div>
            </dl>

            <p className="ma-modal-nota">
              Solicitações de cancelamento,
              reagendamento e acesso à sessão serão
              habilitadas após a integração com o
              sistema de atendimentos.
            </p>

            <button
              type="button"
              className="ma-botao ma-botao-roxo"
              onClick={() =>
                setDetalheAberto(null)
              }
            >
              Fechar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
