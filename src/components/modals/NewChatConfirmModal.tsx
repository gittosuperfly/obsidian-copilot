import { App } from "obsidian";
import { ConfirmModal } from "./ConfirmModal";
import { translate } from "@/i18n";

export class NewChatConfirmModal extends ConfirmModal {
  constructor(app: App, onConfirm: () => void) {
    super(app, onConfirm, translate("modal.newChat.content"), translate("modal.newChat.title"));
  }
}
