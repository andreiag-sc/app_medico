import React, { useState } from "react";
import Spinner from "../components/Spinner";

export default function NewCase({ onProcess, initialText }) {
  const [text, setText] = useState(initialText || "");
  const [focus, setFocus] = useState("Educação/Discussão");
  const [loading, setLoading] = useState(false);

  function handleProcess() {
    setLoading(true);
    const delay = 2200 + Math.floor(Math.random() * 800);
    setTimeout(() => {
      setLoading(false);
      onProcess({ text, focus });
    }, delay);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Novo Caso</h2>
      <div className="space-y-4">
        <label className="block text-sm text-slate-600">Relato do caso clínico</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Cole aqui o relato do caso..."
          className="w-full border rounded-md p-3 bg-white text-slate-800"
        />

        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-600">Foco:</label>
          <select value={focus} onChange={(e) => setFocus(e.target.value)} className="border rounded-md p-2">
            <option>Educação/Discussão</option>
            <option>Inteligência de Mercado</option>
          </select>
        </div>

        <div>
          <button
            onClick={handleProcess}
            className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
            disabled={loading}
          >
            {loading ? <span className="flex items-center gap-2"><Spinner />Processando...</span> : "Processar Texto"}
          </button>
        </div>
      </div>
    </div>
  );
}

