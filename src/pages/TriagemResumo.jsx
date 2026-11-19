
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import "./TriagemFinal.css";

// =====================================================
// ÍCONES
// =====================================================

function IconeCoracao() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M24 40 8.5 24.8C-1 15.1 12 2 21 11l3 3 3-3c9-9 22 4.1 12.5 13.8L24 40Z" />
    </svg>
  );
}

function IconeInformacao() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle
        cx="12"
        cy="7.5"
        r="0.9"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function IconeSeta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

// =====================================================
// EXPORTAR O RESUMO TEMPORÁRIO
//
// Mantido apenas porque o histórico ainda não
// está conectado ao Firebase.
// =====================================================

function montarTextoResumo(resumo) {
  const manifestacoes = Array.isArray(
    resumo.manifestacoes
  )
    ? resumo.manifestacoes
    : [];

  const lacunas = Array.isArray(resumo.lacunas)
    ? resumo.lacunas
    : [];

  const fontes = Array.isArray(resumo.fontes)
    ? resumo.fontes
    : [];

  return [
    "ELORA — RESUMO DA TRIAGEM EXPERIMENTAL",
    "",
    "Documento de teste. Não constitui diagnóstico.",
    "",
    "SÍNTESE DO RELATO",
    resumo.sintese || "Não informada.",
    "",
    "CONTEXTO",
    resumo.contexto || "Não informado.",
    "",
    "MANIFESTAÇÕES MENCIONADAS",

    ...manifestacoes.map((item) => {
      const evidencias = Array.isArray(
        item.evidenciasDoRelato
      )
        ? item.evidenciasDoRelato
        : [];

      return [
        item.descricao || "Não informada.",
        `Evidências: ${evidencias.join("; ")}`,
        `Ressalva: ${item.ressalva || ""}`,
        "",
      ].join("\n");
    }),

    "",
    "INFORMAÇÕES A ESCLARECER",
    ...lacunas,
    "",
    "REFERÊNCIAS RELACIONADAS",

    ...fontes.map(
      (fonte) =>
        `${fonte.titulo || "Referência"} — ${
          fonte.url || "Sem URL"
        }`
    ),

    "",
    resumo.aviso || "",
    resumo.avisoTeste || "",
  ].join("\n");
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function TriagemResumo() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const resumo = state?.resumo ?? null;

  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");

  const destinoInicio = auth.currentUser
    ? "/cliente"
    : "/";

  // ===================================================
  // SAIR DA CONTA
  // ===================================================

  async function sairDaConta() {
    if (saindo) return;

    setSaindo(true);
    setErro("");

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }

      navigate("/login", {
        replace: true,
      });
    } catch {
      setErro(
        "Não foi possível sair da conta. Tente novamente."
      );
    } finally {
      setSaindo(false);
    }
  }

  // ===================================================
  // BUSCAR PSICÓLOGO
  // ===================================================

  function buscarPsicologo() {
    navigate(
      auth.currentUser
        ? "/cliente"
        : "/login",
      {
        replace: true,
      }
    );
  }

  // ===================================================
  // BAIXAR RESUMO
  // ===================================================

  function baixarResumo() {
    if (!resumo) return;

    const conteudo = montarTextoResumo(resumo);

    const arquivo = new Blob([conteudo], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(arquivo);

    const link = document.createElement("a");
    link.href = url;
    link.download = "elora-resumo-triagem.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // ===================================================
  // ACESSO DIRETO SEM RESUMO
  // ===================================================

  if (!resumo) {
    return (
      <div className="tf-page">
        <header className="tf-header">
          <Link
            to="/"
            className="tf-brand"
            aria-label="Elora — início"
          >
            <img
              src="/images/logo-elora.png"
              alt=""
            />
            <span>elora</span>
          </Link>

          <Link
            to={destinoInicio}
            className="tf-header-exit"
          >
            Voltar ao início
            <span aria-hidden="true">×</span>
          </Link>
        </header>

        <main className="tf-indisponivel">
          <p className="tf-eyebrow">
            SEU ESPAÇO DE CUIDADO
          </p>

          <h1>Resumo não disponível</h1>

          <p>
            Não encontramos os dados da triagem
            nesta navegação. Como o histórico
            ainda não está integrado ao Firebase,
            o resumo não pode ser recuperado aqui.
          </p>

          <Link
            to="/triagem"
            className="tf-btn tf-btn-primary"
          >
            Voltar à triagem
          </Link>
        </main>
      </div>
    );
  }

  // ===================================================
  // INTERFACE — TRIAGEM CONCLUÍDA
  // ===================================================

  return (
    <div className="tf-page">

      {/* =============================================
          CABEÇALHO
      ============================================= */}

      <header className="tf-header">

        <Link
          to="/"
          className="tf-brand"
          aria-label="Elora — início"
        >
          <img
            src="/images/logo-elora.png"
            alt=""
          />

          <span>elora</span>
        </Link>

        <Link
          to={destinoInicio}
          className="tf-header-exit"
        >
          Sair da triagem
          <span aria-hidden="true">×</span>
        </Link>

      </header>

      {/* =============================================
          CONTEÚDO
      ============================================= */}

      <main className="tf-layout">

        {/* ===========================================
            ESQUERDA — TRIAGEM CONCLUÍDA
        =========================================== */}

        <section
          className="tf-left"
          aria-labelledby="tf-titulo"
        >
          <div
            className="tf-watermark"
            aria-hidden="true"
          />

          <p className="tf-eyebrow">
            UM ESPAÇO PARA VOCÊ
          </p>

          <h1 id="tf-titulo">
            Triagem
            <br />
            <em>concluída.</em>
          </h1>

          <p className="tf-description">
            Você compartilhou um relato fictício,
            e a Elora organizou as informações
            para apoiar a compreensão inicial,
            sem atribuir diagnósticos.
          </p>

          <p className="tf-academic-note">
            <span aria-hidden="true">✳</span>

            Protótipo do TCC. Use apenas
            relatos fictícios.
          </p>
        </section>

        {/* ===========================================
            DIREITA — OBRIGADO POR COMPARTILHAR
        =========================================== */}

        <section
          className="tf-card"
          aria-labelledby="tf-agradecimento"
        >

          {/* TÍTULO E CORAÇÃO */}

          <div className="tf-card-heading">

            <span className="tf-heart">
              <IconeCoracao />
            </span>

            <h2 id="tf-agradecimento">
              Obrigado por{" "}
              <em>compartilhar!!</em>
            </h2>

          </div>

          {/* MENSAGEM PRINCIPAL */}

          <h3 className="tf-card-title">
            Seu cuidado pode continuar
            no seu ritmo.
          </h3>

          <p className="tf-card-description">
            Conheça os psicólogos disponíveis
            e escolha, com calma, um profissional
            para lhe atender.
          </p>

          {/* =========================================
              AÇÕES
          ========================================= */}

          <div className="tf-actions">

            <button
              type="button"
              className="tf-btn tf-btn-secondary"
              onClick={sairDaConta}
              disabled={saindo}
            >
              {saindo
                ? "Saindo..."
                : "Sair da conta"}
            </button>

            <button
              type="button"
              className="tf-btn tf-btn-primary"
              onClick={buscarPsicologo}
              disabled={saindo}
            >
              Buscar psicólogo

              <IconeSeta />
            </button>

          </div>

          {erro && (
            <p
              className="tf-error"
              role="alert"
            >
              {erro}
            </p>
          )}

          {/* =========================================
              HISTÓRICO DE TRIAGENS
          ========================================= */}

          <div className="tf-divider" />

          <div className="tf-history">

            <span className="tf-info-icon">
              <IconeInformacao />
            </span>

            <p>
              Em breve, seu histórico de triagens
              estará disponível na aba{" "}
              <strong>Triagens</strong> da sua conta,
              para realizar uma nova triagem ou
              baixar seus resumos.

              <span className="tf-history-warning">
                Nesta versão de teste, o histórico
                ainda não é salvo automaticamente.
              </span>
            </p>

          </div>

          {/* DOWNLOAD TEMPORÁRIO DISCRETO */}



        </section>

      </main>
    </div>
  );
}
