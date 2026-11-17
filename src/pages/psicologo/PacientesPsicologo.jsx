
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";

import { auth, db } from "../../firebase";
import "./PacientesPsicologo.css";

const ABAS = [
  {
    id: "recentes",
    titulo: "Recentes",
    subtitulo: "Atendimentos recentes",
    icone: "clock",
  },
  {
    id: "acompanhamento",
    titulo: "Em acompanhamento",
    subtitulo: "Vínculos ativos",
    icone: "layers",
  },
  {
    id: "solicitacoes",
    titulo: "Solicitações pendentes",
    subtitulo: "Aguardando resposta",
    icone: "bell",
  },
];

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function iniciais(nome = "") {
  return (
    String(nome)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase() || "?"
  );
}

// Ícones próprios da página.
function IconePP({ nome, tamanho = 20 }) {
  const base = {
    width: tamanho,
    height: tamanho,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const desenhos = {
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="18" rx="2" />
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M9 11h6M9 15h6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  };

  return (
    <svg {...base}>
      {desenhos[nome] || desenhos.info}
    </svg>
  );
}

// Avatar sem fotografia fixa.
function Avatar({ nome, grande = false }) {
  return (
    <span
      className={`pp-avatar ${grande ? "pp-avatar--grande" : ""}`}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}

function statusPaciente(status) {
  return {
    recentes: "Atendimento recente",
    acompanhamento: "Em acompanhamento",
    solicitacoes: "Solicitação pendente",
    novo: "Sem acompanhamento",
  }[status] || "Paciente";
}

function InfoPerfil({ icone, rotulo, valor }) {
  return (
    <div className="pp-dado">
      <span className="pp-dado-icone">
        <IconePP nome={icone} tamanho={18} />
      </span>

      <div>
        <small>{rotulo}</small>
        <strong>{valor || "—"}</strong>
      </div>
    </div>
  );
}

function CartaoRecurso({
  icone,
  titulo,
  descricao,
  liberado = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`pp-recurso ${
        !liberado ? "pp-recurso--bloqueado" : ""
      }`}
      disabled={!liberado}
      onClick={liberado ? onClick : undefined}
      title={
        liberado
          ? titulo
          : "Funcionalidade indisponível para este paciente"
      }
    >
      <span className="pp-recurso-icone">
        <IconePP nome={icone} tamanho={23} />
      </span>

      <span className="pp-recurso-texto">
        <strong>{titulo}</strong>
        <small>{descricao}</small>
      </span>

      {liberado && (
        <IconePP nome="arrow" tamanho={17} />
      )}
    </button>
  );
}

// Página de pacientes do psicólogo.
// Consulta apenas o índice pacientesBusca.
// O acesso a dados clínicos deverá ser validado no backend.

export default function PacientesPsicologo({
  pacientesRelacionados = [],
  onAbrirTriagem,
  onAbrirHistorico,
  onAbrirProntuario,
}) {
  const [usuario, setUsuario] = useState(undefined);

  const [buscaGeral, setBuscaGeral] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");

  const [aba, setAba] = useState("recentes");
  const [buscaLocal, setBuscaLocal] = useState("");

  const [selecionadoBusca, setSelecionadoBusca] =
    useState(null);

  const [selecionadoLista, setSelecionadoLista] =
    useState(null);

  // Autenticação Firebase.
  useEffect(() => {
    return onAuthStateChanged(
      auth,
      setUsuario,
      () => setUsuario(null)
    );
  }, []);

  // Busca geral de pacientes cadastrados.
  useEffect(() => {
    const termo = normalizar(buscaGeral);

    setResultados([]);
    setErroBusca("");

    if (!usuario || termo.length < 2) {
      setBuscando(false);
      return;
    }

    let cancelado = false;
    setBuscando(true);

    const temporizador = setTimeout(async () => {
      try {
        const consulta = query(
          collection(db, "pacientesBusca"),
          orderBy("nomeBusca"),
          startAt(termo),
          endAt(`${termo}\uf8ff`),
          limit(10)
        );

        const resposta = await getDocs(consulta);

        if (cancelado) return;

        const encontrados = resposta.docs
          .map((documento) => ({
            id: documento.id,
            uid: documento.data().uid || documento.id,
            nome: documento.data().nome || "Paciente",
            status: "novo",
          }))
          .filter(
            (paciente) => paciente.uid !== usuario.uid
          );

        setResultados(encontrados);
      } catch (erro) {
        console.error(
          "Erro na busca de pacientes:",
          erro
        );

        if (!cancelado) {
          setErroBusca(
            "Não foi possível consultar pacientesBusca. " +
            "Confira as regras do Firestore."
          );
        }
      } finally {
        if (!cancelado) {
          setBuscando(false);
        }
      }
    }, 350);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [buscaGeral, usuario]);

  const relacionados = useMemo(
    () =>
      Array.isArray(pacientesRelacionados)
        ? pacientesRelacionados
        : [],
    [pacientesRelacionados]
  );

  const abaAtual =
    ABAS.find((item) => item.id === aba) || ABAS[0];

  // Filtro específico para cada aba.
  const listaDaAba = useMemo(() => {
    const termo = normalizar(buscaLocal);

    return relacionados.filter(
      (paciente) =>
        paciente.status === aba &&
        normalizar(paciente.nome).includes(termo)
    );
  }, [relacionados, aba, buscaLocal]);

  const pacienteDaLista =
    listaDaAba.find(
      (paciente) =>
        (paciente.uid || paciente.id) ===
        selecionadoLista
    ) ||
    listaDaAba[0] ||
    null;

  const pacienteAtual =
    selecionadoBusca || pacienteDaLista;

  // Localizar um paciente não cria vínculo.
  function escolherDaBusca(paciente) {
    setSelecionadoBusca(paciente);
    setSelecionadoLista(null);
    setBuscaGeral("");
    setResultados([]);
  }

  function trocarAba(novaAba) {
    setAba(novaAba);
    setBuscaLocal("");
    setSelecionadoBusca(null);
    setSelecionadoLista(null);
  }

  // Permissões visuais.
  // O Firebase deverá validar a autorização real.
  const temVinculo = Boolean(
    pacienteAtual?.vinculoAtivo === true ||
    pacienteAtual?.atendimentoAceito === true
  );

  const podeTriagem = Boolean(
    temVinculo &&
    pacienteAtual?.triagemCompartilhada === true &&
    typeof onAbrirTriagem === "function"
  );

  const podeHistorico = Boolean(
    temVinculo &&
    typeof onAbrirHistorico === "function"
  );

  const podeProntuario = Boolean(
    temVinculo &&
    typeof onAbrirProntuario === "function"
  );

  return (
    <section
      className="pp-pagina"
      aria-label="Meus Pacientes"
    >
      {/* CABEÇALHO */}
      <header className="pp-topo">
        <h2>Meus Pacientes</h2>

        <p>
          Seu espaço profissional, organizado em
          um só lugar.
        </p>
      </header>

      {/* CONTAINER PRINCIPAL */}
      <div className="pp-painel">

        {/* BUSCAR NOVO PACIENTE */}
        <section
          className="pp-busca-global"
          aria-label="Buscar novo paciente"
        >
          <div className="pp-busca-apresentacao">
            <span className="pp-busca-simbolo">
              <IconePP
                nome="search"
                tamanho={23}
              />
            </span>

            <div>
              <h3>Buscar novo paciente</h3>
              <p>
                Pesquise pelo nome para localizar
                um paciente na Elora.
              </p>
            </div>
          </div>

          <div className="pp-busca-direita">
            <label className="pp-campo pp-campo--geral">
              <IconePP
                nome="search"
                tamanho={18}
              />

              <input
                type="search"
                aria-label="Buscar novo paciente por nome"
                placeholder="Buscar paciente na plataforma..."
                value={buscaGeral}
                onChange={(e) =>
                  setBuscaGeral(e.target.value)
                }
                disabled={!usuario}
                autoComplete="off"
              />
            </label>

            {usuario === null && (
              <p className="pp-feedback">
                Faça login para pesquisar.
              </p>
            )}

            {erroBusca && (
              <p
                className="pp-feedback pp-feedback--erro"
                role="alert"
              >
                {erroBusca}
              </p>
            )}

            {normalizar(buscaGeral).length >= 2 &&
              usuario && (
                <div
                  className="pp-resultados"
                  aria-live="polite"
                >
                  {buscando ? (
                    <p className="pp-estado">
                      Buscando pacientes...
                    </p>
                  ) : resultados.length > 0 ? (
                    resultados.map((paciente) => (
                      <button
                        key={paciente.id}
                        type="button"
                        onClick={() =>
                          escolherDaBusca(paciente)
                        }
                      >
                        <Avatar
                          nome={paciente.nome}
                        />

                        <span>
                          <strong>
                            {paciente.nome}
                          </strong>

                          <small>
                            Visualizar perfil
                          </small>
                        </span>

                        <IconePP
                          nome="arrow"
                          tamanho={16}
                        />
                      </button>
                    ))
                  ) : !erroBusca ? (
                    <p className="pp-estado">
                      Nenhum paciente encontrado com
                      esse início de nome.
                    </p>
                  ) : null}
                </div>
              )}
          </div>
        </section>

        {/* CONTEÚDO */}
        <div className="pp-conteudo">
          <div className="pp-secao-titulo">
            <IconePP
              nome="users"
              tamanho={21}
            />
            <h3>Meus Pacientes</h3>
          </div>

          {/* ABAS */}
          <div
            className="pp-abas"
            role="tablist"
            aria-label="Categorias de pacientes"
          >
            {ABAS.map((item) => {
              const total = relacionados.filter(
                (paciente) =>
                  paciente.status === item.id
              ).length;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={aba === item.id}
                  className={
                    aba === item.id ? "ativo" : ""
                  }
                  onClick={() =>
                    trocarAba(item.id)
                  }
                >
                  <IconePP
                    nome={item.icone}
                    tamanho={16}
                  />

                  <span>{item.titulo}</span>

                  <span className="pp-contador">
                    {total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* BUSCA DA ABA SELECIONADA */}
          <div className="pp-barra-aba">
            <div>
              <h4>{abaAtual.titulo}</h4>
              <p>{abaAtual.subtitulo}</p>
            </div>

            <label className="pp-campo pp-campo--local">
              <IconePP
                nome="search"
                tamanho={16}
              />

              <input
                type="search"
                aria-label={`Buscar em ${abaAtual.titulo}`}
                placeholder={`Buscar em ${abaAtual.titulo.toLowerCase()}...`}
                value={buscaLocal}
                onChange={(e) =>
                  setBuscaLocal(e.target.value)
                }
              />
            </label>
          </div>

          {/* COLUNAS */}
          <div className="pp-colunas">

            {/* LISTA DE PACIENTES */}
            <div
              className="pp-lista"
              aria-label="Lista da categoria"
            >
              {selecionadoBusca && (
                <div className="pp-resultado-selecionado">
                  <span className="pp-lista-legenda">
                    Resultado da busca geral
                  </span>

                  <button
                    type="button"
                    className="pp-item selecionado"
                    onClick={() =>
                      setSelecionadoBusca(
                        selecionadoBusca
                      )
                    }
                  >
                    <Avatar
                      nome={selecionadoBusca.nome}
                    />

                    <span className="pp-item-textos">
                      <strong>
                        {selecionadoBusca.nome}
                      </strong>

                      <small>
                        Perfil encontrado na Elora
                      </small>
                    </span>

                    <IconePP
                      nome="arrow"
                      tamanho={18}
                    />
                  </button>

                  <button
                    className="pp-limpar"
                    type="button"
                    onClick={() =>
                      setSelecionadoBusca(null)
                    }
                  >
                    Fechar resultado
                  </button>
                </div>
              )}

              {listaDaAba.length > 0 ? (
                listaDaAba.map((paciente) => {
                  const id =
                    paciente.uid || paciente.id;

                  const ativo =
                    !selecionadoBusca &&
                    pacienteAtual &&
                    (pacienteAtual.uid ||
                      pacienteAtual.id) === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      className={`pp-item ${
                        ativo ? "selecionado" : ""
                      }`}
                      onClick={() => {
                        setSelecionadoBusca(null);
                        setSelecionadoLista(id);
                      }}
                    >
                      <Avatar
                        nome={paciente.nome}
                      />

                      <span className="pp-item-textos">
                        <strong>
                          {paciente.nome}
                        </strong>

                        <small>
                          {statusPaciente(
                            paciente.status
                          )}
                        </small>
                      </span>

                      <IconePP
                        nome="arrow"
                        tamanho={18}
                      />
                    </button>
                  );
                })
              ) : !selecionadoBusca ? (
                <div className="pp-vazio">
                  <span className="pp-vazio-simbolo">
                    <IconePP
                      nome="users"
                      tamanho={26}
                    />
                  </span>

                  <strong>
                    Nenhum paciente nesta categoria
                  </strong>

                  <p>
                    Quando houver atendimentos
                    ou vínculos reais, eles
                    aparecerão aqui.
                  </p>
                </div>
              ) : null}
            </div>

            {/* PERFIL DO PACIENTE */}
            <aside
              className="pp-perfil"
              aria-label="Perfil do paciente selecionado"
            >
              {!pacienteAtual ? (
                <div className="pp-perfil-sem-selecao">
                  <span className="pp-vazio-simbolo">
                    <IconePP
                      nome="users"
                      tamanho={26}
                    />
                  </span>

                  <strong>
                    Selecione um paciente
                  </strong>

                  <p>
                    Utilize a busca acima ou escolha
                    um paciente da lista.
                  </p>
                </div>
              ) : (
                <>
                  {/* CABEÇALHO DO PERFIL */}
                  <div className="pp-perfil-cabecalho">
                    <Avatar
                      nome={pacienteAtual.nome}
                      grande
                    />

                    <div className="pp-perfil-nome">
                      <h3>
                        {pacienteAtual.nome}
                      </h3>

                      <span className="pp-status">
                        {statusPaciente(
                          pacienteAtual.status
                        )}
                      </span>
                    </div>
                  </div>

                  {/* INFORMAÇÕES */}
                  <div className="pp-dados">
                    <InfoPerfil
                      icone="users"
                      rotulo="Idade"
                      valor={
                        pacienteAtual.idade
                          ? `${pacienteAtual.idade} anos`
                          : "—"
                      }
                    />

                    <InfoPerfil
                      icone="users"
                      rotulo="Gênero"
                      valor={
                        pacienteAtual.genero || "—"
                      }
                    />

                    <InfoPerfil
                      icone="calendar"
                      rotulo="Última sessão"
                      valor={
                        pacienteAtual.ultimaSessao ||
                        "—"
                      }
                    />

                    <InfoPerfil
                      icone="calendar"
                      rotulo="Próxima sessão"
                      valor={
                        pacienteAtual.proximaSessao ||
                        "—"
                      }
                    />
                  </div>

                  {/* FUNCIONALIDADES */}
                  <div className="pp-recursos">
                    <CartaoRecurso
                      icone="clipboard"
                      titulo="Triagem"
                      descricao="Avaliação inicial compartilhada pelo paciente."
                      liberado={podeTriagem}
                      onClick={() =>
                        onAbrirTriagem(pacienteAtual)
                      }
                    />

                    <CartaoRecurso
                      icone="calendar"
                      titulo="Histórico de atendimentos"
                      descricao="Sessões realizadas e anotações autorizadas."
                      liberado={podeHistorico}
                      onClick={() =>
                        onAbrirHistorico(pacienteAtual)
                      }
                    />

                    <CartaoRecurso
                      icone="lock"
                      titulo="Prontuário / Registros"
                      descricao="Disponível após vínculo efetivado ou aceite de atendimento."
                      liberado={podeProntuario}
                      onClick={() =>
                        onAbrirProntuario(pacienteAtual)
                      }
                    />

                  </div>

                  {/* SOLICITAR ACOMPANHAMENTO */}
                  <div className="pp-acompanhamento">
                    <button
                      type="button"
                      className="pp-btn-acompanhamento"
                      disabled
                      title="Funcionalidade em desenvolvimento"
                    >
                      <IconePP
                        nome="users"
                        tamanho={18}
                      />
                      Solicitar acompanhamento
                    </button>
                  </div>

                  {/* AVISO */}
                  <div className="pp-aviso">

                    <IconePP
                      nome="info"
                      tamanho={16}
                    />

                    <span>
                      Prontuário e registros completos
                      ficam disponíveis apenas após
                      vínculo efetivado ou aceite
                      de atendimento, com autorização
                      verificada no backend.
                    </span>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
