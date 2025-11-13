import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { translate } from "@/i18n";
import { App } from "obsidian";

export class ResetSettingsConfirmModal extends ConfirmModal {
  constructor(app: App, onConfirm: () => void) {
    super(
      app,
      onConfirm,
      translate("modal.resetSettings.content"),
      translate("modal.resetSettings.title")
    );
  }
}
