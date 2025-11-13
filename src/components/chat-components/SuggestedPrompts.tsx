import { useChainType } from "@/aiParams";
import { ChainType } from "@/chainFactory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VAULT_VECTOR_STORE_STRATEGY } from "@/constants";
import { useSettingsValue } from "@/settings/model";
import { PlusCircle, TriangleAlert } from "lucide-react";
import React, { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n, TranslationKey } from "@/i18n";

interface NotePrompt {
  titleKey: TranslationKey;
  promptKeys: TranslationKey[];
}

const SUGGESTED_PROMPTS: Record<string, NotePrompt> = {
  activeNote: {
    titleKey: "chat.suggested.category.active",
    promptKeys: [
      "chat.suggested.prompt.active.1",
      "chat.suggested.prompt.active.2",
      "chat.suggested.prompt.active.3",
    ],
  },
  quoteNote: {
    titleKey: "chat.suggested.category.noteLink",
    promptKeys: [
      "chat.suggested.prompt.note.1",
      "chat.suggested.prompt.note.2",
      "chat.suggested.prompt.note.3",
      "chat.suggested.prompt.note.4",
    ],
  },
  fun: {
    titleKey: "chat.suggested.category.fun",
    promptKeys: [
      "chat.suggested.prompt.fun.1",
      "chat.suggested.prompt.fun.2",
      "chat.suggested.prompt.fun.3",
    ],
  },
  qaVault: {
    titleKey: "chat.suggested.category.qa",
    promptKeys: [
      "chat.suggested.prompt.qa.1",
      "chat.suggested.prompt.qa.2",
      "chat.suggested.prompt.qa.3",
      "chat.suggested.prompt.qa.4",
    ],
  },
  advancedAgent: {
    titleKey: "chat.suggested.category.advanced",
    promptKeys: [
      "chat.suggested.prompt.advanced.1",
      "chat.suggested.prompt.advanced.2",
      "chat.suggested.prompt.advanced.3",
      "chat.suggested.prompt.advanced.4",
      "chat.suggested.prompt.advanced.5",
      "chat.suggested.prompt.advanced.6",
    ],
  },
};

const PROMPT_KEYS: Record<ChainType, Array<keyof typeof SUGGESTED_PROMPTS>> = {
  [ChainType.LLM_CHAIN]: ["activeNote", "quoteNote", "fun"],
  [ChainType.VAULT_QA_CHAIN]: ["qaVault", "qaVault", "quoteNote"],
  [ChainType.ADVANCED_CHAIN]: ["advancedAgent", "advancedAgent", "advancedAgent"],
  [ChainType.PROJECT_CHAIN]: ["advancedAgent", "advancedAgent", "advancedAgent"],
};

function getRandomPrompt(
  chainType: ChainType = ChainType.LLM_CHAIN,
  translateKey: (key: TranslationKey) => string
) {
  const keys = PROMPT_KEYS[chainType] || PROMPT_KEYS[ChainType.LLM_CHAIN];

  // For repeated keys, shuffle once and take multiple items
  const shuffledPrompts: Record<string, TranslationKey[]> = {};

  return keys.map((key) => {
    if (!shuffledPrompts[key]) {
      shuffledPrompts[key] = [...SUGGESTED_PROMPTS[key].promptKeys].sort(() => Math.random() - 0.5);
    }
    const promptKey = shuffledPrompts[key].pop() || SUGGESTED_PROMPTS[key].promptKeys[0];
    return {
      title: translateKey(SUGGESTED_PROMPTS[key].titleKey),
      text: translateKey(promptKey),
    };
  });
}

interface SuggestedPromptsProps {
  onClick: (text: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onClick }) => {
  const [chainType] = useChainType();
  const { t } = useI18n();
  const prompts = useMemo(() => getRandomPrompt(chainType, t), [chainType, t]);
  const settings = useSettingsValue();
  const indexVaultToVectorStore = settings.indexVaultToVectorStore as VAULT_VECTOR_STORE_STRATEGY;

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <Card className="tw-w-full tw-bg-transparent">
        <CardHeader className="tw-px-2">
          <CardTitle>{t("chat.suggested.title")}</CardTitle>
        </CardHeader>
        <CardContent className="tw-p-2 tw-pt-0">
          <div className="tw-flex tw-flex-col tw-gap-2">
            {prompts.map((prompt, i) => (
              <div
                key={i}
                className="tw-flex tw-justify-between tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-border-border tw-p-2 tw-text-sm"
              >
                <div className="tw-flex tw-flex-col tw-gap-1">
                  <div className="tw-text-muted">{prompt.title}</div>
                  <div>{prompt.text}</div>
                </div>
                <div className="tw-flex tw-h-full tw-items-start">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost2"
                        size="fit"
                        className="tw-text-muted"
                        onClick={() => onClick(prompt.text)}
                      >
                        <PlusCircle className="tw-size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("chat.suggested.buttonTooltip")}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {chainType === ChainType.VAULT_QA_CHAIN && (
        <div className="tw-rounded-md tw-border tw-border-solid tw-border-border tw-p-2 tw-text-sm">
          {t("chat.suggested.notice.qa")}
        </div>
      )}
      {chainType === ChainType.VAULT_QA_CHAIN &&
        indexVaultToVectorStore === VAULT_VECTOR_STORE_STRATEGY.NEVER && (
          <div className="tw-rounded-md tw-border tw-border-solid tw-border-border tw-p-2 tw-text-sm">
            <div className="tw-flex tw-items-start tw-gap-2">
              <TriangleAlert className="tw-size-4 tw-text-warning" />
              <span>{t("chat.suggested.notice.vector")}</span>
            </div>
          </div>
        )}
    </div>
  );
};
