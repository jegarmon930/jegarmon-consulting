// pages/index.js
import { useState, useEffect, useRef } from "react";
import { BRAND } from "../src/lib/constants";

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── CHAT API (calls our protected server-side route) ──────────────────────────
async function fetchReply(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error("Chat API error");
  const data = await res.json();
  return data.reply;
}

// ── LEAD API (saves to Airtable + triggers email & SMS) ───────────────────────
async function submitLead(lead) {
  try {
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch (e) {
    // Non-blocking — don't interrupt user flow
    console.error("Lead submission error:", e);
  }
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function Pill({ children }) {
  return (
    <span style={{
      padding: "3px 12px",
      background: "rgba(180,148,90,0.08)",
      border: "1px solid rgba(180,148,90,0.2)",
      borderRadius: "20px",
      fontSize: "11px",
      color: "#a8885a",
      display: "inline-block",
    }}>{children}</span>
  );
}

function ServiceCard({ service, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => onClick(service)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(180,148,90,0.13)" : "rgba(180,148,90,0.05)",
        border: `1px solid ${hov ? "rgba(180,148,90,0.5)" : "rgba(180,148,90,0.18)"}`,
        borderRadius: "8px",
        padding: "16px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s",
        width: "100%",
      }}
    >
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{service.icon}</div>
      <div style={{ color: "#d4b06a", fontSize: "13px", fontWeight: "700", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "5px" }}>
        {service.label}
      </div>
      <div style={{ color: "#5a5a4a", fontSize: "11.5px", lineHeight: "1.5" }}>{service.desc}</div>
    </button>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: "10px",
      marginBottom: "20px",
      alignItems: "flex-end",
    }}>
      {!isUser && (
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "linear-gradient(135deg, #b4945a, #7a5f30)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: "800", fontSize: "14px",
          fontFamily: "'Playfair Display', Georgia, serif",
          flexShrink: 0,
        }}>J</div>
      )}
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          background: isUser ? "linear-gradient(135deg, #b4945a, #8a6e3a)" : "rgba(255,255,255,0.038)",
          border: isUser ? "none" : "1px solid rgba(180,148,90,0.12)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "13px 17px",
          color: isUser ? "#fff" : "#c8c8b8",
          fontSize: "13.5px",
          lineHeight: "1.65",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        <span style={{ color: "#2e2e22", fontSize: "10px", marginTop: "4px" }}>{formatTime(msg.ts)}</span>
      </div>
    </div>
  );
}

function LeadForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim() && form.email.trim();

  const inp = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(180,148,90,0.18)",
    borderRadius: "7px",
    padding: "11px 15px",
    color: "#c8c8b8",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    marginBottom: "10px",
    transition: "border-color 0.2s",
  };

  return (
    <div>
      <p style={{ color: "#5a5a4a", fontSize: "12.5px", marginBottom: "18px", lineHeight: "1.6" }}>
        Let us know who we're speaking with to get started:
      </p>
      {[["name","Full Name","text",true],["company","Company / Organization","text",false],["email","Email Address","email",true],["phone","Phone (optional)","tel",false]].map(([k,ph,t,req]) => (
        <input key={k} type={t} placeholder={`${ph}${req ? " *" : ""}`} value={form[k]} onChange={set(k)}
          style={inp}
          onFocus={e => e.target.style.borderColor = "rgba(180,148,90,0.55)"}
          onBlur={e => e.target.style.borderColor = "rgba(180,148,90,0.18)"}
        />
      ))}
      <button
        onClick={() => valid && !loading && onSubmit(form)}
        disabled={!valid || loading}
        style={{
          width: "100%",
          padding: "13px",
          marginTop: "4px",
          background: valid && !loading ? "linear-gradient(135deg, #b4945a, #7a5f30)" : "rgba(180,148,90,0.08)",
          border: "1px solid rgba(180,148,90,0.25)",
          borderRadius: "7px",
          color: valid && !loading ? "#fff" : "#3a3a2a",
          fontSize: "13px",
          fontWeight: "700",
          cursor: valid && !loading ? "pointer" : "default",
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: "0.4px",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Starting…" : "Begin Consultation →"}
      </button>
      <p style={{ color: "#2a2a1a", fontSize: "10.5px", marginTop: "10px", textAlign: "center" }}>
        Your information is never sold or shared.
      </p>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState("chat");
  const [stage, setStage] = useState("home"); // home | chat
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const startChat = async (formData) => {
    setFormLoading(true);
    setLead(formData);

    // Fire lead to Airtable + Email + SMS (non-blocking)
    submitLead({ ...formData, notes: "Initial intake — conversation starting" });

    const welcome = {
      role: "assistant",
      content: `Welcome, ${formData.name}! I'm the consulting intake AI for JE Garmon Construction Management Consulting.\n\nWe specialize in federal construction quality control and compliance — QC Plans, AHAs, Three-Phase Control, RMS 3.0, EM 385-1-1, and full USACE/NAVFAC/AFCEC compliance support.\n\nTo get started:\n• What type of construction work is involved?\n• Is this a federal or DoD contract, and if so, which installation or agency?\n• What's your most pressing QC challenge right now?`,
      ts: Date.now(),
    };

    setMessages([welcome]);
    setSessions(s => [{ id: Date.now(), lead: formData, messages: [welcome], startedAt: Date.now() }, ...s]);
    setStage("chat");
    setFormLoading(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || aiLoading) return;
    const userMsg = { role: "user", content: text.trim(), ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setAiLoading(true);

    try {
      const apiMsgs = updated.map(m => ({ role: m.role, content: m.content }));
      const reply = await fetchReply(apiMsgs);
      const assistantMsg = { role: "assistant", content: reply, ts: Date.now() };
      const final = [...updated, assistantMsg];
      setMessages(final);
      setSessions(s => s.map((sess, i) => i === 0 ? { ...sess, messages: final } : sess));

      // Update Airtable with latest context after every few messages
      if (final.length % 4 === 0 && lead) {
        submitLead({
          ...lead,
          notes: `${final.length} messages exchanged. Latest: "${text.trim().slice(0, 200)}"`,
        });
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "I'm having a connection issue. Please try again in a moment.", ts: Date.now() }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleServiceClick = (service) => {
    if (stage !== "chat") { setTab("chat"); return; }
    sendMessage(service.prompt);
    setTab("chat");
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0a0a08; }
        #__next { height: 100%; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(180,148,90,0.18); border-radius: 2px; }
        textarea::placeholder, input::placeholder { color: #2e2e22; }
        @keyframes pulse { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.3); } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a08", fontFamily: "'Source Sans 3', sans-serif", color: "#c8c8b8" }}>

        {/* ── HEADER ── */}
        <header style={{
          borderBottom: "1px solid rgba(180,148,90,0.12)",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(10,10,8,0.97)",
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "8px",
              background: "linear-gradient(135deg, #b4945a 0%, #5a3e1a 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "17px", fontWeight: "700", color: "#fff",
            }}>JG</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#d4b06a", fontFamily: "'Playfair Display', Georgia, serif" }}>
                JE Garmon CM Consulting
              </div>
              <div style={{ fontSize: "10px", color: "#3a3a2a", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                Federal Construction QC & Compliance
              </div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: "6px" }}>
            {[["chat","💬 Consult"],["services","🔧 Services"],["dashboard","📊 Dashboard"]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: "7px 15px", borderRadius: "20px", fontSize: "11.5px", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: "600",
                  background: tab === t ? "rgba(180,148,90,0.18)" : "transparent",
                  border: tab === t ? "1px solid rgba(180,148,90,0.4)" : "1px solid rgba(180,148,90,0.08)",
                  color: tab === t ? "#d4b06a" : "#3a3a2a",
                  transition: "all 0.18s",
                }}>{label}</button>
            ))}
          </nav>
        </header>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

          {/* SERVICES */}
          {tab === "services" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 40px" }}>
              <h2 style={{ color: "#d4b06a", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: "400", marginBottom: "6px" }}>
                Consulting Services
              </h2>
              <p style={{ color: "#3a3a2a", fontSize: "12.5px", marginBottom: "28px" }}>
                Click any service to route directly into an intake conversation
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px", marginBottom: "36px" }}>
                {BRAND.services.map(s => <ServiceCard key={s.id} service={s} onClick={handleServiceClick} />)}
              </div>
              <div style={{ background: "rgba(180,148,90,0.04)", border: "1px solid rgba(180,148,90,0.14)", borderRadius: "10px", padding: "22px 24px" }}>
                <h3 style={{ color: "#d4b06a", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "16px", fontWeight: "400", marginBottom: "14px" }}>
                  Principal Credentials
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                  {BRAND.certifications.map(c => <Pill key={c}>{c}</Pill>)}
                </div>
                <p style={{ color: "#3a3a2a", fontSize: "12px", lineHeight: "1.7" }}>
                  Serving USACE, NAVFAC, AFCEC, and DoD contractors across all military installations. 
                  Specializing in RMS 3.0, EM 385-1-1, UFGS, and UFC compliance since 2007.
                </p>
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 40px" }}>
              <h2 style={{ color: "#d4b06a", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: "400", marginBottom: "6px" }}>
                Lead Dashboard
              </h2>
              <p style={{ color: "#3a3a2a", fontSize: "12.5px", marginBottom: "8px" }}>
                All leads are automatically saved to Airtable and you're notified by email & SMS.
              </p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
                {[["📨","Email Alerts","Active"],["📱","SMS Alerts","Active"],["🗂️","Airtable Sync","Active"]].map(([icon,label,status]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(80,180,100,0.07)", border: "1px solid rgba(80,180,100,0.18)", borderRadius: "20px" }}>
                    <span>{icon}</span>
                    <span style={{ color: "#5ab870", fontSize: "11.5px", fontWeight: "600" }}>{label}</span>
                    <span style={{ color: "#2a6a38", fontSize: "10px" }}>{status}</span>
                  </div>
                ))}
              </div>

              {sessions.length === 0 ? (
                <div style={{ textAlign: "center", color: "#2a2a18", padding: "60px 20px" }}>
                  <div style={{ fontSize: "44px", marginBottom: "14px" }}>📭</div>
                  <div style={{ fontSize: "13px" }}>No sessions yet this browser session.</div>
                  <div style={{ fontSize: "11.5px", marginTop: "6px", color: "#1e1e12" }}>All leads are permanently stored in Airtable.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {sessions.map((sess, i) => (
                    <div key={sess.id}
                      onClick={() => { setMessages(sess.messages); setLead(sess.lead); setStage("chat"); setTab("chat"); }}
                      style={{
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(180,148,90,0.13)",
                        borderRadius: "8px", padding: "18px 22px", cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(180,148,90,0.35)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(180,148,90,0.13)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div>
                          <div style={{ color: "#d4b06a", fontSize: "15px", fontWeight: "600", fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {sess.lead.name}
                          </div>
                          <div style={{ color: "#3a3a2a", fontSize: "12px", marginTop: "2px" }}>
                            {sess.lead.company && `${sess.lead.company} · `}{sess.lead.email}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ padding: "3px 10px", background: "rgba(80,180,100,0.08)", border: "1px solid rgba(80,180,100,0.18)", borderRadius: "20px", fontSize: "10.5px", color: "#5ab870" }}>
                            Active
                          </span>
                          <span style={{ color: "#2a2a18", fontSize: "10.5px" }}>{sess.messages.length} msgs</span>
                        </div>
                      </div>
                      {sess.messages.length > 1 && (
                        <div style={{ color: "#2e2e22", fontSize: "11.5px", lineHeight: "1.5", borderTop: "1px solid rgba(180,148,90,0.07)", paddingTop: "10px" }}>
                          {sess.messages[sess.messages.length - 1].content.slice(0, 140)}…
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHAT */}
          {tab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* HOME / INTAKE */}
              {stage === "home" && (
                <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
                  <div style={{ width: "100%", maxWidth: "500px" }}>
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                      <div style={{ fontSize: "52px", marginBottom: "18px" }}>🏗️</div>
                      <h1 style={{ color: "#d4b06a", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: "400", lineHeight: "1.3", marginBottom: "12px" }}>
                        Federal Construction<br />QC & Compliance Consulting
                      </h1>
                      <p style={{ color: "#3a3a2a", fontSize: "13px", lineHeight: "1.7", maxWidth: "400px", margin: "0 auto 20px" }}>
                        Our AI consultant qualifies your project, scopes your needs, and delivers a proposal — 24/7, without James needing to be present.
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                        {BRAND.certifications.map(c => <Pill key={c}>{c}</Pill>)}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(180,148,90,0.15)", borderRadius: "12px", padding: "24px 26px" }}>
                      <LeadForm onSubmit={startChat} loading={formLoading} />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE CHAT */}
              {stage === "chat" && (
                <>
                  {/* Lead badge */}
                  <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(180,148,90,0.07)", background: "rgba(180,148,90,0.03)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, #b4945a, #5a3e1a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "13px", fontFamily: "'Playfair Display', serif", flexShrink: 0 }}>
                      {lead?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span style={{ color: "#d4b06a", fontSize: "13px", fontWeight: "600" }}>{lead?.name}</span>
                      {lead?.company && <span style={{ color: "#2e2e22", fontSize: "12px" }}> · {lead.company}</span>}
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#5ab870", animation: "pulse 2s infinite" }} />
                      <span style={{ color: "#3a5a3a", fontSize: "11px" }}>AI Consultant Active</span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 8px" }}>
                    {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {aiLoading && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "20px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #b4945a, #7a5f30)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: "800", fontFamily: "'Playfair Display', serif", flexShrink: 0 }}>J</div>
                        <div style={{ background: "rgba(255,255,255,0.038)", border: "1px solid rgba(180,148,90,0.12)", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", display: "flex", gap: "5px" }}>
                          {[0,1,2].map(i => (
                            <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#b4945a", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input bar */}
                  <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(180,148,90,0.08)", background: "rgba(10,10,8,0.9)" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                      <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Describe your project or ask about our services…"
                        rows={2}
                        style={{
                          flex: 1, background: "rgba(255,255,255,0.035)",
                          border: "1px solid rgba(180,148,90,0.18)", borderRadius: "10px",
                          padding: "12px 16px", color: "#c8c8b8", fontSize: "13px",
                          outline: "none", resize: "none", fontFamily: "inherit", lineHeight: "1.55",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "rgba(180,148,90,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(180,148,90,0.18)"}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || aiLoading}
                        style={{
                          padding: "13px 20px", borderRadius: "10px",
                          background: input.trim() && !aiLoading ? "linear-gradient(135deg, #b4945a, #7a5f30)" : "rgba(180,148,90,0.06)",
                          border: "1px solid rgba(180,148,90,0.18)",
                          color: input.trim() && !aiLoading ? "#fff" : "#2a2a18",
                          fontSize: "17px", cursor: input.trim() && !aiLoading ? "pointer" : "default",
                          transition: "all 0.2s", flexShrink: 0, height: "fit-content",
                        }}
                      >→</button>
                    </div>
                    <p style={{ color: "#1e1e12", fontSize: "10px", marginTop: "8px", textAlign: "center" }}>
                      AI-powered intake · Leads saved to Airtable · James notified by email & SMS · Enter to send
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
