import { ResetSettingsConfirmModal } from "@/components/modals/ResetSettingsConfirmModal";
import { Button } from "@/components/ui/button";
import { TabContent, TabItem } from "@/components/ui/setting-tabs";
import { TabProvider, useTab } from "@/contexts/TabContext";
import { useLatestVersion } from "@/hooks/useLatestVersion";
import CopilotPlugin from "@/main";
import { resetSettings } from "@/settings/model";
import { CommandSettings } from "@/settings/v2/components/CommandSettings";
import { Cog, Command, Cpu, Database, Wrench } from "lucide-react";
import React, { useMemo } from "react";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { BasicSettings } from "./components/BasicSettings";
import { ModelSettings } from "./components/ModelSettings";
import { QASettings } from "./components/QASettings";
import { useI18n, TranslationKey } from "@/i18n";

const TAB_IDS = ["basic", "model", "QA", "command", "advanced"] as const;
type TabId = (typeof TAB_IDS)[number];

// tab icons
const icons: Record<TabId, JSX.Element> = {
  basic: <Cog className="tw-size-5" />,
  model: <Cpu className="tw-size-5" />,
  QA: <Database className="tw-size-5" />,
  command: <Command className="tw-size-5" />,
  advanced: <Wrench className="tw-size-5" />,
};

// tab components
const components: Record<TabId, React.FC> = {
  basic: () => <BasicSettings />,
  model: () => <ModelSettings />,
  QA: () => <QASettings />,
  command: () => <CommandSettings />,
  advanced: () => <AdvancedSettings />,
};

const TAB_LABEL_KEYS: Record<TabId, TranslationKey> = {
  basic: "settings.tabs.basic",
  model: "settings.tabs.model",
  QA: "settings.tabs.qa",
  command: "settings.tabs.command",
  advanced: "settings.tabs.advanced",
};

const SettingsContent: React.FC = () => {
  const { selectedTab, setSelectedTab } = useTab();
  const { t } = useI18n();
  const tabs = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        icon: icons[id],
        label: t(TAB_LABEL_KEYS[id]),
      })),
    [t]
  );

  return (
    <div className="tw-flex tw-flex-col">
      <div className="tw-mb-3 tw-flex tw-flex-nowrap tw-items-center tw-gap-6 tw-overflow-x-auto tw-border-b tw-pl-1 tw-border-border/70">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isSelected={selectedTab === tab.id}
            onClick={() => setSelectedTab(tab.id)}
          />
        ))}
      </div>

      <div className="tw-pt-4">
        {TAB_IDS.map((id) => {
          const Component = components[id];
          return (
            <TabContent key={id} id={id} isSelected={selectedTab === id}>
              <Component />
            </TabContent>
          );
        })}
      </div>
    </div>
  );
};

interface SettingsMainV2Props {
  plugin: CopilotPlugin;
}

const SettingsMainV2: React.FC<SettingsMainV2Props> = ({ plugin }) => {
  // Add a key state that we'll change when resetting
  const [resetKey, setResetKey] = React.useState(0);
  const { latestVersion, hasUpdate } = useLatestVersion(plugin.manifest.version);
  const { t } = useI18n();

  const handleReset = async () => {
    const modal = new ResetSettingsConfirmModal(app, async () => {
      resetSettings();
      // Increment the key to force re-render of all components
      setResetKey((prev) => prev + 1);
    });
    modal.open();
  };

  return (
    <TabProvider>
      <div>
        <div className="tw-flex tw-flex-col tw-gap-2">
          <h1 className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-2">
              <span>{t("settings.header.title")}</span>
              <div className="tw-flex tw-items-center tw-gap-1">
                <span className="tw-text-xs tw-text-muted">v{plugin.manifest.version}</span>
                {latestVersion && (
                  <>
                    {hasUpdate ? (
                      <a
                        href="obsidian://show-plugin?id=copilot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tw-text-xs tw-text-accent hover:tw-underline"
                      >
                        {t("settings.header.updateAvailable", { version: latestVersion })}
                      </a>
                    ) : (
                      <span className="tw-text-xs tw-text-normal">
                        {t("settings.header.upToDate")}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="tw-self-end sm:tw-self-auto">
              <Button variant="secondary" size="sm" onClick={handleReset}>
                {t("settings.header.reset")}
              </Button>
            </div>
          </h1>
        </div>
        {/* Add the key prop to force re-render */}
        <SettingsContent key={resetKey} />
      </div>
    </TabProvider>
  );
};

export default SettingsMainV2;
