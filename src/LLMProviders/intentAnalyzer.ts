import { createGetFileTreeTool } from "@/tools/FileTreeTools";
import { localSearchTool } from "@/tools/SearchTools";
import { getCurrentTimeTool } from "@/tools/TimeTools";
import { updateMemoryTool } from "@/tools/memoryTools";
import { AVAILABLE_TOOLS } from "@/components/chat-components/constants/tools";
import { Vault } from "obsidian";

type ToolCall = {
  tool: any;
  args: any;
};

interface AnalyzeContext {
  salientTerms: string[];
}

export class IntentAnalyzer {
  private static isInitialized = false;

  /**
   * Kept for backwards compatibility so existing initialization calls remain harmless.
   */
  static initTools(vault: Vault) {
    if (this.isInitialized) return;
    // Previously used to register FileTree helpers; retained for compatibility.
    createGetFileTreeTool(vault.getRoot());
    this.isInitialized = true;
  }

  static async analyzeIntent(originalMessage: string): Promise<ToolCall[]> {
    const processedToolCalls: ToolCall[] = [];
    const salientTerms = this.extractSalientTerms(originalMessage);

    await this.processAtCommands(originalMessage, processedToolCalls, {
      salientTerms,
    });

    return processedToolCalls;
  }

  private static extractSalientTerms(message: string): string[] {
    const tokens = message
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .filter((token) => !token.startsWith("@"));

    const filtered = tokens
      .map((token) => token.replace(/[^\w#/-]/g, ""))
      .filter((token) => token.length > 2);

    return Array.from(new Set(filtered));
  }

  private static async processAtCommands(
    originalMessage: string,
    processedToolCalls: ToolCall[],
    context: AnalyzeContext
  ): Promise<void> {
    const message = originalMessage.toLowerCase();
    const { salientTerms } = context;

    if (message.includes("@vault")) {
      const cleanQuery = this.removeAtCommands(originalMessage);
      processedToolCalls.push({
        tool: localSearchTool,
        args: {
          query: cleanQuery,
          salientTerms,
        },
      });
    }

    if (message.includes("@memory")) {
      const cleanQuery = this.removeAtCommands(originalMessage);
      processedToolCalls.push({
        tool: updateMemoryTool,
        args: {
          statement: cleanQuery,
        },
      });
    }

    if (message.includes("@time")) {
      processedToolCalls.push({
        tool: getCurrentTimeTool,
        args: {},
      });
    }
  }

  private static removeAtCommands(message: string): string {
    return message
      .split(" ")
      .filter((word) => !AVAILABLE_TOOLS.includes(word.toLowerCase()))
      .join(" ")
      .trim();
  }
}
