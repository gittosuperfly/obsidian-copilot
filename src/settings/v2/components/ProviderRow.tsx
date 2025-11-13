import { CustomModel, getModelKeyFromModel, ModelProvider } from "@/aiParams";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface ProviderRowProps {
  provider: ModelProvider;
  models: CustomModel[];
  defaultModelKey: string;
  onEdit: (provider: ModelProvider) => void;
  onDelete: (provider: ModelProvider) => void;
  onAddModel: (provider: ModelProvider) => void;
  onEditModel: (model: CustomModel) => void;
  onDeleteModel: (model: CustomModel) => void;
  onToggleModelEnabled: (model: CustomModel) => void;
  onSetDefaultModel: (model: CustomModel) => void;
}

/**
 * Collapsible row component for displaying a provider and its models.
 * Clicking the row expands/collapses the model list.
 */
export const ProviderRow: React.FC<ProviderRowProps> = ({
  provider,
  models,
  defaultModelKey,
  onEdit,
  onDelete,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onToggleModelEnabled,
  onSetDefaultModel,
}) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  const modelCount = models.length;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="tw-mb-3 tw-rounded-lg tw-border tw-border-border">
      {/* Provider Header Row */}
      <div
        className="tw-flex tw-cursor-pointer tw-items-center tw-gap-3 tw-rounded-t-lg tw-p-4 hover:tw-bg-modifier-hover"
        onClick={handleToggleExpand}
      >
        {/* Expand/Collapse Icon */}
        <ChevronDown
          className={cn(
            "tw-size-5 tw-text-muted tw-transition-transform",
            isExpanded && "tw-rotate-180"
          )}
        />

        {/* Provider Info */}
        <div className="tw-flex-1">
          <div className="tw-font-semibold tw-text-normal">{provider.name}</div>
          <div className="tw-text-sm tw-text-muted">{provider.baseUrl}</div>
          <div className="tw-mt-1 tw-text-xs tw-text-muted">
            {t("settings.providers.modelCount", { count: modelCount })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tw-flex tw-gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(provider)}
            title={t("common.edit")}
          >
            <Pencil className="tw-size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(provider)}
            title={t("common.delete")}
          >
            <Trash2 className="tw-size-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Model List */}
      {isExpanded && (
        <div className="tw-border-t tw-border-border tw-bg-secondary tw-p-4">
          <div className="tw-mb-3 tw-flex tw-items-center tw-justify-between">
            <span className="tw-text-sm tw-font-medium tw-text-normal">
              {t("settings.providers.models")}
            </span>
            <Button size="sm" onClick={() => onAddModel(provider)}>
              <Plus className="tw-mr-1 tw-size-4" />
              {t("settings.providers.addModel")}
            </Button>
          </div>

          {/* Model List */}
          {models.length === 0 ? (
            <div className="tw-py-8 tw-text-center tw-text-muted">
              {t("settings.providers.noModels")}
            </div>
          ) : (
            <div className="tw-space-y-2">
              {models.map((model) => {
                const modelKey = getModelKeyFromModel(model);
                const isDefault = modelKey === defaultModelKey;

                return (
                  <div
                    key={modelKey}
                    className="tw-flex tw-items-center tw-gap-3 tw-rounded tw-border tw-border-border tw-bg-primary tw-p-3"
                  >
                    {/* Default Star */}
                    <button
                      className={cn(
                        "tw-cursor-pointer tw-text-xl tw-transition-colors",
                        isDefault ? "tw-text-warning" : "tw-text-muted hover:tw-text-warning"
                      )}
                      onClick={() => onSetDefaultModel(model)}
                      title={
                        isDefault
                          ? t("settings.models.defaultModel")
                          : t("settings.models.setAsDefault")
                      }
                    >
                      {isDefault ? "★" : "☆"}
                    </button>

                    {/* Model Name */}
                    <div className="tw-flex-1">
                      <div className="tw-font-medium tw-text-normal">{model.name}</div>
                      {model.displayName && (
                        <div className="tw-text-xs tw-text-muted">{model.displayName}</div>
                      )}
                    </div>

                    {/* Enabled Checkbox */}
                    <label className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2">
                      <input
                        type="checkbox"
                        checked={model.enabled}
                        onChange={() => onToggleModelEnabled(model)}
                        className="tw-cursor-pointer"
                      />
                      <span className="tw-text-sm tw-text-muted">
                        {t("settings.models.enabled")}
                      </span>
                    </label>

                    {/* Action Buttons */}
                    <div className="tw-flex tw-gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditModel(model)}
                        title={t("common.edit")}
                      >
                        <Pencil className="tw-size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteModel(model)}
                        title={t("common.delete")}
                      >
                        <Trash2 className="tw-size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
