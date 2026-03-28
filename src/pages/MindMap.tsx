
import { useState, useCallback, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;
type ToastType = "success" | "error" | "info";

interface Toast {
  msg: string;
  type: ToastType;
}

// ── Constants ─────────────────────────────────────────────────────────────────
// ✅ FastAPI default port (Flask waala 5000 nahi!)
const API = "http://localhost:8000";
const ACCEPTED = [".pdf", ".docx", ".txt"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GridBg() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function StepTracker({ step }: { step: Step }) {
  const steps = ["Upload", "Keywords", "Mindmap"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 44 }}>
      {steps.map((label, i) => {
        const num = (i + 1) as Step;
        const isDone = num < step;
        const isActive = num === step;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${isDone ? "#34d399" : isActive ? "#38bdf8" : "#2a2a3d"}`,
                  background: isDone ? "#34d399" : isActive ? "#38bdf8" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontFamily: "'Space Mono', monospace",
                  color: isDone || isActive ? "#0a0a0f" : "#6b6b85",
                  transition: "all 0.35s",
                  fontWeight: 700,
                }}
              >
                {isDone ? "✓" : num}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Space Mono', monospace",
                  color: isDone ? "#34d399" : isActive ? "#38bdf8" : "#6b6b85",
                  transition: "color 0.35s",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  width: 48,
                  height: 1,
                  background: isDone ? "#34d399" : "#2a2a3d",
                  margin: "0 10px",
                  transition: "background 0.4s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#13131e",
        border: "1px solid #1e1e2e",
        borderRadius: 20,
        padding: 32,
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
        animation: "fadeUp 0.4s ease forwards",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: "15%", right: "15%",
          height: 1,
          background: "linear-gradient(90deg, transparent, #38bdf840, transparent)",
        }}
      />
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontFamily: "'Space Mono', monospace",
        letterSpacing: 4,
        textTransform: "uppercase" as const,
        color: "#38bdf8",
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, padding: 40 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "3px solid #1e1e2e",
          borderTopColor: "#38bdf8",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b6b85" }}>
        Thinking with Ollama…
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MindMapGenerator() {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [mermaidSvg, setMermaidSvg] = useState("");
  const mermaidRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load mermaid dynamically
  useEffect(() => {
    if (mermaidCode) renderMermaid(mermaidCode);
  }, [mermaidCode]);

  async function renderMermaid(code: string) {
    try {
      const m = await import("https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs" as string) as any;
      m.default.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
      const id = "mm-" + Date.now();
      const { svg } = await m.default.render(id, code);
      setMermaidSvg(svg);
    } catch {
      setMermaidSvg(`<p style="color:#f87171;font-family:monospace;font-size:13px">Could not render diagram.</p>`);
    }
  }

  function showToast(msg: string, type: ToastType = "info") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  function validateFile(f: File): boolean {
    const ext = "." + f.name.split(".").pop()!.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      showToast(`Unsupported type: ${ext}. Use PDF, DOCX, or TXT.`, "error");
      return false;
    }
    return true;
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  }

  async function extractKeywords() {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      // ✅ Correct FastAPI endpoint
      const res = await fetch(`${API}/mindmap/upload`, { method: "POST", body: form });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      // ✅ Backend returns: { filename, keywords, primary_topic, mermaid, tree }
      if (!data.keywords?.length) throw new Error("No keywords found in document");

      setKeywords(data.keywords);
      setStep(2);
      showToast(`${data.keywords.length} keywords extracted!`, "success");
    } catch (e: any) {
      showToast("Extract failed: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function generateMindmap() {
    const topic = selected || customTopic.trim();
    if (!topic) return;
    setStep(3);
    setLoading(true);
    setMermaidSvg("");
    try {
      // ✅ Correct FastAPI endpoint — matches MindmapTopicRequest(topic: str)
      const res = await fetch(`${API}/mindmap/topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      // ✅ Backend returns: { topic, mermaid, tree }
      if (!data.mermaid) throw new Error("No mindmap returned from server");
      setMermaidCode(data.mermaid);
    } catch (e: any) {
      showToast("Mindmap failed: " + e.message, "error");
      setMermaidSvg(`<p style="color:#f87171">Error: ${e.message}</p>`);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(1);
    setFile(null);
    setKeywords([]);
    setSelected("");
    setCustomTopic("");
    setMermaidCode("");
    setMermaidSvg("");
  }

  function downloadSVG() {
    if (!mermaidSvg) return;
    const blob = new Blob([mermaidSvg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mindmap-${selected || customTopic || "output"}.svg`;
    a.click();
  }

  const activeTopic = selected || customTopic.trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 99px; }
      `}</style>

      <GridBg />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "52px 24px 100px", fontFamily: "'DM Sans', sans-serif", color: "#e8e8f2" }}>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: "#38bdf8", marginBottom: 18 }}>
            ⬡ MindMap AI
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(38px,6vw,66px)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-1px", color: "#f0f0f8" }}>
            Documents become<br />
            <em style={{ color: "#38bdf8", fontStyle: "italic" }}>visual knowledge</em>
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b6b85", marginTop: 14 }}>
            Upload → Extract Keywords → Generate Mindmap
          </p>
        </header>

        <StepTracker step={step} />

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <Card>
            <CardLabel>Step 01 — Upload Document</CardLabel>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleFileDrop}
              style={{
                border: `2px dashed ${dragging ? "#38bdf8" : file ? "#34d399" : "#2a2a3d"}`,
                borderRadius: 14,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s",
                background: dragging ? "rgba(56,189,248,0.06)" : "transparent",
                position: "relative",
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              />
              <div style={{ fontSize: 42, marginBottom: 14 }}>{file ? "✅" : "📄"}</div>
              {file ? (
                <>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, color: "#34d399" }}>{file.name}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6b6b85", marginTop: 4 }}>{formatBytes(file.size)}</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>Drop your file here</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b6b85" }}>Supports .pdf &nbsp;·&nbsp; .docx &nbsp;·&nbsp; .txt</div>
                </>
              )}
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button
                onClick={extractKeywords}
                disabled={!file || loading}
                style={{
                  padding: "13px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: file && !loading ? "linear-gradient(135deg,#38bdf8,#818cf8)" : "#1e1e2e",
                  color: file && !loading ? "#0a0a0f" : "#6b6b85",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: file && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? "Extracting…" : "Extract Keywords →"}
              </button>
            </div>
          </Card>
        )}

        {/* ── STEP 2: Keywords ── */}
        {step === 2 && (
          <Card>
            <CardLabel>Step 02 — Choose Your Topic</CardLabel>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b6b85", marginBottom: 18 }}>
              AI ne ye keywords nikale — ek select karo ya khud type karo:
            </p>

            {/* Keyword chips */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, marginBottom: 28 }}>
              {keywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => { setSelected(kw); setCustomTopic(""); }}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 100,
                    border: `1.5px solid ${selected === kw ? "#38bdf8" : "#2a2a3d"}`,
                    background: selected === kw ? "rgba(56,189,248,0.15)" : "transparent",
                    color: selected === kw ? "#38bdf8" : "#a0a0b8",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: selected === kw ? 700 : 400,
                  }}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6b6b85" }}>ya khud type karo</span>
              <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setSelected(""); }}
                placeholder="Koi bhi topic…"
                style={{
                  flex: 1,
                  background: "#0e0e18",
                  border: "1.5px solid #2a2a3d",
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  color: "#e8e8f2",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a3d")}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={generateMindmap}
                disabled={!activeTopic || loading}
                style={{
                  padding: "13px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: activeTopic && !loading ? "linear-gradient(135deg,#38bdf8,#818cf8)" : "#1e1e2e",
                  color: activeTopic && !loading ? "#0a0a0f" : "#6b6b85",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: activeTopic && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Generating…" : "Generate Mindmap →"}
              </button>
              <button
                onClick={restart}
                style={{
                  padding: "13px 20px",
                  borderRadius: 12,
                  border: "1.5px solid #2a2a3d",
                  background: "transparent",
                  color: "#a0a0b8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                ← Back
              </button>
            </div>
          </Card>
        )}

        {/* ── STEP 3: Mindmap ── */}
        {step === 3 && (
          <Card>
            <CardLabel>Step 03 — Your Mindmap</CardLabel>

            {/* Topic pill */}
            {(selected || customTopic) && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(56,189,248,0.1)", border: "1px solid #38bdf840",
                borderRadius: 100, padding: "6px 14px", marginBottom: 20,
                fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#38bdf8",
              }}>
                🧠 {selected || customTopic}
              </div>
            )}

            {loading && <Spinner />}

            {/* Mermaid output */}
            {mermaidSvg && (
              <div
                ref={mermaidRef}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: 24,
                  overflow: "auto",
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "fadeUp 0.5s ease forwards",
                }}
                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
              />
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={restart}
                style={{
                  padding: "13px 20px", borderRadius: 12,
                  border: "1.5px solid #2a2a3d", background: "transparent",
                  color: "#a0a0b8", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, cursor: "pointer",
                }}
              >
                ← Start Over
              </button>
              {mermaidSvg && (
                <button
                  onClick={downloadSVG}
                  style={{
                    padding: "13px 22px", borderRadius: 12,
                    border: "1.5px solid #38bdf860", background: "rgba(56,189,248,0.08)",
                    color: "#38bdf8", fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  ⬇ Download SVG
                </button>
              )}
              <button
                onClick={() => { setStep(2); setMermaidSvg(""); setMermaidCode(""); }}
                style={{
                  padding: "13px 22px", borderRadius: 12,
                  border: "1.5px solid #818cf860", background: "rgba(129,140,248,0.08)",
                  color: "#818cf8", fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}
              >
                ↺ Change Topic
              </button>
            </div>
          </Card>
        )}

        {/* Raw Mermaid Code (collapsed) */}
        {mermaidCode && step === 3 && (
          <details style={{ marginTop: 4 }}>
            <summary style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6b6b85",
              cursor: "pointer", userSelect: "none", letterSpacing: 1,
            }}>
              View raw Mermaid code
            </summary>
            <pre style={{
              background: "#0e0e18", border: "1px solid #1e1e2e", borderRadius: 12,
              padding: 20, marginTop: 10, fontSize: 12, color: "#a0a0b8",
              fontFamily: "'Space Mono', monospace", overflowX: "auto",
              lineHeight: 1.6,
            }}>
              {mermaidCode}
            </pre>
          </details>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28,
          background: "#13131e",
          border: `1px solid ${toast.type === "error" ? "#f87171" : toast.type === "success" ? "#34d399" : "#38bdf8"}`,
          color: toast.type === "error" ? "#f87171" : toast.type === "success" ? "#34d399" : "#38bdf8",
          borderRadius: 12, padding: "13px 20px",
          fontFamily: "'Space Mono', monospace", fontSize: 12,
          animation: "toastIn 0.3s ease",
          zIndex: 999, maxWidth: 320, lineHeight: 1.5,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}