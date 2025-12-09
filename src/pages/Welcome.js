import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";
import Logo from "../assets/logo.png";

import { ClipboardList, Send, BarChart3, FileEdit, Share2, LineChart } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  const companyName = localStorage.getItem("company_name");

  return (
    <div className="welcome-wrapper">

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-left">
          <h1>
            Transformez votre manière de collecter et comprendre les données
            {companyName && (
              <span style={{ color: "#325bb3" }}> | {companyName}</span>
            )}
          </h1>

          <p className="hero-desc">
            Formalyze vous aide à créer des formulaires, à les envoyer à vos clients 
            ou employés, et à transformer instantanément les réponses en insights 
            pertinents grâce à l’IA.
          </p>

          {/* LOGIN / REGISTER BUTTON */}
          {!companyName && (
            <button
              className="main-btn"
              onClick={() => navigate("/")}
              style={{ marginBottom: "10px", marginRight: "12px" }}
            >
              S’inscrire / Se connecter
            </button>
          )}

          <button className="main-btn" onClick={() => navigate("/profile-form")}>
            Commencer votre parcours
          </button>
        </div>

        <div className="hero-right">
          <img src={Logo} alt="Logo Formalyze" className="hero-illustration" />
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="feature-cards">
        <div className="feature-card fade-up delay-1">
          <div className="icon-circle">
            <ClipboardList size={28} strokeWidth={1.8} />
          </div>
          <h3>Formulaires simplifiés</h3>
          <p>Aidez-nous à comprendre votre entreprise pour personnaliser les insights.</p>
        </div>

        <div className="feature-card fade-up delay-2">
          <div className="icon-circle">
            <Send size={28} strokeWidth={1.8} />
          </div>
          <h3>Envoi facile des formulaires</h3>
          <p>Créez des formulaires pour vos clients ou employés et partagez-les instantanément.</p>
        </div>

        <div className="feature-card fade-up delay-3">
          <div className="icon-circle">
            <BarChart3 size={28} strokeWidth={1.8} />
          </div>
          <h3>Analyses claires et intelligentes</h3>
          <p>Des insights générés automatiquement sur lesquels vous pouvez compter.</p>
        </div>
      </section>

      {/* --- TIMELINE SECTION --- */}
      <section className="steps-pro">
        <h2>Un processus simple pour des insights puissants</h2>
        <p className="timeline-subtitle">De la configuration → à la création de formulaires → aux insights IA.</p>

        <div className="steps-list">

          <div className="step-card fade-up delay-1">
            <div className="step-icon blue">
              <FileEdit size={28} />
            </div>
            <div className="step-content">
              <h4>1. Complétez votre formulaire d’accueil</h4>
              <p>Fournissez les informations essentielles afin que notre IA puisse adapter les insights.</p>
            </div>
          </div>

          <div className="step-line"></div>

          <div className="step-card fade-up delay-2">
            <div className="step-icon green">
              <Share2 size={28} />
            </div>
            <div className="step-content">
              <h4>2. Créez et partagez des formulaires</h4>
              <p>Construisez des formulaires professionnels et envoyez-les instantanément.</p>
            </div>
          </div>

          <div className="step-line"></div>

          <div className="step-card fade-up delay-3">
            <div className="step-icon purple">
              <LineChart size={28} />
            </div>
            <div className="step-content">
              <h4>3. Obtenez des analyses</h4>
              <p>Recevez des tableaux de bord, des résumés et des insights générés par IA.</p>
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Formalyze — Tous droits réservés.</p>
      </footer>
    </div>
  );
}
