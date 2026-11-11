import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Cadastro.css";

export default function LoginPsicologo() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    const emailNormalizado = email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
    ) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe sua senha.");
      return;
    }

    try {
      // Sessão demonstrativa.
      // Será substituída pelo Firebase Authentication.

      sessionStorage.setItem(
        "elora-psychologist-demo-session",
        JSON.stringify({
          email: emailNormalizado,
          nome: emailNormalizado.split("@")[0],
          tipo: "psicologo",
          demonstracao: true,
        })
      );

    } catch {
      setErro(
        "Não foi possível iniciar sua sessão."
      );
      return;
    }

    setSenha("");

    navigate("/psicologo", {
      replace: true,
    });
  }

  return (
    <main className="cadastro-page">

      <Link to="/" className="cadastro-back">
        ← Voltar ao início
      </Link>

      <div className="cadastro-layout">

        {/* FORMULÁRIO */}

        <section className="cadastro-card">

          <p className="cadastro-eyebrow">
            ÁREA PROFISSIONAL
          </p>

          <h1>
            Bem-vindo de volta.
          </h1>

          <p className="cadastro-description">
            Acesse seu espaço profissional
            e acompanhe seus atendimentos.
          </p>

          <form
            className="cadastro-form"
            onSubmit={handleSubmit}
            noValidate
          >

            <div className="cadastro-field">

              <label htmlFor="psicologo-email">
                E-mail profissional
              </label>

              <input
                id="psicologo-email"
                type="email"
                placeholder="seuemail@exemplo.com"
                autoComplete="username"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

            <div className="cadastro-field">

              <label htmlFor="psicologo-senha">
                Senha
              </label>

              <div className="cadastro-password">

                <input
                  id="psicologo-senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) =>
                    setSenha(event.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarSenha((atual) => !atual)
                  }
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>

              </div>

            </div>

            {erro && (
              <p
                className="cadastro-error"
                role="alert"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="cadastro-submit"
            >
              Entrar no portal
              <span aria-hidden="true"> →</span>
            </button>

            <p className="cadastro-demo-note">
              Ambiente demonstrativo.
              A autenticação profissional e a
              validação do CRP serão integradas
              posteriormente.
            </p>

          </form>

          <div className="cadastro-login">
            É paciente?

            <Link to="/login">
              Acesse sua conta
            </Link>
          </div>

        </section>

        {/* IDENTIDADE VISUAL */}

        <aside className="cadastro-visual">

          <img
            className="cadastro-photo"
            src="/images/home-elora.png"
            alt="Ambiente ilustrativo da Elora"
          />

          <div className="cadastro-visual-copy">

            <img
              src="/images/logo-elora.png"
              alt=""
              className="cadastro-logo"
            />

            <p className="cadastro-eyebrow">
              ESPAÇO PROFISSIONAL
            </p>

            <h2>
              Seu trabalho.
              <br />
              Nosso propósito.
            </h2>

            <p>
              Um ambiente dedicado aos profissionais
              que fazem parte da Elora, com ferramentas
              para organizar e acompanhar seus atendimentos.
            </p>

          </div>

        </aside>

      </div>

    </main>
  );
}