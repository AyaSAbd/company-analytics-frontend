import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import "../styles/RegisterCompany.css";

export default function RegisterCompany() {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("register"); // register | login

  const [formData, setFormData] = useState({
    p_company_name: "",
    p_industry: "",
    p_country: "",
    p_company_size_category: "",
    p_website: "",
    p_contact_name: "",
    p_contact_email: "",
    p_contact_phone: "",
  });

  const [loginName, setLoginName] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const HEADERS = {
    apikey: "sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    Authorization: "Bearer sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    "Content-Type": "application/json",
  };

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 3000);
  };

  const updateValue = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // -----------------------------------------------------------
  // INSCRIPTION
  // -----------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/create_company",
        {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Résultat création entreprise :", data);

      let companyId = null;
      if (typeof data === "string") companyId = data;

      if (companyId) {
        localStorage.setItem("company_id", companyId);
        localStorage.setItem("company_name", formData.p_company_name);

        showAlert("success", "Entreprise enregistrée avec succès !");
        setTimeout(() => navigate("/welcome"), 1500);
      } else {
        showAlert("error", "Échec de la création de l’entreprise.");
      }
    } catch (err) {
      showAlert("error", "Erreur de connexion au serveur.");
    }
  };

  // -----------------------------------------------------------
  // CONNEXION (par nom de l’entreprise)
  // -----------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("🚀 Tentative de connexion avec :", loginName);

    try {
      console.log("📤 Envoi RPC get_company_by_name...");
      console.log("Corps :", { p_company_name: loginName });

      const response = await fetch(
        "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_company_by_name",
        {
          method: "POST",
          headers: {
            ...HEADERS,
            Prefer: "return=representation",
          },
          body: JSON.stringify({ p_company_name: loginName }),
        }
      );

      console.log("📥 Réponse brute :", response);

      const text = await response.text();
      console.log("📥 Texte brut :", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.log("⚠ Erreur JSON :", text);
        showAlert("error", "Réponse serveur invalide.");
        return;
      }

      console.log("📦 JSON parsé :", data);

      if (Array.isArray(data) && data.length > 0) {
        const company = data[0];
        console.log("✔ Connexion réussie :", company);

        localStorage.setItem("company_id", company.id);
        localStorage.setItem("company_name", company.company_name);

        showAlert("success", "Connexion réussie !");
        setTimeout(() => navigate("/welcome"), 1500);
      } else {
        console.log("❌ Connexion échouée — aucune entreprise trouvée.");
        showAlert("error", "Entreprise introuvable.");
      }
    } catch (err) {
      console.log("🔥 ERREUR :", err);
      showAlert("error", "Erreur de connexion au serveur.");
    }
  };

  return (
    <>
      <div className="register-wrapper">
        <div className="register-card">

          {/* SWITCH BUTTONS */}
          <div style={{ display: "flex", marginBottom: "1rem", gap: "10px" }}>
            <button
              className="main-btn"
              style={{
                flex: 1,
                background: activeView === "register" ? "#325bb3" : "#ccc",
              }}
              onClick={() => setActiveView("register")}
            >
              Inscription
            </button>

            <button
              className="main-btn"
              style={{
                flex: 1,
                background: activeView === "login" ? "#325bb3" : "#ccc",
              }}
              onClick={() => setActiveView("login")}
            >
              Connexion
            </button>
          </div>

          {/* REGISTER FORM */}
          {activeView === "register" && (
            <>
              <h2>Inscrire votre entreprise</h2>
              <p>Créez un profil d'entreprise pour continuer.</p>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Nom de l’entreprise *</label>
                  <input
                    type="text"
                    value={formData.p_company_name}
                    onChange={(e) => updateValue("p_company_name", e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Secteur d’activité *</label>
                  <input
                    type="text"
                    value={formData.p_industry}
                    onChange={(e) => updateValue("p_industry", e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Pays *</label>
                  <input
                    type="text"
                    value={formData.p_country}
                    onChange={(e) => updateValue("p_country", e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Taille de l’entreprise *</label>
                  <input
                    type="text"
                    placeholder="ex : 1000-5000"
                    value={formData.p_company_size_category}
                    onChange={(e) =>
                      updateValue("p_company_size_category", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Site web</label>
                  <input
                    type="text"
                    value={formData.p_website}
                    onChange={(e) => updateValue("p_website", e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Nom du contact *</label>
                  <input
                    type="text"
                    value={formData.p_contact_name}
                    onChange={(e) =>
                      updateValue("p_contact_name", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email du contact *</label>
                  <input
                    type="email"
                    value={formData.p_contact_email}
                    onChange={(e) =>
                      updateValue("p_contact_email", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Téléphone du contact *</label>
                  <input
                    type="text"
                    value={formData.p_contact_phone}
                    onChange={(e) =>
                      updateValue("p_contact_phone", e.target.value)
                    }
                    required
                  />
                </div>

                <button type="submit">Créer l’entreprise</button>
              </form>
            </>
          )}

          {/* LOGIN FORM */}
          {activeView === "login" && (
            <>
              <h2>Connexion</h2>
              <p>Saisissez le nom de votre entreprise.</p>

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Nom de l’entreprise</label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    required
                  />
                </div>

                <button type="submit">Se connecter</button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ALERT */}
      <div className="bottom-alert">
        <Collapse in={alertOpen}>
          <Alert severity={alertType} variant="filled">
            {alertMessage}
          </Alert>
        </Collapse>
      </div>
    </>
  );
}
