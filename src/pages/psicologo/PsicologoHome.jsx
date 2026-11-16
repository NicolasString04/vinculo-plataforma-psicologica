import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase";
import RelatoriosPsicologo from "./RelatoriosPsicologo";

import "./PsicologoHome.css";

// ======================================================
// DADOS FICTÍCIOS — SOMENTE PARA CONTA DE TESTE
// ======================================================

const ATENDIMENTOS_EXEMPLO = [
  { id: "s1", dia: 0, hora: "14:00", paciente: "João P.", formato: "Online" },
  { id: "s2", dia: 0, hora: "15:00", paciente: "Mariana S.", formato: "Presencial" },
  { id: "s3", dia: 0, hora: "16:30", paciente: "Lucas R.", formato: "Online" },
  { id: "s4", dia: 1, hora: "10:00", paciente: "Ana C.", formato: "Online" },
  { id: "s5", dia: 1, hora: "11:30", paciente: "Rafael M.", formato: "Presencial" },
];

const SOLICITACOES_EXEMPLO = [
  {
    id: "r1",
    nome: "Gabriel T.",
    detalhe: "Solicitou seu primeiro atendimento online.",
    quando: "Há 2 horas",
  },
  {
    id: "r2",
    nome: "Fernanda A.",
    detalhe: "Gostaria de agendar uma sessão nesta semana.",
    quando: "Há 4 horas",
  },
  {
    id: "r3",
    nome: "Matheus L.",
    detalhe: "Solicitou disponibilidade para atendimento presencial.",
    quando: "Há 6 horas",
  },
];

const PACIENTES_EXEMPLO = [
  "João P.",
  "Mariana S.",
  "Lucas R.",
  "Ana C.",
  "Rafael M.",
];

const HORARIOS_EXEMPLO = [
  "08:00",
  "09:00",
  "10:00",
  "11:30",
  "14:00",
  "15:00",
  "16:30",
  "18:00",
];

const MENU = [
  { id: "painel", titulo: "Painel", icone: "home" },
  { id: "agenda", titulo: "Minha Agenda", icone: "calendar" },
  { id: "pacientes", titulo: "Meus Pacientes", icone: "users" },
  { id: "solicitacoes", titulo: "Solicitações", icone: "message" },
  { id: "prontuarios", titulo: "Prontuários", icone: "file" },
  { id: "relatorios", titulo: "Relatórios", icone: "chart" },
  { id: "perfil", titulo: "Meu Perfil", icone: "user" },
  { id: "configuracoes", titulo: "Configurações", icone: "settings" },
];

// ======================================================
// ÍCONES
// ======================================================

function Icone({ nome, tamanho = 21, className = "" }) {
  const formas = {
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
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21v-2a7 7 0 0 1 14 0v2M17 4a4 4 0 0 1 0 8M18 15a6 6 0 0 1 4 6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    userPlus: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v8M15 12h8" />
      </>
    ),
    chart: (
      <>
        <rect x="3" y="14" width="4" height="7" />
        <rect x="10" y="9" width="4" height="12" />
        <rect x="17" y="4" width="4" height="17" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    message: <path d="M4 4h16v13H8l-4 4z" />,
    file: (
      <>
        <path d="M6 2h9l5 5v15H6zM15 2v5h5M9 12h8M9 16h8" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
      </>
    ),
    star: (
      <path d="m12 2 3.1 6.4 7.1 1-5.1 5 .9 7-6-3.3-6 3.3.9-7-5.1-5 7.1-1z" />
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 3" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    check: <path d="m4 12 5 5L20 6" />,
    x: <path d="M5 5l14 14M19 5 5 19" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    edit: (
      <path d="m4 20 4-.8L20 7a2 2 0 0 0-3-3L5 16z" />
    ),
    crown: (
      <path d="m3 8 4 4 5-7 5 7 4-4-2 12H5z" />
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 6-4.5 9-9 10-4.5-1-9-4-9-10V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7z" />,
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
    headset: (
      <>
        <path d="M4 13V9a8 8 0 0 1 16 0v4" />
        <rect x="2" y="12" width="4" height="7" rx="2" />
        <rect x="18" y="12" width="4" height="7" rx="2" />
        <path d="M20 19a4 4 0 0 1-4 3h-4" />
      </>
    ),
  };

  return (
    <svg
      className={className}
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
      {formas[nome] || formas.info}
    </svg>
  );
}

// ======================================================
// UTILITÁRIOS
// ======================================================

function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  return (
    partes
      .slice(0, 2)
      .map((item) => item[0])
      .join("") || "EL"
  ).toUpperCase();
}

function dataRelativa(deslocamento = 0) {
  const data = new Date();
  data.setDate(data.getDate() + deslocamento);
  return data;
}

function rotuloDia(deslocamento = 0) {
  const data = dataRelativa(deslocamento);

  const semana = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  })
    .format(data)
    .replace(".", "");

  return {
    semana: semana.charAt(0).toUpperCase() + semana.slice(1),
    numero: data.getDate(),
  };
}

function CardMetrica({ icone, valor, titulo, detalhe }) {
  return (
    <article className="ps-card-metrica">
      <div className="ps-metrica-icone">
        <Icone nome={icone} tamanho={35} />
      </div>

      <div className="ps-metrica-texto">
        <strong>{valor}</strong>
        <span>{titulo}</span>
        {detalhe && <small>{detalhe}</small>}
      </div>
    </article>
  );
}

function CartaoVazio({ titulo, texto }) {
  return (
    <div className="ps-vazio">
      <Icone nome="calendar" tamanho={30} />
      <strong>{titulo}</strong>
      <p>{texto}</p>
    </div>
  );
}

// ======================================================
// HOME DO PSICÓLOGO
// ======================================================

export default function PsicologoHome() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [usuario, setUsuario] = useState(null);
  const [profissional, setProfissional] = useState(null);

  const [secao, setSecao] = useState("painel");

  const [menuContaAberto, setMenuContaAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] =
    useState(false);

  const [solicitacoesDemo, setSolicitacoesDemo] =
    useState(SOLICITACOES_EXEMPLO);

  const [mensagemDemo, setMensagemDemo] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [buscaPaciente, setBuscaPaciente] = useState("");

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([
    "09:00",
    "11:30",
    "15:00",
  ]);

  // ====================================================
  // AUTENTICAÇÃO FIREBASE
  // ====================================================

  useEffect(() => {
    let ativo = true;

    const cancelar = onAuthStateChanged(
      auth,
      async (conta) => {
        if (!conta) {
          navigate("/login/psicologo", {
            replace: true,
          });
          return;
        }

        try {
          const [cadastro, perfil] = await Promise.all([
            getDoc(doc(db, "usuarios", conta.uid)),
            getDoc(doc(db, "psicologos", conta.uid)),
          ]);

          if (!ativo) return;

          if (!cadastro.exists()) {
            setErro(
              "Seu cadastro não foi encontrado na coleção usuarios."
            );
            return;
          }

          if (cadastro.data().tipo !== "psicologo") {
            navigate("/cliente", { replace: true });
            return;
          }

          if (!perfil.exists()) {
            setErro(
              "Seu perfil profissional não foi encontrado na coleção psicologos."
            );
            return;
          }

          setUsuario({
            ...cadastro.data(),
            uid: conta.uid,
            email:
              cadastro.data().email ||
              conta.email ||
              "",
          });

          setProfissional(perfil.data());
        } catch (falha) {
          console.error(
            "Não foi possível abrir o portal profissional:",
            falha
          );

          if (ativo) {
            setErro(
              falha.code === "permission-denied"
                ? "O Firestore não permitiu consultar o perfil. Confira as regras de leitura das coleções usuarios e psicologos."
                : "Não foi possível carregar seu perfil. Verifique a conexão e tente novamente."
            );
          }
        } finally {
          if (ativo) setCarregando(false);
        }
      },
      (falha) => {
        console.error("Falha de autenticação:", falha);

        if (ativo) {
          setErro("Não foi possível confirmar sua sessão.");
          setCarregando(false);
        }
      }
    );

    return () => {
      ativo = false;
      cancelar();
    };
  }, [navigate]);

  // ====================================================
  // DADOS DO PROFISSIONAL
  // ====================================================

  const contaTeste = profissional?.contaTeste === true;

  const nomeCompleto =
    usuario?.nome || "Profissional Elora";

  const primeiroNome = nomeCompleto.trim().split(/\s+/)[0];

  const verificacao =
    profissional?.statusVerificacao || "pendente";

  const crp =
    profissional?.crp || "Não informado";

  const solicitacoes = contaTeste ? solicitacoesDemo : [];

  const atendimentos = contaTeste
    ? ATENDIMENTOS_EXEMPLO
    : [];

  const pacientes = useMemo(
    () => (contaTeste ? PACIENTES_EXEMPLO : []),
    [contaTeste]
  );

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((nome) =>
      nome
        .toLocaleLowerCase("pt-BR")
        .includes(
          buscaPaciente.toLocaleLowerCase("pt-BR")
        )
    );
  }, [pacientes, buscaPaciente]);

  // ====================================================
  // PREENCHIMENTO DO PERFIL
  // ====================================================

  const perfilCampos = [
    Boolean(usuario?.nome),
    Boolean(usuario?.email),

    Boolean(
      profissional?.crp &&
      profissional.crp !== "TESTE"
    ),

    Boolean(profissional?.biografia),

    Array.isArray(profissional?.especialidades) &&
      profissional.especialidades.length > 0,

    Array.isArray(profissional?.abordagens) &&
      profissional.abordagens.length > 0,

    Array.isArray(profissional?.modalidades) &&
      profissional.modalidades.length > 0,

    Boolean(profissional?.fotoURL),
  ];

  const progressoPerfil = Math.round(
    (perfilCampos.filter(Boolean).length /
      perfilCampos.length) *
      100
  );

  // ====================================================
  // NAVEGAÇÃO
  // ====================================================

  function irPara(destino) {
    setSecao(destino);
    setMenuContaAberto(false);
    setNotificacoesAbertas(false);
    setMensagemDemo("");
  }

  function tratarSolicitacao(id, decisao) {
    if (!contaTeste) return;

    const item = solicitacoesDemo.find(
      (solicitacao) => solicitacao.id === id
    );

    setSolicitacoesDemo((atual) =>
      atual.filter(
        (solicitacao) => solicitacao.id !== id
      )
    );

    setMensagemDemo(
      `${item?.nome || "Solicitação"}: ${
        decisao === "aceita" ? "aceita" : "recusada"
      } apenas nesta demonstração. Nenhuma alteração foi gravada no Firebase.`
    );
  }

  function alternarHorario(horario) {
    setHorariosDisponiveis((atual) =>
      atual.includes(horario)
        ? atual.filter((item) => item !== horario)
        : [...atual, horario]
    );
  }

  async function sair() {
    try {
      await signOut(auth);

      navigate("/login/psicologo", {
        replace: true,
      });
    } catch (falha) {
      console.error("Erro ao sair:", falha);

      setMensagemDemo(
        "Não foi possível encerrar sua sessão. Tente novamente."
      );
    }
  }

  // ====================================================
  // AGENDA
  // ====================================================

  function BlocoAgenda({ completa = false }) {
    const lista = completa
      ? atendimentos.filter(
          (item) => item.dia === diaSelecionado
        )
      : atendimentos.filter(
          (item) => item.dia === 0 || item.dia === 1
        );

    const agrupados = [
      ...new Set(lista.map((item) => item.dia)),
    ];

    return (
      <div className="ps-agenda-corpo">
        {completa && (
          <div className="ps-seletor-dia">
            <button
              type="button"
              aria-label="Dia anterior"
              onClick={() =>
                setDiaSelecionado((d) => d - 1)
              }
            >
              <Icone nome="left" />
            </button>

            <strong>
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "full",
              }).format(dataRelativa(diaSelecionado))}
            </strong>

            <button
              type="button"
              aria-label="Próximo dia"
              onClick={() =>
                setDiaSelecionado((d) => d + 1)
              }
            >
              <Icone nome="right" />
            </button>

            <button
              className="ps-hoje"
              type="button"
              onClick={() => setDiaSelecionado(0)}
            >
              Hoje
            </button>
          </div>
        )}

        {agrupados.length === 0 ? (
          <CartaoVazio
            titulo="Nenhum atendimento nesta data"
            texto={
              contaTeste
                ? "Escolha outro dia para ver os horários de exemplo."
                : "Sua agenda será preenchida quando os agendamentos forem integrados."
            }
          />
        ) : (
          agrupados.map((deslocamento) => {
            const dia = rotuloDia(deslocamento);

            return (
              <div
                className="ps-dia-grupo"
                key={deslocamento}
              >
                <div className="ps-dia-caixa">
                  <span>{dia.semana}</span>
                  <strong>{dia.numero}</strong>
                </div>

                <div className="ps-dia-itens">
                  {lista
                    .filter(
                      (item) =>
                        item.dia === deslocamento
                    )
                    .map((item) => (
                      <div
                        className="ps-agenda-item"
                        key={item.id}
                      >
                        <strong className="ps-hora">
                          {item.hora}
                        </strong>

                        <span className="ps-agenda-paciente">
                          <Icone
                            nome="user"
                            tamanho={18}
                          />
                          Atendimento — {item.paciente}
                        </span>

                        <span
                          className={`ps-modalidade ${
                            item.formato === "Online"
                              ? "online"
                              : ""
                          }`}
                        >
                          <Icone
                            nome={
                              item.formato === "Online"
                                ? "check"
                                : "pin"
                            }
                            tamanho={14}
                          />
                          {item.formato}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ====================================================
  // SOLICITAÇÕES
  // ====================================================

  function BlocoSolicitacoes() {
    return (
      <div className="ps-solicitacoes-lista">
        {solicitacoes.length === 0 ? (
          <CartaoVazio
            titulo="Nenhuma solicitação pendente"
            texto="Novos pedidos de agendamento aparecerão aqui após a integração das solicitações."
          />
        ) : (
          solicitacoes.map((item) => (
            <article
              className="ps-solicitacao"
              key={item.id}
            >
              <span className="ps-solicitacao-avatar">
                {iniciais(item.nome)}
              </span>

              <div className="ps-solicitacao-info">
                <strong>{item.nome}</strong>
                <span>{item.detalhe}</span>
              </div>

              <small>{item.quando}</small>

              <div className="ps-solicitacao-acoes">
                <button
                  type="button"
                  className="ps-aceitar"
                  onClick={() =>
                    tratarSolicitacao(
                      item.id,
                      "aceita"
                    )
                  }
                >
                  <Icone
                    nome="check"
                    tamanho={16}
                  />
                  Aceitar
                </button>

                <button
                  type="button"
                  className="ps-recusar"
                  aria-label={`Recusar solicitação de ${item.nome}`}
                  onClick={() =>
                    tratarSolicitacao(
                      item.id,
                      "recusada"
                    )
                  }
                >
                  <Icone
                    nome="x"
                    tamanho={17}
                  />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    );
  }

  // ====================================================
  // CARREGAMENTO E ERROS
  // ====================================================

  if (carregando) {
    return (
      <main className="ps-root ps-estado">
        <div className="ps-carregando" />
        <p>Carregando sua área profissional...</p>
      </main>
    );
  }

  if (erro || !usuario || !profissional) {
    return (
      <main className="ps-root ps-estado">
        <img
          src="/images/logo-elora.png"
          alt="Elora"
          width="72"
        />

        <h1>Não foi possível abrir seu painel.</h1>

        <p>
          {erro ||
            "Não encontramos os dados necessários para acessar a conta."}
        </p>

        <button
          type="button"
          className="ps-botao-primario"
          onClick={sair}
        >
          Voltar ao login
        </button>
      </main>
    );
  }

  // ====================================================
  // INTERFACE PRINCIPAL
  // ====================================================

  return (
    <div className="ps-root">

      {/* CABEÇALHO SUPERIOR */}

      <header className="ps-topbar">
        <Link
          to="/psicologo"
          className="ps-marca"
          onClick={() => irPara("painel")}
        >
          <img
            src="/images/logo-elora.png"
            alt=""
          />
          <span>elora</span>
        </Link>

        <nav
          className="ps-nav-superior"
          aria-label="Navegação profissional"
        >
          {[
            ["painel", "Início", "home"],
            ["pacientes", "Buscar Paciente", "search"],
            ["agenda", "Agenda", "calendar"],
            ["pacientes", "Pacientes", "users"],
            ["relatorios", "Relatórios", "chart"],
          ].map(([id, titulo, icone], indice) => (
            <button
              key={`${id}-${indice}`}
              type="button"
              className={
                secao === id ? "ativo" : ""
              }
              onClick={() => irPara(id)}
            >
              <Icone
                nome={icone}
                tamanho={22}
              />
              {titulo}
            </button>
          ))}
        </nav>

        <div className="ps-topbar-acoes">

          {/* NOTIFICAÇÕES */}

          <div className="ps-menu-ancora">
            <button
              type="button"
              className="ps-icone-topo"
              aria-label="Notificações"
              aria-expanded={notificacoesAbertas}
              onClick={() => {
                setNotificacoesAbertas(
                  (v) => !v
                );
                setMenuContaAberto(false);
              }}
            >
              <Icone
                nome="bell"
                tamanho={23}
              />

              {solicitacoes.length > 0 && (
                <span className="ps-bolinha" />
              )}
            </button>

            {notificacoesAbertas && (
              <div className="ps-popover">
                <strong>Notificações</strong>

                <p>
                  {solicitacoes.length
                    ? `${solicitacoes.length} solicitação(ões) de exemplo para revisar.`
                    : "Nenhuma nova notificação."}
                </p>
              </div>
            )}
          </div>

          {/* PERFIL */}

          <div className="ps-menu-ancora">
            <button
              type="button"
              className="ps-perfil-botao"
              aria-expanded={menuContaAberto}
              aria-label="Abrir menu da conta"
              onClick={() => {
                setMenuContaAberto(
                  (v) => !v
                );
                setNotificacoesAbertas(false);
              }}
            >
              <span className="ps-mini-avatar">
                {iniciais(nomeCompleto)}
              </span>

              <Icone
                nome="chevron"
                tamanho={16}
              />
            </button>

            {menuContaAberto && (
              <div className="ps-popover ps-popover-conta">
                <strong>{nomeCompleto}</strong>
                <p>{usuario.email}</p>

                <button
                  type="button"
                  onClick={() => irPara("perfil")}
                >
                  <Icone
                    nome="user"
                    tamanho={17}
                  />
                  Meu perfil
                </button>

                <button
                  type="button"
                  onClick={sair}
                >
                  <Icone
                    nome="logout"
                    tamanho={17}
                  />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR + CONTEÚDO */}

      <div className="ps-layout">

        {/* SIDEBAR */}

        <aside className="ps-sidebar">

          {/* IDENTIDADE PROFISSIONAL */}

          <div className="ps-identidade">
            <div className="ps-foto-wrapper">
              {profissional.fotoURL ? (
                <img
                  src={profissional.fotoURL}
                  alt={`Foto de ${nomeCompleto}`}
                  className="ps-foto"
                />
              ) : (
                <div className="ps-foto ps-foto-placeholder">
                  {iniciais(nomeCompleto)}
                </div>
              )}

              <button
                type="button"
                onClick={() => irPara("perfil")}
                title="Ver perfil profissional"
                aria-label="Ver perfil profissional"
                className="ps-editar-foto"
              >
                <Icone
                  nome="edit"
                  tamanho={15}
                />
              </button>
            </div>

            <strong className="ps-nome">
              {nomeCompleto}
            </strong>

            <span className="ps-crp">
              CRP {crp}
            </span>

            <div className="ps-simbolo-identidade">
              <img
                src="/images/logo-elora.png"
                alt=""
              />
              <span>│ Ψ</span>
            </div>

            <span
              className={`ps-selo ${
                verificacao === "aprovado" && !contaTeste
                  ? "aprovado"
                  : ""
              }`}
            >
              <Icone
                nome={contaTeste ? "info" : "shield"}
                tamanho={17}
              />

              {contaTeste
                ? "Conta de teste"
                : verificacao === "aprovado"
                  ? "Profissional verificado"
                  : "Verificação pendente"}
            </span>
          </div>

          {/* MENU LATERAL */}

          <nav
            className="ps-menu-lateral"
            aria-label="Menu do psicólogo"
          >
            {MENU.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  secao === item.id ? "ativo" : ""
                }
                onClick={() => irPara(item.id)}
              >
                <Icone
                  nome={item.icone}
                  tamanho={23}
                />

                <span>{item.titulo}</span>

                {item.id === "solicitacoes" &&
                  solicitacoes.length > 0 && (
                    <span className="ps-contador">
                      {solicitacoes.length}
                    </span>
                  )}
              </button>
            ))}
          </nav>

          {/* SUPORTE */}

          <div className="ps-ajuda">
            <Icone
              nome="headset"
              tamanho={29}
            />

            <div>
              <strong>Precisa de ajuda?</strong>
              <p>Suporte profissional Elora</p>
            </div>

            <button
              type="button"
              onClick={() => irPara("suporte")}
            >
              Contato
            </button>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}

        <main className="ps-main">

          {/* SAUDAÇÃO */}

          <section className="ps-bem-vindo">
            <span
              className="ps-traco"
              aria-hidden="true"
            />

            <div>
              <h1>
                {secao === "painel" ? (
                  <>
                    Bem-vindo(a),{" "}
                    <em>{primeiroNome}!</em>
                  </>
                ) : (
                  MENU.find(
                    (item) => item.id === secao
                  )?.titulo || "Suporte"
                )}
              </h1>

              <p>
                {secao === "painel"
                  ? "Aqui está um resumo da sua atuação na Elora."
                  : "Seu espaço profissional, organizado em um só lugar."}
              </p>
            </div>
          </section>

          {/* MODO DE TESTE */}

          {contaTeste && (
            <div
              className="ps-aviso-teste"
              role="status"
            >
              <Icone
                nome="info"
                tamanho={18}
              />

              <span>
                <strong>Modo de teste:</strong>{" "}
                agenda, pacientes, indicadores
                e solicitações do dashboard são exemplos.
                As ações demonstrativas não são salvas
                no Firebase.
              </span>
            </div>
          )}

          {/* VERIFICAÇÃO DE CRP */}

          {verificacao !== "aprovado" && (
            <div className="ps-aviso-pendente">
              <Icone
                nome="shield"
                tamanho={17}
              />

              <span>
                CRP com verificação pendente.
                O acesso ao painel não significa
                aprovação ou publicação do perfil.
              </span>
            </div>
          )}

          {/* FEEDBACK DAS AÇÕES */}

          {mensagemDemo && (
            <div
              className="ps-feedback"
              role="status"
            >
              <Icone
                nome="check"
                tamanho={18}
              />
              {mensagemDemo}
            </div>
          )}

          {/* ======================================
              DASHBOARD
          ====================================== */}

          {secao === "painel" ? (
            <>

              {/* MÉTRICAS */}

              <div className="ps-metricas">
                <CardMetrica
                  icone="calendar"
                  valor={contaTeste ? "12" : "0"}
                  titulo="Atendimentos na semana"
                />

                <CardMetrica
                  icone="users"
                  valor={contaTeste ? "48" : "0"}
                  titulo="Pacientes ativos"
                />

                <CardMetrica
                  icone="clock"
                  valor={contaTeste ? "198h" : "0h"}
                  titulo="Horas de atendimento"
                />

                <CardMetrica
                  icone="star"
                  valor={contaTeste ? "4,9" : "—"}
                  titulo="Avaliação média"
                  detalhe={
                    contaTeste
                      ? "(36 avaliações simuladas)"
                      : "Sem avaliações"
                  }
                />
              </div>

              {/* AGENDA E SOLICITAÇÕES */}

              <div className="ps-dois-paineis">
                <section
                  className="ps-card ps-card-agenda"
                  id="ps-agenda"
                >
                  <div className="ps-card-titulo">
                    <h2>
                      <Icone
                        nome="calendar"
                        tamanho={28}
                      />
                      Agenda da Semana
                    </h2>

                    <button
                      type="button"
                      onClick={() => irPara("agenda")}
                    >
                      Ver agenda completa
                      <Icone
                        nome="arrow"
                        tamanho={17}
                      />
                    </button>
                  </div>

                  <BlocoAgenda />
                </section>

                <section
                  className="ps-card ps-card-solicitacoes"
                  id="ps-solicitacoes"
                >
                  <div className="ps-card-titulo">
                    <h2>
                      <Icone
                        nome="userPlus"
                        tamanho={28}
                      />
                      Solicitações Recentes
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        irPara("solicitacoes")
                      }
                    >
                      Ver todas
                      <Icone
                        nome="arrow"
                        tamanho={17}
                      />
                    </button>
                  </div>

                  <BlocoSolicitacoes />
                </section>
              </div>

              {/* CARDS INFERIORES */}

              <div className="ps-tres-paineis">

                {/* PACIENTES */}

                <section
                  className="ps-card ps-resumo"
                  id="ps-pacientes"
                >
                  <div className="ps-card-titulo">
                    <h2>
                      <Icone
                        nome="users"
                        tamanho={27}
                      />
                      Meus Pacientes
                    </h2>

                    <button
                      type="button"
                      onClick={() => irPara("pacientes")}
                    >
                      Ver todos
                      <Icone
                        nome="arrow"
                        tamanho={16}
                      />
                    </button>
                  </div>

                  <div className="ps-resumo-conteudo">
                    <span className="ps-resumo-icone">
                      <Icone
                        nome="users"
                        tamanho={34}
                      />
                    </span>

                    <div>
                      <strong>
                        {contaTeste ? "48" : "0"}
                      </strong>

                      <p>
                        Pacientes em acompanhamento
                      </p>
                    </div>
                  </div>
                </section>

                {/* AVALIAÇÕES */}

                <section className="ps-card ps-resumo">
                  <div className="ps-card-titulo">
                    <h2>
                      <Icone
                        nome="star"
                        tamanho={27}
                      />
                      Avaliações
                    </h2>
                  </div>

                  <div className="ps-resumo-conteudo">
                    <span className="ps-resumo-icone estrela">
                      <Icone
                        nome="star"
                        tamanho={35}
                      />
                    </span>

                    <div>
                      <strong>
                        {contaTeste ? "4,9" : "—"}
                        <small> / 5</small>
                      </strong>

                      <p>
                        {contaTeste
                          ? "Baseado em 36 avaliações simuladas"
                          : "Ainda sem avaliações"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* PROGRESSO DO PERFIL */}

                <section className="ps-card ps-resumo">
                  <div className="ps-card-titulo">
                    <h2>
                      <Icone
                        nome="user"
                        tamanho={27}
                      />
                      Perfil Profissional
                    </h2>
                  </div>

                  <div className="ps-perfil-progresso">
                    <div className="ps-barra">
                      <span
                        style={{
                          width: `${progressoPerfil}%`,
                        }}
                      />
                    </div>

                    <strong>
                      {progressoPerfil}%
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="ps-texto-acao"
                    onClick={() => irPara("perfil")}
                  >
                    Complete seu perfil para aumentar
                    sua visibilidade.

                    <Icone
                      nome="right"
                      tamanho={17}
                    />
                  </button>
                </section>
              </div>

              {/* AÇÕES RÁPIDAS */}

              <section className="ps-card ps-acoes-rapidas">
                <div className="ps-card-titulo">
                  <h2>
                    <Icone
                      nome="bolt"
                      tamanho={27}
                    />
                    Ações Rápidas
                  </h2>
                </div>

                <div className="ps-acoes-grade">
                  {[
                    ["agenda", "Minha agenda", "calendar"],
                    ["prontuarios", "Prontuários", "file"],
                    ["pacientes", "Pacientes", "userPlus"],
                    ["relatorios", "Relatórios", "chart"],
                    ["solicitacoes", "Solicitações", "message"],
                    ["configuracoes", "Configurações", "settings"],
                  ].map(([id, titulo, icone]) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => irPara(id)}
                    >
                      <Icone
                        nome={icone}
                        tamanho={31}
                      />

                      <span>{titulo}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>

          ) : secao === "agenda" ? (

            /* ======================================
                AGENDA
            ====================================== */

            <section className="ps-card ps-pagina-interna">
              <div className="ps-card-titulo">
                <h2>
                  <Icone nome="calendar" />
                  Minha Agenda
                </h2>
              </div>

              <BlocoAgenda completa />
            </section>

          ) : secao === "solicitacoes" ? (

            /* ======================================
                SOLICITAÇÕES
            ====================================== */

            <section className="ps-card ps-pagina-interna">
              <div className="ps-card-titulo">
                <h2>
                  <Icone nome="userPlus" />
                  Solicitações de atendimento
                </h2>
              </div>

              <BlocoSolicitacoes />
            </section>

          ) : secao === "pacientes" ? (

            /* ======================================
                PACIENTES — DEMONSTRAÇÃO
            ====================================== */

            <section className="ps-card ps-pagina-interna">
              <div className="ps-card-titulo">
                <h2>
                  <Icone nome="users" />
                  Meus Pacientes
                </h2>
              </div>

              <label className="ps-pesquisa">
                <Icone nome="search" />

                <input
                  value={buscaPaciente}
                  onChange={(evento) =>
                    setBuscaPaciente(evento.target.value)
                  }
                  placeholder="Buscar em seus pacientes de exemplo..."
                  aria-label="Buscar pacientes"
                />
              </label>

              {pacientesFiltrados.length === 0 ? (
                <CartaoVazio
                  titulo="Nenhum paciente encontrado"
                  texto="Os pacientes reais aparecerão após a integração dos atendimentos."
                />
              ) : (
                <div className="ps-pacientes-grade">
                  {pacientesFiltrados.map((item) => (
                    <div
                      className="ps-paciente"
                      key={item}
                    >
                      <span className="ps-solicitacao-avatar">
                        {iniciais(item)}
                      </span>

                      <strong>{item}</strong>

                      <small>
                        Perfil fictício para teste
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </section>

          ) : secao === "perfil" ? (

            /* ======================================
                PERFIL PROFISSIONAL
            ====================================== */

            <section className="ps-card ps-pagina-interna">
              <div className="ps-card-titulo">
                <h2>
                  <Icone nome="user" />
                  Perfil Profissional
                </h2>
              </div>

              <div className="ps-dados-perfil">
                <div>
                  <span>Nome</span>
                  <strong>{nomeCompleto}</strong>
                </div>

                <div>
                  <span>E-mail</span>
                  <strong>{usuario.email}</strong>
                </div>

                <div>
                  <span>CRP</span>
                  <strong>{crp}</strong>
                </div>

                <div>
                  <span>Verificação</span>
                  <strong>{verificacao}</strong>
                </div>

                <div>
                  <span>Conta de teste</span>
                  <strong>
                    {contaTeste ? "Sim" : "Não"}
                  </strong>
                </div>

                <div>
                  <span>Perfil preenchido</span>
                  <strong>
                    {progressoPerfil}%
                  </strong>
                </div>
              </div>

              <p className="ps-nota-interna">
                Estes dados são lidos do Firestore.
                A edição do perfil será implementada
                em uma etapa separada; o status de
                verificação não poderá ser alterado
                pelo próprio psicólogo.
              </p>
            </section>

          ) : secao === "configuracoes" ? (

            /* ======================================
                CONFIGURAÇÕES
            ====================================== */

            <section className="ps-card ps-pagina-interna">
              <div className="ps-card-titulo">
                <h2>
                  <Icone nome="settings" />
                  Configurações e Disponibilidade
                </h2>
              </div>

              <p className="ps-nota-interna">
                Selecione horários para testar
                a interface. Esta seleção fica apenas
                na memória da página e ainda não
                grava no Firebase.
              </p>

              <div className="ps-horarios">
                {HORARIOS_EXEMPLO.map((horario) => (
                  <label key={horario}>
                    <input
                      type="checkbox"
                      checked={horariosDisponiveis.includes(
                        horario
                      )}
                      onChange={() =>
                        alternarHorario(horario)
                      }
                    />

                    {horario}
                  </label>
                ))}
              </div>
            </section>

          ) : secao === "relatorios" ? (

            /* ======================================
                NOVA PÁGINA DE RELATÓRIOS
                INTEGRAÇÃO DO PASSO 4
            ====================================== */

            <RelatoriosPsicologo
              psicologoUid={usuario.uid}
              nomeProfissional={nomeCompleto}
              crp={crp}
            />

          ) : (

            /* ======================================
                PRONTUÁRIOS / SUPORTE
            ====================================== */

            <section className="ps-card ps-pagina-interna ps-em-breve">
              <Icone
                nome={
                  secao === "prontuarios"
                    ? "file"
                    : "headset"
                }
                tamanho={44}
              />

              <h2>
                {secao === "prontuarios"
                  ? "Prontuários"
                  : "Suporte"}
              </h2>

              <p>
                {secao === "prontuarios"
                  ? "Área reservada para a futura gestão segura de prontuários. Nenhum dado clínico é criado ou armazenado nesta demonstração."
                  : "O canal de suporte será configurado futuramente."}
              </p>
            </section>

          )}

          {/* RODAPÉ */}

          <footer className="ps-rodape">
            Elora · Área Profissional
            {contaTeste && " · Ambiente de testes"}
          </footer>

        </main>
      </div>
    </div>
  );
}