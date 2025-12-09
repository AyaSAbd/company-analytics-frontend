import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { FaUsers, FaUserTie, FaLightbulb } from "react-icons/fa";
import { MdInsights, MdOutlineChecklist, MdTimeline } from "react-icons/md";

import jsPDF from "jspdf";

import "../styles/Analysis.css";

export default function Analysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); 


  const companyName = localStorage.getItem("company_name") || "Entreprise";

  const HEADERS = {
    apikey: "sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    Authorization: "Bearer sb_publishable_hk-xfAPicrgQtaCFkvEnAA_jrQHqpVA",
    "Content-Type": "application/json",
  };

  const safeParse = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn("Impossible de parser le JSON :", e);
      return null;
    }
  };

  // -----------------------------------------
  // FETCH RECOMMENDATIONS (latest)
  // -----------------------------------------
  useEffect(() => {
    const load = async () => {
      const companyId = localStorage.getItem("company_id");
      try {
        const res = await fetch(
          "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_company_recommendations",
          {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({ p_company_id: companyId }),
          }
        );

        const raw = await res.json();
        if (!raw?.recommendations?.length) {
          setData(null);
          return;
        }

        // on prend la recommandation la plus récente (index 0)
        const latest = raw.recommendations[0];

        const summaryJson = safeParse(latest.summary);
        const recJson = safeParse(latest.recommendations_text);

        setData({
          ...latest,
          summaryJson,
          recJson,
        });
      } catch (e) {
        console.error(e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p className="analysis-loading">Chargement...</p>;

const createdDate = data?.created_at
  ? new Date(data.created_at).toLocaleDateString()
  : null;

  // -----------------------------------------
  // BUILD METRICS FOR HEATMAP (screen only)
  // -----------------------------------------
  const metricScoreFromInsight = (insight) => {
    const txt = (insight || "").toLowerCase();
    if (txt.includes("1/5")) return 1;
    if (txt.includes("2/5")) return 2;
    if (txt.includes("3/5")) return 3;
    if (txt.includes("4/5")) return 4;
    if (txt.includes("5/5")) return 5;
    return 3;
  };

  const heatmapData =
  data?.summaryJson?.key_findings?.map((k) => ({
      id: k.id,
      metric: (k.metrics || []).join(", "),
      score: metricScoreFromInsight(k.insight),
    })) || [];

  // -----------------------------------------
  // PDF GENERATOR – STYLE A (consulting report)
  // -----------------------------------------
  const generatePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    const addTitle = () => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Rapport d’analyse d’entreprise", margin, y);
      y += 8;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Client : ${companyName}`, margin, y);
      y += 6;
      pdf.text(`Date : ${createdDate}`, margin, y);
      y += 10;

      pdf.setDrawColor(52, 86, 178);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    const newPage = () => {
      pdf.addPage();
      y = margin;
    };

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - margin) newPage();
    };

    const sectionTitle = (label) => {
      ensureSpace(12);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(label, margin, y);
      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
    };

    const bulletLines = (text, bullet = "•") => {
      if (!text) return;
      const wrapped = pdf.splitTextToSize(text, pageWidth - 2 * margin - 4);
      ensureSpace(wrapped.length * 6 + 4);
      pdf.text(`${bullet} ${wrapped[0]}`, margin, y);
      y += 6;
      for (let i = 1; i < wrapped.length; i++) {
        pdf.text(`  ${wrapped[i]}`, margin, y);
        y += 6;
      }
      y += 2;
    };

    const subBulletLines = (text) => bulletLines(text, "–");

    // -------- Page 1: En-tête + Principaux constats ----------
    addTitle();
    sectionTitle("SECTION 1 — Principaux constats (clients & employés)");

    if (data.summaryJson.key_findings?.length) {
      data.summaryJson.key_findings.forEach((k) => {
        const metrics = (k.metrics || []).join(", ");
        bulletLines(`${k.insight}  [Indicateurs : ${metrics}]`);
      });
    } else {
      bulletLines(
        "Les principaux constats ne sont pas disponibles dans un format structuré."
      );
    }

    // -------- SECTION 2 : Causes racines ----------
    newPage();
    sectionTitle("SECTION 2 — Hypothèses de causes racines");

    if (data.summaryJson.root_causes?.length) {
      data.summaryJson.root_causes.forEach((r, index) => {
        const metrics = (r.metrics || []).join(", ");
        const label = `H${index + 1} — Indicateurs : ${metrics}`;
        bulletLines(label);
        subBulletLines(r.hypothesis);
      });
    } else {
      bulletLines("Aucune hypothèse de cause racine structurée n’est disponible.");
    }

    // -------- SECTION 3 : Actions prioritaires ----------
    newPage();
    sectionTitle("SECTION 3 — Actions prioritaires");

    if (data.recJson.priority_actions?.length) {
      data.recJson.priority_actions.forEach((a, index) => {
        bulletLines(`P${index + 1} — ${a.problem_summary}`);
        if (a.steps?.length) {
          a.steps.forEach((step) => subBulletLines(step));
        }
        if (a.expected_impact) {
          bulletLines(`Impact attendu : ${a.expected_impact}`);
        }
        y += 2;
      });
    } else {
      bulletLines("Aucune action prioritaire n’est disponible.");
    }

    // -------- SECTION 4 : Actions secondaires ----------
    newPage();
    sectionTitle("SECTION 4 — Actions secondaires");

    if (data.recJson.secondary_actions?.length) {
      data.recJson.secondary_actions.forEach((a, index) => {
        bulletLines(`S${index + 1} — ${a.problem_summary}`);
        if (a.steps?.length) {
          a.steps.forEach((step) => subBulletLines(step));
        }
        if (a.expected_impact) {
          bulletLines(`Impact attendu : ${a.expected_impact}`);
        }
        y += 2;
      });
    } else {
      bulletLines("Aucune action secondaire n’est disponible.");
    }

    // -------- SECTION 5 : Actions à long terme ----------
    newPage();
    sectionTitle("SECTION 5 — Actions à long terme");

    if (data.recJson.long_term_actions?.length) {
      data.recJson.long_term_actions.forEach((a, index) => {
        bulletLines(`L${index + 1} — ${a.problem_summary}`);
        if (a.steps?.length) {
          a.steps.forEach((step) => subBulletLines(step));
        }
        if (a.expected_impact) {
          bulletLines(`Impact attendu : ${a.expected_impact}`);
        }
        y += 2;
      });
    } else {
      bulletLines("Aucune action à long terme n’est disponible.");
    }

    // -------- SECTION 6 : Plan de suivi ----------
    newPage();
    sectionTitle("SECTION 6 — Plan de suivi");

    if (data.recJson.tracking_plan?.length) {
      data.recJson.tracking_plan.forEach((t, index) => {
        const metrics = (t.metrics_to_monitor || []).join(", ");
        bulletLines(`T${index + 1} — Indicateurs suivis : ${metrics}`);
        subBulletLines(t.method);
      });
    } else {
      bulletLines("Aucun plan de suivi structuré n’est disponible.");
    }

    pdf.save(`Rapport_${companyName}.pdf`);
  };

// -----------------------------------------
// TRIGGER N8N WORKFLOW AND RELOAD ANALYSIS
// -----------------------------------------
const triggerN8nWorkflow = async () => {
  const companyId = localStorage.getItem("company_id");
  const webhookUrl = "YOUR_WEBHOOK_URL";

  try {
    setProcessing(true);

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p_company_id: companyId }),
    });

    // wait for server to process
    await new Promise(res => setTimeout(res, 3000));

    // reload analysis WITHOUT full page refresh
    const res = await fetch(
      "https://vcvyrjbymwkvsgfihosn.supabase.co/rest/v1/rpc/get_company_recommendations",
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ p_company_id: companyId }),
      }
    );

    const raw = await res.json();

    if (raw?.recommendations?.length > 0) {
      const latest = raw.recommendations[0];
      setData({
        ...latest,
        summaryJson: safeParse(latest.summary),
        recJson: safeParse(latest.recommendations_text),
      });
    }

  } catch (err) {
    console.error(err);
  } finally {
    setProcessing(false);
  }
};

  const Pill = ({ children }) => <span className="metric-tag">{children}</span>;

  const FindingCard = ({ item }) => (
    <div className="item-card">
      <div className="item-header">
        <span className="item-id">{item.id}</span>
        <div className="item-metrics">
          {(item.metrics || []).map((m) => (
            <Pill key={m}>{m}</Pill>
          ))}
        </div>
      </div>
      <p className="item-text">{item.insight}</p>
    </div>
  );

  const RootCauseCard = ({ rc, idx }) => (
    <div className="item-card">
      <div className="item-header">
        <span className="item-id">H{idx + 1}</span>
        <div className="item-metrics">
          {(rc.metrics || []).map((m) => (
            <Pill key={m}>{m}</Pill>
          ))}
        </div>
      </div>
      <p className="item-text">{rc.hypothesis}</p>
    </div>
  );

  const ActionCard = ({ action, prefix }) => (
    <div className="item-card">
      <div className="item-header">
        <span className="item-id">{prefix}</span>
        <div className="item-metrics">
          {(action.related_metrics || []).map((m) => (
            <Pill key={m}>{m}</Pill>
          ))}
        </div>
      </div>
      <p className="item-text">{action.problem_summary}</p>

      {action.steps?.length > 0 && (
        <>
          <h4 className="action-header">
            <MdOutlineChecklist /> Étapes clés
          </h4>
          <ul className="action-list">
            {action.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {action.expected_impact && (
        <p className="action-impact">
          <strong>Impact attendu :</strong> {action.expected_impact}
        </p>
      )}
    </div>
  );
// -----------------------------------------
// FULL PAGE LOADER COMPONENT
// -----------------------------------------
const FullPageLoader = ({ message = "Analyse en cours..." }) => (
  <div style={loaderStyles.overlay}>
    <div style={loaderStyles.box}>
      <div style={loaderStyles.spinner}></div>
      <p style={loaderStyles.text}>{message}</p>
    </div>
  </div>
);

const loaderStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(6px)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: { textAlign: "center" },
  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid #dbe7ff",
    borderTop: "6px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  text: {
    marginTop: "12px",
    fontSize: "18px",
    color: "#1e40af",
    fontWeight: "600",
  },
  
};
  // -----------------------------------------
  // SCREEN LAYOUT 
  // -----------------------------------------
 return (
  <div className="analysis-page">
    {processing && <FullPageLoader message="Génération de l'analyse..." />}

    <div className="analysis-inner">

      {/* HEADER ALWAYS SHOWS */}
      <header className="analysis-hero">
        <div className="hero-left">
          <h1>Rapport d’analyse d’entreprise</h1>
          <p>
            {companyName}
            {data?.created_at ? ` — généré le ${createdDate}` : ""}
          </p>
        </div>

        <div className="hero-right">
          <button className="generate-btn" onClick={triggerN8nWorkflow}>
            Générer nouvelle analyse
          </button>

          {/* Disable PDF button when no analysis */}
          <button
            className="download-btn"
            onClick={generatePDF}
            disabled={!data || !data.summaryJson || !data.recJson}
          >
            Télécharger le PDF
          </button>
        </div>
      </header>

      {/* IF NO ANALYSIS → SHOW MESSAGE + STOP HERE */}
      {(!data || !data.summaryJson || !data.recJson) && (
        <div className="no-analysis-msg">
          Aucune analyse structurée disponible pour le moment.
        </div>
      )}

      {/* ONLY SHOW ANALYSIS SECTIONS IF DATA EXISTS */}
      {data && data.summaryJson && data.recJson && (
        <>
          {/* FIRST ROW */}
          <div className="analysis-grid">
            {/* KEY FINDINGS */}
            <section className="analysis-column">
              <div className="section-card">
                <div className="section-header blue">
                  <span className="section-icon"><FaUsers /></span>
                  <div>
                    <h2>Principaux constats</h2>
                    <p>Synthèse des enseignements chiffrés…</p>
                  </div>
                </div>

                {heatmapData.length > 0 && (
                  <div className="chart-wrapper">
                    <h3>Heatmap des scores (1–5)</h3>
                    <div className="chart-box">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={heatmapData}>
                          <XAxis dataKey="metric" angle={-45} textAnchor="end" height={50} />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="score" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="items-list">
                  {data.summaryJson.key_findings.map(k => (
                    <FindingCard key={k.id} item={k} />
                  ))}
                </div>
              </div>
            </section>

            {/* ROOT CAUSES */}
            <section className="analysis-column">
              <div className="section-card">
                <div className="section-header orange">
                  <span className="section-icon"><FaLightbulb /></span>
                  <div>
                    <h2>Hypothèses de causes profondes</h2>
                    <p>Analyse des causes business et opérationnelles.</p>
                  </div>
                </div>

                <div className="items-list">
                  {data.summaryJson.root_causes.map((rc, idx) => (
                    <RootCauseCard key={idx} rc={rc} idx={idx} />
                  ))}
                </div>
              </div>
            </section>
          </div>


{/* ACTIONS PRIORITAIRES */}
<section className="analysis-full-section">
  <div className="section-card">
    <div className="section-header purple">
      <span className="section-icon"><MdInsights /></span>
      <div>
        <h2>Actions prioritaires</h2>
        <p>Focus sur les leviers à très fort impact pour les 3–6 prochains mois.</p>
      </div>
    </div>

    <div className="items-list">
      {data?.recJson?.priority_actions?.map((a, idx) => (
        <ActionCard key={a.id || idx} action={a} prefix={`P${idx + 1}`} />
      ))}
    </div>
  </div>
</section>
{/* ACTIONS SECONDAIRES */}
<section className="analysis-full-section">
  <div className="section-card">
    <div className="section-header yellow">
      <span className="section-icon"><MdOutlineChecklist /></span>
      <div>
        <h2>Actions secondaires</h2>
        <p>Initiatives complémentaires pour consolider les résultats sur 6–12 mois.</p>
      </div>
    </div>

    <div className="items-list">
      {data?.recJson?.secondary_actions?.map((a, idx) => (
        <ActionCard key={a.id || idx} action={a} prefix={`S${idx + 1}`} />
      ))}
    </div>
  </div>
</section>
{/* ACTIONS LONG TERME */}
<section className="analysis-full-section">
  <div className="section-card">
    <div className="section-header teal">
      <span className="section-icon"><MdTimeline /></span>
      <div>
        <h2>Actions à long terme</h2>
        <p>Chantiers structurants sur 12–24 mois.</p>
      </div>
    </div>

    <div className="items-list">
      {data?.recJson?.long_term_actions?.map((a, idx) => (
        <ActionCard key={a.id || idx} action={a} prefix={`L${idx + 1}`} />
      ))}
    </div>
  </div>
</section>
{/* PLAN DE SUIVI */}
<section className="analysis-full-section">
  <div className="section-card">
    <div className="section-header dark">
      <span className="section-icon"><FaUserTie /></span>
      <div>
        <h2>Plan de suivi</h2>
        <p>Indicateurs et rituels de pilotage pour suivre l’impact.</p>
      </div>
    </div>

    <div className="items-list">
      {data?.recJson?.tracking_plan?.map((t, idx) => (
        <div key={t.id || idx} className="item-card">
          <div className="item-header">
            <span className="item-id">{`T${idx + 1}`}</span>
            <div className="item-metrics">
              {(t.metrics_to_monitor || []).map((m) => (
                <Pill key={m}>{m}</Pill>
              ))}
            </div>
          </div>
          <p className="item-text">{t.method}</p>
        </div>
      ))}
    </div>
  </div>
</section>

        </>
      )}

    </div>
  </div>
);
}
