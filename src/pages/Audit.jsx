import React from "react";

export default function Audit({ lastAudit }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Auditoria</h2>
      <div className="bg-white border rounded-md p-4">
        <p className="text-sm text-slate-600 mb-4">Substituições detectadas no último caso processado:</p>
        {!lastAudit || !lastAudit.replacements || lastAudit.replacements.length === 0 ? (
          <div className="text-slate-500">Nenhuma substituição registrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Original</th>
                <th className="text-left p-2">Tag</th>
              </tr>
            </thead>
            <tbody>
              {lastAudit.replacements.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 align-top"><code className="text-xs bg-slate-100 px-2 py-1 rounded">{r.original}</code></td>
                  <td className="p-2 align-top">
                    {(() => {
                      const tag = r.tag;
                      const mapping = {
                        "[INSTITUICAO]": "bg-indigo-100 text-indigo-800",
                        "[LOCALIZACAO]": "bg-emerald-100 text-emerald-800",
                        "[DOCUMENTO]": "bg-rose-100 text-rose-800",
                        "[CONTATO]": "bg-amber-100 text-amber-800",
                        "[PACIENTE]": "bg-sky-100 text-sky-800",
                        "[EQUIPE_MEDICA]": "bg-purple-100 text-purple-800"
                      };
                      const cls = mapping[tag] || "bg-gray-100 text-slate-800";
                      return <span className={`${cls} px-2 py-1 rounded`}>{tag}</span>;
                    })()}
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

