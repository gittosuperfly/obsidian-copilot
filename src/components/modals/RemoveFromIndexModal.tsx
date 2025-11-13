import { App, Modal, Setting } from "obsidian";
import { translate } from "@/i18n";

export class RemoveFromIndexModal extends Modal {
  private filePaths = "";
  private onSubmit: (filePaths: string[]) => void;

  constructor(app: App, onSubmit: (filePaths: string[]) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: translate("modal.removeFromIndex.heading") });

    // Create a full-width container
    const container = contentEl.createDiv({ cls: "remove-files-container" });

    new Setting(container)
      .setName(translate("modal.removeFromIndex.fieldName"))
      .setDesc(translate("modal.removeFromIndex.description"))
      .setClass("remove-files-setting")
      .addTextArea((text) =>
        text
          .setPlaceholder(translate("modal.removeFromIndex.placeholder"))
          .setValue(this.filePaths)
          .onChange((value) => {
            this.filePaths = value;
          })
      );

    new Setting(container).addButton((btn) =>
      btn
        .setButtonText(translate("modal.removeFromIndex.button"))
        .setCta()
        .onClick(() => {
          const paths = this.filePaths
            .split("\n")
            .map((line) => {
              // Extract path from markdown list format: "- [[path/to/file.md]]"
              const match = line.match(/\[\[(.*?)\]\]/);
              return match ? match[1].trim() : "";
            })
            .filter((p) => p.length > 0);
          this.onSubmit(paths);
          this.close();
        })
    );

    // Add CSS for better layout
    contentEl.createEl("style", {
      text: `
        .remove-files-container {
          width: 100%;
          margin-top: 12px;
        }
        .remove-files-setting {
          display: block;
        }
        .remove-files-setting .setting-item-control {
          padding: 0;
        }
        .remove-files-setting textarea {
          width: 100%;
          height: 300px;
          margin-top: 12px;
        }
        .remove-files-setting textarea::placeholder {
          opacity: 0.5;
        }
      `,
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
