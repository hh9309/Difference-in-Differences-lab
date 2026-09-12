import React, { useState } from "react";
import {
  Library,
  ArrowRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { EMPIRICAL_CASES } from "../data/cases";
import { EmpiricalCase, SandboxConfig } from "../types";

interface CasesLibraryProps {
  currentCaseId: string;
  onApplyCase: (caseItem: EmpiricalCase) => void;
  onNavigateToSandbox: () => void;
}

export const CasesLibrary: React.FC<CasesLibraryProps> = ({
  currentCaseId,
  onApplyCase,
  onNavigateToSandbox,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(currentCaseId);
  const activeCase = EMPIRICAL_CASES.find((c) => c.id === selectedCaseId) || EMPIRICAL_CASES[0];

  const handleSelectAndApply = (c: EmpiricalCase) => {
    setSelectedCaseId(c.id);
    onApplyCase(c);
  };

  const handleApplyAndGo = (c: EmpiricalCase) => {
    onApplyCase(c);
    onNavigateToSandbox();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 06
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                六大经典双重差分应用案例库 (Classic Empirical Cases)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              覆盖劳动经济学、碳交易多期交错试点、自贸区制度创新、环境规制两控区、专精特新研发补贴及营改增税制改革，支持一键载入沙盒实证参数。
            </p>
          </div>
        </div>

        {/* 6 Cases Grid Selector Slices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {EMPIRICAL_CASES.map((c, idx) => {
            const isSelected = c.id === selectedCaseId;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectAndApply(c)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? "bg-teal-50/50 border-teal-600 shadow-sm ring-1 ring-teal-600"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      CASE 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                      {c.yearPublished} 年
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 font-serif">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {c.summary}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    冲击: {c.shockYear} 年
                  </span>
                  <span className="font-semibold text-teal-700 flex items-center space-x-1">
                    <span>{isSelected ? "已激活" : "点击查阅"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Case Deep Dive Detail Panel */}
        <div className="mt-6 bg-slate-50/90 rounded-xl p-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-700 text-white">
                  {activeCase.category}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  出处: {activeCase.authors} ({activeCase.yearPublished}), 《{activeCase.journal}》
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 font-serif">
                {activeCase.name}
              </h3>
            </div>

            <button
              onClick={() => handleApplyAndGo(activeCase)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs self-start lg:self-auto cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>一键载入该案例并跳转到 2D 平行沙盒演播</span>
            </button>
          </div>

          {/* Sliced Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium block">处理组 (Treated Unit)</span>
              <span className="text-xs font-semibold text-slate-800 mt-1 block">
                {activeCase.treatedUnit}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium block">对照组 (Control Unit)</span>
              <span className="text-xs font-semibold text-slate-800 mt-1 block">
                {activeCase.controlUnit}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium block">因果核心被解释变量 (Outcome)</span>
              <span className="text-xs font-semibold text-slate-800 mt-1 block">
                {activeCase.dependentVar}
              </span>
            </div>

            <div className="bg-teal-50 p-3.5 rounded-lg border border-teal-200">
              <span className="text-[11px] text-teal-800 font-medium block">论文核心因果效应估算值</span>
              <span className="text-xs font-bold text-teal-950 mt-1 block">
                {activeCase.estimatedEffect}
              </span>
            </div>
          </div>

          {/* Context and Intuition Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>制度准自然实验背景 (Policy Background)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {activeCase.policyContext}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>核心经济学直觉 (Economic Intuition)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {activeCase.economicIntuition}
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-2">计量经济学实证要点与启示：</h4>
            <div className="space-y-1.5 text-slate-600">
              {activeCase.keyTakeaways.map((point, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
