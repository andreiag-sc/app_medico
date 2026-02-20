import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { SAMPLE_ORIGINAL } from "../data/mocks";
import anonymize from "../utils/anonymize";

export default function Review({ original = SAMPLE_ORIGINAL, processed, onApprove, onEdit }) {
  const [copied, setCopied] = useState(false);
  // For this NER-style approach, we no longer highlight the original aggressively.
  // The anonymized, structured output is authoritative and appears in the "Processado" column.
  function renderOriginalPlain(text) {
    return <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{text}</div>;
  }

  function renderProcessedSection() {
    // Process the entire original as a single block and display anonymized text preserving structure.
    const result = processed && processed.text ? { text: processed.text, replacements: processed.replacements || [] } : anonymize(original || "");

    function renderWithTagStyling(text) {
      const parts = text.split(/(\[.*?\])/g).filter(Boolean);
      return parts.map((p, i) => {
        if (/^\[.*\]$/.test(p)) {
          return (
            <span key={i} className="bg-blue-100 text-blue-800 font-semibold px-1 rounded-sm">
              {p}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      });
    }

    return (
      <div>
        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{renderWithTagStyling(result.text)}</pre>
      </div>
    );
  }

  function buildProcessedPlainText() {
    // prefer processed prop if available
    if (processed && processed.text) return processed.text;
    // otherwise use shared anonymize util to produce plain processed text
    const lines = original.split("\n").map((l) => l.trim());

    function findSectionByHeadersLocal(headerRegexes) {
      for (let i = 0; i < lines.length; i++) {
        for (const hr of headerRegexes) {
          const regex = new RegExp(hr, "i");
          if (regex.test(lines[i])) {
            const collected = [];
            const after = lines[i].split(/[:\-]\s*/).slice(1).join(": ").trim();
            if (after) collected.push(after);
            for (let j = i + 1; j < lines.length; j++) {
              if (!lines[j]) break;
              if (/^(queixa principal|hist[oó]ria da mol[eé]stia atual|exame físico|ao exame|conduta)[:\s]/i.test(lines[j])) break;
              collected.push(lines[j]);
            }
            return collected.join(" ").trim();
          }
        }
      }
      return "";
    }

    const queixa = findSectionByHeadersLocal(["^queixa principal"]) || "";
    const historia = findSectionByHeadersLocal(["^hist[oó]ria da mol[eé]stia atual", "^historia da molestia atual"]) || "";
    const exame = findSectionByHeadersLocal(["^exame físico", "^exame físico\\/oftalmológico", "^ao exame"]) || "";
    const conduta = findSectionByHeadersLocal(["^conduta"]) || "";

    const fallbackQueixa = queixa || lines.slice(0, 1).join(" ");
    const fallbackHistoria = historia || lines.slice(1, 3).join(" ");
    const fallbackExame = exame || lines.slice(3, 5).join(" ");
    const fallbackConduta = conduta || lines.slice(5).join(" ");

    const qText = anonymize(fallbackQueixa.replace(/^queixa principal:\s*/i, "")).text;
    const hText = anonymize(fallbackHistoria.replace(/^hist(oría|oria) da moléstia atual:\s*/i, "")).text;
    const eText = anonymize((exame || fallbackExame).replace(/^exame físico(:|\/).*?/i, "")).text;
    const cText = anonymize(fallbackConduta.replace(/^conduta:\s*/i, "")).text;
    return [
      "Queixa Principal: " + qText,
      "Histórico da Moléstia Atual: " + hText,
      "Exame Físico: " + eText,
      "Conduta: " + cText,
    ].join("\n\n");
  }

  // expose replacements for parent via effect if processed present
  useEffect(() => {
    // no-op here; parent will manage audit data via App's anonymization
  }, []);

  async function handleCopy() {
    const text = buildProcessedPlainText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Revisão e Estruturação</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 border p-4 rounded-lg overflow-y-auto h-[450px] relative">
          <h3 className="font-medium mb-2">Original</h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {renderOriginalPlain(original)}
          </div>
        </div>

        <div className="bg-gray-50 border p-4 rounded-lg overflow-y-auto h-[450px] relative">
          <h3 className="font-medium mb-2">Processado</h3>
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 bg-white border rounded p-1 hover:bg-gray-50 shadow-sm transition ease-in-out duration-150"
            title="Copiar texto processado"
            aria-label="Copiar texto processado"
          >
            {copied ? <Check className="w-4 h-4 text-green-600 transition-opacity" /> : <Copy className="w-4 h-4 text-slate-600 transition-opacity" />}
          </button>
          <div className="text-sm text-slate-700">
            {processed ? (
              // prefer processed prop if provided by App (already anonymized)
              renderProcessedSection()
            ) : (
              <p className="text-slate-400">Nenhum resultado disponível.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            if (onApprove) {
              // pass processed object if available, otherwise produce anonymized text
              if (processed && processed.text) onApprove({ text: processed.text, replacements: processed.replacements || processed.entities || [] });
              else onApprove({ text: buildProcessedPlainText(), replacements: [] });
            }
          }}
          className="bg-sky-800 hover:bg-sky-900 text-white px-4 py-2 rounded-md"
        >
          Aprovar e Salvar
        </button>
        <button
          onClick={() => {
            alert("A edição manual será habilitada na integração com o backend.");
            if (onEdit) onEdit();
          }}
          className="bg-white text-slate-700 border border-gray-300 px-4 py-2 rounded-md"
        >
          Editar Manualmente
        </button>
        <button
          onClick={() => {
            if (typeof onDiscard === "function") onDiscard();
            else if (typeof onEdit === "function") onEdit();
          }}
          className="text-red-600 border border-transparent bg-transparent px-4 py-2 rounded-md"
        >
          Descartar Caso
        </button>
      </div>
    </div>
  );
}

