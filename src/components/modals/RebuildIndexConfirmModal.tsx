import { App } from "obsidian";
import { ConfirmModal } from "./ConfirmModal";
import { translate } from "@/i18n";

export class RebuildIndexConfirmModal extends ConfirmModal {
  constructor(app: App, onConfirm: () => void) {
    super(
      app,
      onConfirm,
      translate("modal.rebuildIndex.content"),
      translate("modal.rebuildIndex.title")
    );
  }
}
