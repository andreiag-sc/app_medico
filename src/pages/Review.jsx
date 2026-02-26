import React, { useState, useEffect } from "react";
import { Copy, Check, ShieldAlert } from "lucide-react";
import { SAMPLE_ORIGINAL } from "../data/mocks";

const ESTRUTURACAO_FIELDS = [
  { key: "queixa_principal", label: "Queixa Principal" },
  { key: "historia_molestia_atual", label: "Histórico da Moléstia Atual" },
  { key: "exame_fisico", label: "Exame Físico" },
  { key: "exames_complementares", label: "Exames Complementares" },
  { key: "conduta", label: "Conduta" },
];

const LGPD_STYLE = {
  red:    { border: "border-red-300",    bg: "bg-red-50",    badge: "bg-red-100 text-red-800",    icon: "text-red-500"    },
  orange: { border: "border-orange-300", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-800", icon: "text-orange-500" },
  green:  { border: "border-green-300",  bg: "bg-green-50",  badge: "bg-green-100 text-green-800",  icon: "text-green-500"  },
};

function normalizePayload(raw) {
  return raw?.data || raw || {};
}

function buildEditStateFromProcessed(raw) {
  const p = normalizePayload(raw);
  return {
    relato_anonimizado_completo: p?.relato_anonimizado_completo || "",
    estruturacao: {
      queixa_principal:        p?.estruturacao?.queixa_principal        || "",
      historia_molestia_atual: p?.estruturacao?.historia_molestia_atual || "",
      exame_fisico:            p?.estruturacao?.exame_fisico            || "",
      exames_complementares:   p?.estruturacao?.exames_complementares   || "",
      conduta:                 p?.estruturacao?.conduta                 || "",
    },
  };
}

function renderWithTagStyling(text) {
  const safeText = text || "";
  if (!safeText) return null;
  return safeText.split(/(\[.*?\])/g).filter(Boolean).map((part, index) => {
    if (/^\[.*\]$/.test(part)) {
      return (
        <span key={index} className="bg-blue-100 text-blue-800 font-semibold px-1 rounded-sm">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function RiscoLgpdCard({ risco }) {
  if (!risco?.nivel) return null;
  const cor = risco.cor || "green";
  const style = LGPD_STYLE[cor] || LGPD_STYLE.green;
  return (
    <div className={`border-t pt-4`}>
      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <ShieldAlert className={`w-4 h-4 ${style.icon}`} />
        Termômetro de Risco LGPD
      </h4>
      <div className={`border ${style.border} ${style.bg} rounded-xl p-4 space-y-2`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${style.badge}`}>
            {risco.nivel || "—"}
          </span>
          <span className="text-xs text-slate-500">
            {risco.entidades_contadas ?? 0} entidade(s) identificada(s)
          </span>
        </div>
        <p className="text-sm text-slate-700">{risco.mensagem || ""}</p>
      </div>
    </div>
  );
}

export default function Review({ original = SAMPLE_ORIGINAL, processed, onApprove, onEdit, onDiscard }) {
  const payload = normalizePayload(processed);
  console.log("JSON recebido no React:", payload);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingState, setEditingState] = useState(buildEditStateFromProcessed(payload));
  const [manualResult, setManualResult] = useState(null);

  useEffect(() => {
    setEditingState(buildEditStateFromProcessed(payload));
    setManualResult(null);
    setIsEditing(false);
  }, [processed]);

  function startEditing() {
    setEditingState(buildEditStateFromProcessed(payload));
    setIsEditing(true);
  }

  function concludeEditing() {
    setManualResult(editingState);
    setIsEditing(false);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function updateEditedRelato(value) {
    setEditingState((prev) => ({ ...prev, relato_anonimizado_completo: value || "" }));
  }

  function updateEditedEstruturacao(field, value) {
    setEditingState((prev) => ({
      ...prev,
      estruturacao: { ...prev?.estruturacao, [field]: value || "" },
    }));
  }

  function getReadOnlyData() {
    return manualResult || payload || {};
  }

  function renderReadOnlyContent() {
    const data = getReadOnlyData();
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Relato Anonimizado Completo</h4>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
            {renderWithTagStyling(data?.relato_anonimizado_completo || "")}
          </pre>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">Estruturação Clínica</h4>
          <div className="space-y-3 text-sm">
            {ESTRUTURACAO_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <span className="font-medium text-slate-600">{label}:</span>
                <p className="text-slate-700 mt-1">{data?.estruturacao?.[key] || ""}</p>
              </div>
            ))}
          </div>
        </div>

        <RiscoLgpdCard risco={payload?.risco_lgpd} />
      </div>
    );
  }

  function renderEditContent() {
    return (
      <div className="space-y-4 overflow-y-auto">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Relato Anonimizado Completo</h4>
          <textarea
            value={editingState?.relato_anonimizado_completo || ""}
            onChange={(e) => updateEditedRelato(e.target.value)}
            rows={6}
            className="w-full text-sm text-slate-700 p-3 rounded-lg border border-slate-300 bg-white resize-none"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">Estruturação Clínica</h4>
          <div className="space-y-3 text-sm">
            {ESTRUTURACAO_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="font-medium text-slate-600 block mb-1">{label}:</label>
                <textarea
                  value={editingState?.estruturacao?.[key] || ""}
                  onChange={(e) => updateEditedEstruturacao(key, e.target.value)}
                  rows={2}
                  className="w-full text-slate-700 p-2 rounded border border-slate-300 bg-white resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        <RiscoLgpdCard risco={payload?.risco_lgpd} />
      </div>
    );
  }

  function getApprovePayload() {
    const source = manualResult || payload;
    return {
      relato_anonimizado_completo: source?.relato_anonimizado_completo || "",
      estruturacao: {
        queixa_principal:        source?.estruturacao?.queixa_principal        || "",
        historia_molestia_atual: source?.estruturacao?.historia_molestia_atual || "",
        exame_fisico:            source?.estruturacao?.exame_fisico            || "",
        exames_complementares:   source?.estruturacao?.exames_complementares   || "",
        conduta:                 source?.estruturacao?.conduta                 || "",
      },
      entidades_removidas: payload?.entidades_removidas || [],
      risco_lgpd:          payload?.risco_lgpd          || {},
    };
  }

  async function handleCopy() {
    const text = isEditing
      ? editingState?.relato_anonimizado_completo || ""
      : getReadOnlyData()?.relato_anonimizado_completo || "";
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
        <div className="bg-gray-50 border p-4 rounded-lg overflow-y-auto h-[500px] relative">
          <h3 className="font-medium mb-2">Original</h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{original}</div>
        </div>

        <div className="bg-gray-50 border p-4 rounded-lg overflow-y-auto h-[500px] relative">
          <h3 className="font-medium mb-2">Processado</h3>
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 bg-white border rounded p-1 hover:bg-gray-50 shadow-sm transition ease-in-out duration-150"
            title="Copiar texto processado"
            aria-label="Copiar texto processado"
          >
            {copied
              ? <Check className="w-4 h-4 text-green-600 transition-opacity" />
              : <Copy className="w-4 h-4 text-slate-600 transition-opacity" />}
          </button>
          <div className="text-sm text-slate-700">
            {isEditing ? renderEditContent() : renderReadOnlyContent()}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onApprove && onApprove(getApprovePayload())}
          className="bg-sky-800 hover:bg-sky-900 text-white px-4 py-2 rounded-md"
        >
          Aprovar e Salvar
        </button>
        {isEditing ? (
          <>
            <button
              onClick={concludeEditing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
            >
              Concluir Edição
            </button>
            <button
              onClick={cancelEditing}
              className="bg-white text-slate-700 border border-gray-300 px-4 py-2 rounded-md"
            >
              Cancelar Edição
            </button>
          </>
        ) : (
          <button
            onClick={startEditing}
            className="bg-white text-slate-700 border border-gray-300 px-4 py-2 rounded-md"
          >
            Editar Manualmente
          </button>
        )}
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
