import { CustomCommand } from "@/commands/type";
import { Language } from "@/i18n/lang";
import { DEFAULT_LANGUAGE } from "@/i18n";

export const LEGACY_SELECTED_TEXT_PLACEHOLDER = "{copilot-selection}";
export const COMMAND_NAME_MAX_LENGTH = 50;
export const QUICK_COMMAND_CODE_BLOCK = "copilotquickcommand";
export const EMPTY_COMMAND: CustomCommand = {
  title: "",
  content: "",
  showInContextMenu: true,
  showInSlashMenu: true,
  order: 0,
  modelKey: "",
  lastUsedMs: 0,
};

export const COPILOT_COMMAND_CONTEXT_MENU_ENABLED = "copilot-command-context-menu-enabled";
export const COPILOT_COMMAND_SLASH_ENABLED = "copilot-command-slash-enabled";
export const COPILOT_COMMAND_CONTEXT_MENU_ORDER = "copilot-command-context-menu-order";
export const COPILOT_COMMAND_MODEL_KEY = "copilot-command-model-key";
export const COPILOT_COMMAND_LAST_USED = "copilot-command-last-used";

const DEFAULT_COMMANDS_EN: CustomCommand[] = [
  {
    title: "Fix grammar and spelling",
    content: `Fix the grammar and spelling of {}. Preserve all formatting, line breaks, and special characters. Do not add or remove any content. Return only the corrected text.`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1000,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "Translate",
    content: `Translate {} to the target language:
    1. Automatically detect the source language
    2. If source is English, translate to Chinese
    3. If source is Chinese, translate to English
    4. Preserve the meaning, tone and formatting
    5. Maintain appropriate cultural context
    Return only the translated text.`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1010,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "Summarize",
    content: `Create a concise bullet-point summary of {}. Each bullet point should capture a key idea or important detail. Return only the bullet-point summary.`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1020,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "Expand and polish",
    content: `Expand and polish {}:
    1. Add relevant details, examples, and explanations
    2. Improve clarity and flow
    3. Enhance readability while maintaining the original message
    4. Make it more engaging and professional
    Return only the expanded and polished text.`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1030,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "Make professional",
    content: `Rewrite {} in a professional and formal style:
    1. Use formal language and academic tone
    2. Improve structure and logical flow
    3. Remove colloquialisms and casual expressions
    4. Maintain all key information and arguments
    Return only the professional version.`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1040,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "Continue writing",
    content: `Continue writing based on {}:
    1. Analyze the context, style, and direction of the text
    2. Write a natural continuation that flows smoothly
    3. Maintain consistency in tone, style, and perspective
    4. Add meaningful content that extends the ideas
    Return only the continuation (do not repeat the original text).`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1050,
    modelKey: "",
    lastUsedMs: 0,
  },
];

const DEFAULT_COMMANDS_ZH: CustomCommand[] = [
  {
    title: "修复语法与拼写",
    content:
      "请修复 {} 的语法和拼写错误。保留所有格式、换行和特殊字符，不要增删内容。只返回修正后的文本。",
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1000,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "翻译",
    content: `翻译 {} 到目标语言：
1. 自动识别源语言
2. 如果源语言是英文，翻译成中文
3. 如果源语言是中文，翻译成英文
4. 保留原意、语气和格式
5. 兼顾文化背景
仅返回翻译结果。`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1010,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "提炼要点",
    content: "请将 {} 概括为简洁的要点列表，每个要点突出一个关键思想或重要细节。仅返回要点列表。",
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1020,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "扩写润色",
    content: `请对 {} 进行扩写和润色：
1. 补充相关细节、示例和解释
2. 提升表达清晰度和流畅性
3. 增强可读性，同时保持原意
4. 让内容更加生动和专业
仅返回扩写润色后的文本。`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1030,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "改写为专业风格",
    content: `请将 {} 改写为专业正式的风格：
1. 使用正式语言和学术化表达
2. 优化结构和逻辑性
3. 移除口语化和随意的表达
4. 保留所有关键信息和论点
仅返回专业版本的文本。`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1040,
    modelKey: "",
    lastUsedMs: 0,
  },
  {
    title: "续写",
    content: `基于 {} 继续写作：
1. 分析文本的语境、风格和走向
2. 写出自然流畅的续写内容
3. 保持语气、风格和视角的一致性
4. 添加有意义的内容来延伸思想
仅返回续写的内容（不要重复原文）。`,
    showInContextMenu: true,
    showInSlashMenu: true,
    order: 1050,
    modelKey: "",
    lastUsedMs: 0,
  },
];

const DEFAULT_COMMANDS_BY_LANGUAGE: Record<Language, CustomCommand[]> = {
  en: DEFAULT_COMMANDS_EN,
  zh: DEFAULT_COMMANDS_ZH,
};

export const DEFAULT_COMMANDS = DEFAULT_COMMANDS_EN;

export function getDefaultCommandsForLanguage(
  language: Language = DEFAULT_LANGUAGE
): CustomCommand[] {
  return (
    DEFAULT_COMMANDS_BY_LANGUAGE[language] || DEFAULT_COMMANDS_BY_LANGUAGE[DEFAULT_LANGUAGE]
  ).map((command) => ({ ...command }));
}
