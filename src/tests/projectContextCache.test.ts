import { ProjectConfig } from "@/aiParams";
import { ContextCache, ProjectContextCache } from "@/cache/projectContextCache";

// Mock dependencies
jest.mock("obsidian", () => ({
  TFile: class MockTFile {
    path: string;
    extension: string;
    basename: string;
    stat: any;

    constructor(path: string, extension: string, basename: string, stat: any) {
      this.path = path;
      this.extension = extension;
      this.basename = basename;
      this.stat = stat;
    }
  },
  TAbstractFile: class MockTAbstractFile {},
  Vault: class MockVault {},
}));

jest.mock("@/logger", () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

// Mock search utils
jest.mock("@/search/searchUtils", () => ({
  getMatchingPatterns: jest.fn().mockReturnValue({
    inclusions: ["**/*.md", "**/*.pdf"],
    exclusions: [],
  }),
  shouldIndexFile: jest.fn().mockImplementation((file) => {
    return file.extension === "md" || file.extension === "pdf";
  }),
}));

// Mock crypto-js
jest.mock("crypto-js", () => ({
  MD5: jest.fn().mockImplementation((str) => ({
    toString: () => `mocked-hash-${str}`,
  })),
}));

// Mock FileCache
jest.mock("@/cache/fileCache", () => {
  return {
    FileCache: {
      getInstance: jest.fn().mockImplementation(() => ({
        getCacheKey: jest
          .fn()
          .mockImplementation(
            (file, additionalContext) => `key-${file.path}-${additionalContext || ""}`
          ),
        get: jest.fn().mockImplementation(async (key) => {
          // Return mock content based on key
          if (key.includes("pdf")) return "Mock PDF content";
          if (key.includes("doc")) return "Mock document content";
          return `Mock content for ${key}`;
        }),
        set: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
        clear: jest.fn().mockResolvedValue(undefined),
      })),
    },
  };
});

// Create custom, simplified mocks for obsidian
const mockApp = {
  vault: {
    adapter: {
      exists: jest.fn().mockResolvedValue(false),
      mkdir: jest.fn().mockResolvedValue(undefined),
      read: jest.fn().mockResolvedValue("{}"),
      write: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      list: jest.fn().mockResolvedValue({ files: [], folders: [] }),
    },
    getFiles: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getAbstractFileByPath: jest.fn(),
  },
  // Add required App properties to satisfy TypeScript
  workspace: {
    getLeavesOfType: jest.fn().mockReturnValue([]),
    getActiveFile: jest.fn().mockReturnValue(null),
  },
  metadataCache: {
    getFileCache: jest.fn().mockReturnValue(null),
  },
  keymap: {},
  scope: {},
  plugins: {
    plugins: {},
    enabledPlugins: new Set(),
    getPlugin: jest.fn(),
  },
};

describe("ProjectContextCache", () => {
  let projectContextCache: ProjectContextCache;
  let mockProject: ProjectConfig;

  // Mock files
  const { TFile: MockedTFile } = jest.requireMock("obsidian");
  const mockMarkdownFile = new MockedTFile("test/file.md", "md", "file", {
    mtime: Date.now(),
    size: 100,
  });

  const mockPdfFile = new MockedTFile("test/document.pdf", "pdf", "document", {
    mtime: Date.now(),
    size: 200,
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock globals
    global.app = mockApp as any;

    // Set up mock vault file retrieval
    mockApp.vault.getFiles.mockReturnValue([mockMarkdownFile, mockPdfFile]);
    mockApp.vault.getAbstractFileByPath.mockImplementation((path) => {
      if (path === mockMarkdownFile.path) return mockMarkdownFile;
      if (path === mockPdfFile.path) return mockPdfFile;
      return null;
    });

    // Reset vault adapter mocks to default behavior
    mockApp.vault.adapter.exists.mockResolvedValue(false);
    mockApp.vault.adapter.read.mockResolvedValue("{}");
    mockApp.vault.adapter.write.mockResolvedValue(undefined);

    // Get actual instance and clear any existing cache
    projectContextCache = ProjectContextCache.getInstance();

    // Mock project with minimal properties for testing
    mockProject = {
      id: "test-project-id",
      name: "Test Project",
      contextSource: {
        inclusions: "**/*.md, **/*.pdf",
        exclusions: "",
      },
    } as any;
  });

  test("should store and retrieve file content", async () => {
    const filePath = "test/document.pdf";
    const content = "PDF content";

    // Initialize a default cache for testing
    await projectContextCache.getOrInitializeCache(mockProject);

    // Store content
    await projectContextCache.setFileContext(mockProject, filePath, content);

    // Get content
    const retrievedContent = await projectContextCache.getOrReuseFileContext(mockProject, filePath);

    // Verify the content was retrieved (note: implementation may return an object instead of string)
    expect(retrievedContent).toBeDefined();
  });

  test("should update project files from patterns", async () => {
    // Create an empty context cache to update
    const contextCache = {
      markdownContext: "",
      markdownNeedsReload: true,
      fileContexts: {},
      timestamp: Date.now(),
    };

    // Call the method with both required parameters
    const updatedCache = await projectContextCache.updateProjectFilesFromPatterns(
      mockProject,
      contextCache
    );

    // Check that files were evaluated using the search pattern
    expect(mockApp.vault.getFiles).toHaveBeenCalled();

    // Verify the updated cache was returned
    expect(updatedCache).toBeDefined();
  });

  test("should clean up project file references", async () => {
    // Initialize a default cache for testing
    await projectContextCache.getOrInitializeCache(mockProject);

    // First add some context
    await projectContextCache.setFileContext(mockProject, mockPdfFile.path, "PDF content");

    // Then clean it up
    await projectContextCache.cleanupProjectFileReferences(mockProject);

    // We can't directly verify internal state, but we can check interactions
    // or verify behavior through getters
    const projectCache = await projectContextCache.get(mockProject);
    expect(projectCache).toBeDefined();
  });

  test("should update project markdown files from patterns", () => {
    // Create an empty context cache to update
    const contextCache = {
      markdownContext: "",
      markdownNeedsReload: true,
      fileContexts: {},
      timestamp: Date.now(),
    };

    // Create a test file list containing Markdown and non-Markdown files
    const testFiles = [
      {
        path: "test/file1.md",
        extension: "md",
        basename: "file1",
        stat: { mtime: Date.now(), size: 100 },
      },
      {
        path: "test/file2.md",
        extension: "md",
        basename: "file2",
        stat: { mtime: Date.now(), size: 200 },
      },
      {
        path: "test/document.pdf",
        extension: "pdf",
        basename: "document",
        stat: { mtime: Date.now(), size: 300 },
      },
    ];

    // Call the method, passing only Markdown files
    const updatedCache = projectContextCache.updateProjectMarkdownFilesFromPatterns(
      mockProject,
      contextCache,
      testFiles as any
    );

    // Verify that only Markdown files were added to the cache
    expect(Object.keys(updatedCache.fileContexts).length).toBe(2);
    expect(updatedCache.fileContexts["test/file1.md"]).toBeDefined();
    expect(updatedCache.fileContexts["test/file2.md"]).toBeDefined();
    expect(updatedCache.fileContexts["test/document.pdf"]).toBeUndefined();

    // Verify that each file entry contains the necessary properties
    Object.values(updatedCache.fileContexts).forEach((entry) => {
      expect(entry).toHaveProperty("timestamp");
      expect(entry).toHaveProperty("cacheKey");
      expect(typeof entry.timestamp).toBe("number");
      expect(typeof entry.cacheKey).toBe("string");
    });
  });

  test("should safely update cache with updateCacheSafely", async () => {
    // Create initial context cache
    const initialCache = {
      markdownContext: "Initial markdown content",
      markdownNeedsReload: false,
      fileContexts: {},
      timestamp: Date.now(),
    };

    // Mock cache existence
    mockApp.vault.adapter.exists.mockResolvedValue(true);
    mockApp.vault.adapter.read.mockResolvedValue(JSON.stringify(initialCache));

    // Define update function
    const updateFn = (cache: any) => {
      cache.markdownContext = "Updated markdown content";
      cache.markdownNeedsReload = true;
      return cache;
    };

    // Execute safe update
    await projectContextCache.updateCacheSafely(mockProject, updateFn);

    // Verify write was called
    expect(mockApp.vault.adapter.write).toHaveBeenCalled();

    // Check that written content contains updated values
    const writeCall = mockApp.vault.adapter.write.mock.calls[0];
    const writtenContent = JSON.parse(writeCall[1]);
    expect(writtenContent.markdownContext).toBe("Updated markdown content");
    expect(writtenContent.markdownNeedsReload).toBe(true);
  });

  test("should safely update cache with updateCacheSafelyAsync", async () => {
    // Create initial context cache
    const initialCache = {
      markdownContext: "Initial markdown content",
      markdownNeedsReload: false,
      fileContexts: {},
      timestamp: Date.now(),
    };

    // Mock cache existence
    mockApp.vault.adapter.exists.mockResolvedValue(true);
    mockApp.vault.adapter.read.mockResolvedValue(JSON.stringify(initialCache));

    // Define async update function
    const asyncUpdateFn = async (cache: any) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      cache.markdownContext = "Async updated content";
      return cache;
    };

    // Execute async safe update
    await projectContextCache.updateCacheSafelyAsync(mockProject, asyncUpdateFn);

    // Verify write was called
    expect(mockApp.vault.adapter.write).toHaveBeenCalled();

    // Check that written content contains updated values
    const writeCall = mockApp.vault.adapter.write.mock.calls[0];
    const writtenContent = JSON.parse(writeCall[1]);
    expect(writtenContent.markdownContext).toBe("Async updated content");
  });

  test("should handle skipIfEmpty parameter correctly in updateCacheSafely", async () => {
    // Create a new project instance to ensure cache isolation
    const isolatedProject = {
      id: "isolated-test-project-id",
      name: "Isolated Test Project",
      contextSource: {
        inclusions: "**/*.md, **/*.pdf",
        exclusions: "",
      },
    } as any;

    // Mock cache non-existence for this isolated project
    mockApp.vault.adapter.exists.mockImplementation((path) => {
      if (path.includes("isolated-test-project-id")) {
        return Promise.resolve(false);
      }
      return Promise.resolve(true);
    });

    // Define update function
    const updateFn = jest.fn((cache: any) => {
      cache.markdownContext = "Should not be called";
      return cache;
    });

    // Execute safe update with skipIfEmpty=true
    await projectContextCache.updateCacheSafely(isolatedProject, updateFn, true);

    // Verify updateFn was not called
    expect(updateFn).not.toHaveBeenCalled();

    // Should throw error when skipIfEmpty=false
    await expect(
      projectContextCache.updateCacheSafely(isolatedProject, updateFn, false)
    ).rejects.toThrow();
  });

  test("should handle concurrent updates with updateCacheSafely", async () => {
    // Create initial context cache with proper types
    const initialCache: ContextCache = {
      markdownContext: "Initial markdown content",
      markdownNeedsReload: false,
      fileContexts: {},
      timestamp: Date.now(),
    };

    // Mock cache storage to simulate real persistence
    let currentCache = initialCache;
    mockApp.vault.adapter.exists.mockResolvedValue(true);
    mockApp.vault.adapter.read.mockImplementation(() => {
      return Promise.resolve(JSON.stringify(currentCache));
    });
    mockApp.vault.adapter.write.mockImplementation((path, content) => {
      currentCache = JSON.parse(content);
      return Promise.resolve();
    });

    // Track execution order and update timing
    const executionOrder: string[] = [];
    const startTime = Date.now();

    // Create update functions to modify different parts of the cache
    const updateMarkdown = (cache: any) => {
      executionOrder.push(`markdown-${Date.now() - startTime}`);
      cache.markdownContext = "Updated markdown content";
      return cache;
    };

    const updateFileRefs = (cache: any) => {
      executionOrder.push(`files-${Date.now() - startTime}`);
      cache.fileContexts["temp.md"] = {
        timestamp: Date.now(),
        cacheKey: "temp-key",
      };
      return cache;
    };

    // Execute concurrent updates
    await Promise.all([
      projectContextCache.updateCacheSafely(mockProject, updateMarkdown),
      projectContextCache.updateCacheSafely(mockProject, updateFileRefs),
    ]);

    // Verify write was called twice
    expect(mockApp.vault.adapter.write).toHaveBeenCalledTimes(2);

    // Verify that all update functions were executed
    expect(executionOrder.length).toBe(2);

    // Verify all updates were applied to the final cache
    expect(currentCache.markdownContext).toBe("Updated markdown content");
    expect(currentCache.fileContexts["temp.md"]).toBeDefined();
  });

  test("should handle concurrent updates with updateCacheSafelyAsync", async () => {
    // Create initial context cache with proper types
    const initialCache: ContextCache = {
      markdownContext: "Initial markdown content",
      markdownNeedsReload: false,
      fileContexts: {},
      timestamp: Date.now(),
    };

    // Mock cache storage to simulate real persistence
    let currentCache = initialCache;
    mockApp.vault.adapter.exists.mockResolvedValue(true);
    mockApp.vault.adapter.read.mockImplementation(() => {
      return Promise.resolve(JSON.stringify(currentCache));
    });

    // Track execution order, write calls and timing
    const executionOrder: string[] = [];
    const writeOrder: string[] = [];
    const startTime = Date.now();

    mockApp.vault.adapter.write.mockImplementation((path, content) => {
      const parsed = JSON.parse(content);
      currentCache = parsed;

      // Track what was written and when
      if (parsed.markdownContext === "Async updated markdown") {
        writeOrder.push(`markdown-${Date.now() - startTime}`);
      } else if (parsed.fileContexts["async-file.md"]) {
        writeOrder.push(`files-${Date.now() - startTime}`);
      }

      return Promise.resolve();
    });

    // Create async update functions with different delays
    const updateMarkdownAsync = async (cache: any) => {
      const startMark = Date.now() - startTime;
      executionOrder.push(`markdown-start-${startMark}`);
      await new Promise((resolve) => setTimeout(resolve, 30));
      cache.markdownContext = "Async updated markdown";
      executionOrder.push(`markdown-end-${Date.now() - startTime}`);
      return cache;
    };

    const updateFileAsync = async (cache: any) => {
      const startMark = Date.now() - startTime;
      executionOrder.push(`files-start-${startMark}`);
      await new Promise((resolve) => setTimeout(resolve, 15));
      cache.fileContexts["async-file.md"] = {
        timestamp: Date.now(),
        cacheKey: "async-file-key",
      };
      executionOrder.push(`files-end-${Date.now() - startTime}`);
      return cache;
    };

    // Execute concurrent async updates
    await Promise.all([
      projectContextCache.updateCacheSafelyAsync(mockProject, updateMarkdownAsync),
      projectContextCache.updateCacheSafelyAsync(mockProject, updateFileAsync),
    ]);

    // Verify all writes occurred
    expect(mockApp.vault.adapter.write).toHaveBeenCalledTimes(2);
    expect(writeOrder.length).toBe(2);

    // Verify all updates were applied to the final cache
    expect(currentCache.markdownContext).toBe("Async updated markdown");
    expect(currentCache.fileContexts["async-file.md"]).toBeDefined();
  });
});
