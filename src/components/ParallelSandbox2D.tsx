import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  TrendingUp,
  Sliders,
  AlertCircle,
  HelpCircle,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import { SandboxConfig, PanelDataPoint, ShockPattern } from "../types";
import { generatePanelSeries, computeDIDEstimator } from "../utils/econometrics";

interface ParallelSandbox2DProps {
  config: SandboxConfig;
  onChangeConfig: (newCfg: SandboxConfig) => void;
}

export const ParallelSandbox2D: React.FC<ParallelSandbox2DProps> = ({
  config,
  onChangeConfig,
}) => {
  // Animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(config.totalPeriods - 1);
  const [hoveredPoint, setHoveredPoint] = useState<PanelDataPoint | null>(null);

  // Generate full data series based on current config
  const fullSeries = generatePanelSeries(config);
  const didStats = computeDIDEstimator(fullSeries);

  // Active slice of series to display during animation
  const visibleSeries = fullSeries.slice(0, currentStepIndex + 1);

  // Animation frame loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= config.totalPeriods - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, config.totalPeriods]);

  const handlePlayToggle = () => {
    if (currentStepIndex >= config.totalPeriods - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(config.totalPeriods - 1, prev + 1));
  };

  const handleResetAnimation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(config.totalPeriods - 1);
  };

  // SVG dimensions & coordinate scale
  const width = 820;
  const height = 400;
  const padding = { top: 40, right: 60, bottom: 50, left: 60 };

  // Calculate dynamic min/max for scale
  const allY = fullSeries.flatMap((d) => [
    d.controlObs,
    d.treatedObs,
    d.treatedCounterfactual,
  ]);
  const minY = Math.floor(Math.min(...allY) - 2);
  const maxY = Math.ceil(Math.max(...allY) + 3);

  const scaleX = (index: number) => {
    const usableW = width - padding.left - padding.right;
    return padding.left + (index / (config.totalPeriods - 1)) * usableW;
  };

  const scaleY = (val: number) => {
    const usableH = height - padding.top - padding.bottom;
    return height - padding.bottom - ((val - minY) / (maxY - minY)) * usableH;
  };

  // Build SVG Path strings
  const controlPath = visibleSeries
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.controlObs)}`)
    .join(" ");

  const treatedPath = visibleSeries
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.treatedObs)}`)
    .join(" ");

  const counterfactualPath = visibleSeries
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.treatedCounterfactual)}`)
    .join(" ");

  // Post-shock polygon for "Net Causal Effect" shaded area
  const postPoints = visibleSeries.filter((d) => d.year >= config.shockPeriod);
  let shadedPolygonArea = "";
  if (postPoints.length >= 1) {
    const postIndices = visibleSeries
      .map((d, i) => ({ d, i }))
      .filter((item) => item.d.year >= config.shockPeriod);

    if (postIndices.length > 0) {
      // Top path: along treatedObs
      const topPart = postIndices
        .map((item, idx) => `${idx === 0 ? "M" : "L"} ${scaleX(item.i)} ${scaleY(item.d.treatedObs)}`)
        .join(" ");
      // Bottom path: backwards along counterfactual
      const bottomPart = [...postIndices]
        .reverse()
        .map((item) => `L ${scaleX(item.i)} ${scaleY(item.d.treatedCounterfactual)}`)
        .join(" ");

      shadedPolygonArea = `${topPart} ${bottomPart} Z`;
    }
  }

  const shockYearIndex = config.shockPeriod - config.startYear;
  const shockX = scaleX(shockYearIndex);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 02
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                2D 动态平行趋势与政策冲击沙盒 (2D Dynamic Trends Sandbox)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              交互拖拽基期斜率、政策生效点 t<sub>0</sub> 与冲击幅度；动态演播政策冲击瞬间轨迹发散，高亮反事实虚线与净因果效应面。
            </p>
          </div>

          {/* Quick Stats Metric Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500 block text-[10px]">政策生效年份 t₀</span>
              <span className="font-mono font-bold text-slate-900">{config.shockPeriod}</span>
            </div>
            <div className="px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs">
              <span className="text-teal-700 block text-[10px]">净因果冲击幅度 δ</span>
              <span className="font-mono font-bold text-teal-900">
                {config.treatmentEffect > 0 ? `+${config.treatmentEffect}` : config.treatmentEffect}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500 block text-[10px]">估计 DID 效应量</span>
              <span className="font-mono font-bold text-slate-800">
                {didStats.didEstimate > 0 ? `+${didStats.didEstimate}` : didStats.didEstimate}
              </span>
            </div>
          </div>
        </div>

        {/* 2D Canvas & Interactive Playback Screen */}
        <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main 2D Interactive SVG Visualizer */}
          <div className="xl:col-span-8 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md flex flex-col justify-between overflow-hidden">
            {/* Legend & Current Year Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-2 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-teal-400 rounded-full inline-block"></span>
                  <span className="text-teal-200 font-medium">处理组真实观测 Y<sub>T</sub></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 rounded-full inline-block"></span>
                  <span className="text-slate-300 font-medium">对照组观测 Y<sub>C</sub></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-400 inline-block"></span>
                  <span className="text-amber-300 font-medium">反事实轨迹 Y<sub>T</sub><sup>CF</sup></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-teal-500/30 border border-teal-400/80 rounded-xs inline-block"></span>
                  <span className="text-teal-300 font-medium">净因果阴影面 δ(t)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-400 font-mono text-xs">
                <span>演播进度:</span>
                <span className="text-teal-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                  {fullSeries[currentStepIndex]?.year || config.startYear} 年 ({currentStepIndex + 1}/{config.totalPeriods})
                </span>
              </div>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto max-h-[380px] select-none"
              >
                <defs>
                  {/* Shaded Area Gradient */}
                  <linearGradient id="effectGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.1" />
                  </linearGradient>

                  {/* Policy Line Glow */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Grid lines & Y Axis */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = minY + (maxY - minY) * ratio;
                  const yPos = scaleY(yVal);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={width - padding.right}
                        y2={yPos}
                        stroke="#334155"
                        strokeDasharray="3 3"
                        strokeOpacity="0.6"
                      />
                      <text
                        x={padding.left - 10}
                        y={yPos + 4}
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {yVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Year Axis Lines */}
                {fullSeries.map((d, i) => {
                  const xPos = scaleX(i);
                  const isPast = i <= currentStepIndex;
                  return (
                    <g key={d.year}>
                      <line
                        x1={xPos}
                        y1={padding.top}
                        x2={xPos}
                        y2={height - padding.bottom}
                        stroke="#1e293b"
                        strokeWidth="1"
                      />
                      <text
                        x={xPos}
                        y={height - padding.bottom + 20}
                        fill={isPast ? "#cbd5e1" : "#475569"}
                        fontSize="11"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight={d.year === config.shockPeriod ? "bold" : "normal"}
                      >
                        {d.year}
                      </text>
                    </g>
                  );
                })}

                {/* Policy Shock Event Vertical Line */}
                {shockYearIndex <= currentStepIndex && (
                  <g>
                    <line
                      x1={shockX}
                      y1={padding.top - 10}
                      x2={shockX}
                      y2={height - padding.bottom}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      filter="url(#glow)"
                    />
                    <rect
                      x={shockX - 44}
                      y={padding.top - 28}
                      width="88"
                      height="20"
                      rx="4"
                      fill="#b45309"
                    />
                    <text
                      x={shockX}
                      y={padding.top - 14}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      政策冲击 t₀
                    </text>
                  </g>
                )}

                {/* Shaded Causal Effect Area */}
                {shadedPolygonArea && (
                  <path
                    d={shadedPolygonArea}
                    fill="url(#effectGradient)"
                    stroke="#2dd4bf"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="transition-all duration-300"
                  />
                )}

                {/* Counterfactual Dashed Path */}
                {counterfactualPath && (
                  <path
                    d={counterfactualPath}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="transition-all duration-300"
                  />
                )}

                {/* Control Group Solid Path */}
                {controlPath && (
                  <path
                    d={controlPath}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Treated Group Solid Path */}
                {treatedPath && (
                  <path
                    d={treatedPath}
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Interactive Data Dots on Path */}
                {visibleSeries.map((d, i) => {
                  const x = scaleX(i);
                  const isPost = d.year >= config.shockPeriod;
                  return (
                    <g key={d.year}>
                      {/* Control dot */}
                      <circle
                        cx={x}
                        cy={scaleY(d.controlObs)}
                        r="4"
                        fill="#64748b"
                        stroke="#f8fafc"
                        strokeWidth="1.5"
                      />

                      {/* Counterfactual dot (post-shock) */}
                      {isPost && (
                        <circle
                          cx={x}
                          cy={scaleY(d.treatedCounterfactual)}
                          r="3.5"
                          fill="#f59e0b"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      )}

                      {/* Treated dot */}
                      <circle
                        cx={x}
                        cy={scaleY(d.treatedObs)}
                        r={isPost ? "5.5" : "4.5"}
                        fill="#0d9488"
                        stroke="#f0fdfa"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-7 transition-all"
                        onMouseEnter={() => setHoveredPoint(d)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />

                      {/* Height difference caliper at the latest point */}
                      {isPost && i === currentStepIndex && (
                        <g>
                          <line
                            x1={x + 12}
                            y1={scaleY(d.treatedCounterfactual)}
                            x2={x + 12}
                            y2={scaleY(d.treatedObs)}
                            stroke="#2dd4bf"
                            strokeWidth="2"
                          />
                          <line
                            x1={x + 8}
                            y1={scaleY(d.treatedCounterfactual)}
                            x2={x + 16}
                            y2={scaleY(d.treatedCounterfactual)}
                            stroke="#2dd4bf"
                            strokeWidth="2"
                          />
                          <line
                            x1={x + 8}
                            y1={scaleY(d.treatedObs)}
                            x2={x + 16}
                            y2={scaleY(d.treatedObs)}
                            stroke="#2dd4bf"
                            strokeWidth="2"
                          />
                          <rect
                            x={x + 20}
                            y={(scaleY(d.treatedCounterfactual) + scaleY(d.treatedObs)) / 2 - 12}
                            width="58"
                            height="24"
                            rx="4"
                            fill="#042f2e"
                            stroke="#2dd4bf"
                            strokeWidth="1"
                          />
                          <text
                            x={x + 49}
                            y={(scaleY(d.treatedCounterfactual) + scaleY(d.treatedObs)) / 2 + 4}
                            fill="#2dd4bf"
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            δ={d.netEffect > 0 ? `+${d.netEffect}` : d.netEffect}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Playback Controls Toolbar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePlayToggle}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>暂停演播</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>平滑演播</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStep}
                  disabled={currentStepIndex >= config.totalPeriods - 1}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded-lg transition-all"
                  title="单步推进一步"
                >
                  <StepForward className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetAnimation}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                  title="展示全期全貌"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Hover Tooltip / Status Display */}
              <div className="text-xs font-mono text-slate-400">
                {hoveredPoint ? (
                  <span className="text-teal-300">
                    {hoveredPoint.year}年: Y<sub>T</sub>={hoveredPoint.treatedObs} | Y<sub>CF</sub>={hoveredPoint.treatedCounterfactual} | 净效应={hoveredPoint.netEffect}
                  </span>
                ) : (
                  <span>提示: 鼠标悬停轨迹圆点可查验单期数值</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Parameters Panel */}
          <div className="xl:col-span-4 bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  <span>沙盒因果微调控制器</span>
                </span>
                <span className="text-[11px] text-slate-500">参数即时联动</span>
              </div>

              {/* Policy Shock Year Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="shock-year-slider" className="font-medium text-slate-700">政策生效年份 (t₀):</label>
                  <span className="font-mono font-bold text-teal-900">{config.shockPeriod} 年</span>
                </div>
                <input
                  id="shock-year-slider"
                  type="range"
                  min={config.startYear + 2}
                  max={config.startYear + config.totalPeriods - 2}
                  value={config.shockPeriod}
                  onChange={(e) =>
                    onChangeConfig({ ...config, shockPeriod: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Treatment Magnitude Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="treatment-effect-slider" className="font-medium text-slate-700">真实因果效应幅度 (δ):</label>
                  <span className="font-mono font-bold text-teal-900">
                    {config.treatmentEffect > 0 ? `+${config.treatmentEffect}` : config.treatmentEffect}
                  </span>
                </div>
                <input
                  id="treatment-effect-slider"
                  type="range"
                  min="-8.0"
                  max="12.0"
                  step="0.2"
                  value={config.treatmentEffect}
                  onChange={(e) =>
                    onChangeConfig({ ...config, treatmentEffect: parseFloat(e.target.value) })
                  }
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Baseline Trend Slope Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="baseline-slope-slider" className="font-medium text-slate-700">基期宏观自然斜率 (g):</label>
                  <span className="font-mono font-bold text-slate-800">{config.baseSlope} /年</span>
                </div>
                <input
                  id="baseline-slope-slider"
                  type="range"
                  min="-2.0"
                  max="3.5"
                  step="0.1"
                  value={config.baseSlope}
                  onChange={(e) =>
                    onChangeConfig({ ...config, baseSlope: parseFloat(e.target.value) })
                  }
                  className="w-full accent-slate-600 cursor-pointer"
                />
              </div>

              {/* Dynamic Shock Pattern Slices */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">动态响应演播模式:</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: "constant", label: "恒定冲击" },
                    { id: "expanding", label: "递增发散" },
                    { id: "concave", label: "凹形递减" },
                    { id: "lagged", label: "滞后爆发" },
                    { id: "fading", label: "衰减效应" },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() =>
                        onChangeConfig({ ...config, shockPattern: pat.id as ShockPattern })
                      }
                      className={`py-1 px-2 rounded-md text-[11px] font-medium border transition-all ${
                        config.shockPattern === pat.id
                          ? "bg-teal-700 text-white border-teal-700 font-semibold shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switches for Identification Assumption Testing */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div>
                    <span className="font-medium text-slate-800 block">人为违背平行趋势 (Pre-trend Violation)</span>
                    <span className="text-[10px] text-slate-500">模拟处理组在政策前即存在非平行发散</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.violatePreTrend}
                    onChange={(e) =>
                      onChangeConfig({ ...config, violatePreTrend: e.target.checked })
                    }
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div>
                    <span className="font-medium text-slate-800 block">预期效应 (Anticipation Effect)</span>
                    <span className="text-[10px] text-slate-500">政策出台前 1 年市场提前反应产生异动</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.anticipationEffect}
                    onChange={(e) =>
                      onChangeConfig({ ...config, anticipationEffect: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Validation Indicator Notice */}
            <div className={`p-3 rounded-lg border text-xs ${
              config.violatePreTrend
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}>
              <div className="font-bold flex items-center space-x-1.5">
                {config.violatePreTrend ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>平行趋势假说：严重违背！</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>平行趋势假说：严格满足</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                {config.violatePreTrend
                  ? "处理组在事前已呈现内生偏倚发散，传统 DID 估计量将严重掺杂初始趋势偏误！"
                  : "政策前处理组与对照组斜率完全契合，反事实外推具备严格因果识别可信度。"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
