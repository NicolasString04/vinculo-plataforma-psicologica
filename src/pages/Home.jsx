
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./Home.css";

function Icon({ name, size = 24, className = "" }) {
  const paths = {
    chat: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H8l-5 3 1.5-5A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4M17 3v4M3 11h18M7 15h2M13 15h2" />
      </>
    ),

    search: (
      <>
        <circle cx="10.5" cy="10.5" r="7.5" />
        <path d="m16 16 5 5" />
      </>
    ),

    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m8 4 8 8-8 8" />,

    document: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),

    person: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),

    video: (
      <>
        <rect x="3" y="5" width="13" height="14" rx="3" />
        <path d="m16 10 5-3v10l-5-3" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

// Avisos existentes preservados.
const notices = {
  login: {
    title: "Seu espaço no Elora",
    text:
      "A página de login será a próxima etapa. " +
      "Primeiro estamos construindo a página inicial.",
  },

  register: {
    title: "Vamos começar?",
    text:
      "Em seguida, criaremos o cadastro e a escolha " +
      "entre fazer a triagem ou pular por enquanto.",
  },

  professional: {
    title: "Faça parte do Elora",
    text:
      "O cadastro profissional terá apresentação, " +
      "especialidades, CRP e disponibilidade para atendimento.",
  },

  triage: {
    title: "Vamos no seu ritmo.",
    text:
      "A triagem será opcional e organizada em " +
      "Sentimentos, Rotina, Necessidades e Revisão. " +
      "O conteúdo das perguntas ainda será definido.",
  },
};

const steps = [
  {
    number: "1",
    icon: "document",
    title: "Escolha seu caminho",
    text: "Converse agora ou agende sua sessão.",
  },
  {
    number: "2",
    icon: "person",
    title: "Encontre um profissional",
    text:
      "Filtre por especialidade e encontre um " +
      "psicólogo que combine com você.",
  },
  {
    number: "3",
    icon: "video",
    title: "Converse online",
    text:
      "Tenha sua sessão por videochamada, " +
      "no seu espaço e no seu tempo.",
  },
];

function localDateString() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function Home() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("now");
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [notice, setNotice] = useState(null);

  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (notice && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [notice]);

  function showNotice(content) {
    previousFocusRef.current = document.activeElement;
    setNotice(content);
  }

  function closeNotice() {
    dialogRef.current?.close();
  }

  function handleDialogClose() {
    setNotice(null);
    previousFocusRef.current?.focus();
  }

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return;

    const bounds = event.currentTarget.getBoundingClientRect();

    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) closeNotice();
  }

  // Destino atual preservado.
  // A navegação será revisada posteriormente.
  function handleSearch(event) {
    event.preventDefault();

    navigate("/cliente", {
      state: {
        modalidade: mode,
        especialidade: specialty,
        data: date,
      },
    });
  }

  return (
    <>
      <a className="elora-skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <Header
        onAccountClick={(type) => {
          if (type === "professional") {
            navigate("/login/psicologo");
            return;
          }

          showNotice(notices[type]);
        }}
      />

      <main id="conteudo">
        {/* HERO PRINCIPAL */}

        <section
          className="elora-home-hero"
          id="inicio"
          aria-labelledby="home-title"
        >
          <div className="elora-home-copy">
            <p className="elora-eyebrow">
              SEU ESPAÇO DE ESCUTA
            </p>

            <h1 id="home-title">
              Uma conversa pode ser seu primeiro passo.
            </h1>

            <p className="elora-home-description">
              Encontre um psicólogo para conversar agora
              <br className="elora-desktop-break" />
              {" "}ou agendar uma sessão no seu tempo.
            </p>

            {/* BUSCA */}

            <form
              className="elora-search-card"
              id="busca"
              onSubmit={handleSearch}
            >
              <div
                className="elora-service-switch"
                role="group"
                aria-label="Modalidade do atendimento"
              >
                <button
                  type="button"
                  className={mode === "now" ? "is-active" : ""}
                  aria-pressed={mode === "now"}
                  onClick={() => setMode("now")}
                >
                  <Icon name="chat" />
                  Conversar agora
                </button>

                <button
                  type="button"
                  className={
                    mode === "scheduled" ? "is-active" : ""
                  }
                  aria-pressed={mode === "scheduled"}
                  onClick={() => setMode("scheduled")}
                >
                  <Icon name="calendar" />
                  Agendar sessão
                </button>
              </div>

              <div className="elora-specialty-field">
                <Icon name="search" size={22} />

                <label
                  htmlFor="specialty"
                  className="elora-visually-hidden"
                >
                  Especialidade
                </label>

                <select
                  id="specialty"
                  value={specialty}
                  onChange={(event) =>
                    setSpecialty(event.target.value)
                  }
                >
                  <option value="">
                    Selecione uma especialidade
                  </option>

                  <option value="Ansiedade">
                    Ansiedade
                  </option>

                  <option value="Relacionamentos">
                    Relacionamentos
                  </option>

                  <option value="Autoconhecimento">
                    Autoconhecimento
                  </option>
                </select>
              </div>

              {mode === "scheduled" && (
                <div className="elora-date-field">
                  <label htmlFor="appointment-date">
                    Qual dia fica melhor para você?
                  </label>

                  <input
                    id="appointment-date"
                    type="date"
                    min={localDateString()}
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="elora-search-button"
              >
                Encontrar psicólogo
                <Icon name="arrow" size={23} />
              </button>
            </form>
          </div>

          {/* FOTO ORIGINAL DA ELORA */}

          <div className="elora-home-visual">
            <img
              className="elora-home-photo"
              src="/images/home-elora.png"
              alt="Cena ilustrativa de uma mulher conversando com uma psicóloga por videochamada"
              fetchPriority="high"
            />

            <div
              className="elora-hero-ribbon elora-hero-ribbon-blue"
              aria-hidden="true"
            />

            <div
              className="elora-hero-ribbon elora-hero-ribbon-lavender"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* TRIAGEM */}

        <section
          className="elora-triage-banner"
          aria-labelledby="triage-title"
        >
          <img
            className="elora-triage-logo"
            src="/images/logo-elora.png"
            alt=""
          />

          <div className="elora-triage-copy">
            <h2 id="triage-title">
              Vamos no seu ritmo.
            </h2>

            <p>
              A triagem inicial ajuda a organizar suas necessidades.
            </p>
          </div>

          <Link
            to="/triagem"
            className="elora-triage-button"
          >
            Começar triagem
          </Link>

          <div className="elora-triage-note">
            <p>Opcional. Você pode fazer depois.</p>
            <p>
              A IA apoia o direcionamento e não realiza diagnóstico.
            </p>
          </div>
        </section>

        {/* COMO FUNCIONA */}

        <section
          className="elora-home-steps"
          id="como-funciona"
          aria-label="Como funciona o Elora"
        >
          <ol>
            {steps.map((step, index) => (
              <li key={step.number}>
                <div className="elora-step-symbols">
                  <span className="elora-step-number">
                    {step.number}
                  </span>

                  <span className="elora-step-icon">
                    <Icon
                      name={step.icon}
                      size={29}
                    />
                  </span>
                </div>

                <div className="elora-step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>

                {index < steps.length - 1 && (
                  <Icon
                    name="chevron"
                    size={28}
                    className="elora-step-arrow"
                  />
                )}
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* RODAPÉ */}

      <footer className="elora-home-footer">
        <span>Elora · Psicologia online</span>
        <span>Nicolas Stringari da Silva</span>
        <span>Protótipo acadêmico em desenvolvimento.</span>
      </footer>

      {/* AVISOS EXISTENTES */}

      <dialog
        ref={dialogRef}
        className="elora-notice"
        aria-labelledby="notice-title"
        onClose={handleDialogClose}
        onClick={handleBackdropClick}
      >
        <button
          type="button"
          className="elora-notice-close"
          aria-label="Fechar janela"
          onClick={closeNotice}
        >
          ×
        </button>

        {notice && (
          <>
            <img
              src="/images/logo-elora.png"
              alt=""
            />

            <h2 id="notice-title">
              {notice.title}
            </h2>

            <p>{notice.text}</p>

            <button
              type="button"
              className="elora-notice-button"
              onClick={closeNotice}
            >
              Entendi
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
