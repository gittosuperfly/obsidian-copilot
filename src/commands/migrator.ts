import { CustomCommandManager } from "@/commands/customCommandManager";
import { getCustomCommandsFolder, validateCommandName } from "@/commands/customCommandUtils";
import { CustomCommand } from "@/commands/type";
import {
  CopilotSettings,
  getSettings,
  settingsAtom,
  settingsStore,
  updateSetting,
} from "@/settings/model";
import { ensureFolderExists } from "@/utils";
import {
  COPILOT_COMMAND_CONTEXT_MENU_ENABLED,
  COPILOT_COMMAND_CONTEXT_MENU_ORDER,
  COPILOT_COMMAND_LAST_USED,
  COPILOT_COMMAND_MODEL_KEY,
  COPILOT_COMMAND_SLASH_ENABLED,
  EMPTY_COMMAND,
  getDefaultCommandsForLanguage,
} from "@/commands/constants";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { getCachedCustomCommands } from "@/commands/state";
import { DEFAULT_LANGUAGE } from "@/i18n";
import { Language } from "@/i18n/lang";
import { DefaultCommandsOnboardingModal } from "@/components/modals/DefaultCommandsOnboardingModal";

const USER_PROMPT_TITLES: Record<Language, string> = {
  en: "User Custom System Prompt",
  zh: "用户自定义系统提示词",
};

async function saveUnsupportedCommands(commands: CustomCommand[]) {
  const folderPath = getCustomCommandsFolder();
  const unsupportedFolderPath = `${folderPath}/unsupported`;
  // Ensure nested structure exists regardless of platform
  await ensureFolderExists(unsupportedFolderPath);
  return Promise.all(
    commands.map(async (command) => {
      const filePath = `${unsupportedFolderPath}/${command.title}.md`;
      const file = await app.vault.create(filePath, command.content);
      await app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter[COPILOT_COMMAND_CONTEXT_MENU_ENABLED] = command.showInContextMenu;
        frontmatter[COPILOT_COMMAND_SLASH_ENABLED] = command.showInSlashMenu;
        frontmatter[COPILOT_COMMAND_CONTEXT_MENU_ORDER] = command.order;
        frontmatter[COPILOT_COMMAND_MODEL_KEY] = command.modelKey;
        frontmatter[COPILOT_COMMAND_LAST_USED] = 0;
      });
    })
  );
}

/** Migrates the legacy commands in data.json to the new note format. */
export async function migrateCommands() {
  const legacyCommands = getSettings().inlineEditCommands;
  if (!legacyCommands || legacyCommands.length === 0) {
    return;
  }
  const commandsToMigrate: CustomCommand[] = [];
  const unsupportedCommands: CustomCommand[] = [];
  const existingCommands = getCachedCustomCommands();

  const commands = legacyCommands.map((command, index) => ({
    title: command.name,
    content: command.prompt,
    showInContextMenu: command.showInContextMenu,
    showInSlashMenu: false,
    order: index * 10,
    modelKey: command.modelKey ?? "",
    lastUsedMs: 0,
  }));

  for (const command of commands) {
    const error = validateCommandName(command.title, existingCommands);
    if (error) {
      unsupportedCommands.push({
        ...command,
        title: encodeURIComponent(command.title),
        content: `> ${error} \n\nOriginal name: ${command.title} \n\n${command.content}`,
      });
    } else {
      commandsToMigrate.push(command);
    }
  }

  await CustomCommandManager.getInstance().updateCommands([
    ...existingCommands.map((command) => ({
      ...command,
      showInSlashMenu: true,
    })),
    ...commandsToMigrate,
  ]);

  let message = `We have upgraded your commands to the new format. They are now also stored as notes in ${getCustomCommandsFolder()}.`;
  if (unsupportedCommands.length > 0) {
    await saveUnsupportedCommands(unsupportedCommands);
    message += `\n\nWe found ${unsupportedCommands.length} unsupported commands. They are saved in ${getCustomCommandsFolder()}/unsupported. To fix them, please resolve the errors and move the note file out of the unsupported folder.`;
  }

  updateSetting("inlineEditCommands", []);

  new ConfirmModal(app, () => {}, message, "🚀 New Copilot Custom Commands", "OK", "").open();
}

/** Generates the default commands. */
export async function generateDefaultCommands(languageOverride?: Language): Promise<void> {
  const existingCommands = getCachedCustomCommands();
  const resolvedLanguage = languageOverride ?? getSettings().language ?? DEFAULT_LANGUAGE;
  const defaultCommandsForLanguage = getDefaultCommandsForLanguage(resolvedLanguage);
  const defaultCommands = defaultCommandsForLanguage.filter(
    (command) => !existingCommands.some((c) => c.title === command.title)
  );
  const newCommands = [...existingCommands, ...defaultCommands];
  CustomCommandManager.getInstance().updateCommands(newCommands);
}

/** Suggests the default commands if the user has not created any commands yet. */
export async function suggestDefaultCommands(): Promise<void> {
  const suggestedCommand = getSettings().suggestedDefaultCommands;
  if (suggestedCommand) {
    // We only show the modal once
    return;
  }
  const existingCommands = getCachedCustomCommands();
  if (existingCommands.length === 0) {
    const modal = new DefaultCommandsOnboardingModal(
      app,
      (language) => {
        generateDefaultCommands(language);
      },
      () => {}
    );
    modal.open();
    updateSetting("suggestedDefaultCommands", true);
  }
}

export async function migrateUserSystemPrompt(): Promise<void> {
  const settings = getSettings();
  const legacyPrompt = (
    settings as unknown as {
      userSystemPrompt?: string;
    }
  ).userSystemPrompt;

  if (!legacyPrompt || !legacyPrompt.trim()) {
    return;
  }

  const resolvedLanguage = settings.language ?? DEFAULT_LANGUAGE;
  const fallbackTitle = USER_PROMPT_TITLES.en;
  const title = USER_PROMPT_TITLES[resolvedLanguage] ?? fallbackTitle;

  const existingCommands = getCachedCustomCommands();
  const existing = existingCommands.find((command) => command.title === title);

  const promptCommand: CustomCommand = existing
    ? {
        ...existing,
        content: legacyPrompt,
        isSystemPrompt: true,
        isComposerPrompt: false,
        showInContextMenu: false,
        showInSlashMenu: false,
      }
    : {
        ...EMPTY_COMMAND,
        title,
        content: legacyPrompt,
        showInContextMenu: false,
        showInSlashMenu: false,
        order: 100,
        modelKey: "",
        lastUsedMs: 0,
        isSystemPrompt: true,
        isComposerPrompt: false,
      };

  const manager = CustomCommandManager.getInstance();
  if (existing) {
    await manager.updateCommand(promptCommand, existing.title);
  } else {
    await manager.createCommand(promptCommand, { autoOrder: false });
  }

  // Remove userSystemPrompt from settings if it exists (for legacy compatibility)
  const settingsRecord = getSettings() as unknown as Record<string, unknown>;
  if ("userSystemPrompt" in settingsRecord) {
    delete settingsRecord.userSystemPrompt;
    settingsStore.set(settingsAtom, settingsRecord as unknown as CopilotSettings);
  }
}
