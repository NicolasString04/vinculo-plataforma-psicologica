import { Link } from "react-router-dom";
import "../pages/Portais.css";

export default function PortalHeader({ secao }) {
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

        <Link to="/login/psicologo">Área do psicólogo</Link>
      </nav>

      <Link className="portal-account" to="/minha-conta">
        Minha conta
      </Link>
    </header>
  );
}