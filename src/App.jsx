import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import NewCase from "./pages/NewCase";
import Review from "./pages/Review";
import History from "./pages/History";
import { MOCK_HISTORY } from "./data/mocks";

export default function App() {
  const [current, setCurrent] = useState("overview");
  const [currentText, setCurrentText] = useState("");
  const [currentFocus, setCurrentFocus] = useState("Educação/Discussão");
  const [processed, setProcessed] = useState(null);
  const STORAGE_KEY = "app_medico_history_v1";
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : MOCK_HISTORY;
    } catch (e) {
      return MOCK_HISTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      // ignore
    }
  }, [history]);

  function handleProcess({ text, focus }) {
    // Simula processamento e navega para revisão
    setCurrentText(text || "");
    setCurrentFocus(focus);
    setProcessed({ time: Date.now() });
    setCurrent("review");
  }

  function handleApprove(processedText) {
    // Salva resultado no histórico (persistente via localStorage)
    function extractFirstSentence(text) {
      if (!text) return "";
      // normalize whitespace
      const t = text.replace(/\s+/g, " ").trim();
      // find first sentence terminator
      const match = t.match(/(.*?[.?!])\s/);
      if (match && match[1]) return match[1].trim();
      // fallback: try until first period or 200 chars
      const idx = t.indexOf(".");
      if (idx > 0) return t.slice(0, idx + 1);
      return t.slice(0, 200);
    }

    const snippet =
      extractFirstSentence(currentText) || extractFirstSentence(processedText) || "Relato processado";
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      focus: currentFocus,
      summary: snippet,
      original: currentText,
      processed: processedText || ""
    };
    setHistory((prev) => [entry, ...prev]);
    setCurrent("overview");
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function handleEdit() {
    setCurrent("new");
  }

  function handleDiscard() {
    setCurrentText("");
    setProcessed(null);
    setCurrent("new");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar current={current} setCurrent={setCurrent} />
      <main className="flex-1">
        <header className="bg-white border-b p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Painel</h2>
            <div className="text-sm text-slate-500">Paleta: Saúde — azul, branco e cinza</div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {current === "overview" && <Overview />}
          {current === "new" && <NewCase onProcess={handleProcess} initialText={currentText} />}
          {current === "review" && (
            <Review
              original={currentText}
              processed={processed}
              onApprove={handleApprove}
              onEdit={handleEdit}
              onDiscard={handleDiscard}
            />
          )}
          {current === "history" && <History history={history} onClear={clearHistory} />}
        </div>
      </main>
    </div>
  );
}

