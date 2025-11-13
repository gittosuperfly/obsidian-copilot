import { useCallback } from "react";
import { useSettingsValue } from "@/settings/model";
import { DEFAULT_LANGUAGE, Language, SUPPORTED_LANGUAGES } from "./lang";
import { translations, TranslationKey } from "./translations";

type TranslationParams = Record<string, string | number>;

/**
 * Translates a key into the requested language and interpolates any template parameters.
 *
 * @param key - The translation key to resolve.
 * @param params - Optional template parameters used for interpolation.
 * @param language - Target language (defaults to {@link DEFAULT_LANGUAGE}).
 * @returns The translated string with parameters applied.
 */
export function translate(
  key: TranslationKey,
  params: TranslationParams = {},
  language: Language = DEFAULT_LANGUAGE
): string {
  const dictionary = translations[language] ?? translations[DEFAULT_LANGUAGE];
  const fallback = translations[DEFAULT_LANGUAGE];
  const template = dictionary[key] ?? fallback[key] ?? key;

  return template.replace(/{{(.*?)}}/g, (_, paramKey) => {
    const trimmedKey = String(paramKey).trim();
    const value = params[trimmedKey];
    return value !== undefined ? String(value) : `{{${trimmedKey}}}`;
  });
}

/**
 * React hook that returns the translation helper bound to the current language setting.
 *
 * @returns The translator function `t` and the active language code.
 */
export function useI18n() {
  const settings = useSettingsValue();
  const language = settings.language ?? DEFAULT_LANGUAGE;

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(key, params, language),
    [language]
  );

  return { t, language };
}

export type { TranslationKey, Language };
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };
