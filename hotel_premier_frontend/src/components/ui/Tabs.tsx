import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const Tabs = ({ tabs, defaultTab }: TabsProps) => {
  // Estado para saber cuál está activa
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full">
      {/* Barra de Pestañas */}
      <div className="flex border-b border-legacy-inputBorder">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-semibold rounded-t-lg border-t border-l border-r -mb-px transition-colors
                ${
                  isActive
                    ? "bg-white border-legacy-inputBorder text-legacy-text border-b-white z-10"
                    : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
        {/* Espacio vacío para completar la línea */}
        <div className="flex-1 border-b border-legacy-inputBorder"></div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="p-4 bg-white border border-t-0 border-legacy-inputBorder rounded-b-lg shadow-sm">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
};
