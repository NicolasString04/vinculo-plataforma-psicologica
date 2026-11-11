import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Cadastro.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (!senha.trim()) {
      setErro("Preencha a senha para continuar.");
      return;
    }

    try {
      // Apenas uma sessão demonstrativa. Não é autenticação real.
      sessionStorage.setItem(
        "elora-demo-session",
        JSON.stringify({
          email: email.trim(),
          nome: email.trim().split("@")[0],
          demonstracao: true,
        })
      );
    } catch {
      setErro("Não foi possível iniciar a sessão neste navegador.");
      return;
    }

    setSenha("");
    navigate("/triagem", { replace: true });
  }

  return (
    <main className="cadastro-page">
      <Link to="/" className="cadastro-back">
        ← Voltar ao início
      </Link>

      <div className="cadastro-layout">
        <section className="cadastro-card">
          <p className="cadastro-eyebrow">BEM-VINDO AO ELORA</p>

          <h1>Seu espaço de escuta.</h1>

          <p className="cadastro-description">
            Entre para continuar sua jornada.
          </p>

          <form
            className="cadastro-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="cadastro-field">
              <label htmlFor="login-email">E-mail</label>

              <input
                id="login-email"
                type="email"
                placeholder="seuemail@exemplo.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="cadastro-field">
              <label htmlFor="login-senha">Senha</label>

              <div className="cadastro-password">
                <input
                  id="login-senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite uma senha para testar"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />

                <button
                  type="button"
                  aria-pressed={mostrarSenha}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {erro && (
              <p className="cadastro-error" role="alert">
                {erro}
              </p>
            )}

            <button type="submit" className="cadastro-submit">
              Entrar <span aria-hidden="true">→</span>
            </button>

            <p className="cadastro-demo-note">
              Modo demonstrativo: use um e-mail fictício e qualquer
              senha. Não precisa criar uma conta.
            </p>
          </form>

          <div className="cadastro-login">
  É psicólogo?

  <Link to="/login/psicologo">
    Acessar área profissional
  </Link>
</div>
        </section>

        <aside className="cadastro-visual">
          <img
            className="cadastro-photo"
            src="/images/home-elora.png"
            alt="Cena ilustrativa de atendimento psicológico online"
          />

          <div className="cadastro-visual-copy">
            <img
              src="/images/logo-elora.png"
              alt=""
              className="cadastro-logo"
            />

            <p className="cadastro-eyebrow">
              SEU ESPAÇO DE ESCUTA
            </p>

            <h2>
              Que bom
              <br />
              ter você aqui.
            </h2>

            <p>
              Encontre profissionais, organize seus próximos
              encontros e escolha como começar.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}