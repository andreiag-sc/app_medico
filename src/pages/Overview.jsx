import React from "react";
import Card from "../components/Card";
import { SUMMARY, RECENT_ACTIVITIES } from "../data/mocks";
import { ClipboardList, Clock } from "lucide-react";

export default function Overview() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4">
        <Card title="Casos Processados" value={SUMMARY.casesProcessed}>
          <ClipboardList className="w-6 h-6 text-slate-400" />
        </Card>
        <Card title="Dados Sensíveis Protegidos" value={SUMMARY.sensitiveProtected}>
          <svg className="w-6 h-6 text-slate-400" />
        </Card>
        <Card title="Tempo Médio Economizado" value={SUMMARY.timeSaved}>
          <Clock className="w-6 h-6 text-slate-400" />
        </Card>
      </div>

      <section className="mt-6 bg-white border p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-slate-800">Atividades Recentes</h2>
        <ul className="mt-4 divide-y">
          {RECENT_ACTIVITIES.map((a) => (
            <li key={a.id} className="py-3 flex justify-between">
              <span className="text-sm text-slate-700">{a.text}</span>
              <span className="text-xs text-slate-400">{a.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

