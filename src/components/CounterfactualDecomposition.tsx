import React, { useState } from "react";
import {
  Split,
  Layers,
  HelpCircle,
  TrendingUp,
  Percent,
  Compass,
} from "lucide-react";
import { SandboxConfig } from "../types";
import { generatePanelSeries, computeDIDEstimator } from "../utils/econometrics";

interface CounterfactualDecompositionProps {
  config: SandboxConfig;
}

export const CounterfactualDecomposition: React.FC<CounterfactualDecompositionProps> = ({
  config,
}) => {
  const panelSeries = generatePanelSeries(config);
  const metrics = computeDIDEstimator(panelSeries);

  // Selected decomposition element highlight
  const [activeSlice, setActiveSlice] = useState<"all" | "selection" | "trend" | "causal">("all");

  const totalObserved = metrics.yT_Post;
  const baselineControl = metrics.yC_Pre;
  const selectionBias = metrics.selectionBias;
  const timeTrend = metrics.timeTrend;
  const netCausal = metrics.netCausalEffect;

  // Percentage shares relative to baseline
  const absTotalChanges = Math.abs(selectionBias) + Math.abs(timeTrend) + Math.abs(netCausal);
  const shareSelection = ((Math.abs(selectionBias) / (absTotalChanges || 1)) * 100).toFixed(1);
  const shareTrend = ((Math.abs(timeTrend) / (absTotalChanges || 1)) * 100).toFixed(1);
  const shareCausal = ((Math.abs(netCausal) / (absTotalChanges || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 03
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                2D 反事实演播与因果切片分解 (Counterfactual Decomposition)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              将处理组受政策干预后的最终观测均值 Ȳ<sub>T,Post</sub> 纵向剖离为固有选择偏倚、宏观共同时间趋势与政策净因果效应三大切片。
            </p>
          </div>

          {/* Slice Selector Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setActiveSlice("all")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSlice === "all"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              全部切片总览
            </button>
            <button
              onClick={() => setActiveSlice("selection")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSlice === "selection"
                  ? "bg-amber-100 text-amber-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ① 初始选择偏误
            </button>
            <button
              onClick={() => setActiveSlice("trend")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSlice === "trend"
                  ? "bg-blue-100 text-blue-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ② 宏观时间趋势
            </button>
            <button
              onClick={() => setActiveSlice("causal")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSlice === "causal"
                  ? "bg-teal-700 text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ③ 净因果效应 δ
            </button>
          </div>
        </div>

        {/* Visual Stack Decomposition Stage */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliced Stack Bar Diagram */}
          <div className="lg:col-span-7 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>反事实三层切片剖析图</span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">
                目标观测值 Ȳ<sub>T,Post</sub> = {totalObserved}
              </span>
            </h3>

            {/* Stacked Vertical Visualization Bar */}
            <div className="space-y-4">
              <div className="relative w-full h-14 rounded-lg overflow-hidden flex border border-slate-300 shadow-xs">
                {/* 1. Base Control Level */}
                <div
                  style={{ width: "30%" }}
                  className="bg-slate-300 h-full flex flex-col justify-center items-center text-[10px] font-bold text-slate-700 border-r border-slate-400"
                  title="对照组基期水平"
                >
                  <span>对照基期</span>
                  <span className="font-mono">{baselineControl}</span>
                </div>

                {/* 2. Selection Bias */}
                <div
                  style={{ width: "22%" }}
                  className={`h-full flex flex-col justify-center items-center text-[10px] font-bold transition-all border-r border-amber-300 ${
                    activeSlice === "selection" || activeSlice === "all"
                      ? "bg-amber-300 text-amber-950 scale-y-105 shadow-xs"
                      : "bg-amber-100/70 text-amber-800 opacity-60"
                  }`}
                  title="初始选择偏误"
                >
                  <span>选择偏误</span>
                  <span className="font-mono">{selectionBias > 0 ? `+${selectionBias}` : selectionBias}</span>
                </div>

                {/* 3. Common Time Trend */}
                <div
                  style={{ width: "24%" }}
                  className={`h-full flex flex-col justify-center items-center text-[10px] font-bold transition-all border-r border-blue-300 ${
                    activeSlice === "trend" || activeSlice === "all"
                      ? "bg-blue-300 text-blue-950 scale-y-105 shadow-xs"
                      : "bg-blue-100/70 text-blue-800 opacity-60"
                  }`}
                  title="共同时间趋势"
                >
                  <span>时间趋势</span>
                  <span className="font-mono">{timeTrend > 0 ? `+${timeTrend}` : timeTrend}</span>
                </div>

                {/* 4. Net Causal Effect */}
                <div
                  style={{ width: "24%" }}
                  className={`h-full flex flex-col justify-center items-center text-[10px] font-bold transition-all ${
                    activeSlice === "causal" || activeSlice === "all"
                      ? "bg-teal-600 text-white scale-y-105 shadow-md"
                      : "bg-teal-200 text-teal-900 opacity-60"
                  }`}
                  title="净因果效应"
                >
                  <span>净因果 δ</span>
                  <span className="font-mono">{netCausal > 0 ? `+${netCausal}` : netCausal}</span>
                </div>
              </div>

              {/* Formula String Slicing */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 font-mono text-xs text-center text-slate-800 shadow-2xs leading-relaxed">
                <span className="font-bold text-slate-900">Ȳ<sub>T,Post</sub></span> ={" "}
                <span className="text-slate-600">Ȳ<sub>C,Pre</sub> ({baselineControl})</span> +{" "}
                <span className="bg-amber-50 text-amber-900 px-1 py-0.5 rounded border border-amber-200">
                  选择偏误 ({selectionBias > 0 ? `+${selectionBias}` : selectionBias})
                </span>{" "}
                +{" "}
                <span className="bg-blue-50 text-blue-900 px-1 py-0.5 rounded border border-blue-200">
                  时间趋势 ({timeTrend > 0 ? `+${timeTrend}` : timeTrend})
                </span>{" "}
                +{" "}
                <span className="bg-teal-50 text-teal-900 font-bold px-1.5 py-0.5 rounded border border-teal-300">
                  净因果 δ ({netCausal > 0 ? `+${netCausal}` : netCausal})
                </span>
              </div>
            </div>

            {/* Counterfactual Contrast Details */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>反事实水平 Ȳ<sub>T,Post</sub>(0) [假定未受政策]:</span>
                <span className="font-mono text-amber-800">
                  {(baselineControl + selectionBias + timeTrend).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>实际观测水平 Ȳ<sub>T,Post</sub>(1) [实际受政策]:</span>
                <span className="font-mono text-teal-900 font-bold">
                  {totalObserved}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-bold text-teal-950">
                <span>反事实真实落差 (Net Gain):</span>
                <span className="font-mono text-teal-700">
                  {netCausal > 0 ? `+${netCausal}` : netCausal}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Slice Breakdown Cards */}
          <div className="lg:col-span-5 space-y-3">
            {/* Slice 1 */}
            <div
              onClick={() => setActiveSlice("selection")}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                activeSlice === "selection"
                  ? "bg-amber-50 border-amber-300 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>分量 ①：初始选择偏倚 (Selection Bias)</span>
                </span>
                <span className="font-mono font-bold text-amber-950 text-xs">
                  {selectionBias > 0 ? `+${selectionBias}` : selectionBias}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                测度了处理组与对照组在政策实施前的初始禀赋差异（Ȳ<sub>T,Pre</sub> - Ȳ<sub>C,Pre</sub>）。双重差分通过求差将其完美剔除。
              </p>
            </div>

            {/* Slice 2 */}
            <div
              onClick={() => setActiveSlice("trend")}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                activeSlice === "trend"
                  ? "bg-blue-50 border-blue-300 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>分量 ②：宏观共同时间趋势 (Macro Trend)</span>
                </span>
                <span className="font-mono font-bold text-blue-950 text-xs">
                  {timeTrend > 0 ? `+${timeTrend}` : timeTrend}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                测度了所有样本共同经历的自然时间演变（Ȳ<sub>C,Post</sub> - Ȳ<sub>C,Pre</sub>，如通货膨胀、宏观经济周期）。
              </p>
            </div>

            {/* Slice 3 */}
            <div
              onClick={() => setActiveSlice("causal")}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                activeSlice === "causal"
                  ? "bg-teal-50 border-teal-300 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span>分量 ③：净因果冲击效应 (Net Treatment Effect)</span>
                </span>
                <span className="font-mono font-bold text-teal-950 text-xs">
                  {netCausal > 0 ? `+${netCausal}` : netCausal}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                排除固有禀赋差异与宏观周期后，归属于政策制度干预本身的纯粹因果效应 δ。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
