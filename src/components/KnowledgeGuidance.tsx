import React, { useState } from "react";
import {
  GraduationCap,
  Scale,
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Search,
  Sigma,
  ShieldCheck,
  Award,
  Zap,
  HelpCircle,
  BarChart2,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export const KnowledgeGuidance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basics" | "models" | "pitfalls" | "robustness" | "glossary">("basics");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const glossaryItems = [
    {
      term: "SUTVA (Stable Unit Treatment Value Assumption)",
      zh: "个体处理效应稳定性假定",
      desc: "因果推断的核心前提，包含无干扰性（No Interference，一个单位的处理状态不影响其他单位的潜在结果）与无隐藏不同处理版本（No Hidden Variations of Treatment）。",
      citation: "Rubin (1980)",
      category: "识别假定",
    },
    {
      term: "Parallel Trends Assumption",
      zh: "平行趋势前置假定",
      desc: "若没有发生政策冲击，处理组与对照组的结果变量随时间演变的时间趋势应当完全平行一致。此假定在政策实施后本质上是不可直接观测的反事实（Counterfactual）。",
      citation: "Angrist & Pischke (2009)",
      category: "核心假定",
    },
    {
      term: "Counterfactual (反事实潜在状态)",
      zh: "反事实与潜在结果",
      desc: "设 Y(1) 为受到政策干预时的潜在结果，Y(0) 为未受干预时的潜在结果。对于处理组个体，政策实施后的真实反事实 Y_T(0) 永远无法直接观测到，必须通过同质对照组的变动进行逼近构造。",
      citation: "Neyman (1923), Rubin (1974)",
      category: "基本概念",
    },
    {
      term: "Selection Bias (选择性偏误)",
      zh: "自选择偏误 / 选择性偏倚",
      desc: "处理组与对照组在政策干预前的初始基线水平差异 E[Y_T(0) - Y_C(0) | Pre]。传统简单比较均值会把选择性偏倚误算作政策效果，DID 通过一阶纵向差分精准消除了这一不随时间变动的固定选择偏误。",
      citation: "Heckman et al. (1997)",
      category: "偏误识别",
    },
    {
      term: "Event Study Approach (事件研究法)",
      zh: "事件研究法与动态效应",
      desc: "将政策年份锚定为相对时段 k = t - t0，引入多期交互项 ∑ δ_k (Treat × Year_k)。政策前期（k < -1）用于事前平行趋势检验，政策后期（k ≥ 0）用于刻画动态效应时滞与持续性。",
      citation: "Jacobson, LaLonde & Sullivan (1993)",
      category: "检验方法",
    },
    {
      term: "Goodman-Bacon Decomposition",
      zh: "Bacon 双重差分权重分解",
      desc: "揭示了在多期交错 DID 中，双向固定效应 OLS 估计量本质是四类 2x2 DID 比较的加权平均。当“早期处理组”作为“晚期处理组”的对照组时，如果处理效应随时间动态变动，权重可能为负，导致回归系数反转。",
      citation: "Goodman-Bacon (2021, JPubE)",
      category: "前沿计量",
    },
    {
      term: "Callaway & Sant'Anna (CSDID)",
      zh: "CSDID 异质性稳健聚合估计",
      desc: "基于群组（Group，即首次接受处理的年份 g）与时期 t，首先估计纯净的群组-时期 ATT(g,t)（仅以从未处理组或尚未处理组作为对照），再根据样本权重或事件时段进行聚合，彻底规避负权重污染。",
      citation: "Callaway & Sant'Anna (2021, JoE)",
      category: "前沿计量",
    },
    {
      term: "Synthetic Control Method (SCM)",
      zh: "合成控制法",
      desc: "当处理组仅有单一单位（如某省或某国）时，通过对所有未处理对照单位进行凸组合加权，拟合出一个在政策实施前所有关键协变量与结果变量均极度拟合处理组的'人造反事实'。",
      citation: "Abadie, Diamond & Hainmueller (2010, JASA)",
      category: "扩展模型",
    },
  ];

  const filteredGlossary = glossaryItems.filter(
    (g) =>
      g.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.zh.includes(searchTerm) ||
      g.desc.includes(searchTerm) ||
      g.category.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 11 · 知识全景大百科
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                因果推断基础知识导引与前沿方法图谱
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              覆盖从潜在结果框架、经典代数拆解、前沿异质性计量分解到顶级期刊稳健性核查清单的全方位计量经济学知识体系。
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto gap-1">
            <button
              onClick={() => setActiveTab("basics")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "basics"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. 核心因果概念
            </button>
            <button
              onClick={() => setActiveTab("models")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "models"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2. 五大主流模型切片
            </button>
            <button
              onClick={() => setActiveTab("pitfalls")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "pitfalls"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3. 识别六大致命陷阱
            </button>
            <button
              onClick={() => setActiveTab("robustness")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "robustness"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              4. 顶级期刊稳健性清单
            </button>
            <button
              onClick={() => setActiveTab("glossary")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "glossary"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              5. 计量概念词典 ({glossaryItems.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Basics & Foundations (NEW COMPREHENSIVE SECTION) */}
        {activeTab === "basics" && (
          <div className="mt-5 space-y-5">
            {/* Core Intuition Card */}
            <div className="p-5 bg-gradient-to-r from-teal-50/70 via-slate-50 to-indigo-50/50 rounded-xl border border-teal-200">
              <div className="flex items-center gap-2 mb-2 text-teal-950 font-serif font-bold text-base">
                <Sparkles className="w-5 h-5 text-teal-700" />
                <span>什么是因果推断？为什么双重差分 (DID) 是当代社会科学的“识别王牌”？</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                在经验经济学中，“相关不等于因果”（Correlation does not imply Causation）。如果单纯比较“享受研发补贴企业”与“未享受补贴企业”的专利产出，或者比较“设立自贸试验区的城市”与“普通城市”的经济增长，会严重受到两类偏误干扰：
                <strong>【选择性偏倚】</strong>（优秀企业/经济发达城市本身更易被选入试点）与<strong>【时间趋势混淆】</strong>（全国宏观经济增长和通货膨胀带来的虚假提升）。
                双重差分方法（Difference-in-Differences, DID）通过“第一次差分消除个体不随时间变动的固有异质性（消除选择偏倚）”，以及“第二次差分消除所有个体共同经历的时间宏观趋势（消除时间混淆）”，最终在微观上精准剥离出政策干预的<strong>净因果效应 (Net Treatment Effect on the Treated, ATT)</strong>。
              </p>
            </div>

            {/* 3 Pillars of DID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-mono">1</span>
                  <span>潜在结果与反事实思维 (Rubin Causal Model)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  任何个体 i 在时刻 t 存在两个潜在结果：接受处理状态 Y_it(1) 与未接受处理状态 Y_it(0)。由于个体在同一时刻只能处于一个状态，因果推断的本质就是寻找最可信的方法去<strong>估计观测不到的反事实状态 Y_it(0)</strong>。
                </p>
                <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-700">
                  ATT = E[ Y_T,Post(1) - Y_T,Post(0) | Treat = 1 ]
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-mono">2</span>
                  <span>平行趋势假定 (Identification Cornerstone)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  平行趋势假定要求：在政策发生之前，处理组与对照组的变动轨迹必须保持同频同步。这一假定保证了对照组的时间变动趋势可以合法充当处理组在反事实状态下的时间变动趋势：
                </p>
                <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-700">
                  E[Y_T,Post(0) - Y_T,Pre(0)] = E[Y_C,Post - Y_C,Pre]
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-mono">3</span>
                  <span>外生拟自然实验 (Quasi-Natural Experiment)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  政策冲击的实施应当具备外生性（Exogeneity），不能由微观个体自身选择或逆向因果驱动。制度断点、突发法律变更、地理边界划分、环保督察批次以及分批次改革试点构成了经济学研究中绝佳的拟自然实验场景。
                </p>
                <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-700">
                  Cov(Treat × Post, ε_it) = 0
                </div>
              </div>
            </div>

            {/* Step-by-Step 6-Stage Workflow */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                <span>实证论文写作：双重差分因果识别全流程标准推进路线图</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 pt-1 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-teal-700 font-bold">STAGE 01</div>
                    <div className="font-bold text-slate-800 mt-0.5">制度背景与断点挖掘</div>
                    <p className="text-[11px] text-slate-500 mt-1">确定政策文件发布时点，明确处理组与对照组划分标准。</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-teal-700 font-bold">STAGE 02</div>
                    <div className="font-bold text-slate-800 mt-0.5">面板数据构建与清洗</div>
                    <p className="text-[11px] text-slate-500 mt-1">构造平衡面板，1%双侧缩尾，消除缺失值与多重共线性。</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-teal-700 font-bold">STAGE 03</div>
                    <div className="font-bold text-slate-800 mt-0.5">基准双向固定效应回归</div>
                    <p className="text-[11px] text-slate-500 mt-1">控制个体与时间双向固定效应，汇报聚类稳健标准误。</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-teal-700 font-bold">STAGE 04</div>
                    <div className="font-bold text-slate-800 mt-0.5">逐期动态事件研究检验</div>
                    <p className="text-[11px] text-slate-500 mt-1">绘制动态置信区间图，执行事前系数联合 Wald 平行检验。</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-teal-700 font-bold">STAGE 05</div>
                    <div className="font-bold text-slate-800 mt-0.5">蒙特卡洛安慰剂检验</div>
                    <p className="text-[11px] text-slate-500 mt-1">500次随机打乱处理组名单，绘制虚假估计值密度分布。</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-teal-700 font-bold">STAGE 06</div>
                    <div className="font-bold text-slate-800 mt-0.5">机制分析与稳健性套件</div>
                    <p className="text-[11px] text-slate-500 mt-1">CSDID 分解、反向时点检验、中介效应传导与审稿答辩。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 5 Models Comparative Slices (EXPANDED TO 5 MODELS) */}
        {activeTab === "models" && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model 1: Classic 2x2 */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-bold">
                      MODEL 01 · 经典单时点
                    </span>
                    <span className="text-xs text-slate-500">Card & Krueger (1994)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    经典 2×2 双重差分
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-800 my-2.5 shadow-2xs">
                    Y = α + β₁Treat + β₂Post + δ(Treat×Post) + ε
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p><strong>适用场景：</strong>政策仅在某一个唯一定点时段爆发（统一前后两期），处理组与对照组界限分明。</p>
                    <p><strong>核心优势：</strong>代数结构极其简洁，因果识别直接透明，无多期处理效应异质性权重污染。</p>
                    <p><strong>关键局限：</strong>难以刻画政策随时间的动态滞后演变或边际衰减趋势。</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <strong>代表案例：</strong>最低工资调整、单次法律颁布
                </div>
              </div>

              {/* Model 2: Staggered TWFE */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                      MODEL 02 · 渐进多时点
                    </span>
                    <span className="text-xs text-slate-500">多期试点 / 渐进推行</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    多期交错双向固定效应 (Staggered TWFE)
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-800 my-2.5 shadow-2xs">
                    Y<sub>it</sub> = α<sub>i</sub> + λ<sub>t</sub> + δ D<sub>it</sub> + X<sub>it</sub>'β + ε<sub>it</sub>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p><strong>适用场景：</strong>中国式试点政策普遍的分期分批推进（如多批次碳交易、智慧城市试点）。</p>
                    <p><strong>核心优势：</strong>兼顾个体异质性与宏观时间冲击吸收，支持构造相对时段事件研究图形。</p>
                    <p><strong>关键局限：</strong>Goodman-Bacon 负权重偏误风险！当效应动态异质时，可能得出相反符号。</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <strong>代表案例：</strong>碳排放权分批试点、高铁逐步通车
                </div>
              </div>

              {/* Model 3: PSM-DID */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">
                      MODEL 03 · 匹配双重差分
                    </span>
                    <span className="text-xs text-slate-500">Heckman et al. (1997)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    倾向得分匹配双重差分 (PSM-DID)
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-800 my-2.5 shadow-2xs">
                    e(X) = Pr(D=1|X) → 匹配同质样本 → DID
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p><strong>适用场景：</strong>处理组与潜在对照组在事前特征存在严重非平衡偏倚，直接做 DID 难以保证共同趋势。</p>
                    <p><strong>核心优势：</strong>非参数化降低函数形式设定依赖，有效消除可观测变量的选择偏误。</p>
                    <p><strong>关键局限：</strong>只能解决可观测变量偏误，无法消除不可观测的时间异质性扰动。</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <strong>代表案例：</strong>研发创新补贴、扶贫重点县扶持
                </div>
              </div>

              {/* Model 4: CSDID (NEW) */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                      MODEL 04 · 前沿异质性
                    </span>
                    <span className="text-xs text-slate-500">Callaway & Sant'Anna (2021)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    异质性稳健聚合估计器 (CSDID)
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-800 my-2.5 shadow-2xs">
                    ATT(g, t) = E[ Y_t - Y_g-1 | G=g ] - E[ Y_t - Y_g-1 | C ]
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p><strong>适用场景：</strong>多期交错推进且处理效应存在动态发散或行业组别异质性。</p>
                    <p><strong>核心优势：</strong>仅以从未处理或尚未处理组为对照，彻底禁止“已处理组充当对照组”，完全消灭负权重偏误。</p>
                    <p><strong>关键局限：</strong>需要充足的从未处理对照组单位作为参照基准池。</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <strong>代表案例：</strong>营改增梯次扩围、自贸试验区批次推行
                </div>
              </div>

              {/* Model 5: Continuous / Intensity DID (NEW) */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      MODEL 05 · 连续强度DID
                    </span>
                    <span className="text-xs text-slate-500">Nunn & Qian (2011)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    连续处理强度双重差分 (Intensity DID)
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-800 my-2.5 shadow-2xs">
                    Y<sub>it</sub> = α<sub>i</sub> + λ<sub>t</sub> + δ(Dose<sub>i</sub> × Post<sub>t</sub>) + ε<sub>it</sub>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p><strong>适用场景：</strong>政策冲击并非0-1二元划分，而是所有个体均受到冲击但初始暴露强度不同（如关税变动、环境污染基准浓度）。</p>
                    <p><strong>核心优势：</strong>充分利用连续暴露剂量变异，统计功效更高。</p>
                    <p><strong>关键局限：</strong>要求不同处理强度组之间的平行趋势假定在边际连续层面上处处成立。</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <strong>代表案例：</strong>两控区污染浓度强度、外贸关税冲击
                </div>
              </div>

              {/* Model 6: DDD (Triple Differences) (NEW) */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                      MODEL 06 · 三重差分法
                    </span>
                    <span className="text-xs text-slate-500">Gruber (1994)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    三重差分模型 (Triple Differences, DDD)
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-800 my-2.5 shadow-2xs">
                    Y = ... + δ(Treat<sub>i</sub> × Group<sub>j</sub> × Post<sub>t</sub>) + ε
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p><strong>适用场景：</strong>处理组与对照组所在区域面临着未被控制的其他并发政策干扰，DID 无法分离。</p>
                    <p><strong>核心优势：</strong>引入不受该政策影响的第三维度群体（如非目标行业），扣除区域层面的共同宏观扰动。</p>
                    <p><strong>关键局限：</strong>回归交互项复杂，系数解释需要非常严谨的经济学直觉支撑。</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <strong>代表案例：</strong>跨区域税制改革中的行业差异识别
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 6 Fatal Pitfalls (EXPANDED TO 6 PITFALLS) */}
        {activeTab === "pitfalls" && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pitfall 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-rose-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>陷阱 01：SUTVA 假设违背与空间溢出效应 (Spillover Bias)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>理论核心：</strong>稳定个体处理值假设 (SUTVA) 要求任意个体的潜在结果不受其他个体处理状态的影响。若某一城市设立自贸区或实施排污规制，导致污染企业跨界转移至邻近非试点城市，则对照组受到间接污染，DID 估计量将被严重高估或低估。
              </p>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>防范对策：</strong>采用空间杜宾差分模型 (Spatial DID) 或人为剔除处理组地理接壤边界的邻近对照样本，构建空间隔离缓冲环。
              </div>
            </div>

            {/* Pitfall 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>陷阱 02：市场预期效应 (Anticipation Effects)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>理论核心：</strong>重大政策往往经历征求意见、法律草案公示等漫长流程。理性的市场主体（如上市公司或地方政府）会提前调整研发、投资或招聘策略。若政策在 2015 年落地，但 2014 年处理组就已发生异动，直接以 2015 年为基点会导致平行趋势检验在事前被误判为违背。
              </p>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>防范对策：</strong>在事件研究模型中将基期参照点进一步前移 1-2 期（如归零 k = -2），或将冲击时点人为前置以测度预期反应。
              </div>
            </div>

            {/* Pitfall 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-blue-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span>陷阱 03：自选择偏倚与挑选获胜者 (Pick the Winners)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>理论核心：</strong>政策试点名单很少是“上帝掷骰子”般的纯随机抽取，往往是经济发达地区自愿申报、专家评审确定的最优试点（Pick the Winners）。这种内生政策制定导致处理组具备更强的政府治理能力和资源禀赋。
              </p>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>防范对策：</strong>引入倾向得分匹配 (PSM-DID)、工具变量 (IV-DID) 或断点回归设计 (RDD)，利用地理边界阻隔或历史外生冲击作为试点的工具变量。
              </div>
            </div>

            {/* Pitfall 4 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-purple-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                <span>陷阱 04：TWFE 负权重与异质性处理效应偏误 (Negative Weights)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>理论核心：</strong>在多期渐进推进中，已处理组（Already Treated）在后期常被算法自动当作尚未处理组的参照物。当处理效应随时间递增时，这些作为参照的单位拥有虚高的反事实斜率，在 TWFE 回归中被赋予负权重，从而产生严重偏误。
              </p>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>防范对策：</strong>放弃标准 TWFE OLS 估计，直接采用 Callaway & Sant'Anna (2021) CSDID 或 Sun & Abraham (2021) 异质性稳健估计器。
              </div>
            </div>

            {/* Pitfall 5 (NEW) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-teal-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-teal-600" />
                <span>陷阱 05：并发政策干扰与混淆冲击 (Confounding Policy Shocks)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>理论核心：</strong>某一地区可能在获得碳交易试点的同时，也是智慧城市试点、自贸区或国家级高新区。如果未对同时期其他重大政策予以控制，核心 DID 系数会将其他政策的正面或负面效应并入，造成因果归因假象。
              </p>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>防范对策：</strong>在基准回归中加入所有并发政策的二元交互项 Treat_other × Post_other，或剔除复合交叉重叠试点样本重新回归。
              </div>
            </div>

            {/* Pitfall 6 (NEW) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                <span>陷阱 06：反向因果与同期内生反馈 (Reverse Causality)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>理论核心：</strong>究竟是“政策导致了产出提升”，还是“产出出现下滑或上升的势头倒逼上级部门定点出台政策拯救或推广”？若存在反向因果关系，估计出的处理效应将产生严重的联立方程偏误。
              </p>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                <strong>防范对策：</strong>反向时点虚构检验（提前2-3年设置假想政策时点，系数若显著则表明存在反向推动）；控制基期高维领先项与前置协变量。
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Top Journal Robustness Checklist (NEW SECTION) */}
        {activeTab === "robustness" && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900 font-serif">
                  AER / QJE / 经济研究 审稿人标准的稳健性检验必备清单 (The Gold Standard Checklist)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                顶级期刊匿名审稿人在收到双重差分实证稿件时，通常会通过以下七大层级逐项排查因果识别是否真实可信。建议学者在论文初稿阶段主动完成全部自检：
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 1</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">以政策前一期为基准的完整事件研究图谱 (Event Study Plot with 95% CI)</div>
                    <div className="text-slate-600">展示从 k = -5 至 k = +5 各相对期估计系数，确保事前系数均包含 0 轴，并汇报联合 Wald 检验 F 统计量与 p 值。</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 2</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">500 次蒙特卡洛虚构处理组空间置换检验 (In-Space Permutation Test)</div>
                    <div className="text-slate-600">随机抽取与真实处理组等量的虚假处理组回归 500 次，证明真实估计量落于虚构分布的极端尾部（经验 p &lt; 0.01）。</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 3</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">反向时点虚构检验 (In-Time Placebo Test)</div>
                    <div className="text-slate-600">人为将政策落地年份虚构提前 2 年或 3 年构造虚假交互项，证明在真正的政策实施前不存在显著的先行政策效应。</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 4</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">排除并发政策与同期干扰事件 (Exclusion of Confounding Policies)</div>
                    <div className="text-slate-600">系统梳理样本期内相关部委出台的同类试点名单，在回归方程中同时控制并发政策交互项，证明核心系数未发生显著衰减。</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 5</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">剔除极端样本与特殊行政区敏感性检验 (Subsample Sensitivity)</div>
                    <div className="text-slate-600">分别剔除四个直辖市（京津沪渝）、省会首位城市、行业龙头特大企业，重新估计确保因果结论不依赖于个别离群杠杆样本。</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 6</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">前沿异质性 DID 稳健估计器校验 (CSDID / Sun-Abraham)</div>
                    <div className="text-slate-600">采用 Goodman-Bacon 分解检查负权重占比，使用 Callaway & Sant'Anna (2021) 稳健估计量对比基准 TWFE，确认符号与显著性一致。</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">CHECK 7</span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">聚类稳健标准误层级调整 (Clustered Standard Errors Level)</div>
                    <div className="text-slate-600">在个体层面（Firm/City）聚类、在省份层面高阶聚类（State-level cluster），或实施野值自举法（Wild Cluster Bootstrap）排查小样本集群问题。</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Searchable Glossary (NEW COMPREHENSIVE SECTION) */}
        {activeTab === "glossary" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索计量术语 (如 SUTVA、反事实、Bacon、平行趋势...)"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div className="text-xs text-slate-500 font-mono">
                共找到 <strong>{filteredGlossary.length}</strong> 条权威词条
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-serif text-sm">
                      {item.zh}
                    </span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-teal-900 font-medium">
                    {item.term}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {item.desc}
                  </p>
                  <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200 font-mono">
                    经典文献基准：{item.citation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
