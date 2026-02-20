import React from "react";
import { FilePlus, ClipboardList, Archive, Home } from "lucide-react";

export default function Sidebar({ current, setCurrent, onNavigate }) {
  const items = [
    { key: "overview", label: "Visão Geral", icon: Home },
    { key: "new", label: "Novo Caso", icon: FilePlus },
    { key: "history", label: "Histórico", icon: Archive },
    { key: "audit", label: "Auditoria", icon: ClipboardList },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Anonimização Médica</h1>
        <p className="text-sm text-slate-500">Protótipo — fluxo simulado</p>
      </div>

      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = current === it.key;
          return (
            <button
              key={it.key}
              onClick={() => {
                if (onNavigate) onNavigate(it.key);
                else setCurrent(it.key);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${
                active ? "bg-sky-100 text-sky-800 shadow-md" : "text-slate-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

