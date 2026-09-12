/**
 * Types and interfaces for the DID & Dynamic Lab
 */

export type LabModule =
  | "theory"          // 1. 理论代数
  | "sandbox"         // 2. 2D平行沙盒
  | "counterfactual"  // 3. 2D反事实演播
  | "event-study"     // 4. 事件研究演播
  | "placebo"         // 5. 安慰剂检验
  | "cases"           // 6. 六大案例
  | "code"            // 7. 代码引擎
  | "ai-dialogue"     // 8. AI对话窗口
  | "workflow"        // 9. 全流程导引
  | "data-report"     // 10. 数据与报告
  | "knowledge";      // 知识导引

export type ShockPattern = "constant" | "expanding" | "concave" | "lagged" | "fading";

export interface SandboxConfig {
  baseSlope: number;            // 基期年度斜率 (如 1.5)
  interceptControl: number;     // 对照组初始基线截距 (如 10.0)
  interceptTreatedDiff: number; // 处理组初始选择偏倚截距差 (如 2.5)
  shockPeriod: number;          // 政策生效时间 t0 (如 2018)
  treatmentEffect: number;      // 净因果冲击幅度 delta (如 4.8)
  shockPattern: ShockPattern;   // 动态冲击模式
  noiseLevel: number;           // 扰动噪音 (0 - 1)
  violatePreTrend: boolean;     // 是否人为违背平行趋势 (前置趋势偏差)
  anticipationEffect: boolean;  // 是否存在事前预期效应
  totalPeriods: number;         // 总期数 (如 10 年: 2014-2023)
  startYear: number;            // 起始年份 (如 2014)
}

export interface PanelDataPoint {
  year: number;
  tRelative: number;            // 相对时间 k = t - t0
  controlObs: number;           // 对照组观测值 Y_C(t)
  treatedObs: number;           // 处理组真实观测值 Y_T(t)
  treatedCounterfactual: number;// 处理组反事实轨迹 Y_T^CF(t)
  netEffect: number;            // 当前期净因果效应
  isPost: boolean;
}

export interface EventStudyCoefficient {
  k: number;                    // 相对时间期数 (如 -5, -4, -3, -2, -1, 0, 1, 2, 3, 4)
  coef: number;                 // 点估计值 beta_k
  se: number;                   // 标准误
  ciLower: number;              // 95% 置信区间下限
  ciUpper: number;              // 95% 置信区间上限
  pValue: number;               // p-value
  isBasePeriod?: boolean;       // 是否为基准归一化期 (k = -1, coef = 0)
}

export interface PlaceboResult {
  iteration: number;
  estimate: number;
  tStat: number;
  pValue: number;
}

export interface EmpiricalCase {
  id: string;
  name: string;
  category: string;
  authors: string;
  yearPublished: number;
  journal: string;
  summary: string;
  policyContext: string;
  treatedUnit: string;
  controlUnit: string;
  dependentVar: string;
  depVarLabel: string;
  shockYear: number;
  estimatedEffect: string;
  parameters: Partial<SandboxConfig>;
  economicIntuition: string;
  keyTakeaways: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  content: string;
  timestamp: string;
}

export type LLMModelId = "gemini-3-flash" | "deepseek-v4-pro";

export interface LLMSettings {
  selectedModel: LLMModelId;
  apiKey: string;
  customEndpoint?: string;
  isConfigured: boolean;
}
