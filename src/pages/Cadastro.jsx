import { useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import "./Cadastro.css";

const initialForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

function validateForm(form) {
  const errors = {};

  if (form.nome.trim().length < 3) {
    errors.nome = "Informe seu nome com pelo menos 3 caracteres.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (form.senha.length < 8) {
    errors.senha = "Use uma senha com pelo menos 8 caracteres.";
  }

  if (!form.confirmarSenha) {
    errors.confirmarSenha = "Confirme sua senha.";
  } else if (form.confirmarSenha !== form.senha) {
    errors.confirmarSenha = "As senhas precisam ser iguais.";
  }

  return errors;
}

export default function Cadastro() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [notice, setNotice] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setValidated(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    setValidated(true);

    setForm((current) => ({
      ...current,
      senha: "",
      confirmarSenha: "",
    }));
  }

  function handleAccountClick(type) {
    if (type === "professional") {
      setNotice(
        "O cadastro de psicólogos será construído em uma etapa própria."
      );
    }
  }

  return (
    <>
      <a className="elora-skip-link" href="#cadastro-conteudo">
        Pular para o conteúdo
      </a>

      <Header onAccountClick={handleAccountClick} />

      <main className="cadastro-page" id="cadastro-conteudo">
        <Link to="/" className="cadastro-back">
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>

        <div className="cadastro-layout">
          <section className="cadastro-card" aria-labelledby="cadastro-title">
            <p className="cadastro-eyebrow">SEU PRIMEIRO PASSO</p>

            <h1 id="cadastro-title">Um espaço para você.</h1>

            <p className="cadastro-description">
              Comece pelo seu cadastro. Depois, você poderá escolher
              fazer a triagem inicial ou seguir direto para os
              profissionais.
            </p>

            {notice && (
              <div className="cadastro-message" role="status">
                <p>{notice}</p>

                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Fechar aviso"
                >
                  ×
                </button>
              </div>
            )}

            {validated && (
              <div className="cadastro-success" role="status">
                <strong>Os dados passaram na validação.</strong>

                <p>
                  O cadastro ainda é demonstrativo. Você pode conhecer
                  a triagem ou pular para a lista de psicólogos.
                </p>

                <Link to="/triagem">Continuar para a triagem →</Link>
              </div>
            )}

            <form
              className="cadastro-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="cadastro-field">
                <label htmlFor="nome">Nome</label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Como podemos chamar você?"
                  autoComplete="name"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.nome)}
                  aria-describedby={errors.nome ? "nome-error" : undefined}
                />

                {errors.nome && (
                  <p className="cadastro-error" id="nome-error">
                    {errors.nome}
                  </p>
                )}
              </div>

              <div className="cadastro-field">
                <label htmlFor="email">E-mail</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />

                {errors.email && (
                  <p className="cadastro-error" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="cadastro-field">
                <label htmlFor="senha">Senha</label>

                <div className="cadastro-password">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie sua senha"
                    autoComplete="new-password"
                    value={form.senha}
                    onChange={handleChange}
                    required
                    minLength={8}
                    aria-invalid={Boolean(errors.senha)}
                    aria-describedby={
                      errors.senha ? "senha-help senha-error" : "senha-help"
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ocultar senhas" : "Mostrar senhas"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                <small id="senha-help">Use pelo menos 8 caracteres.</small>

                {errors.senha && (
                  <p className="cadastro-error" id="senha-error">
                    {errors.senha}
                  </p>
                )}
              </div>

              <div className="cadastro-field">
                <label htmlFor="confirmarSenha">Confirmar senha</label>

                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha novamente"
                  autoComplete="new-password"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.confirmarSenha)}
                  aria-describedby={
                    errors.confirmarSenha ? "confirmarSenha-error" : undefined
                  }
                />

                {errors.confirmarSenha && (
                  <p className="cadastro-error" id="confirmarSenha-error">
                    {errors.confirmarSenha}
                  </p>
                )}
              </div>

              <button type="submit" className="cadastro-submit">
                Continuar
                <span aria-hidden="true">→</span>
              </button>

              <p className="cadastro-demo-note">
                Protótipo: os dados não são enviados nem salvos.
              </p>
            </form>

            <div className="cadastro-login">
              Já tem uma conta?
              <Link to="/login">Entrar</Link>
            </div>
          </section>

          <aside
            className="cadastro-visual"
            aria-labelledby="cadastro-visual-title"
          >
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

              <p className="cadastro-eyebrow">SEU ESPAÇO DE ESCUTA</p>

              <h2 id="cadastro-visual-title">
                No seu tempo.
                <br />
                Do seu jeito.
              </h2>

              <p>
                Você escolhe como começar. A triagem é opcional,
                e o atendimento acontece com um psicólogo.
              </p>

              <div className="cadastro-optional">
                <span aria-hidden="true">✧</span>

                <span>
                  Depois do cadastro, você poderá fazer a triagem
                  ou pular por enquanto.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}