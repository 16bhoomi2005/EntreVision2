import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User, Sparkle } from "lucide-react";

const KNOWLEDGE_RESPONSES = [
  {
    keywords: ["pmfme", "subsidy", "35%", "grant", "funding", "assistance"],
    answer: "Under the PMFME scheme, Nagpur Mandarin is the notified ODOP commodity. Individual micro-enterprises receive a 35% credit-linked capital subsidy up to ₹10 Lakhs. The promoter contributes 10% equity, with the balance financed via a bank term loan."
  },
  {
    keywords: ["katol", "narkhed", "location", "best business"],
    answer: "Katol and Narkhed are high-density citrus production belts in Vidarbha. Top recommended opportunities include: 1) Disease-Free Citrus Mother Nursery (MIDH 50% subsidy), 2) Farm-gate Sorting & Shellac Waxing Packhouse, and 3) Cold-Pressed Citrus Peel Oil Extraction."
  },
  {
    keywords: ["cold storage", "storage", "kalamna", "infrastructure", "facility"],
    answer: "Major accredited cold chain facilities in Nagpur include: 1) Kailasya Agro Industries (Kalamna Yard, 5,000 MT), 2) Meghvya Cold Chain (Kamthi, 5,000 MT), and 3) Ras Frozen Foods IQF (Butibori MIDC, 3,500 MT). Optimal storage is 5°C–7°C with 90–95% RH."
  },
  {
    keywords: ["bahar", "season", "ambiya", "mrig", "harvest", "mandi"],
    answer: "Nagpur mandarin has two crops: 1) Ambiya Bahar (Flowering Jan–Feb, Harvest Sept–Dec, Mandi ₹25–₹45/kg) and 2) Mrig Bahar (Flowering June–July, Harvest Feb–April, Mandi ₹35–₹60/kg, 42% juice yield, premium export value)."
  },
  {
    keywords: ["nursery", "planting", "budwood", "rootstock", "ccri"],
    answer: "ICAR-CCRI recommends Rangpur Lime and Rough Lemon rootstocks budded with virus-free scions. Accredited mother nurseries receive up to 50% MIDH capital assistance."
  },
  {
    keywords: ["juice", "beverage", "processing", "peel", "rts"],
    answer: "ICAR-CCRI technology debitters juice using enzymatic debittering (limonin reduction). 1 MT fruit yields ~400 L juice, 50 kg essential oil, and 200 kg pectin-rich pomace. CapEx ranges from ₹8L to ₹45L, eligible for PMFME 35% subsidy."
  }
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! 🙏 I am your EntreVision AI Agro Advisor. Ask me anything about Nagpur orange business models, PMFME/MIDH subsidies, cold storage facilities, or mandi rates!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: "user", text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let matched = KNOWLEDGE_RESPONSES.find((item) =>
        item.keywords.some((kw) => lower.includes(kw))
      );

      let reply = matched
        ? matched.answer
        : "Based on ICAR-CCRI and MoFPI data, Nagpur mandarin enterprises range from ₹50,000 to ₹50 Lakhs CapEx. Explore our 4-step decision framework on the home page for tailored guidance.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 999 }}>
      {/* Floating HeroUI Glossy Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="cta"
          style={{
            borderRadius: "50%",
            width: 60,
            height: 60,
            boxShadow: "var(--accent-glow)",
            display: "grid",
            placeItems: "center",
            padding: 0,
          }}
          aria-label="Open Agro Advisor Chatbot"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Glossy Chat Modal */}
      {isOpen && (
        <div
          className="card"
          style={{
            width: 390,
            maxWidth: "calc(100vw - 32px)",
            height: 540,
            maxHeight: "calc(100vh - 48px)",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(99, 102, 241, 0.2)",
            border: "1px solid var(--line-glow)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "var(--accent-gradient)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "grid",
                  placeItems: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <strong style={{ fontSize: "1rem", display: "block", lineHeight: 1.2 }}>
                  EntreVision Advisor
                </strong>
                <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>Nagpur Citrus AI Grounded</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                zIndex: 1,
                transition: "background 0.2s ease",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "var(--panel-2)",
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 10,
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                {m.sender === "bot" && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--accent-gradient)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    <Bot size={15} />
                  </div>
                )}
                <div
                  style={{
                    background: m.sender === "user" ? "var(--accent-gradient)" : "var(--panel-solid)",
                    color: m.sender === "user" ? "#fff" : "var(--text)",
                    padding: "12px 16px",
                    borderRadius: 16,
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                    border: m.sender === "user" ? "none" : "1px solid var(--line)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", gap: 10, alignSelf: "flex-start" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--accent-gradient)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Bot size={15} />
                </div>
                <div
                  style={{
                    background: "var(--panel-solid)",
                    padding: "10px 14px",
                    borderRadius: 14,
                    fontSize: "0.82rem",
                    color: "var(--muted)",
                    border: "1px solid var(--line)",
                  }}
                >
                  Analyzing CCRI & scheme data...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div
            style={{
              padding: "8px 14px",
              background: "var(--panel)",
              borderTop: "1px solid var(--line)",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {[
              "PMFME 35% subsidy?",
              "Cold storage near Kalamna?",
              "Best business in Katol?",
              "Ambiya vs Mrig rates?",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: "var(--panel-2)",
                  color: "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: 12,
              background: "var(--panel-solid)",
              borderTop: "1px solid var(--line)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Ask a question about subsidies, crops..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "var(--panel-2)",
                color: "var(--text)",
                fontSize: "0.88rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="cta"
              style={{
                padding: "10px 16px",
                borderRadius: 12,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
