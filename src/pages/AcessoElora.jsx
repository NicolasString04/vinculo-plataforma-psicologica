import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AcessoElora.css";

const camposPessoais = [
  { nome: "nome", rotulo: "Nome completo", autoComplete: "name", largo: true },
  { nome: "cpf", rotulo: "CPF", inputMode: "numeric", placeholder: "000.000.000-00" },
  { nome: "nascimento", rotulo: "Data de nascimento", tipo: "date", autoComplete: "bday" },
  { nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email", placeholder: "voce@exemplo.com" },
  { nome: "telefone", rotulo: "Telefone", tipo: "tel", autoComplete: "tel", placeholder: "(00) 00000-0000" },
];

const camposEndereco = [
  { nome: "cep", rotulo: "CEP", inputMode: "numeric", autoComplete: "postal-code" },
  { nome: "rua", rotulo: "Rua", autoComplete: "address-line1" },
  { nome: "numero", rotulo: "Número", placeholder: "Ex.: 123 ou S/N" },
  { nome: "complemento", rotulo: "Complemento", opcional: true },
  { nome: "bairro", rotulo: "Bairro" },
  { nome: "cidade", rotulo: "Cidade", autoComplete: "address-level2" },
  { nome: "uf", rotulo: "UF", maxLength: 2, placeholder: "SC" },
];

function Campo({
  nome,
  rotulo,
  tipo = "text",
  largo = false,
  opcional = false,
  ...atributos
}) {
  const [mostrar, setMostrar] = useState(false);
  const senha = tipo === "password";

  return (
    <div className={`acesso-campo${largo ? " acesso-largo" : ""}`}>
      <label htmlFor={`acesso-${nome}`}>
        {rotulo}{opcional ? " (opcional)" : ""}
      </label>

      <div className={senha ? "acesso-campo-senha" : undefined}>
        <input
          id={`acesso-${nome}`}
          name={nome}
          type={senha && mostrar ? "text" : tipo}
          required={!opcional}
          {...atributos}
        />

        {senha && (
          <button
            type="button"
            aria-label={`${mostrar ? "Ocultar" : "Mostrar"} ${rotulo.toLowerCase()}`}
            onClick={() => setMostrar((atual) => !atual)}
          >
            {mostrar ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AcessoElora({ profissional = false, cadastro = false }) {
  const navigate = useNavigate();
  const [informarEndereco, setInformarEndereco] = useState(false);
  const [erro, setErro] = useState("");

  const rotaLogin = profissional ? "/login/psicologo" : "/login";
  const rotaCadastro = profissional ? "/cadastro/psicologo" : "/cadastro";
  const rotaOutroPerfil = cadastro
    ? (profissional ? "/cadastro" : "/cadastro/psicologo")
    : (profissional ? "/login" : "/login/psicologo");

  const titulo = cadastro
    ? (profissional ? "Crie sua conta profissional" : "Crie sua conta")
    : (profissional ? "Acesse seu portal profissional" : "Entre no seu espaço de escuta");

  const textoBotao = cadastro
    ? (profissional ? "Criar conta profissional" : "Criar conta")
    : (profissional ? "Entrar no portal" : "Entrar");

  const hoje = new Date();
  const dataMaxima = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");

  function enviar(evento) {
    evento.preventDefault();
    setErro("");

    const dados = new FormData(evento.currentTarget);
    const email = String(dados.get("email")).trim().toLowerCase();
    const senha = String(dados.get("senha"));
    const nome = cadastro
      ? String(dados.get("nome")).trim()
      : email.split("@")[0];

    if (!senha.trim()) {
      setErro("Digite uma senha para continuar.");
      return;
    }

    if (cadastro) {
      if (!nome) {
        setErro("Informe seu nome completo.");
        return;
      }

      if (String(dados.get("cpf")).replace(/\D/g, "").length !== 11) {
        setErro("O CPF precisa ter 11 dígitos.");
        return;
      }

      if (senha !== dados.get("confirmarSenha")) {
        setErro("As senhas precisam ser iguais.");
        return;
      }
    }

    try {
      const chave = profissional
        ? "elora-psychologist-demo-session"
        : "elora-demo-session";

      sessionStorage.setItem(
        chave,
        JSON.stringify({
          email,
          nome,
          demonstracao: true,
          ...(profissional ? { tipo: "psicologo" } : {}),
        }),
      );
    } catch {
      setErro("Não foi possível iniciar a sessão neste navegador.");
      return;
    }

    navigate(profissional ? "/psicologo" : "/triagem", { replace: true });
  }

  return (
    <main className={`acesso-elora ${profissional ? "acesso-profissional" : ""}`}>
      <header className="acesso-topo">
        <Link to="/" className="acesso-marca" aria-label="Elora — início">
          <img src="/images/logo-elora.png" alt="" />
          <span>elora</span>
        </Link>

        <Link to="/" className="acesso-voltar">← Voltar ao início</Link>
      </header>

      <div className="acesso-layout">
        <aside className="acesso-visual">
          <span className="acesso-etiqueta">
            {profissional ? "Área do psicólogo" : "Área do paciente"}
          </span>

          <p className="acesso-frase">
            {profissional
              ? "Um espaço para organizar seus atendimentos."
              : "Encontre apoio no seu ritmo."}
          </p>

          <img
            className="acesso-sofa"
            src={profissional ? "/images/sofa-roxo.png" : "/images/sofa-azul.png"}
            alt=""
          />
        </aside>

        <section className="acesso-painel" aria-labelledby="acesso-titulo">
          <h1 id="acesso-titulo">{titulo}</h1>
          <p className="acesso-intro">
            {cadastro
              ? "Preencha os dados abaixo para começar."
              : "Use seu e-mail e senha para continuar."}
          </p>

          <form className="acesso-form" onSubmit={enviar}>
            {cadastro && profissional && (
              <Campo
                nome="crp"
                rotulo="CRP"
                placeholder="00/00000"
                largo
              />
            )}

            {cadastro ? (
              camposPessoais.map((campo) => (
                <Campo
                  key={campo.nome}
                  {...campo}
                  {...(campo.tipo === "date" ? { max: dataMaxima } : {})}
                />
              ))
            ) : (
              <Campo nome="email" rotulo="E-mail" tipo="email" autoComplete="username" largo />
            )}

            <Campo
              nome="senha"
              rotulo="Senha"
              tipo="password"
              autoComplete={cadastro ? "new-password" : "current-password"}
              minLength={cadastro ? 6 : undefined}
              largo={!cadastro}
            />

            {cadastro && (
              <Campo
                nome="confirmarSenha"
                rotulo="Confirmar senha"
                tipo="password"
                autoComplete="new-password"
                minLength={6}
              />
            )}

            {cadastro && profissional && (
              <fieldset className="acesso-endereco acesso-largo">
                <legend>Deseja informar seu endereço?</legend>
                <p>É opcional. Ele poderá ser usado no futuro para o envio de conquistas.</p>

                <div className="acesso-opcoes">
                  <label>
                    <input
                      type="radio"
                      name="informarEndereco"
                      value="sim"
                      checked={informarEndereco}
                      onChange={() => setInformarEndereco(true)}
                    />
                    Sim
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="informarEndereco"
                      value="nao"
                      checked={!informarEndereco}
                      onChange={() => setInformarEndereco(false)}
                    />
                    Não
                  </label>
                </div>

                {informarEndereco && (
                  <div className="acesso-grade-endereco">
                    {camposEndereco.map((campo) => (
                      <Campo key={campo.nome} {...campo} />
                    ))}
                  </div>
                )}
              </fieldset>
            )}

            {erro && (
              <p className="acesso-erro acesso-largo" role="alert">{erro}</p>
            )}

            <button className="acesso-submit acesso-largo" type="submit">
              {textoBotao}
            </button>

            <p className="acesso-demo acesso-largo">
              Modo demonstrativo. Use apenas dados fictícios.
            </p>
          </form>

          <footer className="acesso-links">
            <p>
              {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
              <Link to={cadastro ? rotaLogin : rotaCadastro}>
                {cadastro ? "Entrar" : "Criar conta"}
              </Link>
            </p>
            <Link to={rotaOutroPerfil}>
              {profissional ? "Ir para a área do paciente" : "Ir para a área profissional"}
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}