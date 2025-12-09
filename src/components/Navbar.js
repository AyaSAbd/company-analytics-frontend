// src/components/Navbar.js
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/Navbar.css";
import Logo from "../assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const companyName = localStorage.getItem("company_name");
  const isPublic = location.pathname.startsWith("/forms/public");

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src={Logo} alt="Logo Formalyze" className="nav-logo" />
        <span>
          Formalyze {companyName ? `| ${companyName}` : ""}
        </span>
      </div>

      {/* Icône Hamburger (cachée sur les liens de formulaires publics) */}
      {!isPublic && (
        <div className="nav-toggle" onClick={() => setOpen(!open)}>
          <div className={open ? "bar bar1 open" : "bar bar1"}></div>
          <div className={open ? "bar bar2 open" : "bar bar2"}></div>
          <div className={open ? "bar bar3 open" : "bar bar3"}></div>
        </div>
      )}

      {/* Liens internes (cachés pour les formulaires publics) */}
      {!isPublic && (
        <div className={open ? "nav-links open" : "nav-links"}>
          <Link to="/welcome">Accueil</Link>
          <Link to="/forms">Formulaires</Link>
          <Link to="/analysis">Analyse</Link>
        </div>
      )}
    </nav>
  );
}
