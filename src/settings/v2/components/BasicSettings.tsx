import { ChainType } from "@/chainFactory";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Input } from "@/components/ui/input";
import { SettingItem } from "@/components/ui/setting-item";
import { DEFAULT_OPEN_AREA, SEND_SHORTCUT } from "@/constants";
import { cn } from "@/lib/utils";
import { updateSetting, useSettingsValue } from "@/settings/model";
import { formatDateTime } from "@/utils";
import { Loader2 } from "lucide-react";
import { Notice } from "obsidian";
import React, { useState } from "react";
import { useI18n, TranslationKey, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n";
import { Language } from "@/i18n/lang";

const CHAIN_TYPE_LABEL_KEYS: Record<ChainType, TranslationKey> = {
  [ChainType.LLM_CHAIN]: "settings.chain.chat",
  [ChainType.VAULT_QA_CHAIN]: "settings.chain.qa",
  [ChainType.ADVANCED_CHAIN]: "settings.chain.advanced",
  [ChainType.PROJECT_CHAIN]: "settings.chain.project",
};

const LANGUAGE_LABEL_KEYS: Record<Language, TranslationKey> = {
  en: "language.english",
  zh: "language.chinese",
};

export const BasicSettings: React.FC = () => {
  const settings = useSettingsValue();
  const { t } = useI18n();
  const languageValue = settings.language ?? DEFAULT_LANGUAGE;
  const languageOptions = SUPPORTED_LANGUAGES.map((lang) => ({
    label: t(LANGUAGE_LABEL_KEYS[lang]),
    value: lang,
  }));
  const chainOptions = Object.entries(CHAIN_TYPE_LABEL_KEYS).map(([key, labelKey]) => ({
    label: t(labelKey as TranslationKey),
    value: key,
  }));
  const [isChecking, setIsChecking] = useState(false);
  const [conversationNoteName, setConversationNoteName] = useState(
    settings.defaultConversationNoteName || "{$date}_{$time}__{$topic}"
  );

  const applyCustomNoteFormat = () => {
    setIsChecking(true);

    try {
      // Check required variables
      const format = conversationNoteName || t("settings.saving.filenameTemplate.placeholder");
      const requiredVars = ["{$date}", "{$time}", "{$topic}"];
      const missingVars = requiredVars.filter((v) => !format.includes(v));

      if (missingVars.length > 0) {
        new Notice(
          t("settings.notifications.formatMissingVars", {
            variables: missingVars.join(", "),
          }),
          4000
        );
        return;
      }

      // Check illegal characters (excluding variable placeholders)
      const illegalChars = /[\\/:*?"<>|]/;
      const formatWithoutVars = format
        .replace(/\{\$date}/g, "")
        .replace(/\{\$time}/g, "")
        .replace(/\{\$topic}/g, "");

      if (illegalChars.test(formatWithoutVars)) {
        new Notice(t("settings.notifications.formatInvalidChars"), 4000);
        return;
      }

      // Generate example filename
      const { fileName: timestampFileName } = formatDateTime(new Date());
      const firstTenWords = "test topic name";

      // Create example filename
      const customFileName = format
        .replace("{$topic}", firstTenWords.slice(0, 100).replace(/\s+/g, "_"))
        .replace("{$date}", timestampFileName.split("_")[0])
        .replace("{$time}", timestampFileName.split("_")[1]);

      // Save settings
      updateSetting("defaultConversationNoteName", format);
      setConversationNoteName(format);
      new Notice(
        t("settings.notifications.formatApplied", {
          example: customFileName,
        }),
        4000
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(
        t("settings.notifications.formatError", {
          message,
        }),
        4000
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="tw-space-y-4">
      {/* General Section */}
      <section>
        <div className="tw-mb-3 tw-text-xl tw-font-bold">{t("settings.general.heading")}</div>
        <div className="tw-space-y-4">
          <SettingItem
            type="select"
            title={t("settings.language.label")}
            description={t("settings.language.description")}
            value={languageValue}
            onChange={(value) => updateSetting("language", value as Language)}
            options={languageOptions}
          />

          {/* Basic Configuration Group */}
          <SettingItem
            type="select"
            title={t("settings.general.defaultMode.title")}
            description={
              <div className="tw-flex tw-items-center tw-gap-1.5">
                <span className="tw-leading-none">
                  {t("settings.general.defaultMode.description")}
                </span>
                <HelpTooltip
                  content={
                    <div className="tw-flex tw-max-w-96 tw-flex-col tw-gap-2">
                      <ul className="tw-pl-4 tw-text-sm tw-text-muted">
                        <li>
                          <strong>{t("settings.general.defaultMode.tooltip.chatLabel")}:</strong>{" "}
                          {t("settings.general.defaultMode.tooltip.chatDescription")}{" "}
                          <i>{t("settings.general.defaultMode.tooltip.chatNote")}</i>
                        </li>
                        <li>
                          <strong>{t("settings.general.defaultMode.tooltip.qaLabel")}:</strong>{" "}
                          {t("settings.general.defaultMode.tooltip.qaDescription")}{" "}
                          <i>{t("settings.general.defaultMode.tooltip.qaNote")}</i>
                        </li>
                      </ul>
                    </div>
                  }
                />
              </div>
            }
            value={settings.defaultChainType}
            onChange={(value) => updateSetting("defaultChainType", value as ChainType)}
            options={chainOptions}
          />

          <SettingItem
            type="select"
            title={t("settings.general.openArea.title")}
            description={t("settings.general.openArea.description")}
            value={settings.defaultOpenArea}
            onChange={(value) => updateSetting("defaultOpenArea", value as DEFAULT_OPEN_AREA)}
            options={[
              {
                label: t("settings.general.openArea.options.sidebar"),
                value: DEFAULT_OPEN_AREA.VIEW,
              },
              {
                label: t("settings.general.openArea.options.editor"),
                value: DEFAULT_OPEN_AREA.EDITOR,
              },
            ]}
          />

          <SettingItem
            type="select"
            title={t("settings.general.sendShortcut.title")}
            description={
              <div className="tw-flex tw-items-center tw-gap-1.5">
                <span className="tw-leading-none">
                  {t("settings.general.sendShortcut.description")}
                </span>
                <HelpTooltip
                  content={
                    <div className="tw-flex tw-max-w-96 tw-flex-col tw-gap-2 tw-py-4">
                      <div className="tw-text-sm tw-font-medium tw-text-accent">
                        {t("settings.general.sendShortcut.tooltipTitle")}
                      </div>
                      <div className="tw-text-xs tw-text-muted">
                        {t("settings.general.sendShortcut.tooltipBody")}
                      </div>
                    </div>
                  }
                />
              </div>
            }
            value={settings.defaultSendShortcut}
            onChange={(value) => updateSetting("defaultSendShortcut", value as SEND_SHORTCUT)}
            options={[
              {
                label: t("settings.general.sendShortcut.options.enter"),
                value: SEND_SHORTCUT.ENTER,
              },
              {
                label: t("settings.general.sendShortcut.options.shiftEnter"),
                value: SEND_SHORTCUT.SHIFT_ENTER,
              },
            ]}
          />

          <SettingItem
            type="switch"
            title={t("settings.general.includeActiveNote.title")}
            description={t("settings.general.includeActiveNote.description")}
            checked={settings.includeActiveNoteAsContext}
            onCheckedChange={(checked) => {
              updateSetting("includeActiveNoteAsContext", checked);
            }}
          />

          <SettingItem
            type="switch"
            title={t("settings.general.autoSelection.title")}
            description={t("settings.general.autoSelection.description")}
            checked={settings.autoIncludeTextSelection}
            onCheckedChange={(checked) => {
              updateSetting("autoIncludeTextSelection", checked);
            }}
          />

          <SettingItem
            type="switch"
            title={t("settings.general.passImages.title")}
            description={t("settings.general.passImages.description")}
            checked={settings.passMarkdownImages}
            onCheckedChange={(checked) => {
              updateSetting("passMarkdownImages", checked);
            }}
          />

          <SettingItem
            type="switch"
            title={t("settings.general.suggestedPrompts.title")}
            description={t("settings.general.suggestedPrompts.description")}
            checked={settings.showSuggestedPrompts}
            onCheckedChange={(checked) => updateSetting("showSuggestedPrompts", checked)}
          />

          <SettingItem
            type="switch"
            title={t("settings.general.relevantNotes.title")}
            description={t("settings.general.relevantNotes.description")}
            checked={settings.showRelevantNotes}
            onCheckedChange={(checked) => updateSetting("showRelevantNotes", checked)}
          />
        </div>
      </section>

      {/* Saving Conversations Section */}
      <section>
        <div className="tw-mb-3 tw-text-xl tw-font-bold">{t("settings.saving.heading")}</div>
        <div className="tw-space-y-4">
          <SettingItem
            type="switch"
            title={t("settings.saving.autosave.title")}
            description={t("settings.saving.autosave.description")}
            checked={settings.autosaveChat}
            onCheckedChange={(checked) => updateSetting("autosaveChat", checked)}
          />

          <SettingItem
            type="switch"
            title={t("settings.saving.generateTitle.title")}
            description={t("settings.saving.generateTitle.description")}
            checked={settings.generateAIChatTitleOnSave}
            onCheckedChange={(checked) => updateSetting("generateAIChatTitleOnSave", checked)}
          />

          <SettingItem
            type="text"
            title={t("settings.saving.defaultFolder.title")}
            description={t("settings.saving.defaultFolder.description")}
            value={settings.defaultSaveFolder}
            onChange={(value) => updateSetting("defaultSaveFolder", value)}
            placeholder={t("settings.saving.defaultFolder.placeholder")}
          />

          <SettingItem
            type="text"
            title={t("settings.saving.defaultTag.title")}
            description={t("settings.saving.defaultTag.description")}
            value={settings.defaultConversationTag}
            onChange={(value) => updateSetting("defaultConversationTag", value)}
            placeholder={t("settings.saving.defaultTag.placeholder")}
          />

          <SettingItem
            type="custom"
            title={t("settings.saving.filenameTemplate.title")}
            description={
              <div className="tw-flex tw-items-start tw-gap-1.5 ">
                <span className="tw-leading-none">
                  {t("settings.saving.filenameTemplate.description")}
                </span>
                <HelpTooltip
                  content={
                    <div className="tw-flex tw-max-w-96 tw-flex-col tw-gap-2 tw-py-4">
                      <div className="tw-text-sm tw-font-medium tw-text-accent">
                        {t("settings.saving.filenameTemplate.tooltip.note")}
                      </div>
                      <div>
                        <div className="tw-text-sm tw-font-medium tw-text-muted">
                          {t("settings.saving.filenameTemplate.tooltip.variables")}
                        </div>
                        <ul className="tw-pl-4 tw-text-sm tw-text-muted">
                          <li>
                            <strong>{"{$date}"}</strong>:{" "}
                            {t("settings.saving.filenameTemplate.tooltip.date")}
                          </li>
                          <li>
                            <strong>{"{$time}"}</strong>:{" "}
                            {t("settings.saving.filenameTemplate.tooltip.time")}
                          </li>
                          <li>
                            <strong>{"{$topic}"}</strong>:{" "}
                            {t("settings.saving.filenameTemplate.tooltip.topic")}
                          </li>
                        </ul>
                        <i className="tw-mt-2 tw-text-sm tw-text-muted">
                          {t("settings.saving.filenameTemplate.tooltip.example")}
                        </i>
                      </div>
                    </div>
                  }
                />
              </div>
            }
          >
            <div className="tw-flex tw-w-[320px] tw-items-center tw-gap-1.5">
              <Input
                type="text"
                className={cn(
                  "tw-min-w-[80px] tw-grow tw-transition-all tw-duration-200",
                  isChecking ? "tw-w-[80px]" : "tw-w-[120px]"
                )}
                placeholder={t("settings.saving.filenameTemplate.placeholder")}
                value={conversationNoteName}
                onChange={(e) => setConversationNoteName(e.target.value)}
                disabled={isChecking}
              />

              <Button
                onClick={() => applyCustomNoteFormat()}
                disabled={isChecking}
                variant="secondary"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="tw-mr-2 tw-size-4 tw-animate-spin" />
                    {t("settings.saving.filenameTemplate.buttonLoading")}
                  </>
                ) : (
                  t("settings.saving.filenameTemplate.button")
                )}
              </Button>
            </div>
          </SettingItem>
        </div>
      </section>
    </div>
  );
};
