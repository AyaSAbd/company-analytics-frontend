import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import "../styles/FormSelection.css"; // CSS File

export default function FormSelection() {
  const navigate = useNavigate();
  const companyId = localStorage.getItem("company_id");

  const [employeeQs, setEmployeeQs] = useState([]);
  const [customerQs, setCustomerQs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setTimeout(() => setAlertOpen(false), 2500);
  };

  // --------------------------------------------------
  // TRIGGER N8N WORKFLOW
  // --------------------------------------------------
  const triggerN8nWorkflow = (companyId) => {
    const webhookUrl = "YOUR_N8N_TEST_WEBHOOK_URL_HERE"; //replace with your n8n webhook URL

    const dataToSend = {
      p_company_id: companyId,
    };

    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Succès :", data);
        showAlert("success", "Workflow déclenché avec succès !");
      })
      .catch((error) => {
        console.error("Erreur :", error);
        showAlert("error", "Échec du déclenchement du workflow.");
      });
  };

  // --------------------------------------------------
  // LOAD QUESTIONNAIRES
  // --------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_company_questionnaires",
          {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({ p_company_id: companyId }),
          }
        );

        const data = await res.json();
        console.log("Questionnaires chargés :", data);

        setEmployeeQs(data.employee_questionnaires || []);
        setCustomerQs(data.customer_questionnaires || []);
      } catch (err) {
        showAlert("error", "Échec du chargement des questionnaires.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [companyId]);

  // --------------------------------------------------
  // SEND EMAIL
  // --------------------------------------------------
  const handleSendEmail = (title, questionnaireId) => {
    const companyId = localStorage.getItem("company_id");

    const link = `${window.location.origin}/forms/public/${companyId}/${questionnaireId}`;

    const subject = encodeURIComponent(`Veuillez compléter : ${title}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez remplir ce formulaire :\n${link}\n\nMerci !`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // --------------------------------------------------
  // GENERATE PUBLIC LINK
  // --------------------------------------------------
  const handleGenerateLink = (questionnaireId) => {
    const companyId = localStorage.getItem("company_id");

    const link = `${window.location.origin}/forms/public/${companyId}/${questionnaireId}`;

    navigator.clipboard.writeText(link);
    showAlert("success", "Lien copié dans le presse-papiers !");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  if (loading) return <div style={{ padding: "2rem" }}>Chargement...</div>;

  return (
    <div className="form-selection">
      {/* ALERT */}
      <div className="bottom-alert">
        <Collapse in={alertOpen}>
          <Alert severity={alertType} variant="filled">
            {alertMessage}
          </Alert>
        </Collapse>
      </div>

      {/* ----------------------------------------------------
           N8N WORKFLOW TRIGGER BUTTON
      ----------------------------------------------------- */}
      <button
        className="n8n-btn"
        onClick={() => triggerN8nWorkflow(companyId)}
      >
        Générer les formulaires
      </button>

      <h2>Choisissez un type de formulaire</h2>
      <p>Gérez ou partagez des formulaires pour employés et clients.</p>

      <div className="form-list-wrapper">
        {/* =====================================
            EMPLOYEE FORMS
        ====================================== */}
        <div className="form-category">
          <h3>Formulaires employés</h3>

          {employeeQs.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>
              Aucun questionnaire employé trouvé.
            </p>
          ) : (
            employeeQs.map((q) => (
              <div key={q.questionnaire_id} className="form-item">
                <div className="form-item-title">{q.title}</div>

                <div className="form-item-buttons">
                  <button onClick={() => navigate(`/forms/view/${q.questionnaire_id}`)}>
                    Ouvrir
                  </button>

                  <button onClick={() => handleSendEmail(q.title, q.questionnaire_id)}>
                    E-mail
                  </button>

                  <button onClick={() => handleGenerateLink(q.questionnaire_id)}>
                    Lien
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* =====================================
            CUSTOMER FORMS
        ====================================== */}
        <div className="form-category">
          <h3>Formulaires clients</h3>

          {customerQs.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>
              Aucun questionnaire client trouvé.
            </p>
          ) : (
            customerQs.map((q) => (
              <div key={q.questionnaire_id} className="form-item">
                <div className="form-item-title">{q.title}</div>

                <div className="form-item-buttons">
                  <button onClick={() => navigate(`/forms/view/${q.questionnaire_id}`)}>
                    Ouvrir
                  </button>

                  <button onClick={() => handleSendEmail(q.title, q.questionnaire_id)}>
                    E-mail
                  </button>

                  <button onClick={() => handleGenerateLink(q.questionnaire_id)}>
                    Lien
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
