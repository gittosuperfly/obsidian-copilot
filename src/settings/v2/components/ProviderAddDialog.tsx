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
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface FormErrors {
  name: boolean;
  type: boolean;
  baseUrl: boolean;
  apiKey: boolean;
}

interface ProviderAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (provider: ModelProvider) => void;
}

/**
 * Dialog for adding a new model provider.
 * Collects provider name, base URL, and API key.
 */
export const ProviderAddDialog: React.FC<ProviderAddDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
}) => {
  const { modalContainer } = useTab();
  const { t } = useI18n();

  const [provider, setProvider] = useState<ModelProvider>({
    id: uuidv4(),
    name: "",
    type: ChatModelProviders.OPENAI,
    baseUrl: "",
    apiKey: "",
    enabled: true,
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    type: false,
    baseUrl: false,
    apiKey: false,
  });

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
    let isValid = true;
    const newErrors = { ...errors };

    // Validate name
    newErrors.name = !provider.name.trim();
    if (!provider.name.trim()) isValid = false;

    // Validate type
    newErrors.type = !provider.type;
    if (!provider.type) isValid = false;

    // Validate baseUrl
    newErrors.baseUrl = !provider.baseUrl.trim();
    if (!provider.baseUrl.trim()) isValid = false;

    // Validate apiKey
    newErrors.apiKey = !provider.apiKey.trim();
    if (!provider.apiKey.trim()) isValid = false;

    setErrors(newErrors);
    return isValid;
  };

  const handleAdd = () => {
    if (!validateFields()) {
      return;
    }

    onAdd(provider);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setProvider({
      id: uuidv4(),
      name: "",
      type: ChatModelProviders.OPENAI,
      baseUrl: "",
      apiKey: "",
      enabled: true,
    });
    clearErrors();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="tw-max-h-[85vh] tw-max-w-2xl tw-overflow-y-auto"
        container={modalContainer}
      >
        <DialogHeader>
          <DialogTitle>{t("settings.providers.addDialog.title")}</DialogTitle>
          <DialogDescription>{t("settings.providers.addDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="tw-space-y-4 tw-py-4">
          {/* Provider Type */}
          <FormField
            label={t("settings.providers.addDialog.type.label")}
            description={t("settings.providers.addDialog.type.description")}
            error={errors.type}
            errorMessage={t("settings.providers.addDialog.type.error")}
          >
            <Select
              value={provider.type}
              onValueChange={(value: ChatModelProviders) => {
                setProvider({ ...provider, type: value });
                setError("type", false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("settings.providers.addDialog.type.placeholder")} />
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
            label={t("settings.providers.addDialog.name.label")}
            description={t("settings.providers.addDialog.name.description")}
            error={errors.name}
            errorMessage={t("settings.providers.addDialog.name.error")}
          >
            <Input
              type="text"
              placeholder={t("settings.providers.addDialog.name.placeholder")}
              value={provider.name}
              onChange={(e) => {
                setProvider({ ...provider, name: e.target.value });
                setError("name", false);
              }}
            />
          </FormField>

          {/* Base URL */}
          <FormField
            label={t("settings.providers.addDialog.baseUrl.label")}
            description={t("settings.providers.addDialog.baseUrl.description")}
            error={errors.baseUrl}
            errorMessage={t("settings.providers.addDialog.baseUrl.error")}
          >
            <Input
              type="text"
              placeholder={t("settings.providers.addDialog.baseUrl.placeholder")}
              value={provider.baseUrl}
              onChange={(e) => {
                setProvider({ ...provider, baseUrl: e.target.value });
                setError("baseUrl", false);
              }}
            />
          </FormField>

          {/* API Key */}
          <FormField
            label={t("settings.providers.addDialog.apiKey.label")}
            description={t("settings.providers.addDialog.apiKey.description")}
            error={errors.apiKey}
            errorMessage={t("settings.providers.addDialog.apiKey.error")}
          >
            <PasswordInput
              placeholder={t("settings.providers.addDialog.apiKey.placeholder")}
              value={provider.apiKey}
              onChange={(value) => {
                setProvider({ ...provider, apiKey: value });
                setError("apiKey", false);
              }}
            />
          </FormField>
        </div>

        <div className="tw-flex tw-justify-end tw-gap-2">
          <Button variant="secondary" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleAdd}>{t("common.add")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
