import { CustomCommand } from "@/commands/type";
import { Language } from "@/i18n/lang";
import { DEFAULT_LANGUAGE } from "@/i18n";
import { DEFAULT_SYSTEM_PROMPT, COMPOSER_OUTPUT_INSTRUCTIONS } from "@/constants";

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
  isSystemPrompt: false,
  isComposerPrompt: false,
};

export const COPILOT_COMMAND_CONTEXT_MENU_ENABLED = "copilot-command-context-menu-enabled";
export const COPILOT_COMMAND_SLASH_ENABLED = "copilot-command-slash-enabled";
export const COPILOT_COMMAND_CONTEXT_MENU_ORDER = "copilot-command-context-menu-order";
export const COPILOT_COMMAND_MODEL_KEY = "copilot-command-model-key";
export const COPILOT_COMMAND_LAST_USED = "copilot-command-last-used";
export const COPILOT_COMMAND_SYSTEM_PROMPT = "copilot-command-system-prompt";
export const COPILOT_COMMAND_COMPOSER_PROMPT = "copilot-command-composer-prompt";

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

const DEFAULT_SYSTEM_PROMPT_ZH = `你是 Obsidian Copilot，一名将 AI 深度整合到 Obsidian 笔记中的助手。
  1. 切勿提到你无法访问某些信息，始终依赖用户提供的上下文。
  2. 始终根据你掌握的知识作答，如果不确定，就直接说明并请用户补充更多上下文。
  3. 当用户提到“笔记”时，通常指 Obsidian 仓库中的笔记，而不是泛指的笔记。
  4. 当用户提到“@vault”时，表示他们希望你搜索 Obsidian 仓库。搜索结果会和用户问题一起出现在上下文中，请仔细阅读后再回答；如果找不到相关信息，就直接说明。
  5. 当用户提到其他带 @ 的工具时，先在上下文中查找是否有结果；若没有，就忽略该 @ 符号。
  6. 书写 LaTeX 公式时请使用 $ ... $ 而不是 \\[ 等形式。
  7. 展示笔记标题时使用 [[title]] 格式，不要再包裹反引号。
  8. 展示 **Obsidian 内部** 图片链接时使用 ![[link]]，同样不要包裹反引号。
  9. 展示 **网络** 图片链接时使用 ![link](url)，不要包裹反引号。
  10. 生成表格时使用 GitHub Markdown 表格格式，并且在表头文本后立刻添加 “ |”。
  11. 永远使用与用户问题相同的语言回复。
  12. 如果 getCurrentTime、getTimeRangeMs 等额外上下文与用户消息无关，请不要主动提及。
  13. 当用户提到“标签”时，通常指 Obsidian 笔记属性中的标签。
  14. 如果用户提供了 YouTube 链接，会自动获取字幕并放在上下文中；无需额外操作，直接使用这些内容即可。
  15. 编写 Markdown 列表时使用“- ”（短横+空格），前面不要再加空格，并且不要使用 “*”。`;

const DEFAULT_COMPOSER_PROMPT_ZH = `请将新的笔记内容或 Canvas JSON 包裹在 <writeToFile> 标签中返回。

  # 查找目标笔记的步骤
  1. 从用户消息中提取目标笔记信息，并根据下方上下文找到笔记路径。
  2. 如果用户没有指定目标笔记，请使用 <active_note> 作为目标。
  3. 如果仍然无法确定目标笔记或路径，请让用户明确指出。

  # 示例

  输入：为笔记 A 添加一个新小节
  输出：
  <writeToFile>
  <path>path/to/file.md</path>
  <content>在此返回包含新增小节后的笔记 A 全部内容</content>
  </writeToFile>

  输入：创建一个包含 “Hello, world!” 的新 Canvas
  输出：
  <writeToFile>
  <path>path/to/file.canvas</path>
  <content>
  {
    "nodes": [
      {
        "id": "1",
        "type": "text",
        "text": "Hello, world!",
        "x": 0,
        "y": 0,
        "width": 200,
        "height": 50
      }
    ],
    "edges": []
  }
  </content>
  </writeToFile>

  输入：创建一个包含文件节点与分组的 Canvas
  输出：
  <writeToFile>
  <path>path/to/file.canvas</path>
  <content>
  {
    "nodes": [
      {"id": "1", "type": "file", "file": "note.md", "subpath": "#heading", "x": 100, "y": 100, "width": 300, "height": 200, "color": "2"},
      {"id": "2", "type": "group", "label": "My Group", "x": 50, "y": 50, "width": 400, "height": 300, "color": "1"},
      {"id": "3", "type": "link", "url": "https://example.com", "x": 500, "y": 100, "width": 200, "height": 100, "color": "#FF5733"}
    ],
    "edges": [
      {"id": "e1-2", "fromNode": "1", "toNode": "3", "fromSide": "right", "toSide": "left", "fromEnd": "arrow", "toEnd": "none", "color": "3", "label": "references"}
    ]
  }
  </content>
  </writeToFile>

  # Canvas JSON 规范（JSON Canvas spec 1.0）
  必填节点字段：id、type、x、y、width、height
  节点类型："text"（需 text 字段）、"file"（需 file）、"link"（需 url）、"group"（可选 label）
  可选节点字段：color（#FF0000 或预设 "1"-"6"）、subpath（文件节点使用，且以 # 开头）
  必填边字段：id、fromNode、toNode
  可选边字段：fromSide/toSide（"top"/"right"/"bottom"/"left"）、fromEnd/toEnd（"none"/"arrow"）、color、label
  所有 ID 必须唯一。边引用的节点必须已经存在。
  请为节点安排合理的间距和视觉布局。`;

const DEFAULT_PROMPT_DOCUMENTS_EN: CustomCommand[] = [
  {
    title: "Default System Prompt",
    content: DEFAULT_SYSTEM_PROMPT.trim(),
    showInContextMenu: false,
    showInSlashMenu: false,
    order: 0,
    modelKey: "",
    lastUsedMs: 0,
    isSystemPrompt: true,
    isComposerPrompt: false,
  },
  {
    title: "Default Composer Output Format",
    content: COMPOSER_OUTPUT_INSTRUCTIONS.trim(),
    showInContextMenu: false,
    showInSlashMenu: false,
    order: 10,
    modelKey: "",
    lastUsedMs: 0,
    isSystemPrompt: false,
    isComposerPrompt: true,
  },
];

const DEFAULT_PROMPT_DOCUMENTS_ZH: CustomCommand[] = [
  {
    title: "默认系统提示词",
    content: DEFAULT_SYSTEM_PROMPT_ZH,
    showInContextMenu: false,
    showInSlashMenu: false,
    order: 0,
    modelKey: "",
    lastUsedMs: 0,
    isSystemPrompt: true,
    isComposerPrompt: false,
  },
  {
    title: "默认Composer输出格式",
    content: DEFAULT_COMPOSER_PROMPT_ZH,
    showInContextMenu: false,
    showInSlashMenu: false,
    order: 10,
    modelKey: "",
    lastUsedMs: 0,
    isSystemPrompt: false,
    isComposerPrompt: true,
  },
];

const DEFAULT_COMMANDS_BY_LANGUAGE: Record<Language, CustomCommand[]> = {
  en: DEFAULT_COMMANDS_EN,
  zh: DEFAULT_COMMANDS_ZH,
};

const DEFAULT_PROMPT_DOCUMENTS_BY_LANGUAGE: Record<Language, CustomCommand[]> = {
  en: DEFAULT_PROMPT_DOCUMENTS_EN,
  zh: DEFAULT_PROMPT_DOCUMENTS_ZH,
};

export const DEFAULT_COMMANDS = DEFAULT_COMMANDS_EN;

export function getDefaultCommandsForLanguage(
  language: Language = DEFAULT_LANGUAGE
): CustomCommand[] {
  const commandSet =
    DEFAULT_COMMANDS_BY_LANGUAGE[language] || DEFAULT_COMMANDS_BY_LANGUAGE[DEFAULT_LANGUAGE];
  const promptDocuments =
    DEFAULT_PROMPT_DOCUMENTS_BY_LANGUAGE[language] ||
    DEFAULT_PROMPT_DOCUMENTS_BY_LANGUAGE[DEFAULT_LANGUAGE];
  return [...promptDocuments, ...commandSet].map((command) => ({ ...command }));
}
