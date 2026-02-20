import React from "react";

export default function Card({ title, value, children }) {
  return (
    <div className="bg-slate-50 shadow-md rounded-xl p-6 border border-transparent">
      <h3 className="text-sm text-slate-500">{title}</h3>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-2xl font-semibold text-slate-800">{value}</div>
        {children}
      </div>
    </div>
  );
}

