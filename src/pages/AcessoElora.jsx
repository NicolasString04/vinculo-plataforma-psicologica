
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../firebase";

import {
  entrarNoFirebase,
  mensagemErroLogin,
} from "../services/cadastroFirebase";

import "./AcessoElora.css";

// Ícones da interface
function Icone({ tipo, tamanho = 22 }) {
  const comum = {
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

  switch (tipo) {
    case "email":
      return (
        <svg {...comum}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "senha":
      return (
        <svg {...comum}>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        </svg>
      );

    case "olho":
      return (
        <svg {...comum}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    case "olho-fechado":
      return (
        <svg {...comum}>
          <path d="m3 3 18 18M10.6 6.1c.5-.1.9-.1 1.4-.1 6.5 0 10 6 10 6a16 16 0 0 1-3 3.5M6 6.8A16 16 0 0 0 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.9" />
          <path d="M10 10a3 3 0 0 0 4 4" />
        </svg>
      );

    case "entrar":
      return (
        <svg {...comum}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
        </svg>
      );

    case "criar":
      return (
        <svg {...comum}>
          <circle cx="10" cy="7" r="4" />
          <path d="M3 21v-2a7 7 0 0 1 7-7 7 7 0 0 1 4.5 1.6M19 14v7m-3.5-3.5h7" />
        </svg>
      );

    default:
      return (
        <svg {...comum}>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </svg>
      );
  }
}

export default function AcessoElora({ profissional = false }) {
  const navigate = useNavigate();
  const campoEmail = useRef(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const rotaCadastro = profissional
    ? "/cadastro/psicologo"
    : "/cadastro";

  const rotaOutroLogin = profissional
    ? "/login"
    : "/login/psicologo";

  const destino = profissional
    ? "/psicologo"
    : "/cliente";

  // LOGIN COM FIREBASE
  async function entrar(evento) {
    evento.preventDefault();

    if (enviando || recuperando) return;

    setErro("");
    setAviso("");
    setEnviando(true);

    try {
      await entrarNoFirebase(
        email,
        senha,
        profissional ? "psicologo" : "paciente"
      );

      navigate(destino, { replace: true });

    } catch (falha) {
      setErro(mensagemErroLogin(falha));

    } finally {
      setEnviando(false);
    }
  }

  // RECUPERAÇÃO DE SENHA
  async function recuperarSenha() {
    setErro("");
    setAviso("");

    const emailNormalizado = email.trim().toLowerCase();

    if (
      !emailNormalizado ||
      !campoEmail.current?.checkValidity()
    ) {
      setErro(
        "Informe um e-mail válido para recuperar sua senha."
      );

      campoEmail.current?.focus();
      return;
    }

    setRecuperando(true);

    try {
      await sendPasswordResetEmail(
        auth,
        emailNormalizado
      );

      setAviso(
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Confira também o spam."
      );

    } catch (falha) {
      if (falha.code === "auth/user-not-found") {
        setAviso(
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Confira também o spam."
        );
      } else {
        setErro(mensagemErroLogin(falha));
      }

    } finally {
      setRecuperando(false);
    }
  }

  return (
    <main
      className={`acesso-elora ${
        profissional
          ? "acesso-profissional"
          : "acesso-paciente"
      }`}
    >

      {/* VOLTAR AO INÍCIO */}
      <Link
        to="/"
        className="acesso-voltar"
      >
        <span aria-hidden="true">←</span>
        Voltar ao início
      </Link>

      <div className="acesso-layout">

        {/* BANNER LATERAL */}
        <aside className="acesso-visual">

          <div className="acesso-visual-conteudo">

            <span className="acesso-etiqueta">
              <Icone tipo="usuario" tamanho={20} />

              <span>
                {profissional
                  ? "ÁREA DO PSICÓLOGO(A)"
                  : "ÁREA DO PACIENTE"}
              </span>
            </span>

            <h2 className="acesso-frase">
              {profissional ? (
                <>
                  Um espaço para{" "}
                  <span>cuidar de pessoas.</span>
                </>
              ) : (
                <>
                  Seu espaço de{" "}
                  <span>cuidado e bem-estar.</span>
                </>
              )}
            </h2>

            <span className="acesso-traco" />

          </div>
        </aside>

        {/* PAINEL DE LOGIN */}
        <section
          className="acesso-painel"
          aria-labelledby="acesso-titulo"
        >

          {/* LOGO ELORA */}
          <Link
            to="/"
            className="acesso-marca"
          >
            <img
              src="/images/logo-elora.png"
              alt="Logo Elora"
            />
            <span>elora</span>
          </Link>

          <div className="acesso-painel-conteudo">

            {/* CABEÇALHO */}
            <div className="acesso-cabecalho">

              <h1 id="acesso-titulo">
                Bem-vindo(a) de volta.
              </h1>

              <p>
                {profissional
                  ? "Acesse seu portal profissional."
                  : "Acesse sua área do paciente."}
              </p>

            </div>

            {/* FORMULÁRIO */}
            <form
              className="acesso-form"
              onSubmit={entrar}
              aria-busy={enviando}
            >

              {/* EMAIL */}
              <div className="acesso-campo">

                <label htmlFor="acesso-email">
                  E-mail
                </label>

                <div className="acesso-input-wrap">

                  <Icone tipo="email" tamanho={23} />

                  <input
                    ref={campoEmail}
                    id="acesso-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(evento) =>
                      setEmail(evento.target.value)
                    }
                    required
                  />

                </div>
              </div>

              {/* SENHA */}
              <div className="acesso-campo">

                <label htmlFor="acesso-senha">
                  Senha
                </label>

                <div className="acesso-input-wrap acesso-input-senha">

                  <Icone tipo="senha" tamanho={23} />

                  <input
                    id="acesso-senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(evento) =>
                      setSenha(evento.target.value)
                    }
                    required
                  />

                  <button
                    className="acesso-mostrar-senha"
                    type="button"
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    onClick={() =>
                      setMostrarSenha((atual) => !atual)
                    }
                  >
                    <Icone
                      tipo={
                        mostrarSenha
                          ? "olho"
                          : "olho-fechado"
                      }
                      tamanho={22}
                    />
                  </button>

                </div>
              </div>

              {/* ESQUECI MINHA SENHA */}
              <div className="acesso-recuperacao">

                <button
                  type="button"
                  onClick={recuperarSenha}
                  disabled={recuperando || enviando}
                >
                  {recuperando
                    ? "Enviando..."
                    : "Esqueci minha senha"}
                </button>

              </div>

              {/* MENSAGENS */}
              {erro && (
                <p
                  className="acesso-mensagem acesso-erro"
                  role="alert"
                >
                  {erro}
                </p>
              )}

              {aviso && (
                <p
                  className="acesso-mensagem acesso-aviso"
                  role="status"
                >
                  {aviso}
                </p>
              )}

              {/* ENTRAR */}
              <button
                className="acesso-submit"
                type="submit"
                disabled={enviando || recuperando}
              >

                <Icone tipo="entrar" tamanho={23} />

                {enviando
                  ? "Entrando..."
                  : profissional
                    ? "Entrar no portal"
                    : "Entrar na minha conta"}

              </button>

            </form>

            <div className="acesso-separador" />

            {/* CRIAR CONTA */}
            <Link
              to={rotaCadastro}
              className="acesso-criar-conta"
            >

              <Icone tipo="criar" tamanho={24} />

              {profissional
                ? "Criar conta de psicólogo(a)"
                : "Criar conta de paciente"}

            </Link>

            {/* TROCAR ÁREA */}
            <Link
              to={rotaOutroLogin}
              className="acesso-trocar-perfil"
            >

              <Icone tipo="usuario" tamanho={21} />

              {profissional
                ? "Ir para a área do paciente"
                : "Ir para a área do psicólogo(a)"}

            </Link>

          </div>
        </section>
      </div>
    </main>
  );
}
