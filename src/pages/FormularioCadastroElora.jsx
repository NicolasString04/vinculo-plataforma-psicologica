
import { useState } from "react";
import { Link } from "react-router-dom";

import RequisitosSenha, {
  requisitosSenha,
} from "./RequisitosSenha";

import "./CadastroElora.css";

// =====================================================
// ELORA — FORMULÁRIO DE CADASTRO
//
// Compartilhado entre:
// /cadastro
// /cadastro/psicologo
//
// Paciente: azul
// Psicólogo: roxo
// =====================================================

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO",
];

const GENEROS = [
  {
    valor: "mulher",
    nome: "Mulher",
    simbolo: "♀",
  },
  {
    valor: "homem",
    nome: "Homem",
    simbolo: "♂",
  },
  {
    valor: "nao_binario",
    nome: "Não binário",
    simbolo: "⚥",
  },
  {
    valor: "prefiro_nao_informar",
    nome: "Prefiro não informar",
    simbolo: "○",
  },
  {
    valor: "outro",
    nome: "Outro",
    simbolo: "···",
  },
];

const AREAS = [
  "Psicologia Clínica",
  "Psicologia Escolar / Educacional",
  "Psicologia Organizacional e do Trabalho",
  "Psicologia Hospitalar",
  "Psicologia Social",
  "Neuropsicologia",
  "Outra",
];

const DADOS_INICIAIS = {
  nome: "",
  informarNomeSocial: false,
  nomeSocial: "",

  genero: "",
  generoOutro: "",

  nascimento: "",
  cpf: "",
  email: "",
  telefone: "",

  cidade: "",
  uf: "",

  crp: "",
  areaAtuacao: "",

  informarEndereco: false,
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidadeEndereco: "",
  ufEndereco: "",

  senha: "",
  confirmarSenha: "",
};

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function apenasNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function formatarCPF(valor) {
  return apenasNumeros(valor)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatarTelefone(valor) {
  const n = apenasNumeros(valor).slice(0, 11);

  if (n.length <= 2) {
    return n;
  }

  if (n.length <= 6) {
    return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  }

  if (n.length <= 10) {
    return `(${n.slice(0, 2)}) ${n.slice(
      2,
      6
    )}-${n.slice(6)}`;
  }

  return `(${n.slice(0, 2)}) ${n.slice(
    2,
    7
  )}-${n.slice(7)}`;
}

function formatarCEP(valor) {
  return apenasNumeros(valor)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatarCRP(valor) {
  const n = apenasNumeros(valor).slice(0, 9);

  if (n.length <= 2) {
    return n;
  }

  return `${n.slice(0, 2)}/${n.slice(2)}`;
}

function cpfValido(valor) {
  const n = apenasNumeros(valor);

  if (
    n.length !== 11 ||
    /^(\d)\1{10}$/.test(n)
  ) {
    return false;
  }

  return [9, 10].every((posicao) => {
    let soma = 0;

    for (
      let i = 0;
      i < posicao;
      i += 1
    ) {
      soma +=
        Number(n[i]) *
        (posicao + 1 - i);
    }

    const resto = (soma * 10) % 11;

    return (
      (resto === 10 ? 0 : resto) ===
      Number(n[posicao])
    );
  });
}

function dataDeHoje() {
  const hoje = new Date();

  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
}

function nascimentoValido(valor) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const [ano, mes, dia] = valor
    .split("-")
    .map(Number);

  const data = new Date(
    ano,
    mes - 1,
    dia
  );

  return (
    ano >= 1900 &&
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    valor <= dataDeHoje()
  );
}

// =====================================================
// CAMPO REUTILIZÁVEL
// =====================================================

function Campo({
  nome,
  rotulo,
  valor,
  atualizar,
  tipo = "text",
  placeholder = "",
  obrigatorio = false,
  largo = false,
  ajuda = "",
  ...restante
}) {
  return (
    <div
      className={`ce-campo ${
        largo ? "ce-largo" : ""
      }`}
    >
      <label htmlFor={`ce-${nome}`}>
        {rotulo}

        {obrigatorio && (
          <span className="ce-asterisco">
            {" "}*
          </span>
        )}
      </label>

      <input
        {...restante}
        id={`ce-${nome}`}
        name={nome}
        type={tipo}
        value={valor}
        onChange={(event) =>
          atualizar(
            nome,
            event.target.value
          )
        }
        placeholder={placeholder}
        required={obrigatorio}
      />

      {ajuda && (
        <small>{ajuda}</small>
      )}
    </div>
  );
}

// =====================================================
// CAMPO DE REVISÃO
// =====================================================

function ResumoCampo({ titulo, texto }) {
  return (
    <div className="ce-revisao-item">
      <span>{titulo}</span>

      <strong>
        {texto || "Não informado"}
      </strong>
    </div>
  );
}

// =====================================================
// FORMULÁRIO PRINCIPAL
// =====================================================

export default function FormularioCadastroElora({
  profissional = false,
  onCadastrar,
  mensagemErro,
  mensagemSucesso,
}) {
  const [etapa, setEtapa] = useState(0);

  const [dados, setDados] = useState(
    DADOS_INICIAIS
  );

  const [erro, setErro] = useState("");
  const [enviando, setEnviando] =
    useState(false);

  const [concluido, setConcluido] =
    useState(false);

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  // ================================================
  // IDENTIDADE VISUAL E IMAGEM
  // ================================================

  const imagemSofa = profissional
    ? "/images/sofa-roxo.png"
    : "/images/sofa-azul-transparente.png";

  const rotaLogin = profissional
    ? "/login/psicologo"
    : "/login";

  const rotaOutroCadastro = profissional
    ? "/cadastro"
    : "/cadastro/psicologo";

  const etapas = profissional
    ? [
        "Dados profissionais",
        "Registro (CRP)",
        "Conta e segurança",
        "Conclusão",
      ]
    : [
        "Dados pessoais",
        "Contato",
        "Segurança",
        "Conclusão",
      ];

  // ================================================
  // ATUALIZAÇÃO DOS CAMPOS
  // ================================================

  function atualizar(campo, valor) {
    let novoValor = valor;

    if (campo === "cpf") {
      novoValor = formatarCPF(valor);
    }

    if (campo === "telefone") {
      novoValor = formatarTelefone(valor);
    }

    if (campo === "cep") {
      novoValor = formatarCEP(valor);
    }

    if (campo === "crp") {
      novoValor = formatarCRP(valor);
    }

    setDados((anterior) => ({
      ...anterior,
      [campo]: novoValor,
    }));

    setErro("");
  }

  // ================================================
  // GERADOR DE CAMPOS
  // ================================================

  function campo(nome, rotulo, props = {}) {
    return (
      <Campo
        key={nome}
        nome={nome}
        rotulo={rotulo}
        valor={dados[nome]}
        atualizar={atualizar}
        {...props}
      />
    );
  }

  function seletorUF(
    nome,
    rotulo = "UF",
    obrigatorio = false
  ) {
    return (
      <div
        className="ce-campo"
        key={nome}
      >
        <label htmlFor={`ce-${nome}`}>
          {rotulo}

          {obrigatorio && (
            <span className="ce-asterisco">
              {" "}*
            </span>
          )}
        </label>

        <select
          id={`ce-${nome}`}
          name={nome}
          value={dados[nome]}
          onChange={(event) =>
            atualizar(
              nome,
              event.target.value
            )
          }
          required={obrigatorio}
        >
          <option value="">
            Selecione
          </option>

          {ESTADOS.map((uf) => (
            <option
              key={uf}
              value={uf}
            >
              {uf}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // ================================================
  // VALIDAÇÃO DAS ETAPAS
  // ================================================

  function validarEtapa() {
    // ETAPA 1

    if (etapa === 0) {
      if (dados.nome.trim().length < 3) {
        return [
          "nome",
          "Informe seu nome completo.",
        ];
      }

      if (
        dados.informarNomeSocial &&
        dados.nomeSocial.trim().length < 2
      ) {
        return [
          "nomeSocial",
          "Informe seu nome social ou desmarque a opção.",
        ];
      }

      if (
        dados.genero === "outro" &&
        !dados.generoOutro.trim()
      ) {
        return [
          "generoOutro",
          "Informe sua identificação de gênero.",
        ];
      }

      if (profissional) {
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            dados.email.trim()
          )
        ) {
          return [
            "email",
            "Informe um e-mail válido.",
          ];
        }

        if (
          ![10, 11].includes(
            apenasNumeros(
              dados.telefone
            ).length
          )
        ) {
          return [
            "telefone",
            "Informe um telefone com DDD.",
          ];
        }

        if (!dados.areaAtuacao) {
          return [
            "areaAtuacao",
            "Selecione sua área de atuação.",
          ];
        }
      } else {
        if (
          !nascimentoValido(
            dados.nascimento
          )
        ) {
          return [
            "nascimento",
            "Informe uma data de nascimento válida.",
          ];
        }

        if (
          dados.uf &&
          !ESTADOS.includes(dados.uf)
        ) {
          return [
            "uf",
            "Selecione uma UF válida.",
          ];
        }

        if (
          Boolean(dados.cidade.trim()) !==
          Boolean(dados.uf)
        ) {
          return [
            "cidade",
            "Preencha cidade e UF juntas ou deixe ambas em branco.",
          ];
        }
      }
    }

    // ETAPA 2

    if (etapa === 1) {
      if (!cpfValido(dados.cpf)) {
        return [
          "cpf",
          "Informe um CPF válido.",
        ];
      }

      if (profissional) {
        if (
          !nascimentoValido(
            dados.nascimento
          )
        ) {
          return [
            "nascimento",
            "Informe uma data de nascimento válida.",
          ];
        }

        if (
          !/^\d{2}\/\d{4,7}$/.test(
            dados.crp
          )
        ) {
          return [
            "crp",
            "Informe o CRP no formato 00/00000.",
          ];
        }

        if (dados.informarEndereco) {
          if (
            apenasNumeros(
              dados.cep
            ).length !== 8
          ) {
            return [
              "cep",
              "Informe um CEP válido.",
            ];
          }

          const obrigatorios = [
            "rua",
            "numero",
            "bairro",
            "cidadeEndereco",
            "ufEndereco",
          ];

          for (const nome of obrigatorios) {
            if (
              !String(
                dados[nome]
              ).trim()
            ) {
              return [
                nome,
                "Preencha o endereço completo.",
              ];
            }
          }

          if (
            !ESTADOS.includes(
              dados.ufEndereco
            )
          ) {
            return [
              "ufEndereco",
              "Selecione uma UF válida.",
            ];
          }
        }
      } else {
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            dados.email.trim()
          )
        ) {
          return [
            "email",
            "Informe um e-mail válido.",
          ];
        }

        if (
          ![10, 11].includes(
            apenasNumeros(
              dados.telefone
            ).length
          )
        ) {
          return [
            "telefone",
            "Informe um telefone com DDD.",
          ];
        }
      }
    }

    // ETAPA 3

    if (etapa === 2) {
      const faltam = requisitosSenha.filter(
        ({ atende }) =>
          !atende(dados.senha)
      );

      if (faltam.length > 0) {
        return [
          "senha",
          `Sua senha ainda precisa de: ${faltam
            .map((item) =>
              item.texto.toLowerCase()
            )
            .join("; ")}.`,
        ];
      }

      if (
        dados.senha !==
        dados.confirmarSenha
      ) {
        return [
          "confirmarSenha",
          "As senhas não coincidem.",
        ];
      }
    }

    return null;
  }

  // ================================================
  // CONTINUAR / CRIAR CONTA
  // ================================================

  async function continuar(event) {
    event.preventDefault();

    if (enviando || concluido) {
      return;
    }

    setErro("");

    if (etapa < 3) {
      const validacao = validarEtapa();

      if (validacao) {
        setErro(validacao[1]);

        requestAnimationFrame(() => {
          document
            .getElementById(
              `ce-${validacao[0]}`
            )
            ?.focus();
        });

        return;
      }

      setEtapa((atual) => atual + 1);
      return;
    }

    setEnviando(true);

    try {
      const endereco =
        profissional &&
        dados.informarEndereco
          ? {
              cep: apenasNumeros(
                dados.cep
              ),
              rua: dados.rua.trim(),
              numero: dados.numero.trim(),
              complemento:
                dados.complemento.trim(),
              bairro: dados.bairro.trim(),
              cidade:
                dados.cidadeEndereco.trim(),
              uf: dados.ufEndereco,
            }
          : null;

      const dadosCadastro = {
        nome: dados.nome.trim(),

        nomeSocial:
          dados.informarNomeSocial
            ? dados.nomeSocial.trim()
            : "",

        genero:
          dados.genero === "outro"
            ? dados.generoOutro.trim()
            : dados.genero,

        nascimento: dados.nascimento,

        cpf: apenasNumeros(
          dados.cpf
        ),

        email: dados.email
          .trim()
          .toLowerCase(),

        telefone: apenasNumeros(
          dados.telefone
        ),

        senha: dados.senha,

        cidade: profissional
          ? ""
          : dados.cidade.trim(),

        uf: profissional
          ? ""
          : dados.uf,

        crp: profissional
          ? dados.crp.trim()
          : "",

        areaAtuacao: profissional
          ? dados.areaAtuacao
          : "",

        endereco,
      };

      await onCadastrar(dadosCadastro);

      setConcluido(true);
    } catch (falha) {
      setErro(
        mensagemErro
          ? mensagemErro(falha)
          : "Não foi possível criar sua conta."
      );
    } finally {
      setEnviando(false);
    }
  }

  // ==================================================
  // INTERFACE
  // ==================================================

  return (
    <main
      className={`cadastro-elora-page ${
        profissional
          ? "cadastro-psicologo"
          : "cadastro-paciente"
      }`}
    >
      {/* ============================================
          CABEÇALHO
      ============================================ */}

      <header className="cadastro-elora-topbar">
        <Link
          to="/"
          className="cadastro-elora-brand"
          aria-label="Elora — início"
        >
          <img
            src="/images/logo-elora.png"
            alt=""
          />

          <span>elora</span>
        </Link>

        <span className="ce-topbar-label">
          {profissional
            ? "Área do psicólogo"
            : "Área do paciente"}
        </span>
      </header>

      {/* ============================================
          ESTRUTURA
      ============================================ */}

      <div className="ce-layout">

        {/* ==========================================
            COLUNA ESQUERDA
        ========================================== */}

        <section
          className="ce-workflow"
          aria-labelledby="ce-titulo"
        >
          {/* VOLTAR + ETAPAS */}

          <div className="ce-navigation">
            <Link
              to="/"
              className="ce-voltar-inicio"
            >
              ← &nbsp; Voltar ao início
            </Link>

            <nav
              className="ce-progress"
              aria-label="Progresso do cadastro"
            >
              {etapas.map(
                (titulo, indice) => (
                  <div
                    key={titulo}
                    className={`ce-step ${
                      indice === etapa
                        ? "ce-step-current"
                        : ""
                    } ${
                      indice < etapa
                        ? "ce-step-done"
                        : ""
                    }`}
                    aria-current={
                      indice === etapa
                        ? "step"
                        : undefined
                    }
                  >
                    <span className="ce-step-number">
                      {indice < etapa
                        ? "✓"
                        : indice + 1}
                    </span>

                    <span className="ce-step-label">
                      {titulo}
                    </span>
                  </div>
                )
              )}
            </nav>
          </div>

          {/* TÍTULO DA ETAPA */}

          <div className="ce-heading">
            <h1 id="ce-titulo">
              {profissional
                ? "Criar conta profissional"
                : "Criar conta de paciente"}
            </h1>

            <p>
              {etapa === 0
                ? "Vamos começar com suas informações básicas."
                : etapa === 1
                  ? profissional
                    ? "Informe seus dados e seu registro profissional."
                    : "Como podemos entrar em contato com você?"
                  : etapa === 2
                    ? "Proteja sua conta com uma senha segura."
                    : "Confira suas informações antes de finalizar."}
            </p>
          </div>

          {/* FORMULÁRIO */}

          <form
            className="ce-form"
            onSubmit={continuar}
            noValidate
            aria-busy={enviando}
          >
            {/* ======================================
                CADASTRO CONCLUÍDO
            ====================================== */}

            {concluido ? (
              <section
                className="ce-success"
                role="status"
              >
                <span
                  className="ce-success-icon"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <h2>
                  Conta criada com sucesso!
                </h2>

                <p>
                  {mensagemSucesso ||
                    "Seu cadastro foi concluído."}
                </p>

                {profissional && (
                  <p>
                    Seu perfil profissional
                    permanecerá pendente até
                    a verificação do CRP.
                  </p>
                )}

                <p>
                  Faça login para continuar.
                </p>

                <Link
                  to={rotaLogin}
                  className="ce-submit"
                >
                  Ir para o login →
                </Link>
              </section>
            ) : (
              <>

                {/* ================================
                    ETAPA 1 — DADOS INICIAIS
                ================================ */}

                {etapa === 0 && (
                  <div className="ce-fields">

                    {campo(
                      "nome",
                      "Nome completo",
                      {
                        largo: true,
                        obrigatorio: true,
                        placeholder:
                          "Seu nome completo",
                        autoComplete: "name",
                        maxLength: 120,
                      }
                    )}

                    {/* NOME SOCIAL */}

                    <div className="ce-social-option ce-largo">
                      <label className="ce-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            dados.informarNomeSocial
                          }
                          onChange={(event) =>
                            atualizar(
                              "informarNomeSocial",
                              event.target.checked
                            )
                          }
                        />

                        <span>
                          Desejo informar nome social
                        </span>
                      </label>

                      <small>
                        Usaremos o nome social
                        nas comunicações,
                        quando informado.
                      </small>
                    </div>

                    {dados.informarNomeSocial &&
                      campo(
                        "nomeSocial",
                        "Nome social",
                        {
                          largo: true,
                          obrigatorio: true,
                          placeholder:
                            "Como você gostaria de ser chamado(a)?",
                          maxLength: 120,
                        }
                      )}

                    {/* PACIENTE — NASCIMENTO */}

                    {!profissional &&
                      campo(
                        "nascimento",
                        "Data de nascimento",
                        {
                          largo: true,
                          obrigatorio: true,
                          tipo: "date",
                          max: dataDeHoje(),
                          autoComplete: "bday",
                        }
                      )}

                    {/* PSICÓLOGO — E-MAIL */}

                    {profissional &&
                      campo(
                        "email",
                        "E-mail profissional",
                        {
                          largo: true,
                          obrigatorio: true,
                          tipo: "email",
                          placeholder:
                            "seu@email.com",
                          autoComplete: "email",
                        }
                      )}

                    {/* IDENTIFICAÇÃO DE GÊNERO */}

                    <div className="ce-genero ce-largo">
                      <span className="ce-label">
                        Identificação de gênero
                        {" "}
                        <small>(opcional)</small>
                      </span>

                      <div
                        className="ce-genero-opcoes"
                        role="group"
                        aria-label="Identificação de gênero"
                      >
                        {GENEROS.map((opcao) => (
                          <button
                            key={opcao.valor}
                            type="button"
                            aria-pressed={
                              dados.genero ===
                              opcao.valor
                            }
                            className={
                              dados.genero ===
                              opcao.valor
                                ? "ce-genero-ativo"
                                : ""
                            }
                            onClick={() =>
                              atualizar(
                                "genero",
                                dados.genero ===
                                  opcao.valor
                                  ? ""
                                  : opcao.valor
                              )
                            }
                          >
                            <span aria-hidden="true">
                              {opcao.simbolo}
                            </span>

                            {opcao.nome}
                          </button>
                        ))}
                      </div>
                    </div>

                    {dados.genero === "outro" &&
                      campo(
                        "generoOutro",
                        "Como você se identifica?",
                        {
                          largo: true,
                          placeholder:
                            "Sua identificação",
                          maxLength: 80,
                        }
                      )}

                    {/* PACIENTE — LOCALIZAÇÃO */}

                    {!profissional && (
                      <>
                        {campo(
                          "cidade",
                          "Cidade (opcional)",
                          {
                            placeholder:
                              "Ex.: Guaramirim",
                            autoComplete:
                              "address-level2",
                            maxLength: 100,
                          }
                        )}

                        {seletorUF(
                          "uf",
                          "UF (opcional)"
                        )}
                      </>
                    )}

                    {/* PSICÓLOGO — DADOS PROFISSIONAIS */}

                    {profissional && (
                      <>
                        {campo(
                          "telefone",
                          "Telefone",
                          {
                            tipo: "tel",
                            obrigatorio: true,
                            placeholder:
                              "(47) 99999-9999",
                            autoComplete: "tel",
                            maxLength: 16,
                          }
                        )}

                        <div className="ce-campo">
                          <label htmlFor="ce-areaAtuacao">
                            Área de atuação principal

                            <span className="ce-asterisco">
                              {" "}*
                            </span>
                          </label>

                          <select
                            id="ce-areaAtuacao"
                            name="areaAtuacao"
                            value={
                              dados.areaAtuacao
                            }
                            onChange={(event) =>
                              atualizar(
                                "areaAtuacao",
                                event.target.value
                              )
                            }
                            required
                          >
                            <option value="">
                              Selecione sua área
                            </option>

                            {AREAS.map((area) => (
                              <option
                                key={area}
                                value={area}
                              >
                                {area}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                  </div>
                )}

                {/* ================================
                    ETAPA 2 — CONTATO OU CRP
                ================================ */}

                {etapa === 1 && (
                  <div className="ce-fields">

                    {/* PACIENTE */}

                    {!profissional && (
                      <>
                        {campo(
                          "email",
                          "E-mail",
                          {
                            largo: true,
                            obrigatorio: true,
                            tipo: "email",
                            placeholder:
                              "seu@email.com",
                            autoComplete: "email",
                          }
                        )}

                        {campo(
                          "telefone",
                          "Telefone",
                          {
                            obrigatorio: true,
                            tipo: "tel",
                            placeholder:
                              "(47) 99999-9999",
                            autoComplete: "tel",
                            maxLength: 16,
                          }
                        )}

                        {campo(
                          "cpf",
                          "CPF",
                          {
                            obrigatorio: true,
                            placeholder:
                              "000.000.000-00",
                            inputMode: "numeric",
                            maxLength: 14,
                          }
                        )}

                        <p className="ce-helper ce-largo">
                          Seus dados pessoais
                          não serão exibidos
                          publicamente.
                        </p>
                      </>
                    )}

                    {/* PSICÓLOGO */}

                    {profissional && (
                      <>
                        {campo(
                          "crp",
                          "Registro profissional (CRP)",
                          {
                            largo: true,
                            obrigatorio: true,
                            placeholder:
                              "00/00000",
                            maxLength: 10,
                            ajuda:
                              "A validação do CRP será realizada antes da publicação do perfil.",
                          }
                        )}

                        {campo(
                          "cpf",
                          "CPF",
                          {
                            obrigatorio: true,
                            placeholder:
                              "000.000.000-00",
                            inputMode: "numeric",
                            maxLength: 14,
                          }
                        )}

                        {campo(
                          "nascimento",
                          "Data de nascimento",
                          {
                            obrigatorio: true,
                            tipo: "date",
                            max: dataDeHoje(),
                            autoComplete: "bday",
                          }
                        )}

                        {/* ENDEREÇO OPCIONAL */}

                        <div className="ce-address-toggle ce-largo">
                          <label className="ce-checkbox">
                            <input
                              type="checkbox"
                              checked={
                                dados.informarEndereco
                              }
                              onChange={(event) =>
                                atualizar(
                                  "informarEndereco",
                                  event.target.checked
                                )
                              }
                            />

                            <span>
                              Desejo informar meu endereço
                              (opcional)
                            </span>
                          </label>

                          <small>
                            O endereço informado
                            não deve ser exibido
                            publicamente.
                          </small>
                        </div>

                        {dados.informarEndereco && (
                          <div className="ce-fields ce-address-fields ce-largo">

                            {campo(
                              "cep",
                              "CEP",
                              {
                                obrigatorio: true,
                                placeholder:
                                  "00000-000",
                                maxLength: 9,
                                inputMode: "numeric",
                                autoComplete:
                                  "postal-code",
                              }
                            )}

                            {campo(
                              "rua",
                              "Rua",
                              {
                                obrigatorio: true,
                                placeholder:
                                  "Rua ou avenida",
                                maxLength: 150,
                                autoComplete:
                                  "address-line1",
                              }
                            )}

                            {campo(
                              "numero",
                              "Número",
                              {
                                obrigatorio: true,
                                placeholder:
                                  "Número ou S/N",
                                maxLength: 20,
                              }
                            )}

                            {campo(
                              "complemento",
                              "Complemento (opcional)",
                              {
                                placeholder:
                                  "Apartamento, bloco...",
                                maxLength: 120,
                                autoComplete:
                                  "address-line2",
                              }
                            )}

                            {campo(
                              "bairro",
                              "Bairro",
                              {
                                obrigatorio: true,
                                placeholder:
                                  "Seu bairro",
                                maxLength: 100,
                              }
                            )}

                            {campo(
                              "cidadeEndereco",
                              "Cidade",
                              {
                                obrigatorio: true,
                                placeholder:
                                  "Sua cidade",
                                maxLength: 100,
                                autoComplete:
                                  "address-level2",
                              }
                            )}

                            {seletorUF(
                              "ufEndereco",
                              "UF",
                              true
                            )}

                          </div>
                        )}
                      </>
                    )}

                  </div>
                )}

                {/* ================================
                    ETAPA 3 — SEGURANÇA
                ================================ */}

                {etapa === 2 && (
                  <div className="ce-fields">

                    <div className="ce-campo ce-largo">
                      <label htmlFor="ce-senha">
                        Senha

                        <span className="ce-asterisco">
                          {" "}*
                        </span>
                      </label>

                      <div className="ce-password">
                        <input
                          id="ce-senha"
                          name="senha"
                          type={
                            mostrarSenha
                              ? "text"
                              : "password"
                          }
                          value={dados.senha}
                          onChange={(event) =>
                            atualizar(
                              "senha",
                              event.target.value
                            )
                          }
                          placeholder="Crie uma senha segura"
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setMostrarSenha(
                              (atual) => !atual
                            )
                          }
                        >
                          {mostrarSenha
                            ? "Ocultar"
                            : "Mostrar"}
                        </button>
                      </div>

                      <RequisitosSenha
                        senha={dados.senha}
                      />
                    </div>

                    {campo(
                      "confirmarSenha",
                      "Confirmar senha",
                      {
                        largo: true,
                        obrigatorio: true,
                        tipo: mostrarSenha
                          ? "text"
                          : "password",
                        placeholder:
                          "Repita sua senha",
                        autoComplete:
                          "new-password",
                      }
                    )}

                    <p className="ce-helper ce-largo">
                      Sua senha será utilizada
                      no Firebase Authentication
                      para proteger o acesso
                      à sua conta.
                    </p>

                  </div>
                )}

                {/* ================================
                    ETAPA 4 — REVISÃO
                ================================ */}

                {etapa === 3 && (
                  <section className="ce-review">
                    <p>
                      Confira seus dados antes
                      de concluir o cadastro.
                    </p>

                    <div className="ce-review-grid">

                      <ResumoCampo
                        titulo="Nome completo"
                        texto={dados.nome}
                      />

                      {dados.informarNomeSocial && (
                        <ResumoCampo
                          titulo="Nome social"
                          texto={
                            dados.nomeSocial
                          }
                        />
                      )}

                      <ResumoCampo
                        titulo="E-mail"
                        texto={dados.email}
                      />

                      <ResumoCampo
                        titulo="Telefone"
                        texto={dados.telefone}
                      />

                      <ResumoCampo
                        titulo="CPF"
                        texto={
                          dados.cpf
                            ? `***.***.***-${apenasNumeros(
                                dados.cpf
                              ).slice(-2)}`
                            : ""
                        }
                      />

                      <ResumoCampo
                        titulo="Identificação de gênero"
                        texto={
                          dados.genero === "outro"
                            ? dados.generoOutro
                            : GENEROS.find(
                                (item) =>
                                  item.valor ===
                                  dados.genero
                              )?.nome
                        }
                      />

                      {profissional ? (
                        <>
                          <ResumoCampo
                            titulo="CRP"
                            texto={dados.crp}
                          />

                          <ResumoCampo
                            titulo="Área de atuação"
                            texto={
                              dados.areaAtuacao
                            }
                          />
                        </>
                      ) : (
                        <ResumoCampo
                          titulo="Cidade / UF"
                          texto={[
                            dados.cidade,
                            dados.uf,
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        />
                      )}

                    </div>

                    {profissional && (
                      <p className="ce-review-note">
                        O cadastro não garante
                        aprovação profissional.
                        A verificação do CRP
                        continua pendente.
                      </p>
                    )}
                  </section>
                )}

                {/* ERROS */}

                {erro && (
                  <p
                    className="ce-error"
                    role="alert"
                  >
                    {erro}
                  </p>
                )}

                {/* BOTÕES */}

                <div className="ce-actions">

                  {etapa > 0 && (
                    <button
                      type="button"
                      className="ce-back"
                      disabled={enviando}
                      onClick={() => {
                        setErro("");

                        setEtapa(
                          (atual) =>
                            Math.max(
                              0,
                              atual - 1
                            )
                        );
                      }}
                    >
                      ← Voltar
                    </button>
                  )}

                  <button
                    className="ce-submit"
                    type="submit"
                    disabled={enviando}
                  >
                    {enviando
                      ? "Criando conta..."
                      : etapa === 3
                        ? "Criar conta →"
                        : "Continuar →"}
                  </button>

                </div>
              </>
            )}
          </form>

          {/* LINKS INFERIORES */}

          <div className="ce-bottom-links">
            Já tem conta?{" "}

            <Link to={rotaLogin}>
              Entrar
            </Link>

            <span aria-hidden="true">
              {" "} · {" "}
            </span>

            <Link to={rotaOutroCadastro}>
              {profissional
                ? "Sou paciente"
                : "Sou psicólogo(a)"}
            </Link>
          </div>
        </section>

        {/* ==========================================
            COLUNA DIREITA — SOMENTE SOFÁ

            Paciente:
            /images/sofa-azul-transparente.png

            Psicólogo:
            /images/sofa-roxo.png
        ========================================== */}

        <aside
          className="ce-aside"
          aria-hidden="true"
        >
          <div className="ce-sofa-art">
            <img
              src={imagemSofa}
              alt=""
              loading="eager"
            />
          </div>
        </aside>

      </div>
    </main>
  );
}
