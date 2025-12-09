import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Forms.css";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { FaTrash } from "react-icons/fa";

export default function QuestionnaireViewer() {
  const navigate = useNavigate();
  const { questionnaireId } = useParams();

  const companyId = localStorage.getItem("company_id");
  const companyName = localStorage.getItem("company_name");

  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState(null);

  const [formData, setFormData] = useState({});
  const [otherText, setOtherText] = useState({});
  const [progress, setProgress] = useState(0);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_order: "",
    question_text: "",
    question_type: "multiple_choice",
    is_required: true,
  });

  const [optionInput, setOptionInput] = useState("");
  const [optionsList, setOptionsList] = useState([]);

  const HEADERS = {
    apikey: "sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    Authorization: "Bearer sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    "Content-Type": "application/json",
  };

  const GET_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_questionnaire";

  const SUBMIT_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/submit_questionnaire_response";

  const ADD_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/add_question";

  const DELETE_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/delete_question";

  const showAlert = (type, msg) => {
    setAlertType(type);
    setAlertMessage(msg);
    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 3000);
  };

  useEffect(() => {
    if (!companyId || !companyName) navigate("/");
  }, [companyId, companyName, navigate]);

  // CHARGER LE QUESTIONNAIRE
  const loadQuestionnaire = async () => {
    try {
      const response = await fetch(GET_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ p_questionnaire_id: questionnaireId }),
      });

      let data = await response.json();
      setQuestionnaire(data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Échec du chargement du questionnaire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  // METTRE À JOUR LES RÉPONSES
  const updateAnswer = (questionId, value) =>
    setFormData((prev) => ({ ...prev, [questionId]: value }));

  const toggleMultiSelect = (questionId, optionValue) => {
    setFormData((prev) => {
      let current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const exists = current.includes(optionValue);

      return {
        ...prev,
        [questionId]: exists
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue],
      };
    });
  };

  // PROGRESSION
  useEffect(() => {
    if (!questionnaire) return;

    let total = questionnaire.questions.length;
    let answered = 0;

    questionnaire.questions.forEach((q) => {
      const val = formData[q.question_id];
      if (Array.isArray(val) && val.length > 0) answered++;
      else if (val && String(val).trim() !== "") answered++;
    });

    setProgress(Math.round((answered / total) * 100));
  }, [formData, questionnaire]);

  // RENDRE LES CHAMPS
  const renderInput = (q) => {
    const val = formData[q.question_id] || "";

    if (q.question_type === "open_text") {
      return (
        <textarea
          rows="3"
          value={val}
          onChange={(e) => updateAnswer(q.question_id, e.target.value)}
        />
      );
    }

    if (q.question_type.includes("multiple_choice")) {
      const isMulti = q.question_type === "multiple_choice_multi";
      const selected = Array.isArray(val) ? val : [];

      return (
        <div className="option-group">
          {q.options.map((opt) => {
            const checked = isMulti
              ? selected.includes(opt.option_value)
              : val === opt.option_value;

            return (
              <label key={opt.option_id} className="option-item">
                <input
                  type={isMulti ? "checkbox" : "radio"}
                  name={q.question_id}
                  checked={checked}
                  onChange={() =>
                    isMulti
                      ? toggleMultiSelect(q.question_id, opt.option_value)
                      : updateAnswer(q.question_id, opt.option_value)
                  }
                />
                <div className="custom-radio"></div>
                <span className="option-label">{opt.option_label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    return <p>Type non pris en charge</p>;
  };

  // SOUMETTRE LES RÉPONSES
  const handleSubmit = async (e) => {
    e.preventDefault();

    const answers = questionnaire.questions.map((q) => {
      const val = formData[q.question_id];

      return {
        question_id: q.question_id,
        option_id: "",
        answer_text: Array.isArray(val) ? val.join("; ") : val || "",
        answer_numeric: "",
      };
    });

    try {
      await fetch(SUBMIT_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          p_company_id: companyId,
          p_questionnaire_id: questionnaireId,
          p_respondent_type: "company",
          p_respondent_identifier: companyName,
          p_segment_label: null,
          p_answers: answers,
        }),
      });

      showAlert("success", "Envoyé avec succès !");
      setTimeout(() => navigate("/forms"), 1200);
    } catch (err) {
      showAlert("error", "Erreur lors de l’envoi");
    }
  };

  // SUPPRIMER UNE QUESTION
  const handleDeleteQuestion = async (questionId) => {
    try {
      await fetch(DELETE_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          p_questionnaire_id: questionnaireId,
          p_question_id: questionId,
        }),
      });

      await loadQuestionnaire();
      showAlert("success", "Question supprimée.");
    } catch (err) {
      showAlert("error", "Erreur lors de la suppression.");
    }
  };

  // AJOUTER UNE QUESTION
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionnaire) return;

    const { question_order, question_text, question_type, is_required } =
      newQuestion;

    const order =
      Number(question_order) > 0
        ? Number(question_order)
        : questionnaire.questions.length + 1;

    let options = [];

    if (
      question_type === "multiple_choice" ||
      question_type === "multiple_choice_multi"
    ) {
      options = optionsList.map((opt, index) => ({
        option_order: index + 1,
        option_label: opt.option_label,
        option_value: opt.option_value,
      }));
    }

    const p_question = {
      question_order: order,
      section_label: "Questions supplémentaires",
      question_code: `Q${order}`,
      question_text,
      question_type,
      is_required,
      help_text: "",
      elaboration: "",
      format_hint: "",
      options,
      metrics: [],
    };

    try {
      await fetch(ADD_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          p_questionnaire_id: questionnaireId,
          p_question,
        }),
      });

      showAlert("success", "Question ajoutée.");
      await loadQuestionnaire();

      setNewQuestion({
        question_order: "",
        question_text: "",
        question_type: "multiple_choice",
        is_required: true,
      });
      setOptionsList([]);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      showAlert("error", "Erreur lors de l’ajout de la question.");
    }
  };

  // RENDU UI
  if (loading) return <div className="form-container">Chargement...</div>;
  if (!questionnaire) return <div>Erreur de chargement du questionnaire.</div>;

  const sections = questionnaire.questions.reduce((acc, q) => {
    if (!acc[q.section_label]) acc[q.section_label] = [];
    acc[q.section_label].push(q);
    return acc;
  }, {});

  return (
    <>
      <div className="progress-floating">
        <div className="progress-title">Progression</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-value">{progress}%</span>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h2>{questionnaire.title}</h2>
          <p>{questionnaire.description}</p>
        </div>

        <div className="questionnaire-tools">
          <button
            type="button"
            className="icon-btn add-btn"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? "✖ Fermer" : "➕ Ajouter une question"}
          </button>
        </div>

        {showAddForm && (
          <div className="add-question-panel">
            <h4>Ajouter une nouvelle question</h4>

            <form onSubmit={handleAddQuestionSubmit} className="add-question-form">
              <div className="add-q-field small">
                <label>Ordre</label>
                <input
                  type="number"
                  value={newQuestion.question_order}
                  onChange={(e) =>
                    setNewQuestion((p) => ({
                      ...p,
                      question_order: e.target.value,
                    }))
                  }
                  placeholder="Auto"
                />
              </div>

              <div className="add-q-field">
                <label>Texte de la question *</label>
                <textarea
                  rows="2"
                  value={newQuestion.question_text}
                  onChange={(e) =>
                    setNewQuestion((p) => ({
                      ...p,
                      question_text: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="add-q-row">
                <div className="add-q-field">
                  <label>Type de question</label>
                  <select
                    value={newQuestion.question_type}
                    onChange={(e) =>
                      setNewQuestion((p) => ({
                        ...p,
                        question_type: e.target.value,
                      }))
                    }
                  >
                    <option value="open_text">Texte libre</option>
                    <option value="multiple_choice">Choix unique</option>
                    <option value="multiple_choice_multi">Choix multiple</option>
                  </select>
                </div>

                <div className="add-q-field checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={newQuestion.is_required}
                      onChange={(e) =>
                        setNewQuestion((p) => ({
                          ...p,
                          is_required: e.target.checked,
                        }))
                      }
                    />
                    <span>Obligatoire</span>
                  </label>
                </div>
              </div>

              {(newQuestion.question_type === "multiple_choice" ||
                newQuestion.question_type === "multiple_choice_multi") && (
                <div className="add-q-field">
                  <label>Ajouter des options</label>

                  <div className="option-add-row">
                    <input
                      type="text"
                      placeholder="Entrer une option…"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="add-option-btn"
                      onClick={() => {
                        if (!optionInput.trim()) return;
                        setOptionsList((prev) => [
                          ...prev,
                          {
                            option_label: optionInput.trim(),
                            option_value: optionInput.trim(),
                          },
                        ]);
                        setOptionInput("");
                      }}
                    >
                      Ajouter
                    </button>
                  </div>

                  <ul className="options-preview">
                    {optionsList.map((opt, idx) => (
                      <li key={idx}>
                        {opt.option_label}
                        <button
                          type="button"
                          className="remove-option-btn"
                          onClick={() =>
                            setOptionsList((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="add-q-actions">
                <button type="submit" className="form-submit-btn">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {Object.keys(sections).map((section) => (
            <div key={section}>
              <h3>{section}</h3>

              {sections[section]
                .sort((a, b) => a.question_order - b.question_order)
                .map((q) => (
                  <div key={q.question_id} className="question-block">
                    <div className="question-header">
                      <label>
                        {q.question_text}
                        {q.is_required && <span className="required">*</span>}
                      </label>

                      <FaTrash
                        className="trash-icon"
                        onClick={() => handleDeleteQuestion(q.question_id)}
                      />
                    </div>

                    {renderInput(q)}
                  </div>
                ))}
            </div>
          ))}

          <button type="submit" className="form-submit-btn">
            Envoyer
          </button>
        </form>
      </div>

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
