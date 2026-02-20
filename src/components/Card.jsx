import React from "react";

export default function Card({ title, value, children }) {
  return (
    <div className="bg-white shadow-sm border p-4 rounded-lg">
      <h3 className="text-sm text-slate-500">{title}</h3>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-semibold text-slate-800">{value}</div>
        {children}
      </div>
    </div>
  );
}

