// -------------------------------------------------------
// ProfileForm.js — with rating + "Other" + text-only numericals
// -------------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

export default function ProfileForm() {
  const navigate = useNavigate();

  const companyId = localStorage.getItem("company_id");
  const companyName = localStorage.getItem("company_name");

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [otherText, setOtherText] = useState({});
  const [questionnaire, setQuestionnaire] = useState(null);
  const [progress, setProgress] = useState(0);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const QUESTIONNAIRE_ID = "4f5e31a1-b8c9-4b26-8af3-226363aebcb3";

  const GET_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_questionnaire";

  const SUBMIT_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/submit_questionnaire_response";

  const HEADERS = {
    apikey: "sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    Authorization: "Bearer sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (!companyId || !companyName) navigate("/");
  }, [companyId, companyName, navigate]);

  useEffect(() => {
    async function loadForm() {
      try {
        const response = await fetch(GET_URL, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({ p_questionnaire_id: QUESTIONNAIRE_ID }),
        });

        const data = await response.json();
        setQuestionnaire(data);
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, []);

  const showAlert = (type, msg) => {
    setAlertType(type);
    setAlertMessage(msg);
    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 3000);
  };

  const updateAnswer = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const toggleMultiSelect = (questionId, optionValue) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];

      if (optionValue === "Other" && current.includes("Other")) {
        setOtherText((o) => ({ ...o, [questionId]: "" }));
      }

      const exists = current.includes(optionValue);
      const updated = exists
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];

      return { ...prev, [questionId]: updated };
    });
  };

  useEffect(() => {
    if (!questionnaire) return;

    const total = questionnaire.questions.length;
    let answered = 0;

    questionnaire.questions.forEach((q) => {
      const val = formData[q.question_id];
      if (Array.isArray(val) && val.length > 0) answered++;
      else if (val && String(val).trim() !== "") answered++;
    });

    setProgress(Math.round((answered / total) * 100));
  }, [formData, questionnaire]);

  // =============================
  // RENDER INPUT — TRANSLATED
  // =============================
  const renderInput = (q) => {
    const format = (q.format_hint || "").toLowerCase();
    const isMulti =
      q.question_type === "multiple_choice_multi" || format.includes("□");

    const value = formData[q.question_id] || "";
    const otherValue = otherText[q.question_id] || "";

    // ----- OPEN TEXT -----
    if (q.question_type === "open_text") {
      return (
        <textarea
          rows="3"
          value={value}
          onChange={(e) => updateAnswer(q.question_id, e.target.value)}
        />
      );
    }

    // ----- RATING -----
    if (q.question_type === "rating") {
      const min = q.min_rating || 1;
      const max = q.max_rating || 5;

      const circles = [];
      for (let i = min; i <= max; i++) {
        circles.push(
          <label key={i} className="rating-circle">
            <input
              type="radio"
              name={q.question_id}
              value={i}
              checked={String(value) === String(i)}
              onChange={(e) => updateAnswer(q.question_id, e.target.value)}
            />
            <span>{i}</span>
          </label>
        );
      }

      return <div className="rating-group">{circles}</div>;
    }

    // ----- MULTIPLE CHOICE -----
    if (q.question_type.includes("multiple_choice")) {
      if (isMulti) {
        const selected = Array.isArray(value) ? value : [];

        return (
          <div className="option-group">
            {q.options.map((opt) => {
              const isOther = opt.option_label.toLowerCase() === "other";
              const isChecked = selected.includes(opt.option_value);

              return (
                <div key={opt.option_id}>
                  <label className="option-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleMultiSelect(q.question_id, opt.option_value)
                      }
                    />
                    <div className="custom-checkbox"></div>
                    <span className="option-label">{opt.option_label}</span>
                  </label>

                  {isOther && isChecked && (
                    <input
                      type="text"
                      className="other-input"
                      placeholder="Veuillez préciser"
                      value={otherValue}
                      onChange={(e) =>
                        setOtherText((prev) => ({
                          ...prev,
                          [q.question_id]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // Single radio
      return (
        <div className="option-group">
          {q.options.map((opt) => {
            const isOther = opt.option_label.toLowerCase() === "other";
            const isChecked = value === opt.option_value;

            return (
              <div key={opt.option_id}>
                <label className="option-item">
                  <input
                    type="radio"
                    name={q.question_id}
                    value={opt.option_value}
                    checked={isChecked}
                    onChange={(e) => updateAnswer(q.question_id, e.target.value)}
                  />
                  <div className="custom-radio"></div>
                  <span className="option-label">{opt.option_label}</span>
                </label>

                {isOther && isChecked && (
                  <input
                    type="text"
                    className="other-input"
                    placeholder="Veuillez préciser"
                    value={otherValue}
                    onChange={(e) =>
                      setOtherText((prev) => ({
                        ...prev,
                        [q.question_id]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // ----- CLOSED QUESTIONS -----
    if (q.question_type === "closed") {
      if (q.options?.length) {
        return (
          <div className="option-group">
            {q.options.map((opt) => (
              <label key={opt.option_id} className="option-item">
                <input
                  type="radio"
                  name={q.question_id}
                  value={opt.option_value}
                  checked={value === opt.option_value}
                  onChange={(e) => updateAnswer(q.question_id, e.target.value)}
                />
                <div className="custom-radio"></div>
                <span className="option-label">{opt.option_label}</span>
              </label>
            ))}
          </div>
        );
      }

      const isNumericOrText = format.includes("numeric input or text");
      const placeholder = isNumericOrText
        ? 'Entrez un nombre ou "Non suivi"'
        : "";

      return (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => updateAnswer(q.question_id, e.target.value)}
        />
      );
    }

    return <p>Type non pris en charge : {q.question_type}</p>;
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const answers = questionnaire.questions.map((q) => {
      const val = formData[q.question_id];
      const otherVal = otherText[q.question_id] || "";

      const isMulti =
        q.question_type === "multiple_choice_multi" ||
        (q.format_hint || "").includes("□");

      let option_id = "";
      let answer_text = "";
      let answer_numeric = "";

      if (q.question_type === "open_text") {
        answer_text = val || "";
      }

      if (q.question_type === "rating") {
        if (!isNaN(Number(val))) answer_numeric = Number(val);
        else answer_text = String(val);
      }

      if (isMulti && q.question_type.includes("multiple_choice")) {
        if (Array.isArray(val)) {
          const list = [...val];
          if (list.includes("Other") && otherVal.trim() !== "") {
            list[list.indexOf("Other")] = `Other: ${otherVal}`;
          }
          answer_text = list.join("; ");
        }
      }

      if (!isMulti && q.question_type.includes("multiple_choice")) {
        if (val === "Other" && otherVal.trim() !== "") {
          answer_text = `Other: ${otherVal}`;
        } else {
          const opt = q.options.find((o) => o.option_value === val);
          if (opt) option_id = opt.option_id;
        }
      }

      if (q.question_type === "closed") {
        if (q.options?.length > 0) {
          const opt = q.options.find((o) => o.option_value === val);
          if (opt) option_id = opt.option_id;
        } else {
          answer_text = val;
        }
      }

      return {
        question_id: q.question_id,
        option_id,
        answer_text,
        answer_numeric,
      };
    });

    try {
      await fetch(SUBMIT_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          p_company_id: companyId,
          p_questionnaire_id: QUESTIONNAIRE_ID,
          p_respondent_type: "company",
          p_respondent_identifier: companyName,
          p_segment_label: null,
          p_answers: answers,
        }),
      });

      showAlert("success", "Envoyé avec succès !");
      setTimeout(() => navigate("/forms"), 1500);
    } catch (err) {
      showAlert("error", "Erreur lors de l'envoi du formulaire");
    }
  };

  if (loading) return <div className="form-container">Chargement...</div>;
  if (!questionnaire) return <div>Erreur de chargement du questionnaire.</div>;

  const sections = questionnaire.questions.reduce((acc, q) => {
    if (!acc[q.section_label]) acc[q.section_label] = [];
    acc[q.section_label].push(q);
    return acc;
  }, {});

  return (
    <>
      {/* Barre de progression */}
      <div className="progress-floating">
        <div className="progress-title">Progression</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-value">{progress}%</span>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h2>{questionnaire.title}</h2>
          <p>{questionnaire.description}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {Object.keys(sections).map((section) => (
            <div key={section}>
              <h3>{section}</h3>

              {sections[section]
                .sort((a, b) => a.question_order - b.question_order)
                .map((q) => (
                  <div key={q.question_id} className="question-block">
                    <label>
                      {q.question_text}
                      {q.is_required && <span className="required">*</span>}
                    </label>

                    {q.elaboration && (
                      <div className="helper-text">{q.elaboration}</div>
                    )}

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
