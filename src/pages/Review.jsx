import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SAMPLE_ORIGINAL } from "../data/mocks";

export default function Review({ original = SAMPLE_ORIGINAL, processed, onApprove, onEdit }) {
  const [copied, setCopied] = useState(false);
  const sensitiveMap = {
    "Maria Aparecida dos Santos": "[PACIENTE]",
    "58 anos": "[IDADE]",
    "CPF 123.456.789-00": "[CPF]",
    "Rua das Flores, nº 245, bairro Jardim São Luiz, Campinas – SP": "[ENDEREÇO]",
    "telefone (19) 99876-5432": "[TELEFONE]",
    "Hospital Municipal Dr. Mário Gatti": "[INSTITUIÇÃO]",
    "HG-2025-009874": "[MATRÍCULA]",
    "Dra. Ana Paula Ribeiro": "[MÉDICA]",
    "CRM-SP 123456": "[CRM]",
  };

  const sensitiveTerms = Object.keys(sensitiveMap);

  function escapeRegex(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  const regex = new RegExp(`(${sensitiveTerms.map(escapeRegex).join("|")})`, "g");

  function renderWithHighlights(text) {
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (sensitiveTerms.includes(part)) {
        return (
          <span key={i} className="bg-red-100 text-red-800 px-1 rounded-sm">
            {part}
            {" "}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  function renderProcessedSection() {
    // Build structured sections by replacing sensitive terms with tags (plain [TAG] markers)
    const replace = (str) => str.replace(regex, (m) => `${sensitiveMap[m]}`);

    // Extract relevant clauses from original for coherence (mocked parsing)
    const lines = original.split("\n").map((l) => l.trim());
    // Simple mapping to sections (these depend on the SAMPLE_ORIGINAL format)
    const queixa = lines.find((l) => l.toLowerCase().startsWith("queixa principal")) || "";
    const historia = lines.find((l) => l.toLowerCase().startsWith("história da moléstia atual") || l.toLowerCase().startsWith("historia da moléstia atual")) || "";
    const exame = lines.find((l) => l.toLowerCase().startsWith("exame físico") || l.toLowerCase().startsWith("exame físico/oftalmológico")) || lines.find((l)=>l.toLowerCase().startsWith("exame físico/oftalmológico")) || "";
    const conduta = lines.find((l) => l.toLowerCase().startsWith("conduta")) || "";

    // Fallback: use portions of original when headers not matched
    const fallbackQueixa = queixa || lines.slice(0,1).join(" ");
    const fallbackHistoria = historia || lines.slice(1,3).join(" ");
    const fallbackExame = exame || lines.slice(3,5).join(" ");
    const fallbackConduta = conduta || lines.slice(5).join(" ");

    const qText = replace(fallbackQueixa.replace(/^queixa principal:\s*/i, ""));
    const hText = replace(fallbackHistoria.replace(/^hist(oría|oria) da moléstia atual:\s*/i, ""));
    const eText = replace(fallbackExame.replace(/^exame físico(:|\/).*?/i, ""));
    const cText = replace(fallbackConduta.replace(/^conduta:\s*/i, ""));

    // Convert [TAG] markers into styled JSX (bold + light blue background)
    function boldify(str) {
      const parts = str.split(/(\[.*?\])/g).filter(Boolean);
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
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Queixa Principal</h4>
          <p className="leading-relaxed text-sm text-slate-700">{boldify(qText)}</p>
        </div>
        <div>
          <h4 className="font-semibold">Histórico da Moléstia Atual</h4>
          <p className="leading-relaxed text-sm text-slate-700">{boldify(hText)}</p>
        </div>
        <div>
          <h4 className="font-semibold">Exame Físico</h4>
          <p className="leading-relaxed text-sm text-slate-700">{boldify(eText)}</p>
        </div>
        <div>
          <h4 className="font-semibold">Conduta</h4>
          <p className="leading-relaxed text-sm text-slate-700">{boldify(cText)}</p>
        </div>
      </div>
    );
  }

  function buildProcessedPlainText() {
    // similar to renderProcessedSection but returns plain text with tags
    const replace = (str) => str.replace(regex, (m) => `${sensitiveMap[m]}`);
    const lines = original.split("\n").map((l) => l.trim());
    const queixa = lines.find((l) => l.toLowerCase().startsWith("queixa principal")) || "";
    const historia = lines.find((l) => l.toLowerCase().startsWith("história da moléstia atual") || l.toLowerCase().startsWith("historia da moléstia atual")) || "";
    const exame = lines.find((l) => l.toLowerCase().startsWith("exame físico") || l.toLowerCase().startsWith("exame físico/oftalmológico")) || lines.find((l)=>l.toLowerCase().startsWith("exame físico/oftalmológico")) || "";
    const conduta = lines.find((l) => l.toLowerCase().startsWith("conduta")) || "";
    const fallbackQueixa = queixa || lines.slice(0,1).join(" ");
    const fallbackHistoria = historia || lines.slice(1,3).join(" ");
    const fallbackExame = exame || lines.slice(3,5).join(" ");
    const fallbackConduta = conduta || lines.slice(5).join(" ");
    const qText = replace(fallbackQueixa.replace(/^queixa principal:\s*/i, ""));
    const hText = replace(fallbackHistoria.replace(/^hist(oría|oria) da moléstia atual:\s*/i, ""));
    const eText = replace(fallbackExame.replace(/^exame físico(:|\/).*?/i, ""));
    const cText = replace(fallbackConduta.replace(/^conduta:\s*/i, ""));
    return [
      "Queixa Principal: " + qText,
      "Histórico da Moléstia Atual: " + hText,
      "Exame Físico: " + eText,
      "Conduta: " + cText,
    ].join("\n\n");
  }

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
            {renderWithHighlights(original)}
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
            const plain = buildProcessedPlainText();
            if (onApprove) onApprove(plain);
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

