
import { useMemo, useState } from "react";
import "./AgendaPsicologo.css";

// ======================================================
// DADOS DE DEMONSTRAÇÃO
// Não utiliza o Firebase nesta versão.
// ======================================================

const PACIENTES = [
  {
    id: "mariana",
    nome: "Mariana Silva",
    triagem:
      "Resumo fictício: busca acompanhamento para organização da rotina e manejo de situações de estresse.",
  },
  {
    id: "gabriel",
    nome: "Gabriel Torres",
    triagem:
      "Resumo fictício: deseja compreender melhor suas dificuldades cotidianas e desenvolver estratégias de autocuidado.",
  },
  {
    id: "fernanda",
    nome: "Fernanda Alves",
    triagem:
      "Resumo fictício: procura um espaço de escuta e acompanhamento psicológico.",
  },
  {
    id: "matheus",
    nome: "Matheus Lima",
    triagem:
      "Resumo fictício: busca acompanhamento para questões relacionadas à rotina e aos relacionamentos.",
  },
];

function dataISO(data) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0"),
  ].join("-");
}

function lerData(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function moverDias(iso, quantidade) {
  const data = lerData(iso);
  data.setDate(data.getDate() + quantidade);
  return dataISO(data);
}

function formatarData(iso, opcoes) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    opcoes
  ).format(lerData(iso));
}

function inicioSemana(iso) {
  const data = lerData(iso);
  const deslocamento = (data.getDay() + 6) % 7;
  data.setDate(data.getDate() - deslocamento);
  return dataISO(data);
}

function minutos(horario) {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

function dadosDemonstracao() {
  const hoje = dataISO(new Date());

  const criar = (
    id,
    pacienteId,
    deslocamento,
    hora,
    modalidade,
    pagamento,
    status = "confirmado"
  ) => ({
    id,
    pacienteId,
    data: moverDias(hoje, deslocamento),
    hora,
    duracao: 50,
    modalidade,
    pagamento,
    status,
  });

  return [
    criar("ag1", "mariana", 0, "10:00", "online", "aprovado"),
    criar("ag2", "gabriel", 0, "11:30", "presencial", "aprovado"),
    criar("ag3", "fernanda", 0, "14:00", "online", "pendente"),
    criar("ag4", "matheus", 0, "16:00", "presencial", "aprovado"),
    criar("ag5", "mariana", 1, "09:00", "online", "pendente"),
    criar("ag6", "fernanda", 1, "15:00", "online", "aprovado"),
    criar("ag7", "gabriel", 3, "11:30", "presencial", "aprovado"),
    criar("ag8", "gabriel", -7, "11:30", "online", "aprovado", "realizado"),
    criar("ag9", "gabriel", -14, "11:30", "online", "aprovado", "realizado"),
    criar("ag10", "mariana", -3, "10:00", "online", "aprovado", "realizado"),
  ];
}

// ======================================================
// ÍCONES SEM DEPENDÊNCIAS EXTERNAS
// ======================================================

function Icone({ nome, tamanho = 21 }) {
  const formas = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 3" />
      </>
    ),
    video: (
      <>
        <rect x="2" y="5" width="15" height="14" rx="2" />
        <path d="m17 10 5-3v10l-5-3" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 3v6h6M12 7v5l3 2" />
      </>
    ),
    file: (
      <>
        <path d="M6 2h9l5 5v15H6zM15 2v5h5" />
        <path d="M9 12h8M9 16h8" />
      </>
    ),
    credit: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20M6 15h5" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    x: <path d="M5 5l14 14M19 5 5 19" />,
    plus: <path d="M12 5v14M5 12h14" />,
    play: <path d="m8 5 11 7-11 7z" />,
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
      {formas[nome] || formas.calendar}
    </svg>
  );
}

function Avatar({ nome }) {
  const letras = nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <span className="ag-avatar" aria-hidden="true">
      {letras}
    </span>
  );
}

function BadgePagamento({ pagamento }) {
  const aprovado = pagamento === "aprovado";

  return (
    <span
      className={
        aprovado
          ? "ag-pagamento aprovado"
          : "ag-pagamento pendente"
      }
    >
      <Icone nome={aprovado ? "check" : "x"} tamanho={15} />
      {aprovado
        ? "Pagamento aprovado"
        : "Pagamento não aprovado"}
    </span>
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function AgendaPsicologo() {
  const hoje = dataISO(new Date());

  const [atendimentos, setAtendimentos] = useState(
    dadosDemonstracao
  );

  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [atendimentoId, setAtendimentoId] = useState("ag2");

  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const [mesExibido, setMesExibido] = useState(() => {
    const data = new Date();
    return new Date(data.getFullYear(), data.getMonth(), 1);
  });

  const [triagemAberta, setTriagemAberta] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);

  const [novoAberto, setNovoAberto] = useState(false);
  const [cancelamentoId, setCancelamentoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const [form, setForm] = useState({
    pacienteId: "",
    data: hoje,
    hora: "09:00",
    duracao: "50",
    modalidade: "online",
  });

  // ====================================================
  // SEMANA E ATENDIMENTOS SELECIONADOS
  // ====================================================

  const diasSemana = useMemo(() => {
    const inicio = inicioSemana(diaSelecionado);

    return Array.from(
      { length: 7 },
      (_, indice) => moverDias(inicio, indice)
    );
  }, [diaSelecionado]);

  const atendimentosDia = useMemo(() => {
    return atendimentos
      .filter((item) => item.data === diaSelecionado)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [atendimentos, diaSelecionado]);

  const atendimentoSelecionado =
    atendimentosDia.find((item) => item.id === atendimentoId) ||
    atendimentosDia[0] ||
    null;

  const pacienteSelecionado = PACIENTES.find(
    (paciente) =>
      paciente.id === atendimentoSelecionado?.pacienteId
  );

  const historicoPaciente = useMemo(() => {
    if (!atendimentoSelecionado) return [];

    return atendimentos
      .filter(
        (item) =>
          item.pacienteId === atendimentoSelecionado.pacienteId &&
          item.status === "realizado"
      )
      .sort((a, b) =>
        `${b.data}T${b.hora}`.localeCompare(
          `${a.data}T${a.hora}`
        )
      );
  }, [atendimentos, atendimentoSelecionado]);

  // ====================================================
  // NAVEGAÇÃO DE DATAS
  // ====================================================

  function selecionarDia(data) {
    setDiaSelecionado(data);
    setAtendimentoId(null);
    setTriagemAberta(false);
    setHistoricoAberto(false);
    setMensagem("");
  }

  function selecionarAtendimento(id) {
    setAtendimentoId(id);
    setTriagemAberta(false);
    setHistoricoAberto(false);
    setMensagem("");
  }

  function mudarMes(quantidade) {
    setMesExibido(
      (atual) =>
        new Date(
          atual.getFullYear(),
          atual.getMonth() + quantidade,
          1
        )
    );
  }

  function abrirCalendario() {
    const data = lerData(diaSelecionado);

    setMesExibido(
      new Date(data.getFullYear(), data.getMonth(), 1)
    );

    setCalendarioAberto(true);
  }

  // ====================================================
  // CALENDÁRIO MENSAL
  // ====================================================

  const celulasMes = useMemo(() => {
    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();
    const quantidade = new Date(ano, mes + 1, 0).getDate();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const vazios = (primeiroDia + 6) % 7;

    return [
      ...Array(vazios).fill(null),
      ...Array.from({ length: quantidade }, (_, i) =>
        dataISO(new Date(ano, mes, i + 1))
      ),
    ];
  }, [mesExibido]);

  const quantidadePorDia = useMemo(() => {
    const resultado = {};

    atendimentos.forEach((item) => {
      if (item.status !== "cancelado") {
        resultado[item.data] =
          (resultado[item.data] || 0) + 1;
      }
    });

    return resultado;
  }, [atendimentos]);

  // ====================================================
  // AÇÕES DE SESSÃO — DEMONSTRAÇÃO
  // ====================================================

  function alterarStatus(id, status) {
    setAtendimentos((atuais) =>
      atuais.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  function acaoSessao() {
    if (!atendimentoSelecionado) return;

    if (atendimentoSelecionado.status === "em_andamento") {
      alterarStatus(atendimentoSelecionado.id, "realizado");
      setMensagem(
        "Atendimento marcado como realizado. Ação apenas demonstrativa."
      );
    } else {
      alterarStatus(atendimentoSelecionado.id, "em_andamento");
      setMensagem(
        "Sessão iniciada no modo de teste. Nenhuma videochamada foi criada."
      );
    }
  }

  function confirmarCancelamento() {
    if (!cancelamentoId) return;

    alterarStatus(cancelamentoId, "cancelado");
    setCancelamentoId(null);
    setMensagem(
      "Atendimento cancelado nesta demonstração."
    );
  }

  // ====================================================
  // NOVO AGENDAMENTO — DADOS LOCAIS
  // ====================================================

  function abrirNovo() {
    setForm({
      pacienteId: "",
      data: diaSelecionado,
      hora: "09:00",
      duracao: "50",
      modalidade: "online",
    });

    setMensagem("");
    setNovoAberto(true);
  }

  function criarAgendamento(evento) {
    evento.preventDefault();

    if (!form.pacienteId || !form.data || !form.hora) {
      setMensagem("Preencha os campos obrigatórios.");
      return;
    }

    const inicio = minutos(form.hora);
    const fim = inicio + Number(form.duracao);

    const conflito = atendimentos.some((item) => {
      if (
        item.data !== form.data ||
        item.status === "cancelado"
      ) {
        return false;
      }

      const inicioExistente = minutos(item.hora);
      const fimExistente =
        inicioExistente + Number(item.duracao);

      return inicio < fimExistente && fim > inicioExistente;
    });

    if (conflito) {
      setMensagem(
        "Já existe um atendimento nesse intervalo. Escolha outro horário."
      );
      return;
    }

    const novo = {
      id: `demo-${Date.now()}`,
      pacienteId: form.pacienteId,
      data: form.data,
      hora: form.hora,
      duracao: Number(form.duracao),
      modalidade: form.modalidade,
      pagamento: "pendente",
      status: "agendado",
    };

    setAtendimentos((atuais) => [...atuais, novo]);

    selecionarDia(novo.data);
    setAtendimentoId(novo.id);
    setNovoAberto(false);

    setMensagem(
      "Agendamento criado em memória. Não foi salvo no Firebase."
    );
  }

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <div className="ag-pagina">
      <div className="ag-introducao">
        <div>
          <p>
            Gerencie seus atendimentos e acompanhe sua rotina
            profissional.
          </p>
          <small>
            Ambiente de demonstração — dados e pagamentos fictícios.
          </small>
        </div>

        <button
          type="button"
          className="ag-botao-primario"
          onClick={abrirNovo}
        >
          <Icone nome="plus" tamanho={18} />
          Novo agendamento
        </button>
      </div>

      {/* ==============================================
          TELA DE CALENDÁRIO COMPLETO
      ============================================== */}

      {calendarioAberto ? (
        <section className="ag-calendario-pagina">
          <div className="ag-calendario-topo">
            <button
              type="button"
              className="ag-voltar"
              onClick={() => setCalendarioAberto(false)}
            >
              <Icone nome="left" />
              Voltar à agenda
            </button>

            <div>
              <h2>Calendário completo</h2>
              <p>
                Escolha um dia para visualizar seus atendimentos.
              </p>
            </div>
          </div>

          <div className="ag-calendario-controles">
            <button
              type="button"
              onClick={() => mudarMes(-1)}
              aria-label="Mês anterior"
            >
              <Icone nome="left" />
            </button>

            <h3>
              {new Intl.DateTimeFormat("pt-BR", {
                month: "long",
                year: "numeric",
              }).format(mesExibido)}
            </h3>

            <button
              type="button"
              onClick={() => mudarMes(1)}
              aria-label="Próximo mês"
            >
              <Icone nome="right" />
            </button>
          </div>

          <div className="ag-mes-grade">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
              (dia) => (
                <div className="ag-dia-cabecalho" key={dia}>
                  {dia}
                </div>
              )
            )}

            {celulasMes.map((dia, indice) =>
              dia ? (
                <button
                  key={dia}
                  type="button"
                  className={[
                    "ag-dia-mes",
                    dia === hoje ? "hoje" : "",
                    dia === diaSelecionado ? "selecionado" : "",
                    quantidadePorDia[dia] ? "com-atendimento" : "",
                  ].join(" ")}
                  onClick={() => {
                    selecionarDia(dia);
                    setCalendarioAberto(false);
                  }}
                  aria-label={`${formatarData(dia, {
                    dateStyle: "full",
                  })}, ${quantidadePorDia[dia] || 0} atendimentos`}
                >
                  <strong>{lerData(dia).getDate()}</strong>

                  {quantidadePorDia[dia] ? (
                    <span className="ag-marcador-mes">
                      {quantidadePorDia[dia]} atendimento(s)
                    </span>
                  ) : (
                    <span className="ag-sem-marcador">—</span>
                  )}
                </button>
              ) : (
                <div
                  className="ag-dia-vazio"
                  key={`vazio-${indice}`}
                />
              )
            )}
          </div>

          <div className="ag-legenda">
            <span>
              <i className="ag-legenda-ponto" />
              Dias com atendimentos
            </span>
            <span>
              Clique em uma data para voltar à agenda daquele dia.
            </span>
          </div>
        </section>
      ) : (
        <>
          {/* ==========================================
              NAVEGAÇÃO SEMANAL
          ========================================== */}

          <section className="ag-semana">
            <button
              type="button"
              className="ag-seta"
              onClick={() =>
                selecionarDia(moverDias(diaSelecionado, -7))
              }
              aria-label="Semana anterior"
            >
              <Icone nome="left" />
            </button>

            <div className="ag-semana-dias">
              {diasSemana.map((dia) => {
                const selecionado = dia === diaSelecionado;

                return (
                  <button
                    key={dia}
                    type="button"
                    className={`ag-dia-semana ${
                      selecionado ? "selecionado" : ""
                    }`}
                    onClick={() => selecionarDia(dia)}
                    aria-pressed={selecionado}
                  >
                    {dia === hoje && (
                      <span className="ag-hoje-label">Hoje</span>
                    )}

                    <span>
                      {formatarData(dia, { weekday: "short" })
                        .replace(".", "")}
                    </span>

                    <strong>
                      {formatarData(dia, {
                        day: "2-digit",
                        month: "short",
                      })}
                    </strong>

                    {quantidadePorDia[dia] > 0 && (
                      <i className="ag-dia-indicador" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="ag-seta"
              onClick={() =>
                selecionarDia(moverDias(diaSelecionado, 7))
              }
              aria-label="Próxima semana"
            >
              <Icone nome="right" />
            </button>

            <button
              type="button"
              className="ag-calendario-botao"
              onClick={abrirCalendario}
            >
              <Icone nome="calendar" tamanho={29} />
              <span>
                Calendário
                <br />
                completo
              </span>
            </button>
          </section>

          {/* ==========================================
              ATENDIMENTOS E DETALHES
          ========================================== */}

          <div className="ag-paineis">
            <section className="ag-card ag-lista">
              <div className="ag-card-cabecalho">
                <div>
                  <h2>
                    <Icone nome="calendar" tamanho={25} />
                    {diaSelecionado === hoje
                      ? "Agenda de Hoje"
                      : "Agenda do Dia"}
                  </h2>

                  <p>
                    {formatarData(diaSelecionado, {
                      dateStyle: "full",
                    })}
                  </p>
                </div>

                <span className="ag-contagem">
                  {atendimentosDia.length} atendimento(s)
                </span>
              </div>

              {atendimentosDia.length === 0 ? (
                <div className="ag-estado-vazio">
                  <Icone nome="calendar" tamanho={35} />
                  <strong>Dia sem atendimentos</strong>
                  <p>
                    Escolha outro dia ou crie um agendamento
                    de teste.
                  </p>
                </div>
              ) : (
                <div className="ag-lista-itens">
                  {atendimentosDia.map((item) => {
                    const paciente = PACIENTES.find(
                      (p) => p.id === item.pacienteId
                    );

                    const ativo =
                      atendimentoSelecionado?.id === item.id;

                    return (
                      <button
                        type="button"
                        className={`ag-atendimento ${
                          ativo ? "ativo" : ""
                        } ${item.status === "cancelado"
                          ? "cancelado"
                          : ""}`}
                        key={item.id}
                        onClick={() =>
                          selecionarAtendimento(item.id)
                        }
                      >
                        <strong className="ag-hora">
                          {item.hora}
                        </strong>

                        <div className="ag-atendimento-info">
                          <strong>
                            {paciente?.nome || "Paciente"}
                          </strong>

                          <small>
                            <Icone
                              nome={
                                item.modalidade === "online"
                                  ? "video"
                                  : "pin"
                              }
                              tamanho={15}
                            />
                            {item.modalidade === "online"
                              ? "Online"
                              : "Presencial"}
                            {" · "}
                            {item.duracao} min
                          </small>

                          {item.status === "cancelado" && (
                            <span className="ag-status-cancelado">
                              Cancelado
                            </span>
                          )}
                        </div>

                        <BadgePagamento
                          pagamento={item.pagamento}
                        />

                        {ativo && (
                          <Icone nome="right" tamanho={20} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ========================================
                DETALHES DO ATENDIMENTO
            ======================================== */}

            <section className="ag-card ag-detalhes">
              {!atendimentoSelecionado ? (
                <div className="ag-estado-vazio">
                  <Icone nome="user" tamanho={37} />
                  <strong>Selecione um atendimento</strong>
                  <p>
                    Os detalhes do paciente aparecerão aqui.
                  </p>
                </div>
              ) : (
                <>
                  <div className="ag-paciente-cabecalho">
                    <Avatar nome={pacienteSelecionado?.nome || "Paciente"} />

                    <div className="ag-paciente-info">
                      <h2>{pacienteSelecionado?.nome}</h2>

                      <div className="ag-paciente-acoes">
                        <button
                          type="button"
                          onClick={() =>
                            setTriagemAberta((anterior) => !anterior)
                          }
                          aria-expanded={triagemAberta}
                        >
                          <Icone nome="file" tamanho={17} />
                          Ver triagem
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setHistoricoAberto(
                              (anterior) => !anterior
                            )
                          }
                          aria-expanded={historicoAberto}
                        >
                          <Icone nome="history" tamanho={18} />
                          Ver histórico de atendimentos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TRIAGEM */}

                  {triagemAberta && (
                    <div className="ag-bloco-expandido">
                      <strong>Resumo da triagem</strong>
                      <p>
                        {pacienteSelecionado?.triagem ||
                          "Nenhuma triagem disponível."}
                      </p>
                      <small>
                        Exemplo fictício. A triagem real será
                        integrada posteriormente.
                      </small>
                    </div>
                  )}

                  {/* HISTÓRICO */}

                  {historicoAberto && (
                    <div className="ag-bloco-expandido">
                      <strong>Histórico de atendimentos</strong>

                      {historicoPaciente.length ? (
                        <ul className="ag-historico-lista">
                          {historicoPaciente.map((item) => (
                            <li key={item.id}>
                              <Icone
                                nome="check"
                                tamanho={17}
                              />
                              <span>
                                {formatarData(item.data, {
                                  dateStyle: "short",
                                })}
                                {" · "}
                                {item.hora}
                                {" · "}
                                Atendimento realizado
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>
                          Nenhum atendimento anterior
                          registrado nesta demonstração.
                        </p>
                      )}

                      <small>
                        Registros fictícios, sem prontuário real.
                      </small>
                    </div>
                  )}

                  <div className="ag-divisor" />

                  {/* DATA E MODALIDADE */}

                  <div className="ag-detalhes-metricas">
                    <div>
                      <Icone nome="calendar" tamanho={24} />
                      <span>
                        Data
                        <strong>
                          {formatarData(
                            atendimentoSelecionado.data,
                            { dateStyle: "short" }
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Icone nome="clock" tamanho={24} />
                      <span>
                        Horário
                        <strong>
                          {atendimentoSelecionado.hora}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Icone
                        nome={
                          atendimentoSelecionado.modalidade === "online"
                            ? "video"
                            : "pin"
                        }
                        tamanho={24}
                      />
                      <span>
                        Formato
                        <strong>
                          {atendimentoSelecionado.modalidade === "online"
                            ? "Online"
                            : "Presencial"}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Icone nome="clock" tamanho={24} />
                      <span>
                        Duração
                        <strong>
                          {atendimentoSelecionado.duracao} minutos
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="ag-divisor" />

                  {/* PAGAMENTO */}

                  <div className="ag-pagamento-linha">
                    <div>
                      <Icone nome="credit" tamanho={24} />
                      <strong>Pagamento</strong>
                    </div>

                    <BadgePagamento
                      pagamento={atendimentoSelecionado.pagamento}
                    />
                  </div>

                  {atendimentoSelecionado.pagamento !== "aprovado" && (
                    <p className="ag-pagamento-aviso">
                      Pagamento pendente na simulação.
                      Confira a situação antes do atendimento.
                    </p>
                  )}

                  <div className="ag-divisor" />

                  {/* STATUS E AÇÕES */}

                  <div className="ag-status-atendimento">
                    <strong>Status:</strong>{" "}
                    {atendimentoSelecionado.status === "em_andamento"
                      ? "Em andamento"
                      : atendimentoSelecionado.status === "realizado"
                        ? "Realizado"
                        : atendimentoSelecionado.status === "cancelado"
                          ? "Cancelado"
                          : atendimentoSelecionado.status === "agendado"
                            ? "Agendado"
                            : "Confirmado"}
                  </div>

                  {mensagem && (
                    <p className="ag-feedback" role="status">
                      {mensagem}
                    </p>
                  )}

                  <div className="ag-botoes-finais">
                    <button
                      type="button"
                      className="ag-botao-primario"
                      disabled={["realizado", "cancelado"].includes(
                        atendimentoSelecionado.status
                      )}
                      onClick={acaoSessao}
                    >
                      <Icone
                        nome={
                          atendimentoSelecionado.status === "em_andamento"
                            ? "check"
                            : "play"
                        }
                        tamanho={19}
                      />

                      {atendimentoSelecionado.status === "em_andamento"
                        ? "Encerrar sessão"
                        : atendimentoSelecionado.status === "realizado"
                          ? "Sessão finalizada"
                          : "Iniciar sessão"}
                    </button>

                    <button
                      type="button"
                      className="ag-botao-cancelar"
                      disabled={[
                        "cancelado",
                        "realizado",
                        "em_andamento",
                      ].includes(atendimentoSelecionado.status)}
                      onClick={() =>
                        setCancelamentoId(atendimentoSelecionado.id)
                      }
                    >
                      <Icone nome="x" tamanho={19} />
                      Cancelar atendimento
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </>
      )}

      {/* ==============================================
          POP-UP NOVO AGENDAMENTO
      ============================================== */}

      {novoAberto && (
        <div className="ag-overlay">
          <form
            className="ag-modal"
            onSubmit={criarAgendamento}
          >
            <div className="ag-modal-topo">
              <div>
                <h2>Novo agendamento</h2>
                <p>Crie um atendimento de demonstração.</p>
              </div>

              <button
                type="button"
                onClick={() => setNovoAberto(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="ag-formulario">
              <label>
                Paciente *
                <select
                  required
                  value={form.pacienteId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pacienteId: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione um paciente</option>
                  {PACIENTES.map((paciente) => (
                    <option
                      key={paciente.id}
                      value={paciente.id}
                    >
                      {paciente.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Data *
                <input
                  required
                  type="date"
                  value={form.data}
                  onChange={(e) =>
                    setForm({ ...form, data: e.target.value })
                  }
                />
              </label>

              <label>
                Horário *
                <input
                  required
                  type="time"
                  value={form.hora}
                  onChange={(e) =>
                    setForm({ ...form, hora: e.target.value })
                  }
                />
              </label>

              <label>
                Duração
                <select
                  value={form.duracao}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duracao: e.target.value,
                    })
                  }
                >
                  <option value="30">30 minutos</option>
                  <option value="50">50 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                </select>
              </label>

              <label>
                Modalidade
                <select
                  value={form.modalidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      modalidade: e.target.value,
                    })
                  }
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </label>

              <p className="ag-form-nota">
                O pagamento será criado como pendente.
                Nesta fase, o status é apenas demonstrativo.
              </p>
            </div>

            <div className="ag-modal-rodape">
              <button
                type="button"
                className="ag-botao-cancelar"
                onClick={() => setNovoAberto(false)}
              >
                Voltar
              </button>

              <button
                type="submit"
                className="ag-botao-primario"
              >
                Criar agendamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================
          CONFIRMAR CANCELAMENTO
      ============================================== */}

      {cancelamentoId && (
        <div className="ag-overlay">
          <div
            className="ag-modal ag-modal-pequeno"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ag-cancelar-titulo"
          >
            <div className="ag-modal-topo">
              <div>
                <h2 id="ag-cancelar-titulo">
                  Cancelar atendimento?
                </h2>
                <p>
                  O registro continuará no histórico
                  com status cancelado.
                </p>
              </div>
            </div>

            <div className="ag-modal-rodape">
              <button
                type="button"
                className="ag-botao-cancelar"
                onClick={() => setCancelamentoId(null)}
              >
                Manter atendimento
              </button>

              <button
                type="button"
                className="ag-confirmar-cancelamento"
                onClick={confirmarCancelamento}
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
