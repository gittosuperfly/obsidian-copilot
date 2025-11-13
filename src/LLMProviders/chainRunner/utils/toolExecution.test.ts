import { executeSequentialToolCall } from "./toolExecution";
import { createTool } from "@/tools/SimpleTool";
import { z } from "zod";

jest.mock("@/logger", () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
  logWarn: jest.fn(),
}));

jest.mock("@/tools/toolManager", () => ({
  ToolManager: {
    callTool: jest.fn(),
  },
}));

import { ToolManager } from "@/tools/toolManager";

describe("toolExecution", () => {
  const mockCallTool = ToolManager.callTool as jest.MockedFunction<typeof ToolManager.callTool>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("executeSequentialToolCall", () => {
    it("should execute tools without isPlusOnly flag", async () => {
      const testTool = createTool({
        name: "testTool",
        description: "Test tool",
        schema: z.object({ input: z.string() }),
        handler: async ({ input }) => `Result: ${input}`,
      });

      mockCallTool.mockResolvedValueOnce("Tool executed successfully");

      const result = await executeSequentialToolCall(
        { name: "testTool", args: { input: "test" } },
        [testTool]
      );

      expect(result).toEqual({
        toolName: "testTool",
        result: "Tool executed successfully",
        success: true,
      });
      expect(mockCallTool).toHaveBeenCalled();
    });

    it("should handle tool not found", async () => {
      const result = await executeSequentialToolCall({ name: "unknownTool", args: {} }, []);

      expect(result).toEqual({
        toolName: "unknownTool",
        result:
          "Error: Tool 'unknownTool' not found. Available tools: . Make sure you have the tool enabled in the Agent settings.",
        success: false,
      });
    });

    it("should handle invalid tool call", async () => {
      const result = await executeSequentialToolCall(null as any, []);

      expect(result).toEqual({
        toolName: "unknown",
        result: "Error: Invalid tool call - missing tool name",
        success: false,
      });
    });
  });
});
