import React, { useState } from "react";
import {
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Scale,
  GitCommit,
} from "lucide-react";

export const TheoryAlgebra: React.FC = () => {
  // Interactive 2x2 matrix state
  const [ytPre, setYtPre] = useState<number>(20.4);
  const [ytPost, setYtPost] = useState<number>(28.2);
  const [ycPre, setYcPre] = useState<number>(18.0);
  const [ycPost, setYcPost] = useState<number>(21.5);

  const deltaYT = ytPost - ytPre;
  const deltaYC = ycPost - ycPre;
  const didEstimate = deltaYT - deltaYC;

  // Selected derivation slice tab
  const [algebraTab, setAlgebraTab] = useState<"classic" | "potential" | "twfe" | "bacon">("classic");

  return (
    <div className="space-y-6">
      {/* Top Banner with Model Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                模块 01
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                双重差分理论代数与模型推导
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              形式化构建 2×2 经典 DID、潜在因果产出反事实框架、双向固定效应 (TWFE) 及 Goodman-Bacon 分解代数结构。
            </p>
          </div>

          {/* Sliced tab switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setAlgebraTab("classic")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                algebraTab === "classic"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              经典 2×2 DID
            </button>
            <button
              onClick={() => setAlgebraTab("potential")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                algebraTab === "potential"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              潜在产出反事实
            </button>
            <button
              onClick={() => setAlgebraTab("twfe")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                algebraTab === "twfe"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              多期双向固定效应
            </button>
            <button
              onClick={() => setAlgebraTab("bacon")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                algebraTab === "bacon"
                  ? "bg-white text-teal-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Goodman-Bacon 偏误
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="mt-5">
          {algebraTab === "classic" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200/90">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  经典双重差分形式化回归方程
                </h3>
                <div className="bg-white p-3.5 rounded-md border border-slate-200 text-center font-mono text-base md:text-lg text-slate-900 font-semibold shadow-2xs">
                  Y<sub>it</sub> = α + β<sub>1</sub>Treat<sub>i</sub> + β<sub>2</sub>Post<sub>t</sub> + <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">δ (Treat<sub>i</sub> × Post<sub>t</sub>)</span> + ε<sub>it</sub>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs text-slate-600">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">α (截距项):</span> 对照组政策前的基线水平 E[Y|Treat=0, Post=0]
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">β<sub>1</sub> (处理组效应):</span> 处理组与对照组固有初始差异 (Selection Bias)
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">β<sub>2</sub> (时间趋势效应):</span> 宏观共同时间趋势 (Common Time Trend)
                  </div>
                  <div className="bg-white p-2.5 rounded border border-teal-300 bg-teal-50/50">
                    <span className="font-semibold text-teal-900">δ (因果识别量):</span> 净政策处置效应 (Net Treatment Effect)
                  </div>
                </div>
              </div>

              {/* Mathematical Derivation Steps */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-teal-700" />
                  <span>因果效应估计量 δ̂ 的双重求差严密数学推导</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800 flex items-center space-x-1">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                      <span>处理组一阶差 (前后对比)</span>
                    </div>
                    <p className="font-mono text-slate-700">
                      ΔY<sub>T</sub> = E[Y|T=1,P=1] - E[Y|T=1,P=0]
                    </p>
                    <p className="font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                      = (α + β<sub>1</sub> + β<sub>2</sub> + δ) - (α + β<sub>1</sub>) = <span className="font-bold">β<sub>2</sub> + δ</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      不仅包含了真实因果效应 δ，还混杂了宏观时间趋势 β<sub>2</sub>。
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800 flex items-center space-x-1">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                      <span>对照组一阶差 (同期宏观变动)</span>
                    </div>
                    <p className="font-mono text-slate-700">
                      ΔY<sub>C</sub> = E[Y|T=0,P=1] - E[Y|T=0,P=0]
                    </p>
                    <p className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      = (α + β<sub>2</sub>) - α = <span className="font-bold">β<sub>2</sub></span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      由于对照组未受政策干预，其变动纯粹代表了自然宏观趋势 β<sub>2</sub>。
                    </p>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200 text-xs space-y-1.5">
                    <div className="font-semibold text-teal-900 flex items-center space-x-1">
                      <span className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">3</span>
                      <span>双重求差 (消除宏观干扰)</span>
                    </div>
                    <p className="font-mono text-teal-900">
                      δ̂<sub>DID</sub> = ΔY<sub>T</sub> - ΔY<sub>C</sub>
                    </p>
                    <p className="font-mono text-teal-950 font-bold bg-white px-1.5 py-0.5 rounded border border-teal-300">
                      = (β<sub>2</sub> + δ) - β<sub>2</sub> = <span className="text-teal-700 text-sm">δ</span>
                    </p>
                    <p className="text-[11px] text-teal-800">
                      通过两次求差，彻底抵消了不随时间改变的组间差异与全局时间冲击！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {algebraTab === "potential" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Rubin 潜在产出框架与反事实定义
                </h3>
                <div className="bg-white p-3.5 rounded-md border border-slate-200 text-center font-mono text-base text-slate-900 font-semibold shadow-2xs">
                  Y<sub>it</sub> = (1 - D<sub>it</sub>) · Y<sub>it</sub>(0) + D<sub>it</sub> · Y<sub>it</sub>(1)
                </div>
                <div className="mt-3 text-xs text-slate-600 space-y-2">
                  <p>
                    • <strong>Y<sub>it</sub>(1)</strong>：个体 i 在时期 t 若<strong>接受政策干预</strong>的潜在产出；
                  </p>
                  <p>
                    • <strong>Y<sub>it</sub>(0)</strong>：个体 i 在时期 t 若<strong>未接受政策干预</strong>的潜在产出（反事实产出）；
                  </p>
                  <p>
                    • <strong>因果识别根本困难</strong>：对于政策实施后的处理组，我们只能观测到 Y<sub>it</sub>(1)，而其在同时期若没有政策的潜在状态 Y<sub>it</sub>(0) 是<strong>永远不可观测的反事实 (Unobservable Counterfactual)</strong>。
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center space-x-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>平行趋势假说 (Parallel Trends Assumption) 的形式化定义</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 font-mono text-center font-semibold text-slate-900">
                  E[Y<sub>i,Post</sub>(0) - Y<sub>i,Pre</sub>(0) | Treat<sub>i</sub> = 1] = E[Y<sub>i,Post</sub>(0) - Y<sub>i,Pre</sub>(0) | Treat<sub>i</sub> = 0]
                </div>
                <p className="text-slate-700">
                  <strong>直觉含义</strong>：在“假定政策未曾发生”的反事实世界中，处理组潜在产出的自然时间变动趋势，与同期实际未受干预的对照组产出变动趋势完全平行一致。只有该假定成立，对照组的变动才可合法充当处理组的反事实替代！
                </p>
              </div>
            </div>
          )}

          {algebraTab === "twfe" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  多期交错双向固定效应 (TWFE) 模型
                </h3>
                <div className="bg-white p-3.5 rounded-md border border-slate-200 text-center font-mono text-base text-slate-900 font-semibold shadow-2xs">
                  Y<sub>it</sub> = α<sub>i</sub> + λ<sub>t</sub> + <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">δ D<sub>it</sub></span> + X<sub>it</sub>'β + ε<sub>it</sub>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">α<sub>i</sub> (个体固定效应):</span> 吸收所有不随时间变化的省份/城市/企业特征（如地理区位、文化传统、初始要素禀赋）。
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">λ<sub>t</sub> (时间固定效应):</span> 吸收所有不随个体变化的宏观冲击（如全国经济周期、通胀波动、突发公共事件）。
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                  <span>事件研究 (Event Study) 动态回归方程设定</span>
                </h3>
                <div className="bg-slate-50 p-3 rounded font-mono text-sm text-center text-slate-900 font-semibold border border-slate-200">
                  Y<sub>it</sub> = α<sub>i</sub> + λ<sub>t</sub> + ∑<sub>k ∈ [-T<sub>pre</sub>, T<sub>post</sub>], k ≠ -1</sub> δ<sub>k</sub> · 𝕀(t - E<sub>i</sub> = k) + X<sub>it</sub>'β + ε<sub>it</sub>
                </div>
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p>• E<sub>i</sub> 表示个体 i 正式受到政策处理的年份；k = t - E<sub>i</sub> 表示相对于政策落地的相对时期；</p>
                  <p>• <strong>必须强制设定 k = -1（政策前一期）为基准归一期（δ<sub>-1</sub> ≡ 0）</strong>，以消除完全共线性；</p>
                  <p>• 若 ∀ k &lt; -1，系数 δ<sub>k</sub> 均在 0 附近波动且统计不显著，则强有力支持平行趋势假说。</p>
                </div>
              </div>
            </div>
          )}

          {algebraTab === "bacon" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Goodman-Bacon (2021) 分解与负权重偏误警告</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  在政策分期分批交错推行（Staggered Rollout）的实证场景中，传统 TWFE 的 OLS 估计量本质是<strong>所有两两 2×2 DID 估计量的加权总和</strong>：
                </p>
                <div className="bg-white p-3 rounded border border-amber-200 font-mono text-sm text-center font-bold text-amber-950 my-2">
                  β̂<sup>TWFE</sup> = ∑<sub>k</sub> w<sub>k</sub> · β̂<sub>k</sub><sup>2×2</sup>, &nbsp;&nbsp; ∑<sub>k</sub> w<sub>k</sub> = 1
                </div>
                <div className="space-y-1.5 text-xs text-amber-900">
                  <p className="font-semibold">Bacon 分解将比较池拆分为四大类：</p>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-slate-700">
                    <li><strong>Early vs. Later (前期 vs. 后期)</strong>：以尚未受处理的后期组作为前期组的清洁对照；</li>
                    <li><strong>Treated vs. Never-Treated</strong>：以从不接受处理的样本作为清洁对照；</li>
                    <li><strong>Later vs. Already-Treated (危险源！)</strong>：<strong>此时“早已接受政策且仍在经历动态处理效应”的前期组被充当对照组！</strong></li>
                  </ul>
                  <p className="text-rose-700 font-semibold bg-rose-50 p-2 rounded border border-rose-200 mt-2">
                    致命后果：如果政策具有随时间扩大的动态累积效应，已处理组的反事实走势将严重向下或向上偏斜，导致权重 w<sub>k</sub> &lt; 0（负权重）。此时即便真实因果效应全部为正，回归也有可能估算出显著为负的荒谬结果！
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive 2x2 DID Matrix Calculator */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              2×2 经典双重差分求差演播计算器 (Interactive 2x2 Matrix)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            可自由微调下方四个均值输入框，实时核算一阶差与二阶因果差分
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 2x2 Matrix Inputs */}
          <div className="lg:col-span-8 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700">
                  <th className="p-3 font-semibold border border-slate-200">样本组别</th>
                  <th className="p-3 font-semibold border border-slate-200">政策前均值 (Pre)</th>
                  <th className="p-3 font-semibold border border-slate-200">政策后均值 (Post)</th>
                  <th className="p-3 font-semibold border border-slate-200 bg-slate-200/60">
                    一阶差分 (ΔY = Post - Pre)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Treated Group Row */}
                <tr className="bg-teal-50/30">
                  <td className="p-3 font-bold text-teal-900 border border-slate-200 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
                    <span>处理组 (Treated, T=1)</span>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-[10px]">Ȳ<sub>T,0</sub>:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={ytPre}
                        onChange={(e) => setYtPre(parseFloat(e.target.value) || 0)}
                        className="w-20 p-1.5 font-mono text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-[10px]">Ȳ<sub>T,1</sub>:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={ytPost}
                        onChange={(e) => setYtPost(parseFloat(e.target.value) || 0)}
                        className="w-20 p-1.5 font-mono text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-teal-950 border border-slate-200 bg-teal-50/50">
                    ΔY<sub>T</sub> = {deltaYT > 0 ? `+${deltaYT.toFixed(2)}` : deltaYT.toFixed(2)}
                  </td>
                </tr>

                {/* Control Group Row */}
                <tr className="bg-slate-50/40">
                  <td className="p-3 font-bold text-slate-700 border border-slate-200 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                    <span>对照组 (Control, T=0)</span>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-[10px]">Ȳ<sub>C,0</sub>:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={ycPre}
                        onChange={(e) => setYcPre(parseFloat(e.target.value) || 0)}
                        className="w-20 p-1.5 font-mono text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-[10px]">Ȳ<sub>C,1</sub>:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={ycPost}
                        onChange={(e) => setYcPost(parseFloat(e.target.value) || 0)}
                        className="w-20 p-1.5 font-mono text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800 border border-slate-200 bg-slate-100">
                    ΔY<sub>C</sub> = {deltaYC > 0 ? `+${deltaYC.toFixed(2)}` : deltaYC.toFixed(2)}
                  </td>
                </tr>

                {/* Group Difference Row */}
                <tr className="bg-slate-100/60 font-semibold text-slate-700">
                  <td className="p-3 border border-slate-200">组间截面差 (T - C)</td>
                  <td className="p-3 font-mono border border-slate-200">
                    {(ytPre - ycPre) > 0 ? `+${(ytPre - ycPre).toFixed(2)}` : (ytPre - ycPre).toFixed(2)}
                    <span className="text-[10px] text-slate-400 ml-1 block">(选择偏倚)</span>
                  </td>
                  <td className="p-3 font-mono border border-slate-200">
                    {(ytPost - ycPost) > 0 ? `+${(ytPost - ycPost).toFixed(2)}` : (ytPost - ycPost).toFixed(2)}
                    <span className="text-[10px] text-slate-400 ml-1 block">(后期总差异)</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-teal-900 border border-teal-300 bg-teal-100/60">
                    δ̂ = {didEstimate > 0 ? `+${didEstimate.toFixed(2)}` : didEstimate.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Real-time Calculation Result Slice */}
          <div className="lg:col-span-4 bg-teal-900 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-teal-200 text-xs font-mono uppercase tracking-wider mb-2">
                <span>因果效应估计量</span>
                <span className="px-2 py-0.5 bg-teal-800 text-teal-100 rounded text-[10px]">
                  Double Diff
                </span>
              </div>
              <div className="text-3xl font-extrabold font-mono tracking-tight text-white mb-1">
                {didEstimate > 0 ? `+${didEstimate.toFixed(2)}` : didEstimate.toFixed(2)}
              </div>
              <p className="text-xs text-teal-200/90 leading-relaxed mt-2">
                计算公式: δ̂ = ΔY<sub>T</sub> - ΔY<sub>C</sub>
                <br />
                = ({deltaYT.toFixed(2)}) - ({deltaYC.toFixed(2)}) ={" "}
                <span className="font-bold underline text-white">
                  {didEstimate.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-teal-700/60 text-[11px] text-teal-200/80 space-y-1">
              <div className="flex justify-between">
                <span>处理组自然反事实 Ȳ<sub>T</sub>(0):</span>
                <span className="font-mono text-white">{(ytPre + deltaYC).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>净因果提升比例:</span>
                <span className="font-mono text-white">
                  {ytPre !== 0 ? `${((didEstimate / ytPre) * 100).toFixed(1)}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
