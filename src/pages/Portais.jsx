import { Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";

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