import { CustomModel, getModelKeyFromModel, ModelProvider } from "@/aiParams";
import { Button } from "@/components/ui/button";
import { SettingItem } from "@/components/ui/setting-item";
import ProjectManager from "@/LLMProviders/projectManager";
import { logError } from "@/logger";
import { setSettings, updateSetting, useSettingsValue } from "@/settings/model";
import { ModelAddDialog } from "@/settings/v2/components/ModelAddDialog";
import { ModelEditModal } from "@/settings/v2/components/ModelEditDialog";
import { ProviderAddDialog } from "@/settings/v2/components/ProviderAddDialog";
import { ProviderEditDialog } from "@/settings/v2/components/ProviderEditDialog";
import { ProviderRow } from "@/settings/v2/components/ProviderRow";
import { useI18n } from "@/i18n";
import { Plus } from "lucide-react";
import { Notice } from "obsidian";
import React, { useState } from "react";

export const ModelSettings: React.FC = () => {
  const settings = useSettingsValue();
  const { t } = useI18n();

  // Dialog states
  const [showProviderAddDialog, setShowProviderAddDialog] = useState(false);
  const [showProviderEditDialog, setShowProviderEditDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null);

  const [showModelAddDialog, setShowModelAddDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);

  /**
   * Provider CRUD Operations
   */
  const handleAddProvider = (provider: ModelProvider) => {
    const updatedProviders = [...settings.providers, provider];
    updateSetting("providers", updatedProviders);
    new Notice(t("settings.providers.notice.added", { name: provider.name }));
  };

  const handleEditProvider = (provider: ModelProvider) => {
    setEditingProvider(provider);
    setShowProviderEditDialog(true);
  };

  const handleUpdateProvider = (original: ModelProvider, updated: ModelProvider) => {
    const providerIndex = settings.providers.findIndex((p) => p.id === original.id);
    if (providerIndex !== -1) {
      const updatedProviders = [...settings.providers];
      updatedProviders[providerIndex] = updated;
      updateSetting("providers", updatedProviders);
      new Notice(t("settings.providers.notice.updated", { name: updated.name }));
    } else {
      logError("Could not find provider to update:", original);
    }
  };

  const handleDeleteProvider = (provider: ModelProvider) => {
    // Find models associated with this provider
    const associatedModels = settings.activeModels.filter((m) => m.providerId === provider.id);

    if (associatedModels.length > 0) {
      // Show confirmation with model count
      const confirmed = confirm(
        t("settings.providers.notice.deleteConfirm", {
          name: provider.name,
          count: associatedModels.length,
        })
      );

      if (!confirmed) {
        return;
      }

      // Cascade delete: remove all associated models
      const updatedModels = settings.activeModels.filter((m) => m.providerId !== provider.id);

      // Update default model key if needed
      let newDefaultModelKey = settings.defaultModelKey;
      const deletedModelKeys = associatedModels.map((m) => getModelKeyFromModel(m));
      if (deletedModelKeys.includes(settings.defaultModelKey)) {
        const newDefaultModel = updatedModels.find((model) => model.enabled);
        newDefaultModelKey = newDefaultModel ? getModelKeyFromModel(newDefaultModel) : "";
      }

      setSettings({
        activeModels: updatedModels,
        providers: settings.providers.filter((p) => p.id !== provider.id),
        defaultModelKey: newDefaultModelKey,
      });
    } else {
      // No associated models, just delete provider
      updateSetting(
        "providers",
        settings.providers.filter((p) => p.id !== provider.id)
      );
    }

    new Notice(t("settings.providers.notice.deleted", { name: provider.name }));
  };

  /**
   * Model CRUD Operations
   */
  const handleAddModel = (provider: ModelProvider) => {
    setSelectedProvider(provider);
    setShowModelAddDialog(true);
  };

  const handleAddModelSubmit = (model: CustomModel) => {
    const updatedModels = [...settings.activeModels, model];
    updateSetting("activeModels", updatedModels);

    // If this is the first model, set it as default
    if (settings.activeModels.length === 0) {
      updateSetting("defaultModelKey", getModelKeyFromModel(model));
    }

    new Notice(t("settings.models.notice.added", { name: model.name }));
  };

  const handleEditModel = (model: CustomModel) => {
    const modal = new ModelEditModal(app, model, false, (isEmbeddingModel, original, updated) => {
      handleUpdateModel(original, updated);
    });
    modal.open();
  };

  const handleUpdateModel = (original: CustomModel, updated: CustomModel) => {
    const modelIndex = settings.activeModels.findIndex(
      (m) => m.name === original.name && m.providerId === original.providerId
    );

    if (modelIndex !== -1) {
      const updatedModels = [...settings.activeModels];
      updatedModels[modelIndex] = updated;
      updateSetting("activeModels", updatedModels);

      // Update default model key if the name or providerId changed
      const originalKey = getModelKeyFromModel(original);
      if (originalKey === settings.defaultModelKey) {
        updateSetting("defaultModelKey", getModelKeyFromModel(updated));
      }

      new Notice(t("settings.models.notice.updated", { name: updated.name }));
    } else {
      new Notice(t("settings.models.notice.updateMissing"));
      logError("Could not find model to update:", original);
    }
  };

  const handleDeleteModel = (model: CustomModel) => {
    const modelKey = getModelKeyFromModel(model);
    const updatedModels = settings.activeModels.filter((m) => getModelKeyFromModel(m) !== modelKey);

    // Update default model if deleted model was default
    let newDefaultModelKey = settings.defaultModelKey;
    if (modelKey === settings.defaultModelKey) {
      const newDefaultModel = updatedModels.find((m) => m.enabled);
      newDefaultModelKey = newDefaultModel ? getModelKeyFromModel(newDefaultModel) : "";
    }

    setSettings({
      activeModels: updatedModels,
      defaultModelKey: newDefaultModelKey,
    });

    new Notice(t("settings.models.notice.deleted", { name: model.name }));
  };

  const handleToggleModelEnabled = (model: CustomModel) => {
    const updatedModels = settings.activeModels.map((m) =>
      getModelKeyFromModel(m) === getModelKeyFromModel(model) ? { ...m, enabled: !m.enabled } : m
    );
    updateSetting("activeModels", updatedModels);
  };

  const handleSetDefaultModel = (model: CustomModel) => {
    const modelKey = getModelKeyFromModel(model);
    updateSetting("defaultModelKey", modelKey);
    new Notice(t("settings.models.notice.defaultSet", { name: model.name }));
  };

  // Group models by provider
  const getModelsForProvider = (providerId: string): CustomModel[] => {
    return settings.activeModels.filter((m) => m.providerId === providerId);
  };

  return (
    <div className="tw-space-y-6">
      {/* Provider Management Section */}
      <section>
        <div className="tw-mb-4 tw-flex tw-items-center tw-justify-between">
          <div>
            <h2 className="tw-text-2xl tw-font-bold tw-text-normal">
              {t("settings.providers.title")}
            </h2>
            <p className="tw-mt-1 tw-text-sm tw-text-muted">
              {t("settings.providers.description")}
            </p>
          </div>
          <Button onClick={() => setShowProviderAddDialog(true)}>
            <Plus className="tw-mr-2 tw-size-4" />
            {t("settings.providers.addProvider")}
          </Button>
        </div>

        {/* Provider List */}
        {settings.providers.length === 0 ? (
          <div className="tw-rounded-lg tw-border tw-border-dashed tw-border-border tw-py-12 tw-text-center">
            <p className="tw-mb-4 tw-text-muted">{t("settings.providers.noProviders")}</p>
            <Button onClick={() => setShowProviderAddDialog(true)}>
              <Plus className="tw-mr-2 tw-size-4" />
              {t("settings.providers.addFirstProvider")}
            </Button>
          </div>
        ) : (
          <div className="tw-space-y-3">
            {settings.providers.map((provider) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                models={getModelsForProvider(provider.id)}
                defaultModelKey={settings.defaultModelKey}
                onEdit={handleEditProvider}
                onDelete={handleDeleteProvider}
                onAddModel={handleAddModel}
                onEditModel={handleEditModel}
                onDeleteModel={handleDeleteModel}
                onToggleModelEnabled={handleToggleModelEnabled}
                onSetDefaultModel={handleSetDefaultModel}
              />
            ))}
          </div>
        )}
      </section>

      {/* Context Turns Setting */}
      <section className="tw-border-t tw-border-border tw-pt-6">
        <SettingItem
          type="slider"
          title={t("settings.models.context.title")}
          description={t("settings.models.context.description")}
          value={settings.contextTurns}
          onChange={(value) => updateSetting("contextTurns", value)}
          min={1}
          max={50}
          step={1}
        />
      </section>

      {/* Dialogs */}
      <ProviderAddDialog
        open={showProviderAddDialog}
        onOpenChange={setShowProviderAddDialog}
        onAdd={handleAddProvider}
      />

      <ProviderEditDialog
        open={showProviderEditDialog}
        onOpenChange={setShowProviderEditDialog}
        provider={editingProvider}
        onUpdate={handleUpdateProvider}
      />

      <ModelAddDialog
        open={showModelAddDialog}
        onOpenChange={setShowModelAddDialog}
        provider={selectedProvider}
        onAdd={handleAddModelSubmit}
        ping={(model) =>
          ProjectManager.instance.getCurrentChainManager().chatModelManager.ping(model)
        }
      />
    </div>
  );
};
