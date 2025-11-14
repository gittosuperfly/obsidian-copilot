import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translate, TranslationKey } from "@/i18n";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n";
import { Language } from "@/i18n/lang";
import { getSettings, updateSetting } from "@/settings/model";
import { App, Modal } from "obsidian";
import React, { useState } from "react";
import { createRoot, Root } from "react-dom/client";

const LANGUAGE_LABEL_KEYS: Record<Language, TranslationKey> = {
  en: "language.english",
  zh: "language.chinese",
};

interface DefaultCommandsOnboardingContentProps {
  initialLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onConfirm: (language: Language) => void;
  onSkip: () => void;
}

const DefaultCommandsOnboardingContent: React.FC<DefaultCommandsOnboardingContentProps> = ({
  initialLanguage,
  onLanguageChange,
  onConfirm,
  onSkip,
}) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    onLanguageChange(value);
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <p className="tw-text-sm tw-text-muted">
        {translate("onboarding.commands.description", {}, language)}
      </p>

      <div className="tw-space-y-2">
        <label className="tw-text-sm tw-font-medium">
          {translate("onboarding.commands.languageLabel", {}, language)}
        </label>
        <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
          <SelectTrigger className="tw-w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {translate(LANGUAGE_LABEL_KEYS[lang], {}, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="tw-text-xs tw-text-muted">
          {translate("onboarding.commands.languageNote", {}, language)}
        </p>
      </div>

      <p className="tw-text-xs tw-text-muted">
        {translate("onboarding.commands.notice", {}, language)}
      </p>

      <div className="tw-flex tw-justify-end tw-gap-2">
        <Button variant="secondary" onClick={onSkip}>
          {translate("onboarding.commands.skip", {}, language)}
        </Button>
        <Button onClick={() => onConfirm(language)}>
          {translate("onboarding.commands.confirm", {}, language)}
        </Button>
      </div>
    </div>
  );
};

export class DefaultCommandsOnboardingModal extends Modal {
  private root: Root | null = null;
  private selectedLanguage: Language;

  constructor(
    app: App,
    private onConfirm: (language: Language) => void,
    private onSkip: () => void
  ) {
    super(app);
    this.selectedLanguage = getSettings().language ?? DEFAULT_LANGUAGE;
    // https://docs.obsidian.md/Reference/TypeScript+API/Modal/setTitle
    // @ts-ignore
    this.setTitle(translate("onboarding.commands.title", {}, this.selectedLanguage));
  }

  onOpen() {
    const container = this.contentEl;
    this.root = createRoot(container);
    const initialLanguage = this.selectedLanguage;

    const handleLanguageChange = (language: Language) => {
      this.selectedLanguage = language;
      updateSetting("language", language);
      // https://docs.obsidian.md/Reference/TypeScript+API/Modal/setTitle
      // @ts-ignore
      this.setTitle(translate("onboarding.commands.title", {}, language));
    };

    const handleConfirm = (language: Language) => {
      this.onConfirm(language);
      this.close();
    };

    const handleSkip = () => {
      this.onSkip();
      this.close();
    };

    this.root.render(
      <DefaultCommandsOnboardingContent
        initialLanguage={initialLanguage}
        onLanguageChange={handleLanguageChange}
        onConfirm={handleConfirm}
        onSkip={handleSkip}
      />
    );
  }

  onClose() {
    this.root?.unmount();
  }
}
