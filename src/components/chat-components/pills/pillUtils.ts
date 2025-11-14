import { useSettingsValue } from "@/settings/model";

/**
 * Hook to get the max width class for pill text based on settings
 * @returns Tailwind max-width class string (e.g., "tw-max-w-32")
 */
export function usePillMaxWidth(): string {
  const settings = useSettingsValue();
  const maxWidth = settings.pillTextMaxWidth ?? 32;
  return `tw-max-w-${maxWidth}`;
}
