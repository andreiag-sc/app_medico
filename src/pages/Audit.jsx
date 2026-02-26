import React from "react";
import { ShieldAlert } from "lucide-react";

const LGPD_STYLE = {
  red:    { border: "border-red-300",    bg: "bg-red-50",    badge: "bg-red-100 text-red-800",       icon: "text-red-500"    },
  orange: { border: "border-orange-300", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-800", icon: "text-orange-500" },
  green:  { border: "border-green-300",  bg: "bg-green-50",  badge: "bg-green-100 text-green-800",   icon: "text-green-500"  },
};

function tagStyle(tag) {
  const mapping = {
    "[INSTITUICAO]":  "bg-indigo-100 text-indigo-800",
    "[LOCALIZACAO]":  "bg-emerald-100 text-emerald-800",
    "[DOCUMENTO]":    "bg-rose-100 text-rose-800",
    "[CONTATO]":      "bg-amber-100 text-amber-800",
    "[PACIENTE]":     "bg-sky-100 text-sky-800",
    "[EQUIPE_MEDICA]":"bg-purple-100 text-purple-800",
    "[PROFISSAO]":    "bg-teal-100 text-teal-800",
  };
  return mapping[tag] || "bg-gray-100 text-slate-800";
}

export default function Audit({ processed }) {
  const payload = processed?.data || processed || {};

  const replacements = Array.isArray(payload?.entidades_removidas)
    ? payload.entidades_removidas.map((entity) => ({
        original: entity?.valor_original || "",
        tag:      entity?.tipo           || "",
      }))
    : [];

  const risco = payload?.risco_lgpd || null;
  const cor = risco?.cor || "green";
  const style = LGPD_STYLE[cor] || LGPD_STYLE.green;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Auditoria</h2>

      {/* Termômetro de Risco LGPD */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${style.icon}`} />
          Termômetro de Risco LGPD
        </h3>
        {risco ? (
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
        ) : (
          <p className="text-sm text-slate-400">Nenhum resultado de risco disponível.</p>
        )}
      </div>

      {/* Tabela de entidades removidas */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Entidades Removidas</h3>
        <p className="text-sm text-slate-500 mb-4">
          Dados pessoais substituídos por tags durante a anonimização:
        </p>
        {replacements.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhuma substituição registrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 font-medium text-slate-600">Valor Original</th>
                <th className="text-left p-2 font-medium text-slate-600">Tag LGPD</th>
              </tr>
            </thead>
            <tbody>
              {replacements.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 align-top">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">{r.original}</code>
                  </td>
                  <td className="p-2 align-top">
                    <span className={`${tagStyle(r.tag)} text-xs px-2 py-1 rounded font-medium`}>
                      {r.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
