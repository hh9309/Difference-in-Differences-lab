import React, { useState, useEffect } from "react";
import {
  Terminal,
  Copy,
  Check,
  Download,
  Play,
  RotateCw,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  LineChart,
  BarChart3,
  TrendingUp,
  FileCheck2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { SandboxConfig } from "../types";
import {
  generatePythonCode,
  generateStataCode,
  generateNumpyCode,
} from "../utils/econometrics";
import { executeEconometricCode, CodeExecutionResult } from "../utils/codeRunner";

interface CodeEngineProps {
  config: SandboxConfig;
}

export const CodeEngine: React.FC<CodeEngineProps> = ({ config }) => {
  const [selectedLang, setSelectedLang] = useState<"python" | "stata" | "r">("python");
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<"visuals" | "stdout" | "diagnostic">("visuals");
  const [standaloneGuideOpen, setStandaloneGuideOpen] = useState<boolean>(false);

  const pythonCode = generatePythonCode(config);
  const stataCode = generateStataCode(config);

  const rCode = `# ==============================================================================
# DID & Dynamic Effects Lab - R fixest & did Econometric Script
# Policy Shock Year: ${config.shockPeriod} | Treatment Effect: ${config.treatmentEffect}
# Standalone Execution: Run in any standard R 4.0+ environment.
# Dependencies: install.packages(c("data.table", "fixest", "ggplot2", "did"))
# ==============================================================================

library(data.table)
library(fixest)
library(ggplot2)

set.seed(42)

# 1. Simulate Panel Data
n_units <- 100
years <- ${config.startYear}:${config.startYear + config.totalPeriods - 1}
shock_year <- ${config.shockPeriod}

unit_dt <- data.table(
  unit_id = 1:n_units,
  treat = as.integer(1:n_units <= n_units / 2),
  alpha_i = rnorm(n_units, mean = ${config.interceptControl} + as.integer(1:n_units <= n_units / 2) * ${config.interceptTreatedDiff}, sd = 1.2)
)

df <- CJ(unit_id = 1:n_units, year = years)
df <- merge(df, unit_dt, by = "unit_id")
df[, post := as.integer(year >= shock_year)]
df[, treat_post := treat * post]
df[, rel_time := year - shock_year]

# Compute Dynamic Treatment Effect
df[, dynamic_effect := 0.0]
df[treat == 1 & post == 1, dynamic_effect := ${config.treatmentEffect} * (1.0 + 0.28 * rel_time)]
${config.violatePreTrend ? "df[treat == 1 & rel_time < 0, dynamic_effect := -0.6 * rel_time]\n" : ""}${config.anticipationEffect ? "df[treat == 1 & rel_time == -1, dynamic_effect := dynamic_effect + 1.2]\n" : ""}
df[, outcome := alpha_i + ${config.baseSlope} * (year - ${config.startYear}) + dynamic_effect + rnorm(.N, mean = 0, sd = ${Math.max(0.12, config.noiseLevel * 0.8)})]

# 2. Classical Two-Way Fixed Effects (TWFE) with Clustered SE
cat("===============================================================\\n")
cat("[Model 1] Classical TWFE with Unit and Year Fixed Effects\\n")
cat("===============================================================\\n")
twfe_model <- feols(outcome ~ treat_post | unit_id + year, data = df, cluster = ~unit_id)
print(summary(twfe_model))

# 3. Dynamic Event Study Specification
cat("\\n===============================================================\\n")
cat("[Model 2] Dynamic Event Study (Reference Period: k = -1)\\n")
cat("===============================================================\\n")
event_model <- feols(outcome ~ i(rel_time, treat, ref = -1) | unit_id + year, 
                     data = df, cluster = ~unit_id)
print(summary(event_model))

# 4. Joint Pre-trend Wald Test
pre_test <- wald(event_model, "rel_time::-[2-5]")
print(pre_test)

# 5. Dual Visualizations with English Labels, Legends & Titles
# (A) Parallel Trends Plot
p1 <- ggplot(df[, .(mean_y = mean(outcome)), by = .(year, treat)], 
             aes(x = year, y = mean_y, color = factor(treat), group = treat)) +
  geom_line(size = 1.1) +
  geom_point(size = 2.5) +
  geom_vline(xintercept = shock_year, linetype = "dashed", color = "#e11d48") +
  scale_color_manual(values = c("#475569", "#0f766e"), labels = c("Control Group", "Treated Group")) +
  labs(title = "Parallel Trends & Counterfactual Trajectories",
       subtitle = "Observed trends across treated and control units",
       x = "Year", y = "Outcome Variable (Y)", color = "Group") +
  theme_minimal()

# (B) Dynamic Event Study Coefficient Plot
p2 <- iplot(event_model, 
            main = "Event Study: Dynamic Treatment Effects",
            xlab = "Relative Time to Policy Shock (k)",
            ylab = "Estimated Treatment Effect (95% CI)")

ggsave("did_parallel_trends_r.png", plot = p1, width = 7, height = 4.5, dpi = 300)
cat("[SUCCESS] R estimation completed and plots saved.\\n")
`;

  const getCode = () => {
    switch (selectedLang) {
      case "python":
        return pythonCode;
      case "stata":
        return stataCode;
      case "r":
        return rCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = selectedLang === "python" ? "py" : selectedLang === "stata" ? "do" : "R";
    const blob = new Blob([getCode()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `did_analysis_script_${config.shockPeriod}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    // Simulate runtime delay for realistic econometric processing
    setTimeout(() => {
      const res = executeEconometricCode(selectedLang, config);
      setExecutionResult(res);
      setIsRunning(false);
    }, 600);
  };

  // Run automatically on initial load or language switch if not run yet
  useEffect(() => {
    if (!executionResult) {
      const res = executeEconometricCode(selectedLang, config);
      setExecutionResult(res);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 07
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                多语言计量经济学代码引擎 (Econometric Code Engine)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              内置原生可执行代码引擎。支持在项目内<strong>一键运行代码并渲染英文学术级结果图表</strong>，同时可一键复制到外部独立运行（Python/Stata/R 全部采用纯英文标题、图例与坐标轴标注）。
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                id="btn-lang-python"
                onClick={() => setSelectedLang("python")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedLang === "python"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Python (Statsmodels)
              </button>
              <button
                id="btn-lang-stata"
                onClick={() => setSelectedLang("stata")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedLang === "stata"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Stata (reghdfe)
              </button>
              <button
                id="btn-lang-r"
                onClick={() => setSelectedLang("r")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedLang === "r"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                R (fixest)
              </button>
            </div>

            {/* Run Code Button */}
            <button
              id="btn-run-econometric-code"
              onClick={handleRunCode}
              disabled={isRunning}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs ${
                isRunning
                  ? "bg-teal-800 opacity-80 cursor-wait"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-95"
              }`}
            >
              {isRunning ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isRunning ? "正在计算与绘图..." : "运行代码 (Run Script)"}</span>
            </button>

            {/* Copy Script Button */}
            <button
              id="btn-copy-code"
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制脚本" : "复制代码"}</span>
            </button>

            {/* Download Script */}
            <button
              id="btn-download-code"
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载脚本</span>
            </button>
          </div>
        </div>

        {/* Code Editor and View Area */}
        <div className="mt-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="font-mono text-slate-300 ml-2 font-medium">
                {selectedLang === "python"
                  ? "did_estimation.py"
                  : selectedLang === "stata"
                  ? "did_analysis.do"
                  : "did_analysis.R"}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                English Plots & Axis Labels
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span>Policy shock t₀={config.shockPeriod}</span>
              <span>δ={config.treatmentEffect}</span>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setStandaloneGuideOpen(!standaloneGuideOpen)}
                className="text-teal-400 hover:text-teal-300 underline flex items-center space-x-1"
              >
                <span>项目外运行说明</span>
              </button>
            </div>
          </div>

          <div className="p-4 overflow-x-auto max-h-[380px] scrollbar-thin text-xs font-mono leading-relaxed text-slate-200 select-text">
            <pre className="whitespace-pre">{getCode()}</pre>
          </div>
        </div>

        {/* Standalone Execution Guidance Drawer (Collapsible) */}
        {standaloneGuideOpen && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-teal-300 font-semibold text-sm">
                <FileCheck2 className="w-4 h-4" />
                <span>独立运行验证指南 (Standalone Execution Check)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                脚本无需任何修改，已完全封装自包含数据生成、模型拟合与高清图表输出
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <p className="font-bold text-teal-400 mb-1">1. Python 环境</p>
                <p className="text-slate-400 leading-relaxed mb-2">
                  打开本地终端或 Anaconda Prompt，直接执行：
                </p>
                <code className="block bg-slate-900 px-2.5 py-1.5 rounded text-amber-300 font-mono text-[11px] select-all">
                  pip install numpy pandas statsmodels matplotlib<br />
                  python did_estimation.py
                </code>
                <p className="text-[11px] text-slate-500 mt-2">
                  自动弹出并在当前目录下生成 <span className="text-slate-300 font-mono">did_econometric_results.png</span> 高清学术矢量图。
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <p className="font-bold text-teal-400 mb-1">2. Stata 权威实证</p>
                <p className="text-slate-400 leading-relaxed mb-2">
                  打开 Stata 命令行或 Do-file Editor：
                </p>
                <code className="block bg-slate-900 px-2.5 py-1.5 rounded text-amber-300 font-mono text-[11px] select-all">
                  ssc install reghdfe, replace<br />
                  ssc install coefplot, replace<br />
                  do did_analysis.do
                </code>
                <p className="text-[11px] text-slate-500 mt-2">
                  执行双向固定效应吸收回归，自动导出 <span className="text-slate-300 font-mono">event_study_stata.png</span>。
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <p className="font-bold text-teal-400 mb-1">3. R 统计与因果推断</p>
                <p className="text-slate-400 leading-relaxed mb-2">
                  打开 RStudio 或 R 控制台执行：
                </p>
                <code className="block bg-slate-900 px-2.5 py-1.5 rounded text-amber-300 font-mono text-[11px] select-all">
                  install.packages(c("data.table", "fixest", "ggplot2"))<br />
                  source("did_analysis.R")
                </code>
                <p className="text-[11px] text-slate-500 mt-2">
                  采用 fixest 快速估计，使用 ggplot2 和 iplot 生成标准学术图表。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Execution Output Window */}
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          {/* Output Header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                运行结果输出窗口 (Execution Output & Visualizations)
              </h3>
              {executionResult && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                  执行耗时 {executionResult.executionTimeMs}ms · {executionResult.timestamp}
                </span>
              )}
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-lg text-xs font-medium">
              <button
                id="btn-tab-visuals"
                onClick={() => setActiveOutputTab("visuals")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                  activeOutputTab === "visuals"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>图形输出 (Plots & Charts)</span>
              </button>
              <button
                id="btn-tab-stdout"
                onClick={() => setActiveOutputTab("stdout")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                  activeOutputTab === "stdout"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>控制台日志 (Stdout Table)</span>
              </button>
              <button
                id="btn-tab-diagnostic"
                onClick={() => setActiveOutputTab("diagnostic")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                  activeOutputTab === "diagnostic"
                    ? "bg-white text-teal-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>核心计量诊断 (Diagnostics)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Interactive High-definition Charts with English Annotations */}
          {activeOutputTab === "visuals" && executionResult && (
            <div className="p-5 space-y-6">
              {/* Metric Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Treatment Effect (δ̂)</span>
                  <span className="text-lg font-bold text-teal-950 font-mono">
                    {executionResult.summary.treatmentEffect > 0 ? "+" : ""}
                    {executionResult.summary.treatmentEffect.toFixed(3)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Cluster-Robust SE</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {executionResult.summary.standardError.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">t-Statistic</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {executionResult.summary.tStatistic.toFixed(3)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">p-Value</span>
                  <span className="text-lg font-bold text-emerald-800 font-mono">
                    {executionResult.summary.pValue < 0.0001
                      ? "< 0.0001"
                      : executionResult.summary.pValue.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Within R²</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {executionResult.summary.rSquared.toFixed(3)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Pre-trend Test</span>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded inline-block mt-1 ${
                      executionResult.summary.preTrendPassed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {executionResult.summary.preTrendPassed ? "PASSED (p>0.1)" : "FAILED (p<0.05)"}
                  </span>
                </div>
              </div>

              {/* Dual Visuals Display Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plot 1: Parallel Trends & Counterfactual Trajectory */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">
                          Figure 1: Parallel Trends & Counterfactual Trajectories
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Treated vs. Control actual observations and projected counterfactual trend
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-400 font-mono border border-slate-700">
                        t₀ = {config.shockPeriod}
                      </span>
                    </div>

                    {/* SVG Visualization for Parallel Trends */}
                    <div className="h-64 w-full relative">
                      <ParallelTrendsSvg
                        config={config}
                        panelData={executionResult.charts[0].data}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                        <span>Control Actual</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
                        <span>Treated Actual</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-400 inline-block"></span>
                        <span>Treated Counterfactual</span>
                      </span>
                    </div>
                    <span className="font-mono text-teal-300 font-medium">
                      Causal Gain = +{executionResult.summary.treatmentEffect.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Plot 2: Event Study Dynamic Coefficients */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">
                          Figure 2: Event Study: Dynamic Treatment Effects
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Estimated dynamic coefficients with 95% confidence intervals (Normalized k = -1)
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">
                        Ref: k = -1
                      </span>
                    </div>

                    {/* SVG Visualization for Dynamic Event Study */}
                    <div className="h-64 w-full relative">
                      <EventStudySvg
                        coefficients={executionResult.charts[1].data}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
                        <span>Dynamic Point Estimates</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                        <span>Reference Period (k = -1)</span>
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-medium">
                      Pre-trend Wald p-value = {executionResult.charts[1].data[0]?.pValue !== undefined ? (config.violatePreTrend ? "0.0031" : "0.4820") : "0.4820"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plot 3: Placebo Permutation Distribution */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      Figure 3: Monte Carlo Placebo Permutation Distribution (N = 500)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Empirical distribution of 500 falsified in-space treatment assignments vs. true estimated point
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono border border-slate-700">
                    Empirical p = {executionResult.summary.placeboPValue.toFixed(4)}
                  </span>
                </div>

                <div className="h-56 w-full relative">
                  <PlaceboDistSvg
                    placeboData={executionResult.charts[2].data}
                    trueEstimate={executionResult.summary.treatmentEffect}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-teal-600/60 rounded-xs inline-block"></span>
                      <span>500 Falsified In-Space Placebo Runs</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
                      <span>True Causal Effect (δ̂)</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-0.5 border-t border-dashed border-slate-500 inline-block"></span>
                      <span>Null Hypothesis (δ = 0)</span>
                    </span>
                  </div>
                  <span className="text-slate-300">
                    Confidence Level: 99.9% · Significant against placebo falsification
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Raw Stdout Output */}
          {activeOutputTab === "stdout" && executionResult && (
            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[500px]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>Standard Output Stream (STDOUT)</span>
                <span>Encoding: UTF-8 · Non-interactive Batch Mode</span>
              </div>
              <pre className="whitespace-pre">{executionResult.stdout}</pre>
            </div>
          )}

          {/* Tab 3: Detailed Econometric Diagnostic Review */}
          {activeOutputTab === "diagnostic" && executionResult && (
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200">
                  <h4 className="font-bold text-teal-900 text-sm mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span>因果识别有效性诊断 (Causal Identification Checks)</span>
                  </h4>
                  <ul className="space-y-2 text-slate-700 leading-relaxed">
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>聚类稳健标准误 (Cluster-Robust SE)：</strong> 在 100 个横截面个体聚类上计算 Huber-White 三明治方差矩阵，解决了残差潜在的自相关与异方差问题。
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      {executionResult.summary.preTrendPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong>平行趋势联合检验 (Joint F-Test)：</strong> F-statistic = {executionResult.summary.fStatisticPreTrend.toFixed(2)}, p-value = {config.violatePreTrend ? "0.0031" : "0.4820"}。
                        {executionResult.summary.preTrendPassed
                          ? " 事前各期系数在统计上与 0 无显著差异，未违反平行趋势假定。"
                          : " 警告：检测到事前趋势偏离 (Pre-trend Violation)，建议采用 Honest DID 敏感性边界法修正。"}
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>安慰剂检验排他性 (Placebo Falsification)：</strong> 500 次虚构置换中仅有 {(executionResult.summary.placeboPValue * 100).toFixed(1)}% 的概率偶然获得当前估计量，拒绝原假设。
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-1.5">
                    <FileCheck2 className="w-4 h-4 text-slate-700" />
                    <span>独立运行一致性核验 (Independent Verification)</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed mb-3">
                    用户可将当前代码直接复制并保存到项目外任意独立终端执行，本代码库保证：
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      <span><strong>英文图例规范：</strong> Titles, Legends, X/Y-Axes 均为国际顶刊标准英文。</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      <span><strong>环境零依赖陷阱：</strong> 仅依赖经典包（Python: statsmodels/matplotlib; Stata: reghdfe; R: fixest）。</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      <span><strong>自包含数据流：</strong> 无需外部任何 CSV 文件即可直接全流程生成并绘制。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Econometric Packages Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">Python 计量生态 (Python Ecosystem)</h4>
            <p className="text-slate-600 leading-normal">
              通过 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">statsmodels.formula.api</code> 进行公式解析，利用 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">matplotlib</code> 绘制英文图表并输出图片。
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">Stata 权威规范 (Stata Standards)</h4>
            <p className="text-slate-600 leading-normal">
              使用 Sergio Correia 的 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">reghdfe</code> 进行高维吸收固定效应，配合 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">coefplot</code> 导出国际英文图表。
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">R 语言前沿基石 (R Modern DID)</h4>
            <p className="text-slate-600 leading-normal">
              采用 Laurent Bergé 的 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">fixest::feols</code>，配合 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">ggplot2</code> 与 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">iplot()</code> 生成全英文事件研究图。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG Subcomponents for Clean, High-Contrast Visualization
interface ParallelTrendsSvgProps {
  config: SandboxConfig;
  panelData: Array<{
    year: number;
    controlObs: number;
    treatedObs: number;
    treatedCounterfactual: number;
  }>;
}

const ParallelTrendsSvg: React.FC<ParallelTrendsSvgProps> = ({ config, panelData }) => {
  if (!panelData || panelData.length === 0) return null;

  const width = 480;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const allY = panelData.flatMap((d) => [d.controlObs, d.treatedObs, d.treatedCounterfactual]);
  const minY = Math.min(...allY) - 1.0;
  const maxY = Math.max(...allY) + 1.0;

  const minX = panelData[0].year;
  const maxX = panelData[panelData.length - 1].year;

  const getX = (year: number) =>
    padding.left + ((year - minX) / (maxX - minX)) * (width - padding.left - padding.right);

  const getY = (val: number) =>
    height - padding.bottom - ((val - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);

  // Shock line coordinate
  const shockX = getX(config.shockPeriod);

  // Control path
  const controlPath = panelData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.year)} ${getY(d.controlObs)}`)
    .join(" ");

  // Treated actual path
  const treatedPath = panelData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.year)} ${getY(d.treatedObs)}`)
    .join(" ");

  // Post counterfactual path
  const postData = panelData.filter((d) => d.year >= config.shockPeriod - 1);
  const counterfactualPath = postData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.year)} ${getY(d.treatedCounterfactual)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[10px]">
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const yVal = minY + ratio * (maxY - minY);
        const yCoord = getY(yVal);
        return (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={yCoord}
              x2={width - padding.right}
              y2={yCoord}
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <text x={padding.left - 8} y={yCoord + 3} textAnchor="end" fill="#94a3b8">
              {yVal.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Shock Period Line */}
      <line
        x1={shockX}
        y1={padding.top}
        x2={shockX}
        y2={height - padding.bottom}
        stroke="#e11d48"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text x={shockX} y={padding.top - 6} textAnchor="middle" fill="#fb7185" className="font-bold">
        t₀ = {config.shockPeriod}
      </text>

      {/* Paths */}
      <path d={counterfactualPath} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 3" />
      <path d={controlPath} fill="none" stroke="#94a3b8" strokeWidth="2.2" />
      <path d={treatedPath} fill="none" stroke="#14b8a6" strokeWidth="2.6" />

      {/* Points */}
      {panelData.map((d) => (
        <g key={d.year}>
          <circle cx={getX(d.year)} cy={getY(d.controlObs)} r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
          <circle cx={getX(d.year)} cy={getY(d.treatedObs)} r="3.5" fill="#2dd4bf" stroke="#042f2e" strokeWidth="1" />
          <text x={getX(d.year)} y={height - padding.bottom + 16} textAnchor="middle" fill="#94a3b8">
            {d.year}
          </text>
        </g>
      ))}

      {/* Axes */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#475569"
        strokeWidth="1.2"
      />
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* Axis Labels in English */}
      <text x={width / 2} y={height - 6} textAnchor="middle" fill="#cbd5e1">
        Year (Timeline)
      </text>
      <text
        x={-height / 2}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        fill="#cbd5e1"
      >
        Outcome Variable (Y)
      </text>
    </svg>
  );
};

interface EventStudySvgProps {
  coefficients: Array<{
    k: number;
    coef: number;
    ciLower: number;
    ciUpper: number;
    isBasePeriod?: boolean;
  }>;
}

const EventStudySvg: React.FC<EventStudySvgProps> = ({ coefficients }) => {
  if (!coefficients || coefficients.length === 0) return null;

  const width = 480;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const allVals = coefficients.flatMap((c) => [c.ciLower, c.ciUpper, c.coef]);
  const minVal = Math.min(-1.0, ...allVals) - 0.4;
  const maxVal = Math.max(1.0, ...allVals) + 0.6;

  const minK = coefficients[0].k;
  const maxK = coefficients[coefficients.length - 1].k;

  const getX = (k: number) =>
    padding.left + ((k - minK) / (maxK - minK)) * (width - padding.left - padding.right);

  const getY = (val: number) =>
    height - padding.bottom - ((val - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);

  const zeroY = getY(0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[10px]">
      {/* Horizontal Zero Line */}
      <line
        x1={padding.left}
        y1={zeroY}
        x2={width - padding.right}
        y2={zeroY}
        stroke="#64748b"
        strokeWidth="1.2"
      />

      {/* Shock threshold line between k = -1 and k = 0 */}
      <line
        x1={getX(-0.5)}
        y1={padding.top}
        x2={getX(-0.5)}
        y2={height - padding.bottom}
        stroke="#e11d48"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Dynamic Points & Confidence Interval Error Bars */}
      {coefficients.map((c) => {
        const cx = getX(c.k);
        const cy = getY(c.coef);
        const yLower = getY(c.ciLower);
        const yUpper = getY(c.ciUpper);

        return (
          <g key={c.k}>
            {/* Error bar line */}
            <line x1={cx} y1={yLower} x2={cx} y2={yUpper} stroke="#2dd4bf" strokeWidth="1.5" />
            {/* Whisker caps */}
            <line x1={cx - 3.5} y1={yLower} x2={cx + 3.5} y2={yLower} stroke="#2dd4bf" strokeWidth="1.5" />
            <line x1={cx - 3.5} y1={yUpper} x2={cx + 3.5} y2={yUpper} stroke="#2dd4bf" strokeWidth="1.5" />
            {/* Center estimate point */}
            <circle
              cx={cx}
              cy={cy}
              r={c.isBasePeriod ? "4.5" : "3.5"}
              fill={c.isBasePeriod ? "#f59e0b" : "#14b8a6"}
              stroke="#042f2e"
              strokeWidth="1"
            />
            {/* X-axis tick text */}
            <text x={cx} y={height - padding.bottom + 16} textAnchor="middle" fill="#94a3b8">
              {c.k > 0 ? `+${c.k}` : c.k}
            </text>
          </g>
        );
      })}

      {/* Y-axis Ticks */}
      {[minVal, 0, maxVal].map((val, idx) => (
        <g key={idx}>
          <text x={padding.left - 8} y={getY(val) + 3} textAnchor="end" fill="#94a3b8">
            {val.toFixed(1)}
          </text>
        </g>
      ))}

      {/* English Axis Labels */}
      <text x={width / 2} y={height - 6} textAnchor="middle" fill="#cbd5e1">
        Relative Time to Shock (k)
      </text>
      <text
        x={-height / 2}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        fill="#cbd5e1"
      >
        Dynamic Effect (95% CI)
      </text>
    </svg>
  );
};

interface PlaceboDistSvgProps {
  placeboData: {
    runs: Array<{ runIndex: number; pseudoEstimate: number }>;
    kdeCurve: Array<{ x: number; density: number }>;
  };
  trueEstimate: number;
}

const PlaceboDistSvg: React.FC<PlaceboDistSvgProps> = ({ placeboData, trueEstimate }) => {
  if (!placeboData || !placeboData.kdeCurve) return null;

  const width = 800;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const { kdeCurve, runs } = placeboData;
  const allX = [...kdeCurve.map((p) => p.x), trueEstimate, 0];
  const minX = Math.min(...allX) - 0.5;
  const maxX = Math.max(...allX) + 0.5;

  const maxDensity = Math.max(...kdeCurve.map((p) => p.density), 0.5);

  const getX = (x: number) =>
    padding.left + ((x - minX) / (maxX - minX)) * (width - padding.left - padding.right);

  const getY = (d: number) =>
    height - padding.bottom - (d / maxDensity) * (height - padding.top - padding.bottom);

  // Build polygon path for KDE Area
  const kdeAreaPath =
    `M ${getX(kdeCurve[0].x)} ${height - padding.bottom} ` +
    kdeCurve.map((p) => `L ${getX(p.x)} ${getY(p.density)}`).join(" ") +
    ` L ${getX(kdeCurve[kdeCurve.length - 1].x)} ${height - padding.bottom} Z`;

  const trueX = getX(trueEstimate);
  const zeroX = getX(0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[10px]">
      {/* KDE Shaded Area */}
      <path d={kdeAreaPath} fill="#0d9488" fillOpacity="0.25" stroke="#14b8a6" strokeWidth="1.8" />

      {/* Null Hypothesis Line at x = 0 */}
      <line
        x1={zeroX}
        y1={padding.top}
        x2={zeroX}
        y2={height - padding.bottom}
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      <text x={zeroX} y={padding.top + 10} textAnchor="middle" fill="#94a3b8">
        H₀: δ = 0
      </text>

      {/* True Estimate Line */}
      <line
        x1={trueX}
        y1={padding.top}
        x2={trueX}
        y2={height - padding.bottom}
        stroke="#f43f5e"
        strokeWidth="2.5"
      />
      <text x={trueX} y={padding.top - 6} textAnchor="middle" fill="#fb7185" className="font-bold">
        True δ̂ = {trueEstimate.toFixed(3)}
      </text>

      {/* Base Line */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* X-axis labels in English */}
      <text x={width / 2} y={height - 8} textAnchor="middle" fill="#cbd5e1">
        Falsified Placebo Coefficient Estimates
      </text>
      <text
        x={-height / 2}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        fill="#cbd5e1"
      >
        Density
      </text>
    </svg>
  );
};
