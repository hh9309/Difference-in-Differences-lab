import React from "react";
import {
  Activity,
  Bot,
  FileText,
  RotateCcw,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { EMPIRICAL_CASES } from "../data/cases";
import { EmpiricalCase } from "../types";

interface NavbarProps {
  currentCaseId: string;
  onSelectCase: (c: EmpiricalCase) => void;
  onOpenAi: () => void;
  onExportReport: () => void;
  onResetParams: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCaseId,
  onSelectCase,
  onOpenAi,
  onExportReport,
  onResetParams,
}) => {
  const currentCase = EMPIRICAL_CASES.find((c) => c.id === currentCaseId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-serif">
                双重差分与动态效应实验室
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-md">
                DID & Dynamic Lab
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              因果推断 · 反事实演播 · 事件研究检验 · 500次安慰剂 · 代码引擎
            </p>
          </div>
        </div>

        {/* Middle & Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Case quick-selector slice */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <span className="text-xs font-medium text-slate-600">案例库:</span>
            <select
              aria-label="选择实证案例"
              value={currentCaseId}
              onChange={(e) => {
                const found = EMPIRICAL_CASES.find((c) => c.id === e.target.value);
                if (found) onSelectCase(found);
              }}
              className="bg-white text-xs text-slate-800 font-medium py-1 px-2.5 rounded-md border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              {EMPIRICAL_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split("(")[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={onResetParams}
            title="重置参数为基准值"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* AI Diagnose button */}
          <button
            onClick={onOpenAi}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-all shadow-2xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">AI 计量诊断</span>
            <span className="sm:hidden">AI 诊断</span>
          </button>

          {/* Export report button */}
          <button
            onClick={onExportReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">导出实证报告</span>
            <span className="sm:hidden">报告</span>
          </button>
        </div>
      </div>
    </header>
  );
};
