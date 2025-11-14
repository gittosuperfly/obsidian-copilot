import { Button } from "@/components/ui/button";
import { SettingItem } from "@/components/ui/setting-item";
import { logFileManager } from "@/logFileManager";
import { flushRecordedPromptPayloadToLog } from "@/LLMProviders/chainRunner/utils/promptPayloadRecorder";
import { updateSetting, useSettingsValue } from "@/settings/model";
import React from "react";
import { useI18n } from "@/i18n";

export const AdvancedSettings: React.FC = () => {
  const settings = useSettingsValue();
  const { t } = useI18n();

  return (
    <div className="tw-space-y-4">
      <section className="tw-space-y-4">
        <SettingItem
          type="switch"
          title={t("settings.advanced.encryption.title")}
          description={t("settings.advanced.encryption.description")}
          checked={settings.enableEncryption}
          onCheckedChange={(checked) => {
            updateSetting("enableEncryption", checked);
          }}
        />

        <SettingItem
          type="switch"
          title={t("settings.advanced.debug.title")}
          description={t("settings.advanced.debug.description")}
          checked={settings.debug}
          onCheckedChange={(checked) => {
            updateSetting("debug", checked);
          }}
        />

        <SettingItem
          type="custom"
          title={t("settings.advanced.logFile.title")}
          description={t("settings.advanced.logFile.description", {
            path: logFileManager.getLogPath(),
          })}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await flushRecordedPromptPayloadToLog();
              await logFileManager.flush();
              await logFileManager.openLogFile();
            }}
          >
            {t("settings.advanced.logFile.button")}
          </Button>
        </SettingItem>
      </section>
    </div>
  );
};
