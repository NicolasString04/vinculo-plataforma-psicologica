
import { useState } from "react";
import { Link } from "react-router-dom";
import "./CadastroElora.css";

const initialForm = {
  nome: "",
  cpf: "",
  nascimento: "",
  email: "",
  telefone: "",
  senha: "",
  confirmarSenha: "",
};

const numeros = (value) => value.replace(/\D/g, "");

function formatarCPF(value) {
  return numeros(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(value) {
  const n = numeros(value).slice(0, 11);

  if (n.length <= 10) {
    return n
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return n
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatarData(value) {
  const n = numeros(value).slice(0, 8);

  if (n.length <= 2) return n;
  if (n.length <= 4) {
    return `${n.slice(0, 2)}/${n.slice(2)}`;
  }

  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function cpfValido(value) {
  const cpf = numeros(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  if (digito !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(cpf[10]);
}

function dataValida(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) return false;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);

  const data = new Date(ano, mes - 1, dia);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= new Date()
  );
}

export default function Cadastro() {
  const [form, setForm] = useState(initialForm);
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    const formatadores = {
      cpf: formatarCPF,
      telefone: formatarTelefone,
      nascimento: formatarData,
    };

    const valor = formatadores[name]
      ? formatadores[name](value)
      : value;

    setForm((atual) => ({
      ...atual,
      [name]: valor,
    }));

    setErros((atual) => ({
      ...atual,
      [name]: "",
    }));

    setSucesso(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const novosErros = {};

    if (form.nome.trim().length < 3) {
      novosErros.nome = "Informe seu nome completo.";
    }

    if (!cpfValido(form.cpf)) {
      novosErros.cpf = "Informe um CPF válido.";
    }

    if (!dataValida(form.nascimento)) {
      novosErros.nascimento = "Informe uma data válida.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (![10, 11].includes(numeros(form.telefone).length)) {
      novosErros.telefone = "Informe um telefone válido.";
    }

    if (form.senha.length < 8) {
      novosErros.senha =
        "A senha deve ter pelo menos 8 caracteres.";
    }

    if (
      !form.confirmarSenha ||
      form.confirmarSenha !== form.senha
    ) {
      novosErros.confirmarSenha =
        "As senhas não coincidem.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      document
        .getElementById(Object.keys(novosErros)[0])
        ?.focus();
      return;
    }

    // Firebase será integrado posteriormente.
    setSucesso(true);
  }

  return (
    <main
      className="
        cadastro-elora-page
        cadastro-paciente
        cadastro-elora-page--paciente
      "
    >
      {/* Imagem decorativa */}
      <img
        className="cadastro-elora-sofa"
        src="/images/elora-sofa.png"
        alt=""
        aria-hidden="true"
      />

      {/* Cabeçalho */}
      <header className="cadastro-elora-topbar">
        <Link to="/" className="cadastro-elora-brand">
          <img
            src="/images/logo-elora.png"
            alt=""
          />
          <span>elora</span>
        </Link>

        <span className="cadastro-elora-divider" />

        <strong>Paciente</strong>
      </header>

      <section className="cadastro-elora-shell">
        <div className="cadastro-elora-heading">
          <span className="cadastro-elora-eyebrow">
            ÁREA DO PACIENTE
          </span>

          <h1>Crie sua conta</h1>
          <p>Encontre apoio no seu ritmo.</p>
        </div>

        {sucesso && (
          <div
            className="cadastro-elora-success"
            role="status"
          >
            <strong>Validação concluída!</strong>
            <p>
              Seus dados foram validados. O cadastro
              ainda não foi salvo, pois a integração
              com o banco será realizada posteriormente.
            </p>
          </div>
        )}

        <form
          className="cadastro-elora-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Nome */}
          <div className="cadastro-elora-field campo-full">
            <label htmlFor="nome">
              Nome completo
            </label>

            <input
              id="nome"
              name="nome"
              placeholder="Digite seu nome completo"
              autoComplete="name"
              value={form.nome}
              onChange={handleChange}
              aria-invalid={Boolean(erros.nome)}
              required
            />

            {erros.nome && <small>{erros.nome}</small>}
          </div>

          {/* CPF */}
          <div className="cadastro-elora-field">
            <label htmlFor="cpf">CPF</label>

            <input
              id="cpf"
              name="cpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={form.cpf}
              onChange={handleChange}
              aria-invalid={Boolean(erros.cpf)}
              required
            />

            {erros.cpf && <small>{erros.cpf}</small>}
          </div>

          {/* Nascimento */}
          <div className="cadastro-elora-field">
            <label htmlFor="nascimento">
              Data de nascimento
            </label>

            <input
              id="nascimento"
              name="nascimento"
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
              value={form.nascimento}
              onChange={handleChange}
              aria-invalid={Boolean(erros.nascimento)}
              required
            />

            {erros.nascimento && (
              <small>{erros.nascimento}</small>
            )}
          </div>

          {/* E-mail */}
          <div className="cadastro-elora-field">
            <label htmlFor="email">E-mail</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={Boolean(erros.email)}
              required
            />

            {erros.email && <small>{erros.email}</small>}
          </div>

          {/* Telefone */}
          <div className="cadastro-elora-field">
            <label htmlFor="telefone">Telefone</label>

            <input
              id="telefone"
              name="telefone"
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              autoComplete="tel"
              value={form.telefone}
              onChange={handleChange}
              aria-invalid={Boolean(erros.telefone)}
              required
            />

            {erros.telefone && (
              <small>{erros.telefone}</small>
            )}
          </div>

          {/* Senha */}
          <div className="cadastro-elora-field">
            <label htmlFor="senha">Senha</label>

            <div className="cadastro-elora-password">
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                autoComplete="new-password"
                value={form.senha}
                onChange={handleChange}
                aria-invalid={Boolean(erros.senha)}
                required
                minLength={8}
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarSenha((v) => !v)
                }
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {erros.senha && <small>{erros.senha}</small>}
          </div>

          {/* Confirmar senha */}
          <div className="cadastro-elora-field">
            <label htmlFor="confirmarSenha">
              Confirmar senha
            </label>

            <div className="cadastro-elora-password">
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                value={form.confirmarSenha}
                onChange={handleChange}
                aria-invalid={Boolean(erros.confirmarSenha)}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarSenha((v) => !v)
                }
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {erros.confirmarSenha && (
              <small>{erros.confirmarSenha}</small>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="cadastro-elora-submit"
          >
            Criar conta
          </button>
        </form>

        <div className="cadastro-elora-login">
          Já tem conta?
          <Link to="/login">Entrar</Link>
        </div>

        <div className="cadastro-elora-other">
          É psicólogo?
          <Link to="/cadastro/psicologo">
            Criar conta profissional
          </Link>
        </div>
      </section>
    </main>
  );
}
