import { App } from "obsidian";
import { ConfirmModal } from "./ConfirmModal";
import { translate } from "@/i18n";

export class SemanticSearchToggleModal extends ConfirmModal {
  constructor(app: App, onConfirm: () => void, enabling: boolean) {
    const content = enabling
      ? translate("modal.semanticSearchToggle.enable.content")
      : translate("modal.semanticSearchToggle.disable.content");

    const title = enabling
      ? translate("modal.semanticSearchToggle.enable.title")
      : translate("modal.semanticSearchToggle.disable.title");
    const confirmButtonText = enabling
      ? translate("modal.semanticSearchToggle.enable.button")
      : translate("modal.semanticSearchToggle.disable.button");

    super(
      app,
      onConfirm,
      content,
      title,
      confirmButtonText,
      translate("modal.semanticSearchToggle.cancel")
    );
  }
}
