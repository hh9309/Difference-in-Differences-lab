import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { ModuleSliceBar } from "./components/ModuleSliceBar";
import { TheoryAlgebra } from "./components/TheoryAlgebra";
import { ParallelSandbox2D } from "./components/ParallelSandbox2D";
import { CounterfactualDecomposition } from "./components/CounterfactualDecomposition";
import { EventStudyLab } from "./components/EventStudyLab";
import { PlaceboLab } from "./components/PlaceboLab";
import { CasesLibrary } from "./components/CasesLibrary";
import { CodeEngine } from "./components/CodeEngine";
import { AiAssistantModal } from "./components/AiAssistantModal";
import { WorkflowGuide } from "./components/WorkflowGuide";
import { DataAndReport } from "./components/DataAndReport";
import { KnowledgeGuidance } from "./components/KnowledgeGuidance";

import { LabModule, SandboxConfig, EmpiricalCase } from "./types";
import { EMPIRICAL_CASES } from "./data/cases";

const INITIAL_CONFIG: SandboxConfig = {
  startYear: 2010,
  totalPeriods: 10,
  shockPeriod: 2015,
  treatmentEffect: 4.8,
  shockPattern: "expanding",
  baseSlope: 0.8,
  interceptControl: 18.0,
  interceptTreatedDiff: 3.0,
  noiseLevel: 0.15,
  violatePreTrend: false,
  anticipationEffect: false,
};

export default function App() {
  const [activeModule, setActiveModule] = useState<LabModule>("sandbox");
  const [config, setConfig] = useState<SandboxConfig>(INITIAL_CONFIG);
  const [currentCaseId, setCurrentCaseId] = useState<string>("ets-pilot");
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Apply empirical case configuration to the sandbox
  const handleApplyCase = (caseItem: EmpiricalCase) => {
    setCurrentCaseId(caseItem.id);
    setConfig((prev) => ({
      ...prev,
      ...caseItem.parameters,
    }));
  };

  const handleResetParams = () => {
    setConfig(INITIAL_CONFIG);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header Navbar */}
      <Navbar
        currentCaseId={currentCaseId}
        onSelectCase={handleApplyCase}
        onOpenAi={() => setIsAiModalOpen(true)}
        onExportReport={() => setActiveModule("data-report")}
        onResetParams={handleResetParams}
      />

      {/* 10 Core Modules Segmented Slice Bar */}
      <ModuleSliceBar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === "theory" && <TheoryAlgebra />}

        {activeModule === "sandbox" && (
          <ParallelSandbox2D config={config} onChangeConfig={setConfig} />
        )}

        {activeModule === "counterfactual" && (
          <CounterfactualDecomposition config={config} />
        )}

        {activeModule === "event-study" && (
          <EventStudyLab config={config} onChangeConfig={setConfig} />
        )}

        {activeModule === "placebo" && <PlaceboLab config={config} />}

        {activeModule === "cases" && (
          <CasesLibrary
            currentCaseId={currentCaseId}
            onApplyCase={handleApplyCase}
            onNavigateToSandbox={() => setActiveModule("sandbox")}
          />
        )}

        {activeModule === "code" && <CodeEngine config={config} />}

        {activeModule === "ai-dialogue" && (
          <AiAssistantModal
            config={config}
            isOpen={true}
            isEmbedded={true}
          />
        )}

        {activeModule === "workflow" && (
          <WorkflowGuide onNavigateToModule={(mod) => setActiveModule(mod)} />
        )}

        {activeModule === "data-report" && (
          <DataAndReport
            config={config}
            currentCaseId={currentCaseId}
            onSelectCase={handleApplyCase}
          />
        )}

        {activeModule === "knowledge" && <KnowledgeGuidance />}
      </main>

      {/* Floating AI Diagnostic Modal when triggered from Navbar */}
      {isAiModalOpen && activeModule !== "ai-dialogue" && (
        <AiAssistantModal
          config={config}
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          isEmbedded={false}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 font-serif">
              双重差分与动态效应实验室
            </span>
            <span>·</span>
            <span>因果推断严密计算与交互演播平台</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>TWFE & Bacon Decomposition</span>
            <span>·</span>
            <span>Event Study CI</span>
            <span>·</span>
            <span>500-Run Placebo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
