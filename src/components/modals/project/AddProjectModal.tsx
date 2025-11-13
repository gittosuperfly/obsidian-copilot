import { ProjectConfig, getCurrentProject } from "@/aiParams";
import { ContextManageModal } from "@/components/modals/project/context-manage-modal";
import { TruncatedText } from "@/components/TruncatedText";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getModelDisplayWithIcons } from "@/components/ui/model-display";
import { ObsidianNativeSelect } from "@/components/ui/obsidian-native-select";
import { SettingSlider } from "@/components/ui/setting-slider";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_MODEL_SETTING } from "@/constants";
import { getDecodedPatterns } from "@/search/searchUtils";
import { getModelKeyFromModel } from "@/aiParams";
import { useSettingsValue } from "@/settings/model";
import { checkModelApiKey, err2String, randomUUID } from "@/utils";
import { App, Modal, Notice } from "obsidian";
import React, { useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { useI18n, translate } from "@/i18n";

interface AddProjectModalContentProps {
  initialProject?: ProjectConfig;
  onSave: (project: ProjectConfig) => Promise<void>;
  onCancel: () => void;
}

function AddProjectModalContent({ initialProject, onSave, onCancel }: AddProjectModalContentProps) {
  const { t } = useI18n();
  const settings = useSettingsValue();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    systemPrompt: false,
    projectModelKey: false,
    inclusions: false,
  });

  const [formData, setFormData] = useState<ProjectConfig>(
    initialProject || {
      id: randomUUID(),
      name: "",
      description: "",
      systemPrompt: "",
      projectModelKey: "",
      modelConfigs: {
        temperature: DEFAULT_MODEL_SETTING.TEMPERATURE,
        maxTokens: DEFAULT_MODEL_SETTING.MAX_TOKENS,
      },
      contextSource: {
        inclusions: "",
        exclusions: "",
      },
      created: Date.now(),
      UsageTimestamps: Date.now(),
    }
  );

  const showContext = getDecodedPatterns(
    formData.contextSource.inclusions || formData.contextSource.exclusions || "nothing"
  )
    .reverse()
    .join(",");

  const handleEditProjectContext = (originP: ProjectConfig) => {
    // attempt to retrieve the latest project configuration.
    let projectToEdit = originP;

    if (initialProject?.id) {
      const currentProject = getCurrentProject();
      if (currentProject?.id === originP.id) {
        // Use the latest global project configuration
        projectToEdit = currentProject;
      }
    }

    const modal = new ContextManageModal(
      app,
      async (updatedProject: ProjectConfig) => {
        setFormData(updatedProject);
      },
      projectToEdit
    );
    modal.open();
  };

  const isFormValid = () => {
    return formData.name && formData.projectModelKey;
  };

  const handleInputChange = (
    field: string,
    value: string | number | string[] | Record<string, any>
  ) => {
    setFormData((prev) => {
      // Handle text input
      if (typeof value === "string") {
        // Only trim for model key which shouldn't have whitespace
        if (field === "projectModelKey") {
          value = value.trim();
        }
      }
      // Handle string arrays
      if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
        value = value.map((item) => item.trim()).filter(Boolean);
      }

      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        const parentKey = parent as keyof typeof prev;
        const parentValue = prev[parentKey];

        if (typeof parentValue === "object" && parentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSave = async () => {
    // Trim the project name before validation and saving
    if (formData.name) {
      formData.name = formData.name.trim();
    }

    const requiredFields = ["name", "projectModelKey"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof ProjectConfig]);

    if (missingFields.length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(missingFields.map((field) => [field, true])),
      }));
      new Notice(translate("modal.project.validation.required"));
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData as ProjectConfig);
    } catch (e) {
      new Notice(err2String(e));
      setTouched((prev) => ({
        ...prev,
        name: true,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-p-4">
      <div className="tw-mb-2 tw-text-xl tw-font-bold tw-text-normal">
        {initialProject ? t("modal.project.edit.title") : t("modal.project.new.title")}
      </div>

      <div className="tw-flex tw-flex-col tw-gap-2">
        <FormField
          label={t("modal.project.name.label")}
          required
          error={touched.name && !formData.name}
          errorMessage={t("modal.project.name.error")}
        >
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            className="tw-w-full"
          />
        </FormField>

        <FormField
          label={t("modal.project.description.label")}
          description={t("modal.project.description.placeholder")}
        >
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="tw-w-full"
          />
        </FormField>

        <FormField
          label={t("modal.project.systemPrompt.label")}
          description={t("modal.project.systemPrompt.placeholder")}
        >
          <Textarea
            value={formData.systemPrompt}
            onChange={(e) => handleInputChange("systemPrompt", e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, systemPrompt: true }))}
            className="tw-min-h-32"
          />
        </FormField>

        <FormField
          label={t("modal.project.model.label")}
          required
          error={touched.projectModelKey && !formData.projectModelKey}
          errorMessage={t("modal.project.model.error")}
        >
          <ObsidianNativeSelect
            value={formData.projectModelKey}
            onChange={(e) => {
              const value = e.target.value;
              const selectedModel = settings.activeModels.find(
                (m) => m.enabled && getModelKeyFromModel(m) === value
              );
              if (!selectedModel) return;

              const { hasApiKey, errorNotice } = checkModelApiKey(selectedModel, settings);
              if (!hasApiKey && errorNotice) {
                new Notice(errorNotice);
                // Allow the selection to proceed despite missing API key
              }
              handleInputChange("projectModelKey", value);
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, projectModelKey: true }))}
            placeholder={t("modal.project.model.placeholder")}
            options={settings.activeModels
              .filter((m) => m.enabled && m.projectEnabled)
              .map((model) => ({
                label: getModelDisplayWithIcons(model),
                value: getModelKeyFromModel(model),
              }))}
          />
        </FormField>

        <div className="tw-space-y-4">
          <div className="tw-text-base tw-font-medium">
            {t("modal.project.modelConfig.heading")}
          </div>
          <div className="tw-grid tw-grid-cols-1 tw-gap-4">
            <FormField label={t("modal.project.temperature.label")}>
              <SettingSlider
                value={formData.modelConfigs?.temperature ?? DEFAULT_MODEL_SETTING.TEMPERATURE}
                onChange={(value) => handleInputChange("modelConfigs.temperature", value)}
                min={0}
                max={2}
                step={0.01}
                className="tw-w-full"
              />
            </FormField>
            <FormField label={t("modal.project.tokenLimit.label")}>
              <SettingSlider
                value={formData.modelConfigs?.maxTokens ?? DEFAULT_MODEL_SETTING.MAX_TOKENS}
                onChange={(value) => handleInputChange("modelConfigs.maxTokens", value)}
                min={1}
                max={65000}
                step={1}
                className="tw-w-full"
              />
            </FormField>
          </div>
        </div>

        <div className="tw-space-y-4">
          <div className="tw-text-base tw-font-medium">
            {t("modal.project.contextSources.heading")}
          </div>
          <FormField
            label={
              <div className="tw-flex tw-items-center tw-gap-2">
                <span>{t("modal.project.fileContext.label")}</span>
                <HelpTooltip
                  buttonClassName="tw-size-4 tw-text-muted"
                  content={
                    <div className="tw-max-w-80">
                      <strong>{t("modal.project.fileTypes.heading")}</strong>
                      <br />
                      <strong>• {t("modal.project.fileTypes.documents")}</strong>{" "}
                      {t("modal.project.fileTypes.documentsDesc")}
                      <br />
                      <strong>• {t("modal.project.fileTypes.images")}</strong>{" "}
                      {t("modal.project.fileTypes.imagesDesc")}
                      <br />
                      <strong>• {t("modal.project.fileTypes.spreadsheets")}</strong>{" "}
                      {t("modal.project.fileTypes.spreadsheetsDesc")}
                      <br />
                      <br />
                      {t("modal.project.rateLimit")}
                    </div>
                  }
                />
              </div>
            }
            description={t("modal.project.fileContext.description")}
          >
            <div className="tw-flex tw-items-center tw-gap-2">
              <div className="tw-flex tw-flex-1 tw-flex-row">
                <TruncatedText className="tw-max-w-[100px] tw-text-sm tw-text-accent">
                  {showContext}
                </TruncatedText>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  handleEditProjectContext(formData);
                }}
              >
                {t("settings.qa.inclusions.button")}
              </Button>
            </div>
          </FormField>
        </div>
      </div>

      <div className="tw-mt-4 tw-flex tw-items-center tw-justify-end tw-gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {t("modal.project.button.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting || !isFormValid()}>
          {isSubmitting ? t("modal.project.button.saving") : t("modal.project.button.save")}
        </Button>
      </div>
    </div>
  );
}

export class AddProjectModal extends Modal {
  private root: Root;

  constructor(
    app: App,
    private onSave: (project: ProjectConfig) => Promise<void>,
    private initialProject?: ProjectConfig
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    this.root = createRoot(contentEl);

    const handleSave = async (project: ProjectConfig) => {
      await this.onSave(project);
      this.close();
    };

    const handleCancel = () => {
      this.close();
    };

    this.root.render(
      <AddProjectModalContent
        initialProject={this.initialProject}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  onClose() {
    this.root.unmount();
  }
}
