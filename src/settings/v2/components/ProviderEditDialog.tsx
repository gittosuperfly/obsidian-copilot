import { ModelProvider } from "@/aiParams";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTab } from "@/contexts/TabContext";
import { useI18n } from "@/i18n";
import { ChatModelProviders } from "@/constants";
import { getProviderLabel } from "@/utils";
import React, { useEffect, useState } from "react";

interface FormErrors {
  name: boolean;
  type: boolean;
  baseUrl: boolean;
  apiKey: boolean;
}

interface ProviderEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ModelProvider | null;
  onUpdate: (original: ModelProvider, updated: ModelProvider) => void;
}

/**
 * Dialog for editing an existing model provider.
 * Allows updating provider name, base URL, and API key.
 */
export const ProviderEditDialog: React.FC<ProviderEditDialogProps> = ({
  open,
  onOpenChange,
  provider,
  onUpdate,
}) => {
  const { modalContainer } = useTab();
  const { t } = useI18n();

  const [editedProvider, setEditedProvider] = useState<ModelProvider | null>(null);
  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    type: false,
    baseUrl: false,
    apiKey: false,
  });

  // Update local state when provider prop changes
  useEffect(() => {
    if (provider) {
      setEditedProvider({ ...provider });
    }
  }, [provider]);

  const setError = (field: keyof FormErrors, value: boolean) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const clearErrors = () => {
    setErrors({
      name: false,
      type: false,
      baseUrl: false,
      apiKey: false,
    });
  };

  const validateFields = (): boolean => {
    if (!editedProvider) return false;

    let isValid = true;
    const newErrors = { ...errors };

    // Validate name
    newErrors.name = !editedProvider.name.trim();
    if (!editedProvider.name.trim()) isValid = false;

    // Validate type
    newErrors.type = !editedProvider.type;
    if (!editedProvider.type) isValid = false;

    // Validate baseUrl
    newErrors.baseUrl = !editedProvider.baseUrl.trim();
    if (!editedProvider.baseUrl.trim()) isValid = false;

    // Validate apiKey
    newErrors.apiKey = !editedProvider.apiKey.trim();
    if (!editedProvider.apiKey.trim()) isValid = false;

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = () => {
    if (!provider || !editedProvider || !validateFields()) {
      return;
    }

    onUpdate(provider, editedProvider);
    handleClose();
  };

  const handleClose = () => {
    clearErrors();
    onOpenChange(false);
  };

  if (!editedProvider) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="tw-max-h-[85vh] tw-max-w-2xl tw-overflow-y-auto"
        container={modalContainer}
      >
        <DialogHeader>
          <DialogTitle>{t("settings.providers.editDialog.title")}</DialogTitle>
          <DialogDescription>{t("settings.providers.editDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="tw-space-y-4 tw-py-4">
          {/* Provider Type */}
          <FormField
            label={t("settings.providers.editDialog.type.label")}
            description={t("settings.providers.editDialog.type.description")}
            error={errors.type}
            errorMessage={t("settings.providers.editDialog.type.error")}
          >
            <Select
              value={editedProvider.type}
              onValueChange={(value: ChatModelProviders) => {
                setEditedProvider({ ...editedProvider, type: value });
                setError("type", false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("settings.providers.editDialog.type.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ChatModelProviders).map((providerType) => (
                  <SelectItem key={providerType} value={providerType}>
                    {getProviderLabel(providerType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Provider Name */}
          <FormField
            label={t("settings.providers.editDialog.name.label")}
            description={t("settings.providers.editDialog.name.description")}
            error={errors.name}
            errorMessage={t("settings.providers.editDialog.name.error")}
          >
            <Input
              type="text"
              placeholder={t("settings.providers.editDialog.name.placeholder")}
              value={editedProvider.name}
              onChange={(e) => {
                setEditedProvider({ ...editedProvider, name: e.target.value });
                setError("name", false);
              }}
            />
          </FormField>

          {/* Base URL */}
          <FormField
            label={t("settings.providers.editDialog.baseUrl.label")}
            description={t("settings.providers.editDialog.baseUrl.description")}
            error={errors.baseUrl}
            errorMessage={t("settings.providers.editDialog.baseUrl.error")}
          >
            <Input
              type="text"
              placeholder={t("settings.providers.editDialog.baseUrl.placeholder")}
              value={editedProvider.baseUrl}
              onChange={(e) => {
                setEditedProvider({ ...editedProvider, baseUrl: e.target.value });
                setError("baseUrl", false);
              }}
            />
          </FormField>

          {/* API Key */}
          <FormField
            label={t("settings.providers.editDialog.apiKey.label")}
            description={t("settings.providers.editDialog.apiKey.description")}
            error={errors.apiKey}
            errorMessage={t("settings.providers.editDialog.apiKey.error")}
          >
            <PasswordInput
              placeholder={t("settings.providers.editDialog.apiKey.placeholder")}
              value={editedProvider.apiKey}
              onChange={(value) => {
                setEditedProvider({ ...editedProvider, apiKey: value });
                setError("apiKey", false);
              }}
            />
          </FormField>
        </div>

        <div className="tw-flex tw-justify-end tw-gap-2">
          <Button variant="secondary" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleUpdate}>{t("common.save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
