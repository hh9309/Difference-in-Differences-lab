import React, { useState, useEffect } from "react";
import {
  LineChart,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { SandboxConfig, EventStudyCoefficient } from "../types";
import { computeEventStudyCoefficients } from "../utils/econometrics";

interface EventStudyLabProps {
  config: SandboxConfig;
  onChangeConfig: (newCfg: SandboxConfig) => void;
}

export const EventStudyLab: React.FC<EventStudyLabProps> = ({
  config,
  onChangeConfig,
}) => {
  const { coefficients, preTrendPValue, passedPreTrend } =
    computeEventStudyCoefficients(config);

  // Animation playback: index of current coefficient revealed
  const [revealedIndex, setRevealedIndex] = useState<number>(coefficients.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setRevealedIndex((prev) => {
          if (prev >= coefficients.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, coefficients.length]);

  const handlePlayToggle = () => {
    if (revealedIndex >= coefficients.length - 1) {
      setRevealedIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const visibleCoefficients = coefficients.slice(0, revealedIndex + 1);

  // Coordinate scales for Event Study Chart
  const svgWidth = 820;
  const svgHeight = 360;
  const pad = { top: 40, right: 40, bottom: 50, left: 60 };

  const allVals = coefficients.flatMap((c) => [c.ciLower, c.ciUpper, c.coef]);
  const minVal = Math.min(-2.5, Math.floor(Math.min(...allVals) - 1.5));
  const maxVal = Math.max(3.5, Math.ceil(Math.max(...allVals) + 1.5));

  const scaleX = (idx: number) => {
    const usableW = svgWidth - pad.left - pad.right;
    return pad.left + (idx / (coefficients.length - 1)) * usableW;
  };

  const scaleY = (v: number) => {
    const usableH = svgHeight - pad.top - pad.bottom;
    return svgHeight - pad.bottom - ((v - minVal) / (maxVal - minVal)) * usableH;
  };

  const zeroY = scaleY(0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 04
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                事件研究 (Event Study) 动态系数与置信区间演播
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              同屏绘制相对政策时间 k ∈ [-5, +4] 动态系数柱与 95% 置信区间；平滑演播政策前 k &lt; 0 平稳穿梭与政策后发散扩张。
            </p>
          </div>

          {/* Parallel Trend Joint Test Badge */}
          <div className="flex items-center space-x-2">
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center space-x-1.5 ${
                passedPreTrend
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {passedPreTrend ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <div>
                <span className="font-bold">事前联合检验 (Joint F-test):</span>
                <span className="font-mono ml-1 font-semibold">
                  p = {preTrendPValue} {passedPreTrend ? "(通过平行趋势)" : "(违背！)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Event Study Chart Canvas */}
        <div className="mt-5 bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
          {/* Header & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-2 text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                <span className="text-teal-200">点估计值 β̂<sub>k</sub></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-teal-400/60"></span>
                <span className="text-slate-300">95% 置信区间 (CI Whisker)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-slate-500"></span>
                <span className="text-slate-400">0 刻度线 (基准零线)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.2 bg-amber-900/80 text-amber-200 rounded text-[10px] font-mono">
                  k = -1 (参照期 ≡ 0)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayToggle}
                className="flex items-center space-x-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? "暂停" : "平滑演播"}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setRevealedIndex(coefficients.length - 1);
                }}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                title="全量展开"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Canvas for Event Study */}
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              {/* Y Grid lines */}
              {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].filter(v => v >= minVal && v <= maxVal).map((v) => {
                const yPos = scaleY(v);
                const isZero = v === 0;
                return (
                  <g key={v}>
                    <line
                      x1={pad.left}
                      y1={yPos}
                      x2={svgWidth - pad.right}
                      y2={yPos}
                      stroke={isZero ? "#94a3b8" : "#334155"}
                      strokeWidth={isZero ? "1.5" : "1"}
                      strokeDasharray={isZero ? "4 4" : "2 2"}
                      strokeOpacity={isZero ? "0.9" : "0.5"}
                    />
                    <text
                      x={pad.left - 10}
                      y={yPos + 4}
                      fill={isZero ? "#f8fafc" : "#94a3b8"}
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                      fontWeight={isZero ? "bold" : "normal"}
                    >
                      {v.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Policy Shock Vertical Separator at k = 0 */}
              {(() => {
                const k0Idx = coefficients.findIndex((c) => c.k === 0);
                if (k0Idx !== -1) {
                  const xSep = (scaleX(k0Idx - 1) + scaleX(k0Idx)) / 2;
                  return (
                    <g>
                      <line
                        x1={xSep}
                        y1={pad.top}
                        x2={xSep}
                        y2={svgHeight - pad.bottom}
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                      />
                      <rect
                        x={xSep - 35}
                        y={pad.top - 24}
                        width="70"
                        height="18"
                        rx="3"
                        fill="#b45309"
                      />
                      <text
                        x={xSep}
                        y={pad.top - 12}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        政策落地 (t₀)
                      </text>
                    </g>
                  );
                }
                return null;
              })()}

              {/* Connecting Line between estimated coefficients */}
              {visibleCoefficients.length > 1 && (
                <path
                  d={visibleCoefficients
                    .map((c, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(c.coef)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.2"
                  className="transition-all duration-300"
                />
              )}

              {/* Individual Coefficients and Confidence Error Bars */}
              {visibleCoefficients.map((c, i) => {
                const x = scaleX(i);
                const yCoef = scaleY(c.coef);
                const yLower = scaleY(c.ciLower);
                const yUpper = scaleY(c.ciUpper);
                const isPre = c.k < 0;
                const isBase = c.isBasePeriod;

                return (
                  <g key={c.k} className="transition-all duration-200">
                    {/* Vertical Error Bar (Whisker) */}
                    {!isBase && (
                      <>
                        <line
                          x1={x}
                          y1={yLower}
                          x2={x}
                          y2={yUpper}
                          stroke="#2dd4bf"
                          strokeWidth="2"
                          strokeOpacity="0.85"
                        />
                        {/* Top Whisker cap */}
                        <line
                          x1={x - 4}
                          y1={yUpper}
                          x2={x + 4}
                          y2={yUpper}
                          stroke="#2dd4bf"
                          strokeWidth="2"
                        />
                        {/* Bottom Whisker cap */}
                        <line
                          x1={x - 4}
                          y1={yLower}
                          x2={x + 4}
                          y2={yLower}
                          stroke="#2dd4bf"
                          strokeWidth="2"
                        />
                      </>
                    )}

                    {/* Point Marker */}
                    <circle
                      cx={x}
                      cy={yCoef}
                      r={isBase ? "5" : "5.5"}
                      fill={isBase ? "#f59e0b" : isPre ? "#38bdf8" : "#2dd4bf"}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-7 transition-all"
                    />

                    {/* Value label */}
                    <text
                      x={x}
                      y={yCoef - 12}
                      fill={isBase ? "#fbbf24" : isPre ? "#bae6fd" : "#5eead4"}
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {c.coef > 0 ? `+${c.coef}` : c.coef}
                    </text>

                    {/* X Axis Label */}
                    <text
                      x={x}
                      y={svgHeight - pad.bottom + 20}
                      fill={isBase ? "#fbbf24" : "#cbd5e1"}
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isBase ? "bold" : "normal"}
                    >
                      k={c.k >= 0 ? `+${c.k}` : c.k}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Interaction Bar & Pre-trend Toggle */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">实验说明：</span>
            k &lt; 0 为政策实施前相对期，系数置信区间覆盖 0 刻度线表示通过事前趋势检验；k ≥ 0 展示政策动态扩散或累积响应。
          </div>

          <label className="flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-2xs">
            <input
              type="checkbox"
              checked={config.violatePreTrend}
              onChange={(e) =>
                onChangeConfig({ ...config, violatePreTrend: e.target.checked })
              }
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
            <span>注入事前趋势违背 (Pre-trend Violation)</span>
          </label>
        </div>

        {/* Detailed Econometric Regression Table Slice */}
        <div className="mt-5 overflow-x-auto">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            事件研究动态估计系数明细表 (Event Study Estimation Table)
          </h3>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700">
                <th className="p-2.5 font-semibold border border-slate-200">相对时间 (k)</th>
                <th className="p-2.5 font-semibold border border-slate-200">点估计 (β̂<sub>k</sub>)</th>
                <th className="p-2.5 font-semibold border border-slate-200">聚类标准误 (SE)</th>
                <th className="p-2.5 font-semibold border border-slate-200">95% 置信区间</th>
                <th className="p-2.5 font-semibold border border-slate-200">p-value</th>
                <th className="p-2.5 font-semibold border border-slate-200">统计推断判定</th>
              </tr>
            </thead>
            <tbody>
              {coefficients.map((c) => (
                <tr
                  key={c.k}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    c.isBasePeriod
                      ? "bg-amber-50/50 font-bold text-amber-950"
                      : c.k >= 0 && c.pValue < 0.05
                      ? "bg-teal-50/30 font-medium text-teal-950"
                      : "text-slate-800"
                  }`}
                >
                  <td className="p-2.5 font-mono border border-slate-200">
                    {c.k >= 0 ? `k = +${c.k}` : `k = ${c.k}`}
                    {c.isBasePeriod && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                        参照基准期
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 font-mono font-bold border border-slate-200">
                    {c.coef > 0 ? `+${c.coef}` : c.coef}
                  </td>
                  <td className="p-2.5 font-mono text-slate-600 border border-slate-200">
                    {c.se}
                  </td>
                  <td className="p-2.5 font-mono text-slate-600 border border-slate-200">
                    [{c.ciLower}, {c.ciUpper}]
                  </td>
                  <td className="p-2.5 font-mono border border-slate-200">
                    {c.pValue}
                  </td>
                  <td className="p-2.5 border border-slate-200">
                    {c.isBasePeriod ? (
                      <span className="text-slate-500">基准归零 (0)</span>
                    ) : c.k < 0 ? (
                      c.pValue > 0.1 ? (
                        <span className="text-emerald-700 font-semibold">✓ 不显著 (满足平行趋势)</span>
                      ) : (
                        <span className="text-rose-700 font-bold">✗ 显著异动 (平行趋势违背)</span>
                      )
                    ) : c.pValue < 0.01 ? (
                      <span className="text-teal-700 font-bold">高度显著 (***)</span>
                    ) : c.pValue < 0.05 ? (
                      <span className="text-teal-700 font-medium">显著 (**)</span>
                    ) : (
                      <span className="text-slate-500">不显著</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
