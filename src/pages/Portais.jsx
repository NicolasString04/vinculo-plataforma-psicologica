import { Link } from "react-router-dom";
import "./Portais.css";

const psicologos = [
  {
    iniciais: "FA",
    nome: "Felipe Almeida",
    crp: "CRP 12/34567",
    especialidades: "Ansiedade · Autoconhecimento",
    formato: "Online",
    disponibilidade: "Hoje, às 19h",
    cor: "azul",
  },
  {
    iniciais: "AM",
    nome: "Amanda Martins",
    crp: "CRP 12/45678",
    especialidades: "Relacionamentos · Autoestima",
    formato: "Online",
    disponibilidade: "Amanhã, às 10h",
    cor: "lilas",
  },
  {
    iniciais: "PS",
    nome: "Penelope Souza",
    crp: "CRP 12/56789",
    especialidades: "Ansiedade · Desenvolvimento pessoal",
    formato: "Online",
    disponibilidade: "Hoje, às 20h",
    cor: "pessego",
  },
  {
    iniciais: "VB",
    nome: "Vanessa Barros",
    crp: "CRP 12/67890",
    especialidades: "Luto · Momentos de mudança",
    formato: "Online",
    disponibilidade: "Quinta-feira, às 14h",
    cor: "verde",
  },
  {
    iniciais: "RA",
    nome: "Rafael Andrade",
    crp: "CRP 12/78901",
    especialidades: "Estresse · Ansiedade",
    formato: "Online",
    disponibilidade: "Sexta-feira, às 9h",
    cor: "amarelo",
  },
];

function PortalHeader({ secao }) {
  return (
    <header className="portal-header">
      <Link className="portal-brand" to="/" aria-label="Elora — início">
        <img src="/images/logo-elora.png" alt="" />
        <span>elora</span>
      </Link>

      <nav className="portal-nav" aria-label="Navegação principal">
        <Link to="/cliente" className={secao === "cliente" ? "ativo" : ""}>
          Encontrar psicólogo
        </Link>
        <Link
          to="/psicologo"
          className={secao === "psicologo" ? "ativo" : ""}
        >
          Área do psicólogo
        </Link>
      </nav>

      <Link className="portal-account" to="/minha-conta">
        Minha conta
      </Link>
    </header>
  );
}

export function PosTriagem() {
  return (
    <div className="portal-page pos-triagem-page">
      <PortalHeader />

      <main className="pos-triagem-main">
        <div className="pos-triagem-orbita orbita-um" aria-hidden="true" />
        <div className="pos-triagem-orbita orbita-dois" aria-hidden="true" />

        <div className="pos-triagem-content">
          <div className="pos-triagem-simbolo" aria-hidden="true">
            <span>e</span>
            <i />
          </div>

          <p className="portal-eyebrow">UM PASSO DE CADA VEZ</p>

          <h1>Obrigado por compartilhar um pouco de você.</h1>

          <p className="pos-triagem-texto">
            Suas respostas ajudam a organizar o próximo passo. Você pode
            conhecer profissionais e escolher com calma com quem gostaria de
            conversar.
          </p>

          <div className="pos-triagem-aviso">
            <span aria-hidden="true">✳</span>
            <p>
              Esta triagem é uma ferramenta de apoio e não substitui uma
              avaliação ou diagnóstico feito por um profissional.
            </p>
          </div>

          <div className="pos-triagem-acoes">
            <Link className="portal-button primario" to="/cliente">
              Conhecer psicólogos <span aria-hidden="true">→</span>
            </Link>
            <Link className="portal-text-link" to="/">
              Voltar para o início
            </Link>
          </div>
        </div>

        <p className="portal-demo-note">
          Protótipo acadêmico · conteúdo demonstrativo
        </p>
      </main>
    </div>
  );
}

export function ClienteHome() {
  return (
    <div className="portal-page">
      <PortalHeader secao="cliente" />

      <main className="cliente-main">
        <section className="cliente-intro">
          <p className="portal-eyebrow">ENCONTRE SEU ESPAÇO DE ESCUTA</p>
          <h1>Um encontro de cada vez.</h1>
          <p>
            Conheça os profissionais e encontre alguém com quem você se sinta
            à vontade para conversar.
          </p>
        </section>

        <section className="cliente-filtros" aria-label="Filtros de busca">
          <label>
            <span>O que você gostaria de cuidar?</span>
            <select defaultValue="">
              <option value="">Todas as especialidades</option>
              <option>Ansiedade</option>
              <option>Relacionamentos</option>
              <option>Autoconhecimento</option>
              <option>Estresse</option>
            </select>
          </label>

          <label>
            <span>Quando?</span>
            <select defaultValue="">
              <option value="">Qualquer horário</option>
              <option>Hoje</option>
              <option>Esta semana</option>
            </select>
          </label>

          <button type="button" className="portal-button filtro-button">
            Aplicar filtros
          </button>
        </section>

        <div className="cliente-lista-titulo">
          <div>
            <p className="portal-eyebrow">PROFISSIONAIS</p>
            <h2>Pessoas que podem te acompanhar</h2>
          </div>
          <span>{psicologos.length} perfis demonstrativos</span>
        </div>

        <section className="psicologos-lista" aria-label="Psicólogos">
          {psicologos.map((psicologo) => (
            <article className="psicologo-card" key={psicologo.nome}>
              <div
                className={`psicologo-avatar avatar-${psicologo.cor}`}
                aria-hidden="true"
              >
                {psicologo.iniciais}
              </div>

              <div className="psicologo-info">
                <div className="psicologo-nome-linha">
                  <h3>{psicologo.nome}</h3>
                  <span className="psicologo-status">
                    <i />
                    {psicologo.formato}
                  </span>
                </div>

                <p className="psicologo-crp">{psicologo.crp}</p>
                <p className="psicologo-especialidades">
                  {psicologo.especialidades}
                </p>
                <p className="psicologo-disponibilidade">
                  Próximo horário: <strong>{psicologo.disponibilidade}</strong>
                </p>
              </div>

              <button
                type="button"
                className="psicologo-ver-mais"
                onClick={() =>
                  window.alert(
                    "O perfil e o agendamento serão implementados nas próximas etapas."
                  )
                }
              >
                Ver perfil <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </section>

        <p className="portal-demo-note">
          Os profissionais e horários desta página são fictícios e servem
          apenas para demonstrar a interface.
        </p>
      </main>
    </div>
  );
}

export function PsicologoHome() {
  return (
    <div className="portal-page">
      <PortalHeader secao="psicologo" />

      <main className="psicologo-main">
        <section className="psicologo-boas-vindas">
          <div>
            <p className="portal-eyebrow">ESPAÇO PROFISSIONAL</p>
            <h1>Bom dia, profissional.</h1>
            <p>
              Aqui você poderá acompanhar sua agenda e organizar seus
              atendimentos.
            </p>
          </div>

          <div className="psicologo-perfil-resumo">
            <div className="psicologo-avatar avatar-lilas" aria-hidden="true">
              EL
            </div>
            <div>
              <strong>Perfil demonstrativo</strong>
              <span>Psicologia · CRP a cadastrar</span>
            </div>
          </div>
        </section>

        <section className="psicologo-resumo-cards" aria-label="Resumo">
          <article>
            <span className="resumo-icone">◷</span>
            <div>
              <p>Próxima sessão</p>
              <strong>Hoje, às 14h</strong>
            </div>
          </article>
          <article>
            <span className="resumo-icone">＋</span>
            <div>
              <p>Novas solicitações</p>
              <strong>2 para revisar</strong>
            </div>
          </article>
          <article>
            <span className="resumo-icone">▤</span>
            <div>
              <p>Atendimentos da semana</p>
              <strong>8 sessões</strong>
            </div>
          </article>
        </section>

        <div className="psicologo-painel-grid">
          <section className="painel-bloco">
            <div className="painel-titulo">
              <div>
                <p className="portal-eyebrow">SUA ROTINA</p>
                <h2>Próximos horários</h2>
              </div>
              <button type="button" className="painel-link">
                Ver agenda
              </button>
            </div>

            <div className="agenda-item">
              <div className="agenda-hora">14:00</div>
              <div className="agenda-linha" />
              <div>
                <strong>Marina Costa</strong>
                <span>Sessão online · 50 min</span>
              </div>
              <span className="agenda-tag">Hoje</span>
            </div>

            <div className="agenda-item">
              <div className="agenda-hora">16:30</div>
              <div className="agenda-linha" />
              <div>
                <strong>Lucas Ferreira</strong>
                <span>Sessão online · 50 min</span>
              </div>
              <span className="agenda-tag">Hoje</span>
            </div>

            <div className="agenda-item">
              <div className="agenda-hora">10:00</div>
              <div className="agenda-linha" />
              <div>
                <strong>Camila Rodrigues</strong>
                <span>Sessão online · 50 min</span>
              </div>
              <span className="agenda-tag">Amanhã</span>
            </div>
          </section>

          <section className="painel-bloco solicitacoes-bloco">
            <div className="painel-titulo">
              <div>
                <p className="portal-eyebrow">PARA VOCÊ AVALIAR</p>
                <h2>Solicitações recentes</h2>
              </div>
              <span className="solicitacoes-contador">2</span>
            </div>

            <article className="solicitacao-item">
              <div className="solicitacao-avatar">AR</div>
              <div>
                <strong>Ana Ribeiro</strong>
                <span>Busca por atendimento online</span>
              </div>
              <button type="button" aria-label="Abrir solicitação de Ana">
                →
              </button>
            </article>

            <article className="solicitacao-item">
              <div className="solicitacao-avatar">JP</div>
              <div>
                <strong>João Pereira</strong>
                <span>Disponibilidade para esta semana</span>
              </div>
              <button type="button" aria-label="Abrir solicitação de João">
                →
              </button>
            </article>

            <p className="solicitacao-nota">
              Nesta demonstração, não há informações clínicas ou dados reais de
              pacientes.
            </p>
          </section>
        </div>

        <p className="portal-demo-note">
          Dados fictícios para apresentação do protótipo acadêmico.
        </p>
      </main>
    </div>
  );
}