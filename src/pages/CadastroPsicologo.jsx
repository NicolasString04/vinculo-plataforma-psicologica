
import { useState } from "react";
import { Link } from "react-router-dom";
import "./CadastroElora.css";

const initialForm = {
  crp: "",
  cpf: "",
  nome: "",
  nascimento: "",
  telefone: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "SC",
};

const numeros = (value) => value.replace(/\D/g, "");

function formatarCPF(value) {
  return numeros(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarCRP(value) {
  const n = numeros(value).slice(0, 7);

  return n.length > 2
    ? `${n.slice(0, 2)}/${n.slice(2)}`
    : n;
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

function formatarCEP(value) {
  return numeros(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
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

export default function CadastroPsicologo() {
  const [form, setForm] = useState(initialForm);
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [informarEndereco, setInformarEndereco] = useState(true);
  const [sucesso, setSucesso] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    const formatadores = {
      crp: formatarCRP,
      cpf: formatarCPF,
      telefone: formatarTelefone,
      nascimento: formatarData,
      cep: formatarCEP,
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

    if (!/^\d{2}\/\d{5}$/.test(form.crp)) {
      novosErros.crp =
        "Informe o CRP no formato 00/00000.";
    }

    if (!cpfValido(form.cpf)) {
      novosErros.cpf = "Informe um CPF válido.";
    }

    if (form.nome.trim().length < 3) {
      novosErros.nome = "Informe seu nome completo.";
    }

    if (!dataValida(form.nascimento)) {
      novosErros.nascimento = "Informe uma data válida.";
    }

    if (![10, 11].includes(numeros(form.telefone).length)) {
      novosErros.telefone = "Informe um telefone válido.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
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

    if (informarEndereco) {
      if (numeros(form.cep).length !== 8) {
        novosErros.cep = "Informe um CEP válido.";
      }

      if (!form.rua.trim()) {
        novosErros.rua = "Informe a rua.";
      }

      if (!form.numero.trim()) {
        novosErros.numero = "Informe o número.";
      }

      if (!form.bairro.trim()) {
        novosErros.bairro = "Informe o bairro.";
      }

      if (!form.cidade.trim()) {
        novosErros.cidade = "Informe a cidade.";
      }
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      document
        .getElementById(Object.keys(novosErros)[0])
        ?.focus();
      return;
    }

    // Validação oficial do CRP e Firebase
    // serão integrados posteriormente.
    setSucesso(true);
  }

  return (
    <main
      className="
        cadastro-elora-page
        cadastro-psicologo
        cadastro-elora-page--psicologo
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

        <strong>Psicólogo(a)</strong>
      </header>

      <section className="cadastro-elora-shell">
        <div className="cadastro-elora-heading">
          <span className="cadastro-elora-eyebrow">
            ÁREA DO PSICÓLOGO
          </span>

          <h1>Crie sua conta profissional</h1>

          <p>
            Faça parte da Elora e conecte-se a pessoas
            que procuram acolhimento e acompanhamento
            psicológico.
          </p>
        </div>

        {sucesso && (
          <div
            className="cadastro-elora-success"
            role="status"
          >
            <strong>Dados validados!</strong>

            <p>
              O formulário passou pelas verificações
              básicas. A validação oficial do CRP e
              o cadastro no banco ainda serão
              implementados.
            </p>
          </div>
        )}

        <form
          className="cadastro-elora-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* CRP */}
          <div className="cadastro-elora-field">
            <label htmlFor="crp">CRP</label>

            <input
              id="crp"
              name="crp"
              placeholder="00/00000"
              inputMode="numeric"
              value={form.crp}
              onChange={handleChange}
              aria-invalid={Boolean(erros.crp)}
              required
            />

            {erros.crp && <small>{erros.crp}</small>}
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

          {/* Nome */}
          <div className="cadastro-elora-field campo-full">
            <label htmlFor="nome">Nome completo</label>

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

          {/* E-mail */}
          <div className="cadastro-elora-field campo-full">
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

          {/* Endereço opcional */}
          <section className="cadastro-elora-address campo-full">
            <div className="cadastro-elora-address-heading">
              <div>
                <h2>Deseja informar seu endereço?</h2>

                <p>
                  Podemos utilizá-lo futuramente
                  para enviar comunicações.
                </p>
              </div>

              <div className="cadastro-elora-radio">
                <label>
                  <input
                    type="radio"
                    name="endereco"
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
                    name="endereco"
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
                {/* CEP */}
                <div className="cadastro-elora-field">
                  <label htmlFor="cep">CEP</label>

                  <input
                    id="cep"
                    name="cep"
                    placeholder="00000-000"
                    inputMode="numeric"
                    value={form.cep}
                    onChange={handleChange}
                    aria-invalid={Boolean(erros.cep)}
                  />

                  {erros.cep && <small>{erros.cep}</small>}
                </div>

                {/* Rua */}
                <div className="cadastro-elora-field endereco-rua">
                  <label htmlFor="rua">Rua</label>

                  <input
                    id="rua"
                    name="rua"
                    placeholder="Digite o nome da rua"
                    value={form.rua}
                    onChange={handleChange}
                  />

                  {erros.rua && <small>{erros.rua}</small>}
                </div>

                {/* Número */}
                <div className="cadastro-elora-field">
                  <label htmlFor="numero">Número</label>

                  <input
                    id="numero"
                    name="numero"
                    placeholder="123"
                    value={form.numero}
                    onChange={handleChange}
                  />

                  {erros.numero && (
                    <small>{erros.numero}</small>
                  )}
                </div>

                {/* Complemento */}
                <div className="cadastro-elora-field endereco-complemento">
                  <label htmlFor="complemento">
                    Complemento
                  </label>

                  <input
                    id="complemento"
                    name="complemento"
                    placeholder="Apto, sala, bloco (opcional)"
                    value={form.complemento}
                    onChange={handleChange}
                  />
                </div>

                {/* Bairro */}
                <div className="cadastro-elora-field">
                  <label htmlFor="bairro">Bairro</label>

                  <input
                    id="bairro"
                    name="bairro"
                    placeholder="Digite o bairro"
                    value={form.bairro}
                    onChange={handleChange}
                  />

                  {erros.bairro && (
                    <small>{erros.bairro}</small>
                  )}
                </div>

                {/* Cidade */}
                <div className="cadastro-elora-field">
                  <label htmlFor="cidade">Cidade</label>

                  <input
                    id="cidade"
                    name="cidade"
                    placeholder="Digite a cidade"
                    value={form.cidade}
                    onChange={handleChange}
                  />

                  {erros.cidade && (
                    <small>{erros.cidade}</small>
                  )}
                </div>

                {/* UF */}
                <div className="cadastro-elora-field">
                  <label htmlFor="uf">UF</label>

                  <select
                    id="uf"
                    name="uf"
                    value={form.uf}
                    onChange={handleChange}
                  >
                    {[
                      "AC", "AL", "AP", "AM", "BA", "CE",
                      "DF", "ES", "GO", "MA", "MT", "MS",
                      "MG", "PA", "PB", "PR", "PE", "PI",
                      "RJ", "RN", "RS", "RO", "RR", "SC",
                      "SP", "SE", "TO",
                    ].map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Botão */}
          <button
            type="submit"
            className="cadastro-elora-submit"
          >
            Criar conta profissional
          </button>
        </form>

        <div className="cadastro-elora-login">
          Já tem conta?
          <Link to="/login/psicologo">Entrar</Link>
        </div>

        <div className="cadastro-elora-other">
          É paciente?
          <Link to="/cadastro">
            Criar conta de paciente
          </Link>
        </div>
      </section>
    </main>
  );
}
