import React, { useMemo } from "react";
import { TFile, TFolder } from "obsidian";
import { FileText, Wrench, Folder } from "lucide-react";
import { TypeaheadOption } from "../TypeaheadMenuContent";
import { useI18n } from "@/i18n";

export type AtMentionCategory = "notes" | "tools" | "folders" | "activeNote";

export interface AtMentionOption extends TypeaheadOption {
  category: AtMentionCategory;
  data: TFile | string | TFolder;
}

export interface CategoryOption extends TypeaheadOption {
  category: AtMentionCategory;
  icon: React.ReactNode;
}

// Note: This is now a function that uses i18n, not a constant
function getCategoryOptions(t: (key: string) => string): CategoryOption[] {
  return [
    {
      key: "notes",
      title: t("chat.mention.category.notes"),
      subtitle: t("chat.mention.category.notes.subtitle"),
      category: "notes",
      icon: <FileText className="tw-size-4" />,
    },
    {
      key: "tools",
      title: t("chat.mention.category.tools"),
      subtitle: t("chat.mention.category.tools.subtitle"),
      category: "tools",
      icon: <Wrench className="tw-size-4" />,
    },
    {
      key: "folders",
      title: t("chat.mention.category.folders"),
      subtitle: t("chat.mention.category.folders.subtitle"),
      category: "folders",
      icon: <Folder className="tw-size-4" />,
    },
  ];
}

/**
 * Hook that provides available @ mention categories based on whether advanced tools are enabled.
 * Returns the array of available category options directly.
 *
 * @param advancedModeEnabled - Whether tool categories should be exposed
 * @returns Array of CategoryOption objects
 */
export function useAtMentionCategories(advancedModeEnabled: boolean = false): CategoryOption[] {
  const { t } = useI18n();

  // Filter category options based on advanced-tool availability
  return useMemo(() => {
    const categoryOptions = getCategoryOptions(t);
    return categoryOptions.filter((cat) => {
      if (cat.category === "tools") {
        return advancedModeEnabled;
      }
      return true;
    });
  }, [advancedModeEnabled, t]);
}
