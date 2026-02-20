import React, { useState } from "react";
import { MOCK_HISTORY } from "../data/mocks";
import { Copy, Check, X } from "lucide-react";

export default function History({ history = MOCK_HISTORY, onClear }) {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleClear() {
    const ok = window.confirm("Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.");
    if (ok && onClear) onClear();
  }

  async function handleCopyProcessed(text) {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Histórico</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500">{history.length} itens</div>
          <button
            onClick={handleClear}
            className="text-sm bg-white border border-gray-300 text-slate-700 px-3 py-1 rounded-md hover:bg-gray-50"
          >
            Limpar histórico
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-md overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Foco</th>
              <th className="text-left p-3">Resumo</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr
                key={h.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelected(h)}
              >
                <td className="p-3 align-top">{h.date}</td>
                <td className="p-3 align-top">
                  <span className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 rounded">{h.focus}</span>
                </td>
                <td className="p-3">{h.summary}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  Nenhum item no histórico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-[90%] max-w-4xl rounded-md p-4 z-60 fade-in">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">Visualização do Caso</h3>
                <div className="text-sm text-slate-500">{selected.date} • <span className="font-medium">{selected.focus}</span></div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border p-4 rounded-lg h-[450px] overflow-y-auto">
                <h4 className="font-medium mb-2">Original</h4>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{selected.original || "—"}</pre>
              </div>

              <div className="bg-gray-50 border p-4 rounded-lg h-[450px] overflow-y-auto relative">
                <h4 className="font-medium mb-2">Processado</h4>
                <button
                  onClick={() => handleCopyProcessed(selected.processed)}
                  className="absolute top-4 right-4 bg-white border rounded p-1 hover:bg-gray-50 shadow-sm transition ease-in-out duration-150"
                  title="Copiar texto processado"
                  aria-label="Copiar texto processado"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600 transition-opacity" /> : <Copy className="w-4 h-4 text-slate-600 transition-opacity" />}
                </button>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{selected.processed || "—"}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

