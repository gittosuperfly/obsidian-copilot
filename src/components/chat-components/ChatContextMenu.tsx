import { AlertCircle, CheckCircle, CircleDashed, Loader2 } from "lucide-react";
import { TFile } from "obsidian";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectedTextContext } from "@/types/message";
import { ChainType } from "@/chainFactory";
import { Separator } from "@/components/ui/separator";
import { useChainType } from "@/aiParams";
import { useProjectContextStatus } from "@/hooks/useProjectContextStatus";
import { isAdvancedChain } from "@/utils";
import { AtMentionTypeahead } from "./AtMentionTypeahead";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatContextMenuProps {
  currentActiveFile: TFile | null;
  contextNotes: TFile[];
  contextUrls: string[];
  contextFolders: string[];
  selectedTextContexts?: SelectedTextContext[];
  onRemoveContext: (category: string, data: any) => void;
  showProgressCard: () => void;
  onTypeaheadSelect: (category: string, data: any) => void;
  lexicalEditorRef?: React.RefObject<any>;
}

export const ChatContextMenu: React.FC<ChatContextMenuProps> = ({
  currentActiveFile,
  contextNotes,
  contextUrls,
  contextFolders,
  selectedTextContexts = [],
  onRemoveContext,
  showProgressCard,
  onTypeaheadSelect,
  lexicalEditorRef,
}) => {
  const [currentChain] = useChainType();
  const contextStatus = useProjectContextStatus();
  const [showTypeahead, setShowTypeahead] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const advancedModeEnabled = isAdvancedChain(currentChain);

  const handleTypeaheadClose = () => {
    setShowTypeahead(false);
  };

  // Simple wrapper that adds focus management to the ContextControl handler
  const handleTypeaheadSelect = (category: string, data: any) => {
    // Delegate to ContextControl handler
    onTypeaheadSelect(category, data);

    // Return focus to the editor after selection
    setTimeout(() => {
      if (lexicalEditorRef?.current) {
        lexicalEditorRef.current.focus();
      }
    }, 100);
  };

  // Get contextStatus from the shared hook
  const getContextStatusIcon = () => {
    switch (contextStatus) {
      case "success":
        return <CheckCircle className="tw-size-4 tw-text-success" />;
      case "loading":
        return <Loader2 className="tw-size-4 tw-animate-spin tw-text-loading" />;
      case "error":
        return <AlertCircle className="tw-size-4 tw-text-error" />;
      case "initial":
        return <CircleDashed className="tw-size-4 tw-text-faint" />;
    }
  };

  return (
    <>
      {/* @按钮 - 缩小后放在按钮区域 */}
      <Popover open={showTypeahead} onOpenChange={setShowTypeahead}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="ghost2"
            size="fit"
            className="tw-text-muted hover:tw-text-accent"
          >
            <span className="tw-text-sm tw-font-medium tw-leading-none">@</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="tw-w-[400px] tw-p-0" align="start" side="top" sideOffset={4}>
          <AtMentionTypeahead
            isOpen={showTypeahead}
            onClose={handleTypeaheadClose}
            onSelect={handleTypeaheadSelect}
            advancedModeEnabled={advancedModeEnabled}
            currentActiveFile={currentActiveFile}
          />
        </PopoverContent>
      </Popover>

      {/* 项目模式下的状态指示器 */}
      {currentChain === ChainType.PROJECT_CHAIN && (
        <>
          <Separator orientation="vertical" className="tw-h-4" />
          <Button
            variant="ghost2"
            size="fit"
            className="tw-text-muted"
            onClick={() => showProgressCard()}
          >
            {getContextStatusIcon()}
          </Button>
        </>
      )}
    </>
  );
};
