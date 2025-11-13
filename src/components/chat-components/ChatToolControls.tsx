import React from "react";
import { Database, Pen, Sparkles, Brain, Wrench, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChainType } from "@/chainFactory";
import { cn } from "@/lib/utils";
import { updateSetting } from "@/settings/model";
import { isAdvancedChain } from "@/utils";
import { useI18n } from "@/i18n";

interface ChatToolControlsProps {
  // Tool toggle states
  vaultToggle: boolean;
  setVaultToggle: (value: boolean) => void;
  composerToggle: boolean;
  setComposerToggle: (value: boolean) => void;
  autonomousAgentToggle: boolean;
  setAutonomousAgentToggle: (value: boolean) => void;

  // Toggle-off callbacks for pill removal
  onVaultToggleOff?: () => void;
  onComposerToggleOff?: () => void;

  // Other props
  currentChain: ChainType;
}

const ChatToolControls: React.FC<ChatToolControlsProps> = ({
  vaultToggle,
  setVaultToggle,
  composerToggle,
  setComposerToggle,
  autonomousAgentToggle,
  setAutonomousAgentToggle,
  onVaultToggleOff,
  onComposerToggleOff,
  currentChain,
}) => {
  const { t } = useI18n();
  const isAdvancedMode = isAdvancedChain(currentChain);
  const showAutonomousAgent = isAdvancedMode && currentChain !== ChainType.PROJECT_CHAIN;

  const handleAutonomousAgentToggle = () => {
    const newValue = !autonomousAgentToggle;
    setAutonomousAgentToggle(newValue);
    updateSetting("enableAutonomousAgent", newValue);
  };

  const handleVaultToggle = () => {
    const newValue = !vaultToggle;
    setVaultToggle(newValue);
    // If toggling off, remove pills
    if (!newValue && onVaultToggleOff) {
      onVaultToggleOff();
    }
  };

  const handleComposerToggle = () => {
    const newValue = !composerToggle;
    setComposerToggle(newValue);
    // If toggling off, remove pills
    if (!newValue && onComposerToggleOff) {
      onComposerToggleOff();
    }
  };

  // Only show controls in advanced modes
  if (!isAdvancedMode) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop view - show all icons when container is wide enough */}
      <div className="tw-hidden tw-items-center tw-gap-1.5 @[420px]/chat-input:tw-flex">
        {/* Autonomous Agent button - only show in advanced mode and NOT in Projects mode */}
        {showAutonomousAgent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost2"
                size="fit"
                onClick={handleAutonomousAgentToggle}
                className={cn(
                  "tw-text-muted hover:tw-text-accent",
                  autonomousAgentToggle && "tw-text-accent tw-bg-accent/10"
                )}
              >
                <Brain className="tw-size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="tw-px-1 tw-py-0.5">
              {t("chat.tool.agentTooltip")}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Toggle buttons for vault search and composer - show when Autonomous Agent is off */}
        {!autonomousAgentToggle && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost2"
                  size="fit"
                  onClick={handleVaultToggle}
                  className={cn(
                    "tw-text-muted hover:tw-text-accent",
                    vaultToggle && "tw-text-accent tw-bg-accent/10"
                  )}
                >
                  <Database className="tw-size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tw-px-1 tw-py-0.5">
                {t("chat.tool.vaultTooltip")}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost2"
                  size="fit"
                  onClick={handleComposerToggle}
                  className={cn(
                    "tw-text-muted hover:tw-text-accent",
                    composerToggle && "tw-text-accent tw-bg-accent/10"
                  )}
                >
                  <span className="tw-flex tw-items-center tw-gap-0.5">
                    <Sparkles className="tw-size-2" />
                    <Pen className="tw-size-3" />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tw-px-1 tw-py-0.5">
                {t("chat.tool.composerTooltip")}
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Mobile view - show overflow dropdown when container is narrow */}
      <div className="tw-flex tw-items-center tw-gap-0.5 @[420px]/chat-input:tw-hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost2" size="fit" className="tw-text-muted hover:tw-text-accent">
              <Wrench className="tw-size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="tw-w-56">
            {/* Autonomous Agent option - only show in advanced mode and NOT in Projects mode */}
            {showAutonomousAgent && (
              <DropdownMenuItem
                onClick={handleAutonomousAgentToggle}
                className="tw-flex tw-items-center tw-justify-between"
              >
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Brain className="tw-size-4" />
                  <span>{t("chat.tool.agent")}</span>
                </div>
                {autonomousAgentToggle && <Check className="tw-size-4" />}
              </DropdownMenuItem>
            )}

            {/* Tool options - show when Autonomous Agent is off */}
            {!autonomousAgentToggle && (
              <>
                <DropdownMenuItem
                  onClick={handleVaultToggle}
                  className="tw-flex tw-items-center tw-justify-between"
                >
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Database className="tw-size-4" />
                    <span>{t("chat.tool.vault")}</span>
                  </div>
                  {vaultToggle && <Check className="tw-size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleComposerToggle}
                  className="tw-flex tw-items-center tw-justify-between"
                >
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-flex tw-items-center tw-gap-0.5">
                      <Sparkles className="tw-size-2" />
                      <Pen className="tw-size-3" />
                    </span>
                    <span>{t("chat.tool.composer")}</span>
                  </div>
                  {composerToggle && <Check className="tw-size-4" />}
                </DropdownMenuItem>
              </>
            )}

            {/* Tool options - show when Autonomous Agent is on (disabled) */}
            {autonomousAgentToggle && (
              <>
                <DropdownMenuItem
                  disabled
                  className="tw-flex tw-items-center tw-justify-between tw-opacity-50"
                >
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Database className="tw-size-4" />
                    <span>{t("chat.tool.vault")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled
                  className="tw-flex tw-items-center tw-justify-between tw-opacity-50"
                >
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-flex tw-items-center tw-gap-0.5">
                      <Sparkles className="tw-size-2" />
                      <Pen className="tw-size-3" />
                    </span>
                    <span>{t("chat.tool.composer")}</span>
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export { ChatToolControls };
