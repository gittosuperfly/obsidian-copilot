import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { TFile } from "obsidian";
import { notesAtom } from "@/state/vaultDataAtoms";
import { settingsStore } from "@/settings/model";

/**
 * Custom hook to get all available notes from the vault.
 * Includes Markdown and canvas files for every user and automatically updates when files change.
 * Notes are sorted by creation date in descending order (newest first).
 *
 * Data is managed by the singleton VaultDataManager, which provides:
 * - Single set of vault event listeners (eliminates duplicates)
 * - Debounced updates (250ms) to batch rapid file operations
 * - Stable array references to prevent unnecessary re-renders
 *
 * @returns Array of TFile objects sorted by creation date (newest first)
 */
export function useAllNotes(): TFile[] {
  const allNotes = useAtomValue(notesAtom, { store: settingsStore });

  return useMemo(() => {
    const files = allNotes.filter((file) => file.extension === "md" || file.extension === "canvas");

    // Sort by creation time in descending order (newest first)
    return files.sort((a, b) => b.stat.ctime - a.stat.ctime);
  }, [allNotes]);
}
