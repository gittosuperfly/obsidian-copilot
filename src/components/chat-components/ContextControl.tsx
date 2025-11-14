import React from "react";

import { SelectedTextContext } from "@/types/message";
import { TFile } from "obsidian";
import { ChatContextMenu } from "./ChatContextMenu";

interface ChatControlsProps {
  activeNote: TFile | null;
  contextNotes: TFile[];
  contextUrls: string[];
  contextFolders: string[];
  selectedTextContexts?: SelectedTextContext[];
  showProgressCard: () => void;
  lexicalEditorRef?: React.RefObject<any>;

  // Unified handlers
  onAddToContext: (category: string, data: any) => void;
  onRemoveFromContext: (category: string, data: any) => void;
}

export const ContextControl: React.FC<ChatControlsProps> = ({
  activeNote,
  contextNotes,
  contextUrls,
  contextFolders,
  selectedTextContexts,
  showProgressCard,
  lexicalEditorRef,
  onAddToContext,
  onRemoveFromContext,
}) => {
  const handleRemoveContext = (category: string, data: any) => {
    // Delegate to unified handler
    onRemoveFromContext(category, data);
  };

  const handleTypeaheadSelect = (category: string, data: any) => {
    // Delegate to unified handler
    onAddToContext(category, data);
  };

  // Context menu is now available for all chain types

  return (
    <ChatContextMenu
      currentActiveFile={activeNote}
      contextNotes={contextNotes}
      onRemoveContext={handleRemoveContext}
      contextUrls={contextUrls}
      contextFolders={contextFolders}
      selectedTextContexts={selectedTextContexts}
      showProgressCard={showProgressCard}
      onTypeaheadSelect={handleTypeaheadSelect}
      lexicalEditorRef={lexicalEditorRef}
    />
  );
};
