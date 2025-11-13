import { Button } from "@/components/ui/button";
import { translate } from "@/i18n";
import { App, Modal } from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";

function ConfirmModalContent({
  content,
  onConfirm,
  onCancel,
  confirmButtonText,
  cancelButtonText,
}: {
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText: string;
  cancelButtonText: string;
}) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-5">
      <div className="tw-whitespace-pre-wrap">{content}</div>
      <div className="tw-flex tw-justify-end tw-gap-2">
        {cancelButtonText && (
          <Button variant="secondary" onClick={onCancel}>
            {cancelButtonText}
          </Button>
        )}
        {confirmButtonText && (
          <Button variant="default" onClick={onConfirm}>
            {confirmButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}

export class ConfirmModal extends Modal {
  private root: Root;
  private confirmButtonText: string;
  private cancelButtonText: string;

  constructor(
    app: App,
    private onConfirm: () => void,
    private content: string,
    title: string,
    confirmButtonText?: string,
    cancelButtonText?: string
  ) {
    super(app);
    // https://docs.obsidian.md/Reference/TypeScript+API/Modal/setTitle
    // @ts-ignore
    this.setTitle(title);
    // Set default translations if not provided
    this.confirmButtonText = confirmButtonText || translate("modal.confirm.continue");
    this.cancelButtonText = cancelButtonText || translate("modal.confirm.cancel");
  }

  onOpen() {
    const { contentEl } = this;
    this.root = createRoot(contentEl);

    const handleConfirm = () => {
      this.onConfirm();
      this.close();
    };

    const handleCancel = () => {
      this.close();
    };

    this.root.render(
      <ConfirmModalContent
        content={this.content}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmButtonText={this.confirmButtonText}
        cancelButtonText={this.cancelButtonText}
      />
    );
  }

  onClose() {
    this.root.unmount();
  }
}
