import { getCurrentProject, setCurrentProject, setProjectLoading, useChainType } from "@/aiParams";
import { ProjectContextCache } from "@/cache/projectContextCache";
import { ChainType } from "@/chainFactory";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SettingSwitch } from "@/components/ui/setting-switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { logError } from "@/logger";
import { getSettings, updateSetting, useSettingsValue } from "@/settings/model";
import { isRateLimitError } from "@/utils/rateLimitUtils";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  FileText,
  History,
  LibraryBig,
  MessageCirclePlus,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Notice } from "obsidian";
import React from "react";
import {
  ChatHistoryItem,
  ChatHistoryPopover,
} from "@/components/chat-components/ChatHistoryPopover";
import { TokenCounter } from "./TokenCounter";
import { useI18n, translate, DEFAULT_LANGUAGE } from "@/i18n";

export async function refreshVaultIndex() {
  const settings = getSettings();
  const language = settings.language ?? DEFAULT_LANGUAGE;

  try {
    if (settings.enableSemanticSearchV3) {
      // Use VectorStoreManager for semantic search indexing
      const VectorStoreManager = (await import("@/search/vectorStoreManager")).default;
      const count = await VectorStoreManager.getInstance().indexVaultToVectorStore(false);
      new Notice(translate("chat.notice.semanticIndexRefreshed", { count }, language));
    } else {
      // V3 search builds indexes on demand
      new Notice(translate("chat.notice.lexicalOnDemand", {}, language));
    }
  } catch (error) {
    console.error("Error refreshing vault index:", error);
    new Notice(translate("chat.notice.refreshFailed", {}, language));
  }
}

export async function forceReindexVault() {
  const settings = getSettings();
  const language = settings.language ?? DEFAULT_LANGUAGE;

  try {
    if (settings.enableSemanticSearchV3) {
      // Use VectorStoreManager for semantic search indexing
      const VectorStoreManager = (await import("@/search/vectorStoreManager")).default;
      const count = await VectorStoreManager.getInstance().indexVaultToVectorStore(true);
      new Notice(translate("chat.notice.semanticIndexRebuilt", { count }, language));
    } else {
      // V3 search builds indexes on demand
      new Notice(translate("chat.notice.lexicalOnDemand", {}, language));
    }
  } catch (error) {
    console.error("Error force reindexing vault:", error);
    new Notice(translate("chat.notice.reindexFailed", {}, language));
  }
}

export async function reloadCurrentProject() {
  const currentProject = getCurrentProject();
  const language = getSettings().language ?? DEFAULT_LANGUAGE;

  if (!currentProject) {
    new Notice(translate("chat.notice.noProjectReload", {}, language));
    return;
  }

  // Directly execute the reload logic without a confirmation modal
  try {
    setProjectLoading(true); // Start loading indicator

    // Invalidate the markdown context first. This also cleans up file references
    // for files that no longer match project patterns so fresh context is generated.
    await ProjectContextCache.getInstance().invalidateMarkdownContext(currentProject, true);

    // Then, trigger the full load and processing logic via ProjectManager.
    // getProjectContext will call loadProjectContext if markdownNeedsReload is true.
    // loadProjectContext will handle markdown and supported file types (including API calls for new formats).
    const plugin = (app as any).plugins.getPlugin("copilot");
    if (plugin && plugin.projectManager) {
      await plugin.projectManager.getProjectContext(currentProject.id);
      new Notice(translate("chat.notice.projectReloaded", { name: currentProject.name }, language));
    } else {
      throw new Error(translate("chat.notice.pluginUnavailable", {}, language));
    }
  } catch (error) {
    logError("Error reloading project context:", error);

    // Check if this is a rate limit error and let the FileParserManager notice handle it
    if (!isRateLimitError(error)) {
      new Notice(translate("chat.notice.projectReloadFailed", {}, language));
    }
    // If it's a rate limit error, don't show generic failure message - let the rate limit notice show
  } finally {
    setProjectLoading(false); // Stop loading indicator
  }
}

export async function forceRebuildCurrentProjectContext() {
  const currentProject = getCurrentProject();
  const language = getSettings().language ?? DEFAULT_LANGUAGE;

  if (!currentProject) {
    new Notice(translate("chat.notice.noProjectRebuild", {}, language));
    return;
  }

  const modal = new ConfirmModal(
    app,
    async () => {
      try {
        setProjectLoading(true); // Start loading indicator
        new Notice(
          translate("chat.notice.forceRebuildStart", { name: currentProject.name }, language),
          10000
        );

        // Step 1: Completely clear all cached data for this project (in-memory and on-disk)
        await ProjectContextCache.getInstance().clearForProject(currentProject);
        new Notice(translate("chat.notice.cacheCleared", { name: currentProject.name }, language));

        // Step 2: Trigger a full reload from scratch.
        // getProjectContext will call loadProjectContext as the cache is now empty.
        // loadProjectContext will handle markdown and all other supported file types.
        const plugin = (app as any).plugins.getPlugin("copilot");
        if (plugin && plugin.projectManager) {
          await plugin.projectManager.getProjectContext(currentProject.id);
          new Notice(
            translate("chat.notice.projectRebuilt", { name: currentProject.name }, language)
          );
        } else {
          throw new Error(translate("chat.notice.pluginUnavailable", {}, language));
        }
      } catch (error) {
        logError("Error force rebuilding project context:", error);

        // Check if this is a rate limit error and let the FileParserManager notice handle it
        if (!isRateLimitError(error)) {
          new Notice(translate("chat.notice.projectRebuildFailed", {}, language));
        }
        // If it's a rate limit error, don't show generic failure message - let the rate limit notice show
      } finally {
        setProjectLoading(false); // Stop loading indicator
      }
    },
    // Confirmation message with a strong warning
    translate("chat.common.forceRebuildConfirm", { name: currentProject.name }, language),
    translate("chat.common.forceRebuildTitle", {}, language)
  );
  modal.open();
}

interface ChatControlsProps {
  onNewChat: () => void;
  onSaveAsNote: () => void;
  onLoadHistory: () => void;
  onModeChange: (mode: ChainType) => void;
  onCloseProject?: () => void;
  chatHistory: ChatHistoryItem[];
  onUpdateChatTitle: (id: string, newTitle: string) => Promise<void>;
  onDeleteChat: (id: string) => Promise<void>;
  onLoadChat: (id: string) => Promise<void>;
  onOpenSourceFile?: (id: string) => Promise<void>;
  latestTokenCount?: number | null;
}

export function ChatControls({
  onNewChat,
  onSaveAsNote,
  onLoadHistory,
  onModeChange,
  onCloseProject,
  chatHistory,
  onUpdateChatTitle,
  onDeleteChat,
  onLoadChat,
  onOpenSourceFile,
  latestTokenCount,
}: ChatControlsProps) {
  const settings = useSettingsValue();
  const [selectedChain, setSelectedChain] = useChainType();
  const { t } = useI18n();

  const handleModeChange = (chainType: ChainType) => {
    setSelectedChain(chainType);
    onModeChange(chainType);
    if (chainType !== ChainType.PROJECT_CHAIN) {
      setCurrentProject(null);
      onCloseProject?.();
    }
  };

  return (
    <div className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-1">
      <div className="tw-flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost2" size="fit" className="tw-ml-1 tw-text-sm tw-text-muted">
              {selectedChain === ChainType.LLM_CHAIN && t("chat.controls.mode.chat")}
              {selectedChain === ChainType.VAULT_QA_CHAIN && t("chat.controls.mode.qa")}
              {selectedChain === ChainType.ADVANCED_CHAIN && (
                <div className="tw-flex tw-items-center tw-gap-1">
                  <Sparkles className="tw-size-4" />
                  {t("chat.controls.mode.advanced")}
                </div>
              )}
              {selectedChain === ChainType.PROJECT_CHAIN && t("chat.controls.mode.projects")}
              <ChevronDown className="tw-mt-0.5 tw-size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onSelect={() => {
                handleModeChange(ChainType.LLM_CHAIN);
              }}
            >
              {t("chat.controls.mode.chat")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                handleModeChange(ChainType.VAULT_QA_CHAIN);
              }}
            >
              {t("chat.controls.mode.qa")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                handleModeChange(ChainType.ADVANCED_CHAIN);
              }}
            >
              <div className="tw-flex tw-items-center tw-gap-1">
                <Sparkles className="tw-size-4" />
                {t("chat.controls.mode.advanced")}
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="tw-flex tw-items-center tw-gap-1"
              onSelect={() => {
                handleModeChange(ChainType.PROJECT_CHAIN);
              }}
            >
              <LibraryBig className="tw-size-4" />
              {t("chat.controls.mode.projects")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="tw-flex tw-items-center tw-gap-1">
        <div className="tw-mr-2">
          <TokenCounter tokenCount={latestTokenCount ?? null} />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost2"
              size="icon"
              title={t("chat.common.newChat")}
              onClick={onNewChat}
            >
              <MessageCirclePlus className="tw-size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("chat.common.newChat")}</TooltipContent>
        </Tooltip>
        {!settings.autosaveChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost2"
                size="icon"
                title={t("chat.common.saveChat")}
                onClick={onSaveAsNote}
              >
                <Download className="tw-size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("chat.common.saveChat")}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <ChatHistoryPopover
            chatHistory={chatHistory}
            onUpdateTitle={onUpdateChatTitle}
            onDeleteChat={onDeleteChat}
            onLoadChat={onLoadChat}
            onOpenSourceFile={onOpenSourceFile}
          >
            <TooltipTrigger asChild>
              <Button
                variant="ghost2"
                size="icon"
                title={t("chat.common.chatHistory")}
                onClick={onLoadHistory}
              >
                <History className="tw-size-4" />
              </Button>
            </TooltipTrigger>
          </ChatHistoryPopover>
          <TooltipContent>{t("chat.common.chatHistory")}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost2" size="icon" title={t("chat.common.advancedSettings")}>
              <MoreHorizontal className="tw-size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="tw-w-64">
            <DropdownMenuItem
              className="tw-flex tw-justify-between"
              onSelect={(e) => {
                e.preventDefault();
                updateSetting("showSuggestedPrompts", !settings.showSuggestedPrompts);
              }}
            >
              <div className="tw-flex tw-items-center tw-gap-2">
                <Sparkles className="tw-size-4" />
                {t("chat.common.suggestedPrompt")}
              </div>
              <SettingSwitch checked={settings.showSuggestedPrompts} />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="tw-flex tw-justify-between"
              onSelect={(e) => {
                e.preventDefault();
                updateSetting("showRelevantNotes", !settings.showRelevantNotes);
              }}
            >
              <div className="tw-flex tw-items-center tw-gap-2">
                <FileText className="tw-size-4" />
                {t("chat.common.relevantNote")}
              </div>
              <SettingSwitch checked={settings.showRelevantNotes} />
            </DropdownMenuItem>
            {selectedChain === ChainType.PROJECT_CHAIN ? (
              <>
                <DropdownMenuItem
                  className="tw-flex tw-items-center tw-gap-2"
                  onSelect={() => reloadCurrentProject()}
                >
                  <RefreshCw className="tw-size-4" />
                  {t("chat.common.reloadProject")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="tw-flex tw-items-center tw-gap-2"
                  onSelect={() => forceRebuildCurrentProjectContext()}
                >
                  <AlertTriangle className="tw-size-4" />
                  {t("chat.common.forceRebuildContext")}
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  className="tw-flex tw-items-center tw-gap-2"
                  onSelect={() => refreshVaultIndex()}
                >
                  <RefreshCw className="tw-size-4" />
                  {t("chat.common.refreshVaultIndex")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="tw-flex tw-items-center tw-gap-2"
                  onSelect={() => {
                    const modal = new ConfirmModal(
                      app,
                      () => forceReindexVault(),
                      t("chat.common.forceReindexConfirm"),
                      t("chat.common.forceReindexVault")
                    );
                    modal.open();
                  }}
                >
                  <AlertTriangle className="tw-size-4" />
                  {t("chat.common.forceReindexVault")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
