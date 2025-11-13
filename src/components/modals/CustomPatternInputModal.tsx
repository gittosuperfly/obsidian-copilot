import { App, Modal } from "obsidian";
import React, { useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, translate } from "@/i18n";

function CustomPatternInputModalContent({
  onConfirm,
  onCancel,
}: {
  onConfirm: (pattern: string) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  // TODO: Add validation
  const [pattern, setPattern] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onConfirm(pattern);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <div className="tw-flex tw-flex-col tw-gap-4">
        <div>{t("modal.customPattern.description")}</div>
        <Input
          placeholder={t("modal.customPattern.placeholder")}
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="tw-flex tw-justify-end tw-gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {t("modal.customPattern.cancel")}
        </Button>
        <Button variant="default" onClick={() => onConfirm(pattern)}>
          {t("modal.customPattern.confirm")}
        </Button>
      </div>
    </div>
  );
}

export class CustomPatternInputModal extends Modal {
  private root: Root;

  constructor(
    app: App,
    private onConfirm: (pattern: string) => void
  ) {
    super(app);
    // https://docs.obsidian.md/Reference/TypeScript+API/Modal/setTitle
    // @ts-ignore
    this.setTitle(translate("modal.customPattern.title"));
  }

  onOpen() {
    const { contentEl } = this;
    this.root = createRoot(contentEl);

    const handleConfirm = (extension: string) => {
      this.onConfirm(extension);
      this.close();
    };

    const handleCancel = () => {
      this.close();
    };

    this.root.render(
      <CustomPatternInputModalContent onConfirm={handleConfirm} onCancel={handleCancel} />
    );
  }

  onClose() {
    this.root.unmount();
  }
}
