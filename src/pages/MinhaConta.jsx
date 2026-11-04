import { Link, Navigate, useNavigate } from "react-router-dom";
import "./Cadastro.css";

function lerSessao() {
  try {
    const conteudo = sessionStorage.getItem("elora-demo-session");
    const sessao = conteudo ? JSON.parse(conteudo) : null;

    return sessao?.demonstracao === true &&
      typeof sessao.email === "string"
      ? sessao
      : null;
  } catch {
    return null;
  }
}

export default function MinhaConta() {
  const navigate = useNavigate();
  const sessao = lerSessao();

  if (!sessao) {
    return <Navigate to="/login" replace />;
  }

  function sair() {
    sessionStorage.removeItem("elora-demo-session");
    navigate("/login", { replace: true });
  }

  return (
    <main className="cadastro-page">
      <Link to="/" className="cadastro-back">
        ← Voltar ao início
      </Link>

      <section className="cadastro-card">
        <img
          className="cadastro-logo"
          src="/images/logo-elora.png"
          alt="Elora"
        />

        <p className="cadastro-eyebrow">SEU ESPAÇO NO ELORA</p>

        <h1>Bem-vindo, {sessao.nome}.</h1>

        <p className="cadastro-description">
          Você entrou com {sessao.email}.
        </p>

        <div className="cadastro-success">
          <strong>Sessão demonstrativa iniciada.</strong>
          <p>
            Ainda não existe autenticação real. Vamos usar esta
            sessão para desenvolver as próximas telas.
          </p>
        </div>

        <Link to="/cliente" className="cadastro-submit">
          Explorar psicólogos →
        </Link>

        <button
          type="button"
          className="cadastro-back"
          onClick={sair}
          style={{
            marginTop: "24px",
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Sair da conta
        </button>
      </section>
    </main>
  );
}