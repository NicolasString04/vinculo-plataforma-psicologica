import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequisitosSenha, { requisitosSenha } from "./RequisitosSenha";
import "./CadastroElora.css";

const nome = {
  name: "nome",
  label: "Nome completo",
  autoComplete: "name",
  placeholder: "Digite seu nome completo",
  maxLength: 120,
  largo: true,
};

const cpf = {
  name: "cpf",
  label: "CPF",
  inputMode: "numeric",
  placeholder: "000.000.000-00",
  maxLength: 14,
};

const nascimento = {
  name: "nascimento",
  label: "Data de nascimento",
  type: "date",
  autoComplete: "bday",
};

const email = {
  name: "email",
  label: "E-mail",
  type: "email",
  autoComplete: "email",
  placeholder: "seu@email.com",
};

const telefone = {
  name: "telefone",
  label: "Telefone",
  type: "tel",
  autoComplete: "tel",
  placeholder: "(11) 99999-9999",
  maxLength: 18,
};

const senhas = [
  {
    name: "senha",
    label: "Senha",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Digite sua senha",
    minLength: 8,
  },
  {
    name: "confirmarSenha",
    label: "Confirmar senha",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Confirme sua senha",
    minLength: 8,
  },
];

const camposPaciente = [
  nome,
  cpf,
  nascimento,
  email,
  telefone,
  ...senhas,
];

const camposPsicologo = [
  {
    name: "crp",
    label: "CRP",
    placeholder: "00/00000",
    maxLength: 10,
  },
  cpf,
  nome,
  nascimento,
  telefone,
  { ...email, largo: true },
  ...senhas,
];

const camposEndereco = [
  {
    name: "cep",
    label: "CEP",
    placeholder: "00000-000",
    inputMode: "numeric",
    autoComplete: "postal-code",
    maxLength: 9,
  },
  {
    name: "rua",
    label: "Rua",
    autoComplete: "address-line1",
    maxLength: 150,
  },
  {
    name: "numero",
    label: "Número",
    placeholder: "Ex.: 123 ou S/N",
    maxLength: 20,
  },
  {
    name: "complemento",
    label: "Complemento (opcional)",
    autoComplete: "address-line2",
    maxLength: 120,
    opcional: true,
  },
  {
    name: "bairro",
    label: "Bairro",
    maxLength: 100,
  },
  {
    name: "cidade",
    label: "Cidade",
    autoComplete: "address-level2",
    maxLength: 100,
  },
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO",
];

const numeros = (valor) => valor.replace(/\D/g, "");

function cpfValido(valor) {
  if (
    valor.length !== 11 ||
    /^(\d)\1{10}$/.test(valor)
  ) {
    return false;
  }

  return [9, 10].every((posicao) => {
    let soma = 0;

    for (let i = 0; i < posicao; i += 1) {
      soma +=
        Number(valor[i]) *
        (posicao + 1 - i);
    }

    const resto = (soma * 10) % 11;

    return (
      (resto === 10 ? 0 : resto) ===
      Number(valor[posicao])
    );
  });
}

function dataDeHoje() {
  const agora = new Date();

  return [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");
}

function Campo({
  label,
  name,
  type = "text",
  largo = false,
  opcional = false,
  endereco = false,
  ...atributos
}) {
  const [visivel, setVisivel] = useState(false);
  const [valorSenha, setValorSenha] = useState("");

  const ehSenha = type === "password";
  const mostraRequisitos = name === "senha";
  const id = `cadastro-${name}`;

  const classe = [
    "cadastro-elora-field",
    largo && "campo-full",
    endereco && `endereco-${name}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classe}>
      <label htmlFor={id}>
        {label}
      </label>

      <div
        className={
          ehSenha
            ? "cadastro-elora-password"
            : undefined
        }
      >
        <input
          {...atributos}
          id={id}
          name={name}
          type={
            ehSenha && visivel
              ? "text"
              : type
          }
          required={!opcional}
          aria-describedby={
            mostraRequisitos
              ? "cadastro-requisitos-senha"
              : undefined
          }
          onChange={
            mostraRequisitos
              ? (event) =>
                  setValorSenha(event.target.value)
              : undefined
          }
        />

        {ehSenha && (
          <button
            type="button"
            aria-controls={id}
            aria-label={`${
              visivel ? "Ocultar" : "Mostrar"
            } ${label.toLowerCase()}`}
            onClick={() =>
              setVisivel((atual) => !atual)
            }
          >
            {visivel ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>

      {mostraRequisitos && (
        <RequisitosSenha senha={valorSenha} />
      )}
    </div>
  );
}

export default function FormularioCadastroElora({
  profissional = false,
  onCadastrar,
  mensagemSucesso,
  mensagemErro,
}) {
  const navigate = useNavigate();

  const [informarEndereco, setInformarEndereco] =
    useState(false);

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  // Redirecionamento automático do paciente
  useEffect(() => {
    if (!sucesso || profissional) return;

    const temporizador = setTimeout(() => {
      navigate("/cliente", {
        replace: true,
      });
    }, 2200);

    return () => clearTimeout(temporizador);
  }, [sucesso, profissional, navigate]);

  const campos = profissional
    ? camposPsicologo
    : camposPaciente;

  const hoje = dataDeHoje();

  async function handleSubmit(event) {
    event.preventDefault();

    if (enviando || sucesso) return;

    const formulario = event.currentTarget;
    const form = new FormData(formulario);

    const ler = (campo) =>
      String(form.get(campo) ?? "").trim();

    function falhar(campo, mensagem) {
      setErro(mensagem);

      formulario.elements
        .namedItem(campo)
        ?.focus();
    }

    setErro("");

    const dados = {
      nome: ler("nome"),
      cpf: numeros(ler("cpf")),
      nascimento: ler("nascimento"),
      email: ler("email").toLowerCase(),
      telefone: numeros(ler("telefone")),
      senha: String(form.get("senha") ?? ""),
    };

    // Validação do nome
    if (dados.nome.length < 3) {
      return falhar(
        "nome",
        "Informe seu nome completo."
      );
    }

    // Validação do CPF
    if (!cpfValido(dados.cpf)) {
      return falhar(
        "cpf",
        "Informe um CPF válido."
      );
    }

    // Validação da data de nascimento
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dados.nascimento) ||
      dados.nascimento > hoje
    ) {
      return falhar(
        "nascimento",
        "Informe uma data de nascimento válida."
      );
    }

    // Validação do telefone
    if (![10, 11].includes(dados.telefone.length)) {
      return falhar(
        "telefone",
        "Informe um telefone com DDD."
      );
    }

    // Validação dos requisitos de senha
    const faltam = requisitosSenha.filter(
      ({ atende }) => !atende(dados.senha)
    );

    if (faltam.length > 0) {
      return falhar(
        "senha",
        `Sua senha ainda precisa de: ${faltam
          .map(({ texto }) => texto.toLowerCase())
          .join("; ")}.`
      );
    }

    // Confirmação da senha
    if (
      dados.senha !== form.get("confirmarSenha")
    ) {
      return falhar(
        "confirmarSenha",
        "As senhas não coincidem."
      );
    }

    // Campos exclusivos do psicólogo
    if (profissional) {
      dados.crp = ler("crp");
      dados.endereco = null;

      if (!/^\d{2}\/\d{4,7}$/.test(dados.crp)) {
        return falhar(
          "crp",
          "Informe o CRP no formato 00/00000."
        );
      }

      if (informarEndereco) {
        const cep = numeros(ler("cep"));

        if (cep.length !== 8) {
          return falhar(
            "cep",
            "Informe um CEP com 8 dígitos."
          );
        }

        for (const campo of camposEndereco) {
          if (
            !campo.opcional &&
            !ler(campo.name)
          ) {
            return falhar(
              campo.name,
              `Preencha o campo ${campo.label}.`
            );
          }
        }

        if (!estados.includes(ler("uf"))) {
          return falhar(
            "uf",
            "Selecione o estado."
          );
        }

        dados.endereco = {
          cep,
          rua: ler("rua"),
          numero: ler("numero"),
          complemento: ler("complemento"),
          bairro: ler("bairro"),
          cidade: ler("cidade"),
          uf: ler("uf"),
        };
      }
    }

    setEnviando(true);

    try {
      // Aguarda Firebase Auth e Firestore
      await onCadastrar(dados);

      // Mostra confirmação somente após sucesso
      setSucesso(true);
    } catch (falha) {
      setErro(mensagemErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main
      className={`cadastro-elora-page ${
        profissional
          ? "cadastro-psicologo"
          : "cadastro-paciente"
      }`}
    >
      <img
        className="cadastro-elora-sofa"
        src={
          profissional
            ? "/images/sofa-roxo.png"
            : "/images/sofa-azul-transparente.png"
        }
        alt=""
      />

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

        <span
          className="cadastro-elora-divider"
          aria-hidden="true"
        />

        <strong>
          {profissional
            ? "Psicólogo(a)"
            : "Paciente"}
        </strong>
      </header>

      <section
        className="cadastro-elora-shell"
        aria-labelledby="titulo-cadastro"
      >
        <div className="cadastro-elora-heading">
          <span className="cadastro-elora-eyebrow">
            {profissional
              ? "Área do psicólogo"
              : "Área do paciente"}
          </span>

          <h1 id="titulo-cadastro">
            {profissional
              ? "Crie sua conta profissional"
              : "Crie sua conta"}
          </h1>

          {!profissional && (
            <p>
              Encontre apoio no seu ritmo.
            </p>
          )}
        </div>

        {sucesso ? (
          profissional ? (
            <p
              className="cadastro-elora-mensagem"
              role="status"
            >
              {mensagemSucesso}
            </p>
          ) : (
            <section
              className="cadastro-elora-confirmacao"
              role="status"
              aria-live="polite"
            >
              <div
                className="cadastro-elora-confirmacao-icone"
                aria-hidden="true"
              >
                ✓
              </div>

              <span className="cadastro-elora-confirmacao-etiqueta">
                BEM-VINDO(A) AO ELORA
              </span>

              <h2>
                Conta criada com sucesso!
              </h2>

              <p>
                Seu cadastro foi concluído.
                Seu espaço está pronto para você
                começar a explorar.
              </p>

              <span className="cadastro-elora-confirmacao-aguarde">
                Redirecionando para sua área...
              </span>

              <div
                className="cadastro-elora-confirmacao-progresso"
                aria-hidden="true"
              >
                <span />
              </div>
            </section>
          )
        ) : (
          <form
            className="cadastro-elora-form"
            onSubmit={handleSubmit}
            onChange={() => setErro("")}
            aria-busy={enviando}
          >
            {campos.map((campo) => (
              <Campo
                key={campo.name}
                {...campo}
                max={
                  campo.type === "date"
                    ? hoje
                    : undefined
                }
              />
            ))}

            {profissional && (
              <section
                className="cadastro-elora-address campo-full"
                aria-labelledby="titulo-endereco"
              >
                <div className="cadastro-elora-address-heading">
                  <div>
                    <h2 id="titulo-endereco">
                      Deseja informar seu endereço?
                    </h2>

                    <p>
                      É opcional. Podemos usá-lo
                      no futuro para enviar conquistas.
                    </p>
                  </div>

                  <div
                    className="cadastro-elora-radio"
                    role="group"
                    aria-labelledby="titulo-endereco"
                  >
                    <label>
                      <input
                        type="radio"
                        name="informarEndereco"
                        value="sim"
                        checked={informarEndereco}
                        onChange={() =>
                          setInformarEndereco(true)
                        }
                      />
                      Sim
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="informarEndereco"
                        value="nao"
                        checked={!informarEndereco}
                        onChange={() =>
                          setInformarEndereco(false)
                        }
                      />
                      Não
                    </label>
                  </div>
                </div>

                {informarEndereco && (
                  <div className="cadastro-elora-address-grid">
                    {camposEndereco.map((campo) => (
                      <Campo
                        key={campo.name}
                        {...campo}
                        endereco
                      />
                    ))}

                    <div className="cadastro-elora-field endereco-uf">
                      <label htmlFor="cadastro-uf">
                        UF
                      </label>

                      <select
                        id="cadastro-uf"
                        name="uf"
                        autoComplete="address-level1"
                        defaultValue=""
                        required
                      >
                        <option
                          value=""
                          disabled
                        >
                          UF
                        </option>

                        {estados.map((uf) => (
                          <option
                            key={uf}
                            value={uf}
                          >
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </section>
            )}

            {erro && (
              <p
                className="cadastro-elora-mensagem campo-full mensagem-erro"
                role="alert"
              >
                {erro}
              </p>
            )}

            <button
              className="cadastro-elora-submit campo-full"
              type="submit"
              disabled={enviando}
            >
              {enviando
                ? "Salvando cadastro…"
                : profissional
                  ? "Criar conta profissional"
                  : "Criar conta"}
            </button>
          </form>
        )}

        <p className="cadastro-elora-login">
          Já tem conta?{" "}
          <Link
            to={
              profissional
                ? "/login/psicologo"
                : "/login"
            }
          >
            Entrar
          </Link>
        </p>

        <p className="cadastro-elora-other">
          <Link
            to={
              profissional
                ? "/cadastro"
                : "/cadastro/psicologo"
            }
          >
            {profissional
              ? "Sou paciente"
              : "Sou psicólogo(a)"}
          </Link>
        </p>
      </section>
    </main>
  );
}