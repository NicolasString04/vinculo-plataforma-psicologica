import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  endAt,
  where,
} from "firebase/firestore";

import { db } from "../../firebase";
import "./RelatoriosPsicologo.css";

// ======================================================
// UTILITÁRIOS
// ======================================================

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function exibirData(valor) {
  if (!valor) return "—";

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return valor;
}

function lerDataAgendamento(agendamento) {
  if (!agendamento) return null;

  const valor =
    agendamento.inicio ||
    agendamento.dataAtendimento ||
    agendamento.data;

  if (valor?.toDate) {
    const data = valor.toDate();

    return {
      data: [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0"),
      ].join("-"),

      hora: [
        String(data.getHours()).padStart(2, "0"),
        String(data.getMinutes()).padStart(2, "0"),
      ].join(":"),
    };
  }

  if (typeof valor === "string") {
    return {
      data: valor.slice(0, 10),
      hora:
        agendamento.hora ||
        agendamento.horario ||
        valor.slice(11, 16) ||
        "",
    };
  }

  return null;
}

// ======================================================
// MINI FOTO DO PACIENTE
// ======================================================

function MiniFoto({ pessoa, tamanho = 40 }) {
  const iniciais = (pessoa?.nome || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  const fotoURL = pessoa?.fotoURL;

  if (
    fotoURL &&
    (fotoURL.startsWith("https://") ||
      fotoURL.startsWith("/"))
  ) {
    return (
      <img
        className="rp-foto"
        src={fotoURL}
        alt=""
        width={tamanho}
        height={tamanho}
      />
    );
  }

  return (
    <span
      className="rp-foto rp-foto-vazia"
      style={{
        width: tamanho,
        height: tamanho,
      }}
      aria-hidden="true"
    >
      {iniciais}
    </span>
  );
}

// ======================================================
// SELETOR / BUSCA DE PACIENTES DO FIRESTORE
// ======================================================

function SeletorPaciente({
  valor,
  onChange,
  selecionado,
  onSelecionar,
  onLimpar,
  rotulo,
}) {
  const [opcoes, setOpcoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (selecionado || !aberto) return;

    let ativo = true;

    const timer = setTimeout(async () => {
      setCarregando(true);
      setErro("");

      try {
        const termo = normalizar(valor);
        const referencia = collection(db, "pacientesBusca");

        const consulta = termo
          ? query(
              referencia,
              orderBy("nomeBusca"),
              startAt(termo),
              endAt(`${termo}\uf8ff`),
              limit(15)
            )
          : query(
              referencia,
              orderBy("nomeBusca"),
              limit(15)
            );

        const resultado = await getDocs(consulta);

        if (!ativo) return;

        setOpcoes(
          resultado.docs.map((documento) => ({
            ...documento.data(),
            uid: documento.id,
          }))
        );
      } catch (falha) {
        console.error("Erro ao buscar pacientes:", falha);

        if (!ativo) return;

        setErro(
          falha.code === "permission-denied"
            ? "Sem permissão para pesquisar pacientes."
            : "Não foi possível realizar a pesquisa."
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }, 250);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [valor, selecionado, aberto]);

  return (
    <div className="rp-seletor">
      {rotulo && (
        <label className="rp-label">
          {rotulo}
        </label>
      )}

      {/* PACIENTE SELECIONADO */}

      {selecionado ? (
        <div className="rp-paciente-selecionado">
          <MiniFoto
            pessoa={selecionado}
            tamanho={42}
          />

          <strong>{selecionado.nome}</strong>

          <button
            type="button"
            aria-label="Remover paciente selecionado"
            title="Remover paciente"
            onClick={() => {
              onLimpar();
              setAberto(false);
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div className="rp-campo-busca">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            value={valor}
            autoComplete="off"
            placeholder="Buscar paciente pelo nome..."
            aria-label="Buscar paciente pelo nome"
            onFocus={() => setAberto(true)}
            onChange={(evento) => {
              onChange(evento.target.value);
              setAberto(true);
            }}
          />

          {valor && (
            <button
              type="button"
              aria-label="Limpar pesquisa"
              onClick={() => onChange("")}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* RESULTADOS DA PESQUISA */}

      {aberto && !selecionado && (
        <div
          className="rp-sugestoes"
          role="listbox"
          aria-label="Pacientes encontrados"
        >
          {carregando && (
            <p>Buscando pacientes...</p>
          )}

          {erro && (
            <p className="rp-erro">{erro}</p>
          )}

          {!carregando &&
            !erro &&
            opcoes.length === 0 && (
              <p>Nenhum paciente encontrado.</p>
            )}

          {!carregando &&
            opcoes.map((paciente) => (
              <button
                key={paciente.uid}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => {
                  onSelecionar(paciente);
                  setAberto(false);
                }}
              >
                <MiniFoto
                  pessoa={paciente}
                  tamanho={34}
                />

                <span>{paciente.nome}</span>
              </button>
            ))}

          <button
            type="button"
            className="rp-fechar-busca"
            onClick={() => setAberto(false)}
          >
            Fechar busca
          </button>
        </div>
      )}
    </div>
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function RelatoriosPsicologo({
  psicologoUid,
  nomeProfissional = "Psicólogo",
  crp = "",
}) {
  // Relatórios
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  // Busca principal
  const [termoBusca, setTermoBusca] = useState("");
  const [pacienteBusca, setPacienteBusca] = useState(null);

  // Modal
  const [aberto, setAberto] = useState(false);
  const [termoModal, setTermoModal] = useState("");
  const [pacienteModal, setPacienteModal] = useState(null);
  const [anotacoes, setAnotacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Histórico
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [visualizando, setVisualizando] = useState(null);

  // Agendamentos reais
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentoId, setAgendamentoId] = useState("");
  const [carregandoAgenda, setCarregandoAgenda] = useState(false);
  const [erroAgenda, setErroAgenda] = useState("");

  // ====================================================
  // BUSCAR RELATÓRIOS DO PSICÓLOGO
  // ====================================================

  async function carregarRelatorios() {
    if (!psicologoUid) return;

    setCarregando(true);

    try {
      const consulta = query(
        collection(db, "relatorios"),
        where("psicologoUid", "==", psicologoUid),
        limit(100)
      );

      const resultado = await getDocs(consulta);

      setRelatorios(
        resultado.docs.map((documento) => ({
          ...documento.data(),
          id: documento.id,
        }))
      );

      setErro("");
    } catch (falha) {
      console.error("Erro ao carregar relatórios:", falha);

      setErro(
        falha.code === "permission-denied"
          ? "O Firestore não autorizou a consulta de relatórios."
          : "Não foi possível carregar os relatórios."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRelatorios();
  }, [psicologoUid]);

  // ====================================================
  // BUSCAR AGENDAMENTOS DO PACIENTE SELECIONADO
  // ====================================================

  useEffect(() => {
    if (!aberto || !pacienteModal || !psicologoUid) {
      setAgendamentos([]);
      setAgendamentoId("");
      setErroAgenda("");
      return;
    }

    let ativo = true;

    async function carregarAgenda() {
      setCarregandoAgenda(true);

      try {
        const consulta = query(
          collection(db, "agendamentos"),
          where("psicologoUid", "==", psicologoUid),
          limit(100)
        );

        const resultado = await getDocs(consulta);

        if (!ativo) return;

        const encontrados = resultado.docs
          .map((documento) => ({
            ...documento.data(),
            id: documento.id,
          }))
          .filter(
            (agendamento) =>
              agendamento.pacienteUid === pacienteModal.uid &&
              lerDataAgendamento(agendamento)
          );

        setAgendamentos(encontrados);
        setAgendamentoId(encontrados[0]?.id || "");
        setErroAgenda("");
      } catch (falha) {
        if (!ativo) return;

        setErroAgenda(
          falha.code === "permission-denied"
            ? "O Firestore não autorizou a consulta da agenda."
            : "Não foi possível consultar os agendamentos."
        );
      } finally {
        if (ativo) setCarregandoAgenda(false);
      }
    }

    carregarAgenda();

    return () => {
      ativo = false;
    };
  }, [aberto, pacienteModal?.uid, psicologoUid]);

  // ====================================================
  // FILTRAGEM DOS RELATÓRIOS
  // ====================================================

  const lista = useMemo(() => {
    return relatorios
      .filter((relatorio) =>
        pacienteBusca
          ? relatorio.pacienteUid === pacienteBusca.uid
          : !termoBusca ||
            normalizar(relatorio.pacienteNome).includes(
              normalizar(termoBusca)
            )
      )
      .sort(
        (a, b) =>
          (b.criadoEm?.seconds || 0) -
          (a.criadoEm?.seconds || 0)
      );
  }, [relatorios, pacienteBusca, termoBusca]);

  const historico = useMemo(() => {
    return relatorios
      .filter(
        (relatorio) =>
          relatorio.pacienteUid === pacienteModal?.uid
      )
      .sort(
        (a, b) =>
          (b.criadoEm?.seconds || 0) -
          (a.criadoEm?.seconds || 0)
      );
  }, [relatorios, pacienteModal]);

  const agendamento = agendamentos.find(
    (item) => item.id === agendamentoId
  );

  const quando = lerDataAgendamento(agendamento);

  // ====================================================
  // ABRIR O MODAL
  // ====================================================

  function abrirNovo() {
    setPacienteModal(pacienteBusca);
    setTermoModal("");
    setAnotacoes("");
    setHistoricoAberto(false);

    setAgendamentos([]);
    setAgendamentoId("");
    setErroAgenda("");

    setErro("");
    setAviso("");
    setAberto(true);
  }

  // ====================================================
  // SALVAR NO FIRESTORE
  // ====================================================

  async function salvar(status) {
    setErro("");

    if (!pacienteModal) {
      setErro("Selecione um paciente.");
      return;
    }

    if (status === "finalizado" && !anotacoes.trim()) {
      setErro("Preencha as anotações antes de finalizar.");
      return;
    }

    if (status === "finalizado" && !quando) {
      setErro(
        "Selecione um atendimento agendado antes de finalizar."
      );
      return;
    }

    setSalvando(true);

    try {
      await addDoc(collection(db, "relatorios"), {
        psicologoUid,
        pacienteUid: pacienteModal.uid,
        pacienteNome: pacienteModal.nome,
        pacienteFotoURL: pacienteModal.fotoURL || "",
        profissionalNome: nomeProfissional,

        atendimentoUid: agendamentoId || null,
        dataAtendimento: quando?.data || null,
        horaAtendimento: quando?.hora || null,

        anotacoes: anotacoes.trim(),
        status,
        criadoEm: serverTimestamp(),
      });

      setAberto(false);

      setAviso(
        status === "rascunho"
          ? "Rascunho salvo no Firestore."
          : "Relatório finalizado e salvo no Firestore."
      );

      await carregarRelatorios();
    } catch (falha) {
      console.error("Erro ao salvar relatório:", falha);

      setErro(
        falha.code === "permission-denied"
          ? "O Firestore bloqueou a gravação do relatório."
          : "Não foi possível salvar o relatório."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <div className="rp-pagina">

      {/* CABEÇALHO */}

      <div className="rp-topo">
        <p>
          Consulte os registros vinculados ao seu perfil
          profissional.
        </p>

        <button
          type="button"
          className="rp-primario"
          onClick={abrirNovo}
        >
          ＋ Novo relatório
        </button>
      </div>

      {/* BUSCAR PACIENTE */}

      <div className="rp-barra-pesquisa">
        <SeletorPaciente
          rotulo="Buscar paciente"
          valor={termoBusca}
          onChange={setTermoBusca}
          selecionado={pacienteBusca}
          onSelecionar={(paciente) => {
            setPacienteBusca(paciente);
            setTermoBusca("");
          }}
          onLimpar={() => {
            setPacienteBusca(null);
            setTermoBusca("");
          }}
        />
      </div>

      {/* RELATÓRIOS RECENTES */}

      <section className="rp-painel">
        <h2>
          {pacienteBusca
            ? `Relatórios de ${pacienteBusca.nome}`
            : termoBusca
              ? "Resultados da busca"
              : "Relatórios recentes"}
        </h2>

        <p className="rp-subtitulo">
          {pacienteBusca
            ? "Registros desta pessoa disponíveis para o seu perfil."
            : "Seus relatórios mais recentes. Pesquise um paciente para filtrar."}
        </p>

        {aviso && (
          <p className="rp-aviso" role="status">
            {aviso}
          </p>
        )}

        {erro && !aberto && (
          <p className="rp-erro" role="alert">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="rp-estado">
            Carregando relatórios...
          </p>
        ) : lista.length === 0 ? (
          <p className="rp-estado">
            Nenhum relatório encontrado.
          </p>
        ) : (
          <div className="rp-tabela-scroll">
            <table className="rp-tabela">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Profissional</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {lista.map((relatorio) => (
                  <tr key={relatorio.id}>
                    <td>
                      <span className="rp-celula-pessoa">
                        <MiniFoto
                          pessoa={{
                            nome: relatorio.pacienteNome,
                            fotoURL: relatorio.pacienteFotoURL,
                          }}
                          tamanho={34}
                        />

                        {relatorio.pacienteNome}
                      </span>
                    </td>

                    <td>
                      {relatorio.profissionalNome || "—"}
                    </td>

                    <td>
                      {exibirData(relatorio.dataAtendimento)}
                    </td>

                    <td>
                      <span
                        className={`rp-status ${relatorio.status}`}
                      >
                        {relatorio.status === "finalizado"
                          ? "Finalizado"
                          : "Rascunho"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="rp-abrir"
                        onClick={() => setVisualizando(relatorio)}
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ==============================================
          POP-UP: NOVO RELATÓRIO
      ============================================== */}

      {aberto && (
        <div
          className="rp-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setAberto(false);
            }
          }}
        >
          <div
            className="rp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rp-titulo"
          >
            <div className="rp-modal-topo">
              <div>
                <h2 id="rp-titulo">
                  Novo relatório de atendimento
                </h2>

                <p>
                  Registre e acompanhe a evolução do paciente.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar janela"
                onClick={() => setAberto(false)}
              >
                ×
              </button>
            </div>

            <div className="rp-modal-scroll">

              {/* INFORMAÇÕES INICIAIS */}

              <div className="rp-dados">
                <SeletorPaciente
                  rotulo="Selecionar / buscar paciente *"
                  valor={termoModal}
                  onChange={setTermoModal}
                  selecionado={pacienteModal}
                  onSelecionar={setPacienteModal}
                  onLimpar={() => {
                    setPacienteModal(null);
                    setTermoModal("");
                  }}
                />

                <div>
                  <label className="rp-label">
                    Profissional responsável
                  </label>

                  <div className="rp-campo-fixo">
                    {nomeProfissional}

                    {crp && (
                      <small>CRP {crp}</small>
                    )}
                  </div>
                </div>

                <div>
                  <label className="rp-label">
                    Data e horário do atendimento
                  </label>

                  <div className="rp-campo-fixo">
                    {carregandoAgenda
                      ? "Buscando agendamentos..."
                      : quando
                        ? `${exibirData(quando.data)} • ${quando.hora}`
                        : "Sem atendimento selecionado"}
                  </div>

                  {agendamentos.length > 1 && (
                    <select
                      className="rp-select-agenda"
                      value={agendamentoId}
                      onChange={(evento) =>
                        setAgendamentoId(evento.target.value)
                      }
                    >
                      {agendamentos.map((item) => {
                        const data = lerDataAgendamento(item);

                        return (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {exibirData(data?.data)} • {data?.hora}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {erroAgenda && (
                    <small className="rp-auxiliar">
                      {erroAgenda}
                    </small>
                  )}
                </div>
              </div>

              {/* ANOTAÇÕES + TRIAGEM */}

              <div className="rp-corpo-duas-colunas">

                <section className="rp-box-anotacoes">
                  <h3>✎ Anotações do atendimento *</h3>

                  <textarea
                    rows={13}
                    maxLength={10000}
                    value={anotacoes}
                    onChange={(evento) =>
                      setAnotacoes(evento.target.value)
                    }
                    placeholder="Registre observações, evolução, intervenções e encaminhamentos..."
                  />

                  <small>
                    {anotacoes.length} / 10000 caracteres
                  </small>
                </section>

                <section className="rp-box-triagem">
                  <h3>✧ Triagem</h3>

                  <div className="rp-triagem-vazia">
                    {pacienteModal
                      ? "O resumo da triagem aparecerá aqui quando estiver vinculado ao Firestore."
                      : "Selecione um paciente para consultar a triagem."}
                  </div>
                </section>

              </div>

              {/* HISTÓRICO EXPANSÍVEL */}

              <div className="rp-historico">
                <button
                  type="button"
                  aria-expanded={historicoAberto}
                  onClick={() =>
                    setHistoricoAberto((atual) => !atual)
                  }
                >
                  <span>
                    ▤ Histórico de atendimentos e relatórios
                  </span>

                  <span>
                    {historicoAberto ? "⌃" : "⌄"}
                  </span>
                </button>

                {historicoAberto && (
                  <div className="rp-historico-conteudo">
                    {!pacienteModal ? (
                      <p>Selecione um paciente.</p>
                    ) : historico.length === 0 ? (
                      <p>
                        Nenhum relatório anterior deste paciente.
                      </p>
                    ) : (
                      historico.map((relatorio) => (
                        <button
                          key={relatorio.id}
                          type="button"
                          onClick={() =>
                            setVisualizando(relatorio)
                          }
                        >
                          <span>
                            {exibirData(relatorio.dataAtendimento)}
                            {" — "}
                            {relatorio.status === "rascunho"
                              ? "Rascunho"
                              : "Finalizado"}
                          </span>

                          <span>Visualizar</span>
                        </button>
                      ))
                    )}

                    <p className="rp-auxiliar">
                      O histórico completo de sessões será
                      integrado ao módulo de agendamentos.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {erro && (
              <p className="rp-erro" role="alert">
                {erro}
              </p>
            )}

            {/* BOTÕES DO POP-UP */}

            <div className="rp-rodape-modal">
              <button
                type="button"
                className="rp-secundario"
                onClick={() => setAberto(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="rp-rascunho"
                disabled={salvando || !pacienteModal}
                onClick={() => salvar("rascunho")}
              >
                Salvar rascunho
              </button>

              <button
                type="button"
                className="rp-primario"
                disabled={
                  salvando ||
                  !pacienteModal ||
                  !quando ||
                  !anotacoes.trim()
                }
                onClick={() => salvar("finalizado")}
              >
                Finalizar relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          VISUALIZAR RELATÓRIO
      ============================================== */}

      {visualizando && (
        <div
          className="rp-overlay rp-overlay-detalhe"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setVisualizando(null);
            }
          }}
        >
          <div
            className="rp-detalhe-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rp-detalhe-titulo"
          >
            <div className="rp-modal-topo">
              <div>
                <h2 id="rp-detalhe-titulo">
                  Relatório de {visualizando.pacienteNome}
                </h2>

                <p>
                  {exibirData(visualizando.dataAtendimento)}
                  {" · "}
                  {visualizando.status}
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setVisualizando(null)}
              >
                ×
              </button>
            </div>

            <div className="rp-detalhe-texto">
              {visualizando.anotacoes ||
                "Rascunho sem anotações."}
            </div>

            <div className="rp-rodape-modal">
              <button
                type="button"
                className="rp-secundario"
                onClick={() => setVisualizando(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}