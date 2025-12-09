import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Forms.css";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

export default function PublicFormViewer() {
  const navigate = useNavigate();

  const { companyId, questionnaireId } = useParams();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [otherText, setOtherText] = useState({});
  const [questionnaire, setQuestionnaire] = useState(null);
  const [progress, setProgress] = useState(0);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const GET_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_questionnaire";

  const SUBMIT_URL =
    "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/submit_questionnaire_response";

  const HEADERS = {
    apikey: "sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    Authorization: "Bearer sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    "Content-Type": "application/json",
  };

  // --------------------------
  // Load questionnaire
  // --------------------------
  useEffect(() => {
    async function loadForm() {
      try {
        const response = await fetch(GET_URL, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({ p_questionnaire_id: questionnaireId }),
        });

        const data = await response.json();
        setQuestionnaire(data);
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [questionnaireId]);

  const showAlert = (type, msg) => {
    setAlertType(type);
    setAlertMessage(msg);
    setAlertOpen(true);

    setTimeout(() => setAlertOpen(false), 3000);
  };

  // --------------------------
  // Update answers
  // --------------------------
  const updateAnswer = (qid, val) => {
    setFormData((prev) => ({ ...prev, [qid]: val }));
  };

  const toggleMultiSelect = (qid, val) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[qid]) ? prev[qid] : [];

      if (val === "Other" && current.includes("Other")) {
        setOtherText((o) => ({ ...o, [qid]: "" }));
      }

      const updated = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];

      return { ...prev, [qid]: updated };
    });
  };

  // --------------------------
  // Progress %
  // --------------------------
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

  // --------------------------
  // Input Renderer
  // --------------------------
  const renderInput = (q) => {
    const format = (q.format_hint || "").toLowerCase();
    const isMulti = q.question_type === "multiple_choice_multi";

    const value = formData[q.question_id] || "";
    const otherValue = otherText[q.question_id] || "";

    // ---- open text ----
    if (q.question_type === "open_text") {
      return (
        <textarea
          rows="3"
          value={value}
          onChange={(e) => updateAnswer(q.question_id, e.target.value)}
        />
      );
    }

    // ---- rating ----
    if (q.question_type === "rating") {
      const min = q.min_rating || 1;
      const max = q.max_rating || 5;

      return (
        <div className="rating-group">
          {Array.from({ length: max - min + 1 }).map((_, i) => {
            const num = min + i;
            return (
              <label key={num} className="rating-circle">
                <input
                  type="radio"
                  name={q.question_id}
                  value={num}
                  checked={String(value) === String(num)}
                  onChange={(e) => updateAnswer(q.question_id, e.target.value)}
                />
                <span>{num}</span>
              </label>
            );
          })}
        </div>
      );
    }

    // ---- multiple choice ----
    if (q.question_type.includes("multiple_choice")) {
      // MULTI
      if (isMulti) {
        const selected = Array.isArray(value) ? value : [];

        return (
          <div className="option-group">
            {q.options.map((opt) => {
              const isOther = opt.option_label.toLowerCase() === "other";
              const checked = selected.includes(opt.option_value);

              return (
                <div key={opt.option_id}>
                  <label className="option-item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleMultiSelect(q.question_id, opt.option_value)
                      }
                    />
                    <div className="custom-checkbox"></div>
                    <span className="option-label">{opt.option_label}</span>
                  </label>

                  {isOther && checked && (
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

      // SINGLE
      return (
        <div className="option-group">
          {q.options.map((opt) => {
            const isOther = opt.option_label.toLowerCase() === "other";

            return (
              <div key={opt.option_id}>
                <label className="option-item">
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

                {isOther && value === "Other" && (
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

    // ---- closed ----
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

      return (
        <input
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => updateAnswer(q.question_id, e.target.value)}
        />
      );
    }

    return <p>Type non pris en charge : {q.question_type}</p>;
  };

  // --------------------------
  // Submit
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const answers = questionnaire.questions.map((q) => {
      const val = formData[q.question_id];
      const otherVal = otherText[q.question_id] || "";

      let option_id = "";
      let answer_text = "";
      let answer_numeric = "";

      if (q.question_type === "open_text") answer_text = val || "";

      if (q.question_type === "rating") {
        answer_numeric = Number(val);
      }

      if (q.question_type.includes("multiple_choice")) {
        if (Array.isArray(val)) {
          const finalList = [...val];

          if (finalList.includes("Other") && otherVal.trim() !== "") {
            finalList[finalList.indexOf("Other")] = `Other: ${otherVal}`;
          }

          answer_text = finalList.join("; ");
        }

        if (val === "Other" && otherVal.trim() !== "") {
          answer_text = `Other: ${otherVal}`;
        }
      }

      if (q.question_type === "closed") {
        if (q.options?.length) {
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
          p_questionnaire_id: questionnaireId,
          p_respondent_type: "external",
          p_respondent_identifier: "public-user",
          p_segment_label: null,
          p_answers: answers,
        }),
      });

      showAlert("success", "Formulaire envoyé avec succès !");
      setTimeout(() => navigate("/forms/thank-you"), 1200);
    } catch (err) {
      showAlert("error", "Erreur lors de l'envoi du formulaire.");
    }
  };

  if (loading) return <div className="form-container">Chargement...</div>;
  if (!questionnaire)
    return <div>Erreur de chargement du questionnaire.</div>;

  const sections = questionnaire.questions.reduce((acc, q) => {
    if (!acc[q.section_label]) acc[q.section_label] = [];
    acc[q.section_label].push(q);
    return acc;
  }, {});

  return (
    <>
      {/* Progress Bar */}
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
