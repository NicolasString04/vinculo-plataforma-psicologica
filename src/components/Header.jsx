
import { useState } from "react";
import { Link } from "react-router-dom";

import "./Header.css";

export default function Header({ onAccountClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleProfessionalClick() {
    closeMenu();

    onAccountClick?.("professional");
  }

  return (
    <header className="elora-header">
      <div className="elora-header-inner">

        {/* LOGO */}

        <Link
          className="elora-brand"
          to="/"
          aria-label="Elora — página inicial"
          onClick={closeMenu}
        >
          <img
            src="/images/logo-elora.png"
            alt=""
          />

          <span>elora</span>
        </Link>

        {/* NAVEGAÇÃO */}

        <nav
          id="elora-navigation"
          className={`elora-navigation ${
            menuOpen ? "is-open" : ""
          }`}
          aria-label="Navegação principal"
        >
          <a
            href="/#como-funciona"
            onClick={closeMenu}
          >
            Como funciona
          </a>

          <a
            href="/#busca"
            onClick={closeMenu}
          >
            Encontre um psicólogo
          </a>

          <button
            type="button"
            onClick={handleProfessionalClick}
          >
            Sou psicólogo
          </button>
        </nav>

        {/* AÇÕES */}

        <div className="elora-header-actions">
          <Link
            to="/login"
            className="elora-login-button"
            onClick={closeMenu}
          >
            Entrar
          </Link>

          <Link
            to="/cadastro"
            className="elora-register-button"
            onClick={closeMenu}
          >
            Criar conta
          </Link>

          {/* MENU MOBILE */}

          <button
            type="button"
            className="elora-menu-button"
            aria-label={
              menuOpen ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={menuOpen}
            aria-controls="elora-navigation"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
