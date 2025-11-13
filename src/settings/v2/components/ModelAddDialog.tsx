import { CustomModel, ModelProvider } from "@/aiParams";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_CAPABILITIES, ModelCapability } from "@/constants";
import { useTab } from "@/contexts/TabContext";
import { useI18n } from "@/i18n";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface FormErrors {
  name: boolean;
}

interface ModelAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ModelProvider | null;
  onAdd: (model: CustomModel) => void;
  ping: (model: CustomModel) => Promise<boolean>;
}

/**
 * Simplified ModelAddDialog for the provider-centric architecture.
 * Users select a provider first, then add models to it.
 */
export const ModelAddDialog: React.FC<ModelAddDialogProps> = ({
  open,
  onOpenChange,
  provider,
  onAdd,
  ping,
}) => {
  const { modalContainer } = useTab();
  const { t } = useI18n();

  const [model, setModel] = useState<CustomModel>({
    name: "",
    providerId: provider?.id || "",
    enabled: true,
    stream: true,
    temperature: 0.7,
    maxTokens: 4000,
    capabilities: [],
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    name: false,
  });

  // Update providerId when provider changes
  useEffect(() => {
    if (provider) {
      setModel((prev) => ({ ...prev, providerId: provider.id }));
    }
  }, [provider]);

  const setError = (field: keyof FormErrors, value: boolean) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const clearErrors = () => {
    setErrors({ name: false });
  };

  const validateFields = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate name
    newErrors.name = !model.name.trim();
    if (!model.name.trim()) isValid = false;

    setErrors(newErrors);
    return isValid;
  };

  const handleAdd = async () => {
    if (!validateFields() || !provider) {
      return;
    }

    onAdd(model);
    handleClose();
  };

  const handleVerify = async () => {
    if (!validateFields() || !provider) {
      return;
    }

    setIsVerifying(true);
    try {
      const success = await ping(model);
      if (success) {
        alert(t("settings.models.notice.pingSuccess"));
      } else {
        alert(t("settings.models.notice.pingFailed"));
      }
    } catch (error) {
      alert(t("settings.models.notice.pingError", { error: String(error) }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setModel({
      name: "",
      providerId: provider?.id || "",
      enabled: true,
      stream: true,
      temperature: 0.7,
      maxTokens: 4000,
      capabilities: [],
    });
    clearErrors();
    onOpenChange(false);
  };

  const toggleCapability = (capability: ModelCapability) => {
    const capabilities = model.capabilities || [];
    const hasCapability = capabilities.includes(capability);

    setModel({
      ...model,
      capabilities: hasCapability
        ? capabilities.filter((c) => c !== capability)
        : [...capabilities, capability],
    });
  };

  if (!provider) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="tw-max-h-[85vh] tw-max-w-2xl tw-overflow-y-auto"
        container={modalContainer}
      >
        <DialogHeader>
          <DialogTitle>{t("settings.models.addDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("settings.models.addDialog.description", { provider: provider.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="tw-space-y-4 tw-py-4">
          {/* Provider Info (Read-only) */}
          <div className="tw-rounded tw-border tw-border-border tw-bg-secondary tw-p-3">
            <div className="tw-mb-1 tw-text-sm tw-text-muted">
              {t("settings.models.addDialog.provider")}
            </div>
            <div className="tw-font-medium tw-text-normal">{provider.name}</div>
            <div className="tw-mt-1 tw-text-xs tw-text-muted">{provider.baseUrl}</div>
          </div>

          {/* Model Name */}
          <FormField
            label={t("settings.models.addDialog.name.label")}
            description={t("settings.models.addDialog.name.description")}
            error={errors.name}
            errorMessage={t("settings.models.addDialog.name.error")}
          >
            <Input
              type="text"
              placeholder={t("settings.models.addDialog.name.placeholder")}
              value={model.name}
              onChange={(e) => {
                setModel({ ...model, name: e.target.value });
                setError("name", false);
              }}
            />
          </FormField>

          {/* Display Name (Optional) */}
          <FormField
            label={t("settings.models.addDialog.displayName.label")}
            description={t("settings.models.addDialog.displayName.description")}
          >
            <Input
              type="text"
              placeholder={t("settings.models.addDialog.displayName.placeholder")}
              value={model.displayName || ""}
              onChange={(e) => setModel({ ...model, displayName: e.target.value })}
            />
          </FormField>

          {/* Capabilities */}
          <FormField
            label={t("settings.models.addDialog.capabilities.label")}
            description={t("settings.models.addDialog.capabilities.description")}
          >
            <div className="tw-space-y-2">
              {Object.entries(MODEL_CAPABILITIES).map(([key, capability]) => {
                const capabilityKey = key as ModelCapability;
                const isSelected = model.capabilities?.includes(capabilityKey) || false;

                return (
                  <label
                    key={capabilityKey}
                    className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCapability(capabilityKey)}
                    />
                    <span className="tw-text-sm">{t(capability.labelKey)}</span>
                  </label>
                );
              })}
            </div>
          </FormField>

          {/* Temperature */}
          <FormField
            label={t("settings.models.addDialog.temperature.label")}
            description={t("settings.models.addDialog.temperature.description")}
          >
            <Input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={model.temperature || 0.7}
              onChange={(e) =>
                setModel({ ...model, temperature: parseFloat(e.target.value) || 0.7 })
              }
            />
          </FormField>

          {/* Max Tokens */}
          <FormField
            label={t("settings.models.addDialog.maxTokens.label")}
            description={t("settings.models.addDialog.maxTokens.description")}
          >
            <Input
              type="number"
              min={1}
              max={1000000}
              step={100}
              value={model.maxTokens || 4000}
              onChange={(e) => setModel({ ...model, maxTokens: parseInt(e.target.value) || 4000 })}
            />
          </FormField>

          {/* Reasoning Effort (for reasoning models) */}
          {model.capabilities?.includes(ModelCapability.REASONING) && (
            <FormField
              label={t("settings.models.addDialog.reasoningEffort.label")}
              description={t("settings.models.addDialog.reasoningEffort.description")}
            >
              <Select
                value={model.reasoningEffort || "medium"}
                onValueChange={(value: "minimal" | "low" | "medium" | "high") =>
                  setModel({ ...model, reasoningEffort: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">
                    {t("settings.models.reasoningEffort.minimal")}
                  </SelectItem>
                  <SelectItem value="low">{t("settings.models.reasoningEffort.low")}</SelectItem>
                  <SelectItem value="medium">
                    {t("settings.models.reasoningEffort.medium")}
                  </SelectItem>
                  <SelectItem value="high">{t("settings.models.reasoningEffort.high")}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}

          {/* Stream */}
          <label className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2">
            <Checkbox
              checked={model.stream}
              onCheckedChange={(checked) => setModel({ ...model, stream: !!checked })}
            />
            <span className="tw-text-sm">{t("settings.models.addDialog.stream")}</span>
          </label>

          {/* Enabled */}
          <label className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2">
            <Checkbox
              checked={model.enabled}
              onCheckedChange={(checked) => setModel({ ...model, enabled: !!checked })}
            />
            <span className="tw-text-sm">{t("settings.models.addDialog.enabled")}</span>
          </label>
        </div>

        <div className="tw-flex tw-justify-between tw-gap-2">
          <Button variant="secondary" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying && <Loader2 className="tw-mr-2 tw-size-4 tw-animate-spin" />}
            {t("settings.models.addDialog.verify")}
          </Button>
          <div className="tw-flex tw-gap-2">
            <Button variant="secondary" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAdd}>{t("common.add")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
