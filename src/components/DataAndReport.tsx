import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Printer,
  Upload,
  Filter,
  Eye,
  FileText,
  Sparkles,
  BookOpen,
  Code,
  Layout,
  Layers,
  ChevronRight,
} from "lucide-react";
import { SandboxConfig, EmpiricalCase } from "../types";
import { EMPIRICAL_CASES } from "../data/cases";
import {
  generatePanelSeries,
  computeDIDEstimator,
  computeEventStudyCoefficients,
  generatePlaceboDistribution,
  generateMarkdownReport,
} from "../utils/econometrics";
import { ReportPreview } from "./ReportPreview";

interface DataAndReportProps {
  config: SandboxConfig;
  currentCaseId?: string;
  onSelectCase?: (caseItem: EmpiricalCase) => void;
}

export const DataAndReport: React.FC<DataAndReportProps> = ({
  config,
  currentCaseId = "china-ets",
  onSelectCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(currentCaseId);
  const activeCase = EMPIRICAL_CASES.find((c) => c.id === selectedCaseId) || EMPIRICAL_CASES[0];

  // If user switches case directly within Data & Report suite
  const handleCaseChange = (caseItem: EmpiricalCase) => {
    setSelectedCaseId(caseItem.id);
    if (onSelectCase) {
      onSelectCase(caseItem);
    }
  };

  const panel = generatePanelSeries(config);
  const didStats = computeDIDEstimator(panel);
  const eventStudy = computeEventStudyCoefficients(config);
  const placebo = generatePlaceboDistribution(didStats.didEstimate, 500);

  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "table">("preview");
  const [copied, setCopied] = useState<boolean>(false);

  const markdownReport = generateMarkdownReport(config, didStats, eventStudy, placebo, activeCase);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Download helpers
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. Download panel simulation dataset for currently active case
  const handleDownloadPanelData = () => {
    const headers = `year,unit_id,group,treated,post,did_interaction,${activeCase.dependentVar.replace(/[^a-zA-Z0-9_]/g, "_")},counterfactual_y,net_policy_effect\n`;
    const rows = panel
      .map((d) => {
        const isPost = d.year >= config.shockPeriod ? 1 : 0;
        // Treated observation row
        const rowTreated = `${d.year},treated_group,Treated,1,${isPost},${isPost},${d.treatedObs},${d.treatedCounterfactual},${d.netEffect}`;
        // Control observation row
        const rowControl = `${d.year},control_group,Control,0,${isPost},0,${d.controlObs},${d.controlObs},0`;
        return `${rowTreated}\n${rowControl}`;
      })
      .join("\n");
    downloadCSV(headers + rows, `${activeCase.id}_panel_dataset_${config.shockPeriod}.csv`);
  };

  // 2. Download dynamic event study coefficients for current case
  const handleDownloadEventStudyData = () => {
    const headers = "k,relative_year,coef_beta_k,se,ci_95_lower,ci_95_upper,p_value,is_base_period,status\n";
    const rows = eventStudy.coefficients
      .map(
        (c) =>
          `${c.k},${config.shockPeriod + c.k},${c.coef.toFixed(4)},${c.se.toFixed(4)},${c.ciLower.toFixed(4)},${c.ciUpper.toFixed(4)},${c.pValue.toFixed(4)},${c.isBasePeriod ? 1 : 0},${c.k < 0 ? "Pre" : "Post"}`
      )
      .join("\n");
    downloadCSV(headers + rows, `${activeCase.id}_event_study_coefficients.csv`);
  };

  // 3. Download 500-run placebo permutation distribution
  const handleDownloadPlaceboData = () => {
    const headers = "iteration,pseudo_att_estimate,t_statistic,p_value,true_estimate_benchmark\n";
    const rows = placebo.runs
      .map((r) => `${r.iteration},${r.estimate.toFixed(4)},${r.tStat.toFixed(4)},${r.pValue.toFixed(4)},${didStats.didEstimate.toFixed(4)}`)
      .join("\n");
    downloadCSV(headers + rows, `${activeCase.id}_500_placebo_permutation.csv`);
  };

  // 4. Download Full Micro Data for this case
  const handleDownloadAllCaseZip = () => {
    // Generate combined metadata + panel package
    const content = `# Empirical Case: ${activeCase.name}
# Authors: ${activeCase.authors} (${activeCase.yearPublished})
# Journal: ${activeCase.journal}
# Dependent Variable: ${activeCase.depVarLabel} (${activeCase.dependentVar})
# Shock Year: ${config.shockPeriod}
# Estimated Effect in Literature: ${activeCase.estimatedEffect}
# Simulated ATT: ${didStats.didEstimate.toFixed(4)}

year,group,is_treated,is_post,did,outcome_value,counterfactual_outcome
` + panel
      .map((d) => {
        const isPost = d.year >= config.shockPeriod ? 1 : 0;
        return `${d.year},Treated,1,${isPost},${isPost},${d.treatedObs},${d.treatedCounterfactual}\n${d.year},Control,0,${isPost},0,${d.controlObs},${d.controlObs}`;
      })
      .join("\n");
    downloadCSV(content, `${activeCase.id}_full_empirical_case_data.csv`);
  };

  return (
    <div className="space-y-6">
      {/* 6 Cases Selector Ribbon inside Data & Report Module */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                案例对应报告生成器
              </span>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                六大实证案例专属报告与微观数据集切换
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              每一个案例均深度绑定专属政策背景、被解释变量、样本对照组设定、7 大完整切片实证报告及相应数据下载。
            </p>
          </div>
          <div className="text-xs text-teal-800 bg-teal-50 px-3 py-1 rounded-md border border-teal-200 font-medium">
            当前对应：<strong>{activeCase.name.split(" ")[0]}</strong> ({activeCase.shockYear}年冲击)
          </div>
        </div>

        {/* 6 Case Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3.5">
          {EMPIRICAL_CASES.map((c) => {
            const isSelected = c.id === activeCase.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCaseChange(c)}
                className={`p-2.5 rounded-lg text-left transition-all text-xs border ${
                  isSelected
                    ? "bg-teal-800 text-white border-teal-900 shadow-xs font-semibold ring-2 ring-teal-600/30"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <div className="text-[10px] opacity-75 font-mono">
                  {c.category.split("/")[0].trim()}
                </div>
                <div className="font-medium text-xs mt-0.5 line-clamp-1">
                  {c.name.split(" ")[0]}
                </div>
                <div className="text-[10px] mt-1 flex items-center justify-between opacity-80">
                  <span>{c.shockYear}年</span>
                  <span className="font-mono">{isSelected ? "✓ 激活" : "切换"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 10
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                数据与报告中心 · {activeCase.name}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              对应出处：{activeCase.authors} ({activeCase.yearPublished})《{activeCase.journal}》· 被解释变量：{activeCase.dependentVar}
            </p>
          </div>

          {/* Sliced view switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "preview"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-teal-700" />
              <span>全流程报告交互预览</span>
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "table"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>面板数据切片表格</span>
            </button>
            <button
              onClick={() => setActiveTab("markdown")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "markdown"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Markdown 原始源码</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar for Datasets & Reports */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">导出【{activeCase.name.split(" ")[0]}】专属数据集:</span>
            <button
              onClick={handleDownloadPanelData}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
              title="下载处理组与对照组双向平衡面板微观数据"
            >
              <Download className="w-3 h-3 text-teal-600" />
              <span>面板微观数据 (.csv)</span>
            </button>
            <button
              onClick={handleDownloadEventStudyData}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
              title="下载逐期事件研究相对时期估计系数与置信区间"
            >
              <Download className="w-3 h-3 text-teal-600" />
              <span>事件研究动态系数 (.csv)</span>
            </button>
            <button
              onClick={handleDownloadPlaceboData}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
              title="下载500次蒙特卡洛空间安慰剂抽样估计值"
            >
              <Download className="w-3 h-3 text-teal-600" />
              <span>500次安慰剂分布 (.csv)</span>
            </button>
            <button
              onClick={handleDownloadAllCaseZip}
              className="flex items-center space-x-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-md transition-all shadow-2xs font-semibold cursor-pointer"
              title="下载包含论文背景与面板指标的完整实证数据包"
            >
              <Download className="w-3 h-3 text-teal-700" />
              <span>完整案例数据包 (.csv)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制 Markdown" : "复制报告 Markdown"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-md transition-all shadow-2xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 另存为 PDF</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Report Preview (Formatted according to Workflow Guide) */}
        {activeTab === "preview" && (
          <div className="mt-4">
            <ReportPreview
              config={config}
              activeCase={activeCase}
              didMetrics={didStats}
              eventStudy={eventStudy}
              placebo={placebo}
              panel={panel}
            />
          </div>
        )}

        {/* Tab 2: Panel Data Table */}
        {activeTab === "table" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <strong>被解释变量 (Outcome)：</strong>{activeCase.depVarLabel} ({activeCase.dependentVar})
              </div>
              <div>
                <strong>处理组：</strong>{activeCase.treatedUnit} | <strong>对照组：</strong>{activeCase.controlUnit}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700">
                    <th className="p-2.5 font-semibold border border-slate-200">年份 (Year)</th>
                    <th className="p-2.5 font-semibold border border-slate-200">对照组观测均值 (Y_C)</th>
                    <th className="p-2.5 font-semibold border border-slate-200">处理组观测均值 (Y_T)</th>
                    <th className="p-2.5 font-semibold border border-slate-200">反事实潜在均值 (Y_CF)</th>
                    <th className="p-2.5 font-semibold border border-slate-200">净政策效应 (Net Effect)</th>
                    <th className="p-2.5 font-semibold border border-slate-200">政策状态 (Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {panel.map((d) => {
                    const isPost = d.year >= config.shockPeriod;
                    return (
                      <tr
                        key={d.year}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          d.year === config.shockPeriod
                            ? "bg-amber-50/40 font-bold"
                            : isPost
                            ? "bg-teal-50/20"
                            : ""
                        }`}
                      >
                        <td className="p-2.5 font-mono font-medium border border-slate-200">
                          {d.year}
                          {d.year === config.shockPeriod && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-normal">
                              冲击时点
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-slate-700 border border-slate-200">
                          {d.controlObs}
                        </td>
                        <td className="p-2.5 font-mono text-teal-900 font-semibold border border-slate-200">
                          {d.treatedObs}
                        </td>
                        <td className="p-2.5 font-mono text-amber-800 border border-slate-200">
                          {d.treatedCounterfactual}
                        </td>
                        <td className="p-2.5 font-mono font-bold border border-slate-200">
                          {d.netEffect !== 0 ? (
                            <span className={d.netEffect > 0 ? "text-teal-700" : "text-rose-700"}>
                              {d.netEffect > 0 ? `+${d.netEffect}` : d.netEffect}
                            </span>
                          ) : (
                            <span className="text-slate-400">0.00</span>
                          )}
                        </td>
                        <td className="p-2.5 border border-slate-200">
                          {isPost ? (
                            <span className="text-teal-700 font-semibold">政策干预期 (Post)</span>
                          ) : (
                            <span className="text-slate-500">基期事前 (Pre)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Raw Academic Markdown Source */}
        {activeTab === "markdown" && (
          <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[600px] overflow-y-auto shadow-inner">
            {markdownReport}
          </div>
        )}
      </div>
    </div>
  );
};
