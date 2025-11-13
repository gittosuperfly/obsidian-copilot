import React, { useMemo } from "react";
import { TFile, TFolder } from "obsidian";
import { FileText, Wrench, Folder } from "lucide-react";
import { TypeaheadOption } from "../TypeaheadMenuContent";

export type AtMentionCategory = "notes" | "tools" | "folders" | "activeNote";

export interface AtMentionOption extends TypeaheadOption {
  category: AtMentionCategory;
  data: TFile | string | TFolder;
}

export interface CategoryOption extends TypeaheadOption {
  category: AtMentionCategory;
  icon: React.ReactNode;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    key: "notes",
    title: "Notes",
    subtitle: "Reference notes in your vault",
    category: "notes",
    icon: <FileText className="tw-size-4" />,
  },
  {
    key: "tools",
    title: "Tools",
    subtitle: "AI tools and commands",
    category: "tools",
    icon: <Wrench className="tw-size-4" />,
  },
  {
    key: "folders",
    title: "Folders",
    subtitle: "Reference vault folders",
    category: "folders",
    icon: <Folder className="tw-size-4" />,
  },
];

/**
 * Hook that provides available @ mention categories based on whether advanced tools are enabled.
 * Returns the array of available category options directly.
 *
 * @param advancedModeEnabled - Whether tool categories should be exposed
 * @returns Array of CategoryOption objects
 */
export function useAtMentionCategories(advancedModeEnabled: boolean = false): CategoryOption[] {
  // Filter category options based on advanced-tool availability
  return useMemo(() => {
    return CATEGORY_OPTIONS.filter((cat) => {
      if (cat.category === "tools") {
        return advancedModeEnabled;
      }
      return true;
    });
  }, [advancedModeEnabled]);
}
