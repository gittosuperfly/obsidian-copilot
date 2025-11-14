import { sortCommandsByOrder, removeQuickCommandBlocks } from "@/commands/customCommandUtils";
import { getCachedCustomCommands } from "@/commands/state";
import { QUICK_COMMAND_CODE_BLOCK } from "@/commands/constants";
import { Menu, Notice, Editor } from "obsidian";
import { CustomCommand } from "./type";
import { v4 as uuidv4 } from "uuid";
import { SelectedTextContext } from "@/types/message";
import { setSelectedTextContexts } from "@/aiParams";
import CopilotPlugin from "@/main";
import { CustomCommandChatModal } from "@/commands/CustomCommandChatModal";
import { CustomCommandManager } from "@/commands/customCommandManager";
import { isSourceModeOn } from "@/utils";
import { translate } from "@/i18n";
import { getSettings } from "@/settings/model";
import { DEFAULT_LANGUAGE } from "@/i18n";

export function registerContextMenu(menu: Menu, editor: Editor) {
  // Get the plugin instance
  const plugin = (app as any).plugins.plugins["obsidian-copilot"] as CopilotPlugin;

  // Get current language setting
  const settings = getSettings();
  const language = settings.language ?? DEFAULT_LANGUAGE;

  // Create the main "Copilot" submenu
  menu.addItem((item) => {
    item.setTitle(translate("contextMenu.copilot", {}, language));
    const submenu = new Menu();
    (item as any).submenu = submenu;

    // Add the main selection command
    submenu.addItem((subItem) => {
      subItem
        .setTitle(translate("contextMenu.addSelectionToContext", {}, language))
        .onClick(async () => {
          if (!editor) {
            new Notice(translate("contextMenu.notice.noEditor", {}, language));
            return;
          }

          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice(translate("contextMenu.notice.noTextSelected", {}, language));
            return;
          }

          const activeFile = app.workspace.getActiveFile();
          if (!activeFile) {
            new Notice(translate("contextMenu.notice.noActiveFile", {}, language));
            return;
          }

          // Get selection range to determine line numbers
          const selectionRange = editor.listSelections()[0];
          if (!selectionRange) {
            new Notice(translate("contextMenu.notice.couldNotDetermineRange", {}, language));
            return;
          }

          const startLine = selectionRange.anchor.line + 1;
          const endLine = selectionRange.head.line + 1;

          // Create selected text context
          const selectedTextContext: SelectedTextContext = {
            id: uuidv4(),
            content: selectedText,
            noteTitle: activeFile.basename,
            notePath: activeFile.path,
            startLine: Math.min(startLine, endLine),
            endLine: Math.max(startLine, endLine),
          };

          // Set the selected text context
          setSelectedTextContexts([selectedTextContext]);

          // Open chat window to show the context was added
          if (plugin) {
            plugin.activateView();
          }
        });
    });

    submenu.addItem((subItem) => {
      subItem.setTitle(translate("contextMenu.triggerQuickCommand", {}, language)).onClick(() => {
        if (!editor) {
          new Notice(translate("contextMenu.notice.noEditor", {}, language));
          return;
        }

        // Check if in source mode
        if (isSourceModeOn()) {
          new Notice(translate("contextMenu.notice.quickCommandNotAvailable", {}, language));
          return;
        }

        // Check if text is selected
        const selectedText = editor.getSelection();
        if (!selectedText.trim()) {
          new Notice(translate("contextMenu.notice.selectTextFirst", {}, language));
          return;
        }

        // Remove any existing quick command blocks
        removeQuickCommandBlocks(editor);

        // Get the current cursor/selection position
        const cursor = editor.getCursor("from");
        const line = cursor.line;

        // Insert the quick command code block above the selected text
        const codeBlock = `\`\`\`${QUICK_COMMAND_CODE_BLOCK}\n\`\`\`\n`;
        editor.replaceRange(codeBlock, { line, ch: 0 });
      });
    });

    // Get custom commands
    const commands = getCachedCustomCommands();
    const visibleCustomCommands = commands.filter(
      (command: CustomCommand) => command.showInContextMenu
    );

    // Add separator if there are custom commands
    if (visibleCustomCommands.length > 0) {
      submenu.addSeparator();
    }

    // Add custom commands to submenu
    sortCommandsByOrder(visibleCustomCommands).forEach((command: CustomCommand) => {
      submenu.addItem((subItem) => {
        subItem.setTitle(command.title).onClick(() => {
          if (!editor) {
            new Notice(translate("contextMenu.notice.noEditor", {}, language));
            return;
          }

          // Directly execute the custom command logic instead of using executeCommandById
          // This ensures the editor parameter is properly passed
          const selectedText = editor.getSelection();
          new CustomCommandChatModal(app, {
            selectedText: selectedText || "",
            command: command,
          }).open();
          CustomCommandManager.getInstance().recordUsage(command);
        });
      });
    });
  });
}
