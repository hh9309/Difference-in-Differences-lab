import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  MessageSquare,
  Settings,
  Key,
  Eye,
  EyeOff,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Check,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { SandboxConfig, LLMModelId, LLMSettings } from "../types";

interface Message {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface AiAssistantModalProps {
  config: SandboxConfig;
  isOpen: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

const STORAGE_KEY = "did_lab_llm_settings_v1";

const DEFAULT_SETTINGS: LLMSettings = {
  selectedModel: "gemini-3-flash",
  apiKey: "",
  customEndpoint: "",
  isConfigured: false,
};

const PRESET_PROMPTS = [
  {
    title: "Bacon 负权重偏误",
    prompt: "请诊断多期交错 DID (Staggered TWFE) 中的异质性处理效应偏误，解释 Goodman-Bacon 分解为什么可能出现负权重以及如何改用 CSDID 估计器？",
  },
  {
    title: "事前趋势轻微违背",
    prompt: "如果实证检验中政策前 k = -2 的系数在 10% 水平上显著异于 0，被审稿人质疑平行趋势假说，我应该如何使用 Rambachan & Roth (2023) 的 Honest DID 进行敏感性分析并答辩？",
  },
  {
    title: "PSM-DID 匹配偏误",
    prompt: "请详细阐述 PSM-DID（倾向得分匹配双重差分）的核心假定（共支撑假设与条件独立假设），以及在面板数据中应当做逐期匹配还是混合匹配？",
  },
  {
    title: "安慰剂检验评审答辩",
    prompt: "审稿人提出：'请补充 500 次虚构政策时点的安慰剂检验以排除不可观测宏观冲击'，我应该如何在实证章节中规范表述其核密度图与经验 p 值的严谨性？",
  },
  {
    title: "当前沙盒参数诊断",
    prompt: "请基于我当前沙盒的配置参数，诊断模型因果识别能力并提出计量改进建议。",
  },
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  config,
  isOpen,
  onClose,
  isEmbedded = false,
}) => {
  // Load persistent LLM settings from localStorage
  const [settings, setSettings] = useState<LLMSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          selectedModel: parsed.selectedModel || "gemini-3-flash",
          apiKey: parsed.apiKey || "",
          customEndpoint: parsed.customEndpoint || "",
          isConfigured: Boolean(parsed.apiKey && parsed.apiKey.trim().length > 0),
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Settings modal / dialog state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempModel, setTempModel] = useState<LLMModelId>(settings.selectedModel);
  const [tempApiKey, setTempApiKey] = useState<string>(settings.apiKey);
  const [tempEndpoint, setTempEndpoint] = useState<string>(settings.customEndpoint || "");
  const [showKeySecret, setShowKeySecret] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string>("");
  const [settingsSuccess, setSettingsSuccess] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "assistant",
      text: `您好！我是双重差分实验室的 AI 计量因果推断专家。我精通经典 2×2 DID、多期交错 TWFE、Goodman-Bacon 分解、Callaway & Sant'Anna (CSDID)、Rambachan & Roth (Honest DID) 以及顶刊审稿人答辩策略。\n\n📌 部署说明：为支持部署在 GitHub 等纯静态环境中由浏览器直接调用，所有大模型调用必须先点击标题最右侧小齿轮 ⚙️ 手工输入 API-Key 并确认大模型。`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      scrollToBottom();
    }
  }, [messages, isOpen, isEmbedded]);

  // Open settings modal and synchronize temp state with saved settings
  const handleOpenSettings = () => {
    setTempModel(settings.selectedModel);
    setTempApiKey(settings.apiKey);
    setTempEndpoint(settings.customEndpoint || "");
    setSettingsError("");
    setSettingsSuccess("");
    setShowSettings(true);
  };

  // Confirm and Save Model Settings
  const handleConfirmSettings = () => {
    const trimmedKey = tempApiKey.trim();
    if (!trimmedKey) {
      setSettingsError("请输入对应的 API-Key 后方可确认大模型！");
      return;
    }

    const updated: LLMSettings = {
      selectedModel: tempModel,
      apiKey: trimmedKey,
      customEndpoint: tempEndpoint.trim(),
      isConfigured: true,
    };

    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSettingsSuccess("大模型与 API-Key 配置成功！已可在浏览器端直接调用。");
    setSettingsError("");

    setTimeout(() => {
      setShowSettings(false);
      setSettingsSuccess("");
    }, 700);
  };

  // Clear Model Settings
  const handleClearSettings = () => {
    setTempApiKey("");
    setTempEndpoint("");
    const cleared: LLMSettings = {
      selectedModel: tempModel,
      apiKey: "",
      customEndpoint: "",
      isConfigured: false,
    };
    setSettings(cleared);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSettingsSuccess("API-Key 已清除。后续提问需重新输入。");
  };

  // Core LLM caller directly from the browser
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal.trim();
    if (!query || isLoading) return;

    // Requirement: 所有大模型调用必须输入API-Key后才能调用
    if (!settings.apiKey.trim() || !settings.isConfigured) {
      handleOpenSettings();
      setSettingsError("请先手工输入 API-Key 并点击【确认大模型】，方可发起大模型调用。");
      return;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsLoading(true);

    // Build academic system prompt with current sandbox econometric context
    const econometricContext = `你是一位世界顶尖的计量经济学与因果推断教授。你精通经典双重差分 (DID)、多期交错 TWFE、Goodman-Bacon 偏误分解、Callaway & Sant'Anna (2021) CSDID、Sun & Abraham (2021)、Rambachan & Roth (2023) Honest DID 敏感性分析、倾向得分匹配 (PSM-DID)、500次安慰剂置换检验以及权威期刊 (AER, QJE, Econometrica, 经济研究, 管理世界) 审稿人质询答辩。
当前用户的双重差分沙盒配置：
- 政策冲击基准年: ${config.shockPeriod} (总时段: ${config.totalPeriods} 期)
- 设定净因果效应幅度: ${config.treatmentEffect}
- 动态冲击响应形态: ${config.shockPattern} (模式: 恒定/发散/凹形/滞后/衰减)
- 是否人为违背事前平行趋势: ${config.violatePreTrend ? "是 (存在前置斜率扭曲)" : "否 (严格满足共同趋势)"}
- 是否引入事前市场预期效应: ${config.anticipationEffect ? "是" : "否"}

请基于严密的因果识别假定（SUTVA, 共同趋势, 无事前预期, 外生冲击），以专业、条理分明、客观且富有指导性的学术规范解答用户的疑问。若涉及公式，请使用标准的 Markdown / LaTeX 格式展现。`;

    try {
      let replyText = "";

      if (settings.selectedModel === "gemini-3-flash") {
        // Direct browser call to Google Generative Language API
        const endpointBase = settings.customEndpoint?.trim() || "https://generativelanguage.googleapis.com";
        const cleanBase = endpointBase.replace(/\/+$/, "");
        const url = `${cleanBase}/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(settings.apiKey.trim())}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${econometricContext}\n\n用户提问：\n${query}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2500,
            },
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errorMsg = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          if (response.status === 400 || response.status === 403 || errorMsg.includes("API_KEY_INVALID")) {
            throw new Error(`API-Key 验证失败 (${errorMsg})。请点击右上角小齿轮 ⚙️ 检查您的 Gemini API-Key。`);
          } else if (response.status === 429) {
            throw new Error(`请求频率超出限额 (429 Too Many Requests)，请稍后重试或检查 API 配额。`);
          } else {
            throw new Error(`Gemini 调用失败: ${errorMsg}`);
          }
        }

        const data = await response.json();
        replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "已完成计量因果推断分析，但大模型未返回正文。";
      } else {
        // Direct browser call to DeepSeek API (deepseek-v4-pro)
        const endpointBase = settings.customEndpoint?.trim() || "https://api.deepseek.com";
        const cleanBase = endpointBase.replace(/\/+$/, "");
        const url = cleanBase.includes("/chat/completions") ? cleanBase : `${cleanBase}/chat/completions`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: econometricContext },
              { role: "user", content: query },
            ],
            temperature: 0.3,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errorMsg = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          if (response.status === 401) {
            throw new Error(`DeepSeek API-Key 无效或已过期 (401 Unauthorized)。请点击右上角小齿轮 ⚙️ 检查密钥。`);
          } else if (response.status === 429) {
            throw new Error(`DeepSeek 请求超出额度或受限 (429 Too Many Requests)，请检查账户余额。`);
          } else {
            throw new Error(`DeepSeek 调用失败: ${errorMsg}`);
          }
        }

        const data = await response.json();
        replyText =
          data?.choices?.[0]?.message?.content ||
          "已完成计量因果推断分析，但大模型未返回正文。";
      }

      const assistantReply: Message = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Direct LLM Call error:", msg);

      const errorReply: Message = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `⚠️ **大模型调用提示**：\n\n${msg}\n\n*提示：如果遇到跨域 (CORS) 限制或端点错误，请点击右上角小齿轮 ⚙️ 切换至 gemini 3 flash 或在高级选项中配置反向代理端点。*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const content = (
    <div className="flex flex-col h-full relative">
      {/* Modal / Section Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 font-serif">
                AI 计量因果推断专家对话
              </h3>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                GitHub 静态部署 · 浏览器直调
              </span>
            </div>
            <p className="text-xs text-slate-500">
              支持 gemini 3 flash 与 deepseek-v4-pro 双模型 · 诊断偏误与答辩策略
            </p>
          </div>
        </div>

        {/* Far Right Action Buttons (Gear settings icon strictly on the far right of the title) */}
        <div className="flex items-center space-x-2">
          {/* Active Model Status Tag */}
          <div
            onClick={handleOpenSettings}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${
              settings.isConfigured
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse"
            }`}
            title="点击修改大模型与 API-Key"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.isConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="font-mono font-semibold">
              {settings.selectedModel === "gemini-3-flash" ? "gemini 3 flash" : "deepseek-v4-pro"}
            </span>
            <span className="text-[10px] opacity-80">
              {settings.isConfigured ? "已就绪" : "待输入Key"}
            </span>
          </div>

          {/* Gear Icon Button for Model Settings */}
          <button
            onClick={handleOpenSettings}
            title="设置大模型与手工输入 API-Key"
            aria-label="设置大模型与手工输入 API-Key"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg transition-all shadow-2xs cursor-pointer group"
          >
            <Settings className="w-4 h-4 text-slate-600 group-hover:text-teal-700 group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xs font-semibold hidden md:inline">设置大模型</span>
          </button>

          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner if API Key is not configured */}
      {!settings.isConfigured && (
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>未配置 API-Key</strong>：为适配 GitHub 静态部署，所有大模型调用均由浏览器本地直接发起，必须先输入 API-Key 确认后才能调用。
            </span>
          </div>
          <button
            onClick={handleOpenSettings}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
          >
            立即设置大模型
          </button>
        </div>
      )}

      {/* Preset quick topic chips */}
      <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>快捷诊断:</span>
          </span>
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p.prompt)}
              className="px-2.5 py-1 text-xs bg-white text-slate-700 hover:text-teal-900 hover:border-teal-300 border border-slate-200 rounded-md transition-all shadow-2xs font-medium cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chat conversation area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 min-h-[360px] max-h-[500px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-3 ${
              m.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                m.sender === "user"
                  ? "bg-slate-800 text-white"
                  : m.isError
                  ? "bg-rose-700 text-white"
                  : "bg-teal-700 text-white"
              }`}
            >
              {m.sender === "user" ? (
                <User className="w-4 h-4" />
              ) : m.isError ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-teal-700 text-white shadow-xs"
                  : m.isError
                  ? "bg-rose-50 border border-rose-200 text-rose-900 shadow-xs"
                  : "bg-white border border-slate-200 text-slate-800 shadow-xs"
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              <div
                className={`text-[10px] mt-2 font-mono ${
                  m.sender === "user" ? "text-teal-200" : "text-slate-400"
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center space-x-2 text-xs text-slate-600">
              <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span>
                正在调用 <strong>{settings.selectedModel}</strong> 分析计量因果假定与模型偏误...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              settings.isConfigured
                ? `使用 ${settings.selectedModel} 提问关于 DID、TWFE、Bacon 分解或审稿人答辩...`
                : "请先点击右上角小齿轮 ⚙️ 设置 API-Key 并确认大模型..."
            }
            className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>发送</span>
          </button>
        </form>
      </div>

      {/* Model & API-Key Configuration Modal / Popover */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92%] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-xs">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">
                    大模型配置 (Model Settings)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    选择大模型并手工输入 API-Key，支持 GitHub 静态部署浏览器直调
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Feedback messages */}
              {settingsError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{settingsError}</span>
                </div>
              )}
              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {/* Requirement 2: 选择两个大模型 gemini 3 flash 和 deepseek-v4-pro */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-700" />
                  <span>第一步：选择大模型 (Select Model)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: gemini 3 flash */}
                  <div
                    onClick={() => setTempModel("gemini-3-flash")}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      tempModel === "gemini-3-flash"
                        ? "border-teal-600 bg-teal-50/50 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          gemini 3 flash
                        </span>
                        {tempModel === "gemini-3-flash" && (
                          <Check className="w-4 h-4 text-teal-700" />
                        )}
                      </div>
                      <span className="inline-block px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-medium mb-2">
                        Google AI Studio · 极速响应
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        精通因果推断识别理论、平行趋势假定敏感性检验与顶刊审稿意见专业答辩。
                      </p>
                    </div>
                  </div>

                  {/* Option 2: deepseek-v4-pro */}
                  <div
                    onClick={() => setTempModel("deepseek-v4-pro")}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      tempModel === "deepseek-v4-pro"
                        ? "border-teal-600 bg-teal-50/50 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          deepseek-v4-pro
                        </span>
                        {tempModel === "deepseek-v4-pro" && (
                          <Check className="w-4 h-4 text-teal-700" />
                        )}
                      </div>
                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-medium mb-2">
                        DeepSeek Platform · 深度推理
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        擅长多期交错 TWFE 负权重数理分解、Goodman-Bacon 权重推导与实证代码纠错。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement 1: 手工输入 API-Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-teal-700" />
                    <span>第二步：手工输入 API-Key</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {tempModel === "gemini-3-flash"
                      ? "格式通常以 AIzaSy... 开头"
                      : "格式通常以 sk-... 开头"}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showKeySecret ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => {
                      setTempApiKey(e.target.value);
                      if (settingsError) setSettingsError("");
                    }}
                    placeholder={
                      tempModel === "gemini-3-flash"
                        ? "请输入您的 Google Gemini API Key (例如 AIzaSy...)"
                        : "请输入您的 DeepSeek API Key (例如 sk-...)"
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-10 py-2.5 font-mono focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showKeySecret ? "隐藏 Key" : "查看明文 Key"}
                  >
                    {showKeySecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5">
                  {tempModel === "gemini-3-flash" ? (
                    <span>
                      可通过{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 underline font-medium"
                      >
                        Google AI Studio API Keys
                      </a>{" "}
                      免费申请并获取。
                    </span>
                  ) : (
                    <span>
                      可通过{" "}
                      <a
                        href="https://platform.deepseek.com/api_keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 underline font-medium"
                      >
                        DeepSeek 开放平台
                      </a>{" "}
                      申请并获取。
                    </span>
                  )}
                </p>
              </div>

              {/* Optional Custom API Endpoint (for reverse proxies or custom mirrors) */}
              <div className="pt-2 border-t border-slate-100">
                <details className="group">
                  <summary className="text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer list-none flex items-center space-x-1">
                    <span className="group-open:rotate-90 transition-transform">▸</span>
                    <span>高级配置：自定义 API 代理端点 (可选，用于反向代理/中继站)</span>
                  </summary>
                  <div className="mt-2.5 pl-3">
                    <input
                      type="text"
                      value={tempEndpoint}
                      onChange={(e) => setTempEndpoint(e.target.value)}
                      placeholder={
                        tempModel === "gemini-3-flash"
                          ? "默认官方端点: https://generativelanguage.googleapis.com"
                          : "默认官方端点: https://api.deepseek.com"
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      如您在纯前端调用中遇到跨域 (CORS) 限制，可填入支持 CORS 的 API 代理 URL。
                    </span>
                  </div>
                </details>
              </div>

              {/* Static GitHub Pages Security & Privacy statement */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>纯静态部署安全保证</strong>：您的 API-Key 仅保存在当前浏览器的 localStorage 中，所有调用均由浏览器本地直接向模型服务发起，无任何后端服务器转存，完全保障密钥私密与安全性。
                </div>
              </div>
            </div>

            {/* Modal Footer: Requirement 3 确认大模型 */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {settings.isConfigured && (
                  <button
                    type="button"
                    onClick={handleClearSettings}
                    className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 cursor-pointer px-2 py-1 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清除密钥</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSettings}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>确认大模型</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh]">
        {content}
      </div>
    </div>
  );
};
