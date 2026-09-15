import React from "react";
import {
  Calculator,
  Sliders,
  Split,
  LineChart,
  Boxes,
  Library,
  Terminal,
  Compass,
  FileSpreadsheet,
  GraduationCap,
} from "lucide-react";
import { LabModule } from "../types";

interface ModuleSliceBarProps {
  activeModule: LabModule;
  onSelectModule: (mod: LabModule) => void;
}

interface ModuleItem {
  id: LabModule;
  index: number;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULES: ModuleItem[] = [
  { id: "theory", index: 1, label: "理论代数", shortDesc: "经典/多期模型推导", icon: Calculator },
  { id: "sandbox", index: 2, label: "2D平行沙盒", shortDesc: "趋势冲击平滑演播", icon: Sliders },
  { id: "counterfactual", index: 3, label: "2D反事实演播", shortDesc: "净因果切片分解", icon: Split },
  { id: "event-study", index: 4, label: "事件研究演播", shortDesc: "动态系数与置信区间", icon: LineChart },
  { id: "placebo", index: 5, label: "安慰剂检验", shortDesc: "500次蒙特卡洛虚构", icon: Boxes },
  { id: "cases", index: 6, label: "六大案例", shortDesc: "经典自然实验一键加载", icon: Library },
  { id: "code", index: 7, label: "代码引擎", shortDesc: "在线运行与独立执行", icon: Terminal },
  { id: "workflow", index: 8, label: "全流程导引", shortDesc: "数据到决策5步全景", icon: Compass },
  { id: "data-report", index: 9, label: "数据与报告", shortDesc: "数据集下载与PDF导出", icon: FileSpreadsheet },
  { id: "knowledge", index: 10, label: "知识导引", shortDesc: "三大模型与陷阱图谱", icon: GraduationCap },
];

export const ModuleSliceBar: React.FC<ModuleSliceBarProps> = ({
  activeModule,
  onSelectModule,
}) => {
  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-2.5 px-4 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-1.5 min-w-max">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none text-center ${
                isActive
                  ? "bg-teal-700 text-white shadow-xs font-semibold"
                  : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
