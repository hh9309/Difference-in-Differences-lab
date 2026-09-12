import React, { useState, useEffect, useRef } from "react";
import {
  Boxes,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Settings2,
} from "lucide-react";
import { SandboxConfig, PlaceboResult } from "../types";
import { generatePlaceboDistribution, computeDIDEstimator, generatePanelSeries } from "../utils/econometrics";

interface PlaceboLabProps {
  config: SandboxConfig;
}

export const PlaceboLab: React.FC<PlaceboLabProps> = ({ config }) => {
  const panel = generatePanelSeries(config);
  const { didEstimate } = computeDIDEstimator(panel);

  const [totalSimulations, setTotalSimulations] = useState<number>(500);
  const [simulationMode, setSimulationMode] = useState<"unit" | "time">("unit");

  // Placebo generation state
  const [placeboData, setPlaceboData] = useState(() =>
    generatePlaceboDistribution(didEstimate, totalSimulations)
  );

  // Animation playback state
  const [currentCount, setCurrentCount] = useState<number>(totalSimulations);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleStartSimulation = () => {
    // Re-generate
    const res = generatePlaceboDistribution(didEstimate, totalSimulations);
    setPlaceboData(res);
    setCurrentCount(0);
    setIsSimulating(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isSimulating) {
      timer = setInterval(() => {
        setCurrentCount((prev) => {
          if (prev >= totalSimulations) {
            setIsSimulating(false);
            return totalSimulations;
          }
          // Fast step accumulation
          return Math.min(totalSimulations, prev + 15);
        });
      }, 40);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, totalSimulations]);

  // When config's didEstimate changes, update placebo distribution
  useEffect(() => {
    setPlaceboData(generatePlaceboDistribution(didEstimate, totalSimulations));
    setCurrentCount(totalSimulations);
  }, [didEstimate, totalSimulations]);

  // Visual subset of runs
  const currentRuns = placeboData.runs.slice(0, currentCount);

  // Calculate current empirical p-value based on accumulated runs
  const currentExtremeCount = currentRuns.filter(
    (r) => Math.abs(r.estimate) >= Math.abs(didEstimate)
  ).length;
  const currentPVal = currentRuns.length > 0 ? (currentExtremeCount / currentRuns.length).toFixed(4) : "0.0000";

  // Coordinates for KDE Curve SVG
  const svgWidth = 820;
  const svgHeight = 360;
  const pad = { top: 40, right: 50, bottom: 50, left: 60 };

  const allX = placeboData.kdeCurve.map((d) => d.x);
  const minX = Math.min(-Math.abs(didEstimate) * 1.25, Math.min(...allX));
  const maxX = Math.max(Math.abs(didEstimate) * 1.25, Math.max(...allX));

  const maxDensity = Math.max(...placeboData.kdeCurve.map((d) => d.density)) * 1.15;

  const scaleX = (x: number) => {
    const usableW = svgWidth - pad.left - pad.right;
    return pad.left + ((x - minX) / (maxX - minX)) * usableW;
  };

  const scaleY = (d: number) => {
    const usableH = svgHeight - pad.top - pad.bottom;
    return svgHeight - pad.bottom - (d / (maxDensity || 1)) * usableH;
  };

  const zeroX = scaleX(0);
  const trueEstimateX = scaleX(didEstimate);

  // Build KDE path
  const kdePath = placeboData.kdeCurve
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${scaleX(pt.x)} ${scaleY(pt.density)}`)
    .join(" ");

  // Shaded KDE Area
  const kdeArea = `${kdePath} L ${scaleX(maxX)} ${scaleY(0)} L ${scaleX(minX)} ${scaleY(0)} Z`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 05
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                安慰剂检验 (Placebo Test) 2D 蒙特卡洛虚构演播
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              同屏进行 500 次随机虚构处理组或伪政策时点估计；动态平滑演播伪估计系数堆叠形成核密度 (KDE) 钟形曲线，闪烁高亮真实因果效应处于显著拒绝尾部。
            </p>
          </div>

          {/* Controls and trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setSimulationMode("unit")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  simulationMode === "unit"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                虚构处理组 (Unit)
              </button>
              <button
                onClick={() => setSimulationMode("time")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  simulationMode === "time"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                伪政策时点 (Time)
              </button>
            </div>

            <select
              aria-label="选择模拟置换次数"
              value={totalSimulations}
              onChange={(e) => setTotalSimulations(parseInt(e.target.value, 10))}
              className="bg-white text-xs text-slate-700 font-medium py-1 px-2.5 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="100">100 次迭代</option>
              <option value="250">250 次迭代</option>
              <option value="500">500 次迭代 (标准规范)</option>
            </select>

            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>演播中 ({currentCount}/{totalSimulations})</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>启动 {totalSimulations} 次蒙特卡洛演播</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2D Canvas Stage */}
        <div className="mt-5 bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
          {/* Header Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-2 text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-teal-500/20 border border-teal-400 rounded-xs"></span>
                <span className="text-teal-200">虚构估计值核密度曲线 (KDE)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="text-slate-300">500 次置换抽样离散散点</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-b-2 border-rose-500"></span>
                <span className="text-rose-300 font-bold">真实估计值 δ̂ ({didEstimate})</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-slate-400">已累积置换:</span>
              <span className="text-teal-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                {currentCount} / {totalSimulations} 次
              </span>
            </div>
          </div>

          {/* SVG Canvas for KDE & Placebo Points */}
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              <defs>
                <linearGradient id="kdeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.05" />
                </linearGradient>

                <filter id="rejectionGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Zero Reference Line */}
              <line
                x1={zeroX}
                y1={pad.top}
                x2={zeroX}
                y2={svgHeight - pad.bottom}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={zeroX}
                y={pad.top - 8}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                0 (无效应中心)
              </text>

              {/* Shaded KDE Distribution Area */}
              {currentCount > 50 && (
                <path d={kdeArea} fill="url(#kdeGrad)" className="transition-all duration-300" />
              )}

              {/* KDE Outline Curve */}
              {currentCount > 50 && (
                <path
                  d={kdePath}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
              )}

              {/* Individual Pseudo Sample Points Stacking near bottom */}
              {currentRuns.map((r, idx) => {
                const px = scaleX(r.estimate);
                // pseudo stacking height
                const py = svgHeight - pad.bottom - 12 - (idx % 8) * 6;
                return (
                  <circle
                    key={r.iteration}
                    cx={px}
                    cy={py}
                    r="2.5"
                    fill="#94a3b8"
                    opacity="0.4"
                  />
                );
              })}

              {/* True Estimate Highlight Vertical Line & Flashing Rejection Tag */}
              <g>
                <line
                  x1={trueEstimateX}
                  y1={pad.top}
                  x2={trueEstimateX}
                  y2={svgHeight - pad.bottom}
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  filter="url(#rejectionGlow)"
                />
                <circle
                  cx={trueEstimateX}
                  cy={scaleY(0) - 20}
                  r="6"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                <rect
                  x={trueEstimateX - 52}
                  y={pad.top - 26}
                  width="104"
                  height="22"
                  rx="4"
                  fill="#be123c"
                />
                <text
                  x={trueEstimateX}
                  y={pad.top - 12}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  真实值 δ̂={didEstimate}
                </text>
              </g>

              {/* X Axis & Scale ticks */}
              {[-6, -4, -2, 0, 2, 4, 6].filter(v => v >= minX && v <= maxX).map((val) => {
                const xPos = scaleX(val);
                return (
                  <g key={val}>
                    <line
                      x1={xPos}
                      y1={svgHeight - pad.bottom}
                      x2={xPos}
                      y2={svgHeight - pad.bottom + 6}
                      stroke="#475569"
                    />
                    <text
                      x={xPos}
                      y={svgHeight - pad.bottom + 20}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Statistical Evaluation Metrics Slice */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">虚构伪估计均值 (μ_pseudo)</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              {placeboData.meanPseudo}
            </span>
            <span className="text-[10px] text-slate-400">高度趋近于 0，符合正态原假设</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">虚构分布离散度 (σ_pseudo)</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              {placeboData.sdPseudo}
            </span>
            <span className="text-[10px] text-slate-400">测度了系统随机抽样波动标准差</span>
          </div>

          <div className="bg-teal-50 p-3.5 rounded-lg border border-teal-200">
            <span className="text-[11px] text-teal-800 font-medium block">真实因果估计量 (True δ̂)</span>
            <span className="text-base font-bold font-mono text-teal-950 mt-1 block">
              {didEstimate > 0 ? `+${didEstimate}` : didEstimate}
            </span>
            <span className="text-[10px] text-teal-700 font-semibold">位于极端拒绝域</span>
          </div>

          <div className={`p-3.5 rounded-lg border ${
            parseFloat(currentPVal) < 0.05
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            <span className="text-[11px] font-medium block">经验统计 p 值 (Empirical p-val)</span>
            <span className="text-base font-bold font-mono mt-1 block">
              p = {currentPVal}
            </span>
            <span className="text-[10px] font-semibold">
              {parseFloat(currentPVal) < 0.05 ? "✓ 显著通过安慰剂检验" : "⚠ 存在随机偶发风险"}
            </span>
          </div>
        </div>

        {/* Economic Intuition Slice */}
        <div className="mt-4 p-4 bg-slate-50/70 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">安慰剂检验学术逻辑：</strong>
          通过 500 次在样本池中纯随机洗牌（抽取伪处理组名单），若估计出的伪系数呈现以 0 为中心的对称正态分布，且真实估计值位于该分布的拒绝尾部（经验 p-value &lt; 0.05），即可排除由于遗漏变量或随机构建带来的虚假显著性，证实政策处理效应具有强烈的因果独立性。
        </div>
      </div>
    </div>
  );
};
