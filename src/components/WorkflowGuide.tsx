import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react";
import { LabModule } from "../types";

interface WorkflowGuideProps {
  onNavigateToModule: (mod: LabModule) => void;
}

interface WorkflowStep {
  stepNumber: number;
  title: string;
  shortDesc: string;
  targetModule: LabModule;
  checklist: string[];
  refereeConcerns: string;
  defenseStrategy: string;
  pitfalls: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    stepNumber: 1,
    title: "数据清洗与倾向得分匹配 (Data Preparation & PSM)",
    shortDesc: "平衡面板构建、变量缩尾与缓解选择性偏差",
    targetModule: "theory",
    checklist: [
      "构建平衡面板 (Balanced Panel)，剔除缺失核心变量的样本",
      "对连续变量进行 1% 和 99% 分位数的缩尾处理 (Winsorize)",
      "进行 Logit/Probit 倾向得分估计，核查共同支撑域 (Common Support)",
      "进行近邻匹配或核匹配，检验匹配后协变量的均值标准化偏差 (< 10%)",
    ],
    refereeConcerns: "处理组和对照组在政策实施前具有显著的系统性差异，匹配过程是否导致大量样本丢失？",
    defenseStrategy: "汇报匹配前后的核密度分布重叠图，说明匹配后样本通过平衡性检验，并汇报全样本与匹配样本的双重基准回归对照。",
    pitfalls: "绝对禁止将受政策影响的内生结果变量放入匹配协变量池中（引起过度控制偏误）！",
  },
  {
    stepNumber: 2,
    title: "平行趋势与事件研究检验 (Parallel Trends & Event Study)",
    shortDesc: "动态系数绘制、基期归一化与事前联合 F 检验",
    targetModule: "event-study",
    checklist: [
      "设定相对时间虚拟变量 k ∈ [-T_pre, T_post]",
      "严格固定政策前一期 k = -1 作为参照基准（系数归零消除完全多重共线性）",
      "进行事前系数的联合 Wald F 检验，确认事前系数统计不显著 (p > 0.10)",
      "观察政策后动态响应时滞与持续性（即时生效还是存在 1-2 年滞后）",
    ],
    refereeConcerns: "政策前 k = -2 系数在 10% 水平临界显著，或者图形存在视觉上的斜率发散，如何证明平行趋势成立？",
    defenseStrategy: "补充多维度交互固定效应（如省份×年份、行业×年份）以吸收宏观差异；进一步引入 Rambachan & Roth (2023) Honest DID 汇报允许偏离边界下的破裂值。",
    pitfalls: "切勿为了“追求图形漂亮”而随意更换基准期，经典规范必须以 k = -1 为参照！",
  },
  {
    stepNumber: 3,
    title: "基准回归与双向固定效应 (Baseline TWFE Regression)",
    shortDesc: "个体与时间双向固定效应吸收，聚类稳健标准误修正",
    targetModule: "code",
    checklist: [
      "控制个体固定效应 (Firm/City FE) 吸收不随时间改变的特征",
      "控制时间固定效应 (Year FE) 吸收宏观共同冲击",
      "将标准误严格聚类 (Cluster) 在最高政策实施层级（如城市或行业）",
      "逐步加入控制变量，观察核心 DID 估计系数的稳健性与符号稳定性",
    ],
    refereeConcerns: "多期交错 DID 中是否存在异质性处理效应导致传统 TWFE 估计量被赋予负权重？",
    defenseStrategy: "运行 Goodman-Bacon 分解检验四组两两比较的权重结构；补充 Callaway & Sant'Anna (2021) CSDID 估计结果作为对照验证。",
    pitfalls: "标准误如果不做聚类调整，直接报告普通稳健标准误会导致严重低估标准误，产生大量虚假显著性！",
  },
  {
    stepNumber: 4,
    title: "安慰剂与多重稳健性检验 (Placebo & Robustness Suite)",
    shortDesc: "500次蒙特卡洛虚构、反向因果、排除并发政策",
    targetModule: "placebo",
    checklist: [
      "进行 500 次虚构处理组或伪时点的蒙特卡洛置换检验，绘制核密度分布",
      "反向因果排除：检验未来期政策变量是否会影响当前被解释变量",
      "排除同时期其他竞争性政策干扰（如环保政策与碳交易试点的重叠剔除）",
      "更换被解释变量的衡量口径或替换对照组样本池（如近邻非试点省份）",
    ],
    refereeConcerns: "政策效应是否只是某种未被控制的未观测宏观冲击碰巧作用在处理组上？",
    defenseStrategy: "展示 500 次安慰剂置换分布图，指出真实回归系数处于正态分布极度远离中心的尾部（经验 p < 0.001），偶发概率低于千分之一。",
    pitfalls: "安慰剂检验置换次数不足（如仅进行 50 次）会导致经验分布不光滑，缺乏权威说服力，建议至少 500 次。",
  },
  {
    stepNumber: 5,
    title: "因果效应评估与学术报告决策导出 (Causal Impact & Export)",
    shortDesc: "经济学显著性解读、政策边际收益与可复现性报告",
    targetModule: "data-report",
    checklist: [
      "计算因果效应相较于样本均值的百分比提升（经济学显著性 Economic Significance）",
      "进行机制检验 (Mechanism Analysis: 中介效应/渠道检验)",
      "异质性剖析 (Heterogeneity: 区分企业规模、所有制、地理区位)",
      "一键导出标准化实证研究 Markdown / PDF 报告与复现代码包",
    ],
    refereeConcerns: "该政策建议是否具备外部有效性（External Validity）？是否有由于幸存者偏差带来的过度乐观估计？",
    defenseStrategy: "结合制度背景深入讨论政策适用边界与约束条件，强调边际改进路径，并提供开源代码与复现指引保证研究公开透明。",
    pitfalls: "切忌仅罗列统计星号而不做经济学含义解释（如提升了多少个标准差或占 GDP 的百分比）。",
  },
];

export const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ onNavigateToModule }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const currentStep = WORKFLOW_STEPS.find((s) => s.stepNumber === activeStep) || WORKFLOW_STEPS[0];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 09
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                双重差分实证全流程全景导引 (5-Step Empirical Workflow)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              遵循国际经济学顶刊（AER/QJE/JFE）与国内顶刊（《经济研究》/《管理世界》）严格规范，提供 5 大阶段核查清单、审稿人质疑答辩与避坑指南。
            </p>
          </div>
        </div>

        {/* 5-Step Horizontal Slices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mt-5">
          {WORKFLOW_STEPS.map((step) => {
            const isSelected = activeStep === step.stepNumber;
            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStep(step.stepNumber)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isSelected ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        isSelected ? "text-teal-200" : "text-slate-400"
                      }`}
                    >
                      阶段 {step.stepNumber}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold mt-2 line-clamp-1">{step.title.split("(")[0]}</h4>
                  <p
                    className={`text-[11px] mt-1 line-clamp-2 ${
                      isSelected ? "text-teal-100" : "text-slate-500"
                    }`}
                  >
                    {step.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Deep Content */}
        <div className="mt-6 bg-slate-50/90 rounded-xl p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                  STEP 0{currentStep.stepNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {currentStep.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentStep.shortDesc}
              </p>
            </div>

            <button
              onClick={() => onNavigateToModule(currentStep.targetModule)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs self-start md:self-auto cursor-pointer"
            >
              <span>跳转至对应实验模块执行</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            {/* Checklist */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>实证规范核查清单 (Checklist)</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                {currentStep.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-normal">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Strategy */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>审稿人高频质疑与顶刊答辩预案 (Referee Defense)</span>
                </h4>
                <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200/80 text-amber-950">
                  <strong>审稿人质疑：</strong>"{currentStep.refereeConcerns}"
                </div>
                <div className="text-slate-700 leading-relaxed">
                  <strong>答辩应对方案：</strong>{currentStep.defenseStrategy}
                </div>
              </div>

              {/* Pitfalls */}
              <div className="bg-rose-50/70 p-4 rounded-lg border border-rose-200 text-xs text-rose-950 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>计量避坑指南 (Critical Pitfalls)</span>
                </div>
                <p className="leading-relaxed">
                  {currentStep.pitfalls}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
