import React from "react";
import { TFile, App } from "obsidian";
import { parseTextForPills } from "./utils/lexicalTextUtils";
import { cn } from "@/lib/utils";
import { PillBadge } from "./pills/PillBadge";
import { TruncatedPillText } from "./pills/TruncatedPillText";
import { useActiveFile, ActiveFileProvider } from "./context/ActiveFileContext";

interface MessageContentWithPillsProps {
  message: string;
  app: App;
  className?: string;
  currentActiveFile?: TFile | null;
}

/**
 * Simple pill component for displaying active note
 */
function ActiveNotePillDisplay() {
  const currentActiveFile = useActiveFile();

  if (!currentActiveFile) {
    return (
      <PillBadge>
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <TruncatedPillText
            content="activeNote"
            openBracket=""
            closeBracket=""
            tooltipContent={
              <div className="tw-text-left">
                Will use the active note at the time the message is sent
              </div>
            }
            maxWidth="tw-max-w-32"
          />
        </div>
      </PillBadge>
    );
  }

  const noteTitle = currentActiveFile.basename;
  const notePath = currentActiveFile.path;
  const isPdf = notePath.toLowerCase().endsWith(".pdf");

  return (
    <PillBadge>
      <div className="tw-flex tw-items-center tw-gap-1.5">
        <TruncatedPillText
          content={noteTitle}
          openBracket=""
          closeBracket=""
          tooltipContent={<div className="tw-text-left">{notePath}</div>}
          maxWidth="tw-max-w-32"
        />
        <span className="tw-text-[10px] tw-text-faint">Current</span>
        {isPdf && <span className="tw-text-[10px] tw-text-faint">pdf</span>}
      </div>
    </PillBadge>
  );
}

/**
 * Component that renders message content with inline pills for references
 * Similar to how Cursor displays mentions inline in messages
 */
export function MessageContentWithPills({
  message,
  app,
  className,
  currentActiveFile,
}: MessageContentWithPillsProps): JSX.Element {
  // Parse message text and convert references to pills
  const segments = React.useMemo(() => {
    try {
      return parseTextForPills(message, {
        includeNotes: true,
        includeURLs: true,
        includeTools: true,
        includeCustomTemplates: true,
      });
    } catch (error) {
      console.error("Error parsing message for pills:", error);
      // Fallback to plain text if parsing fails
      return [{ type: "text", content: message }];
    }
  }, [message]);

  return (
    <ActiveFileProvider currentActiveFile={currentActiveFile ?? null}>
      <div
        className={cn(
          "tw-inline tw-whitespace-pre-wrap tw-break-words tw-text-[calc(var(--font-text-size)_-_2px)] tw-font-normal",
          className
        )}
      >
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return <span key={index}>{segment.content}</span>;
          } else if (segment.type === "active-note-pill") {
            return <ActiveNotePillDisplay key={index} />;
          } else if (segment.type === "note-pill" && "file" in segment && segment.file) {
            const noteTitle = segment.content;
            const notePath = segment.file.path;
            const lowerPath = notePath.toLowerCase();
            const isPdf = lowerPath.endsWith(".pdf");
            const isCanvas = lowerPath.endsWith(".canvas");

            return (
              <PillBadge key={index}>
                <div className="tw-flex tw-items-center tw-gap-1.5">
                  <TruncatedPillText
                    content={noteTitle}
                    openBracket=""
                    closeBracket=""
                    tooltipContent={<div className="tw-text-left">{notePath}</div>}
                    maxWidth="tw-max-w-32"
                  />
                  {isPdf && <span className="tw-text-[10px] tw-text-faint">pdf</span>}
                  {isCanvas && <span className="tw-text-[10px] tw-text-faint">canvas</span>}
                </div>
              </PillBadge>
            );
          } else if (segment.type === "url-pill" && "url" in segment && segment.url) {
            return (
              <PillBadge key={index}>
                <div className="tw-flex tw-items-center tw-gap-1.5">
                  <TruncatedPillText
                    content={segment.url}
                    openBracket=""
                    closeBracket=""
                    tooltipContent={<div className="tw-text-left">{segment.url}</div>}
                    maxWidth="tw-max-w-32"
                  />
                </div>
              </PillBadge>
            );
          } else if (segment.type === "tool-pill" && "toolName" in segment && segment.toolName) {
            return (
              <PillBadge key={index}>
                <div className="tw-flex tw-items-center tw-gap-1.5">
                  <TruncatedPillText
                    content={segment.toolName}
                    openBracket="@"
                    closeBracket=""
                    tooltipContent={<div className="tw-text-left">{segment.toolName}</div>}
                    maxWidth="tw-max-w-32"
                  />
                </div>
              </PillBadge>
            );
          } else if (segment.type === "folder-pill" && "folder" in segment && segment.folder) {
            return (
              <PillBadge key={index}>
                <div className="tw-flex tw-items-center tw-gap-1.5">
                  <TruncatedPillText
                    content={segment.folder.name}
                    openBracket=""
                    closeBracket=""
                    tooltipContent={<div className="tw-text-left">{segment.folder.path}</div>}
                    maxWidth="tw-max-w-32"
                  />
                </div>
              </PillBadge>
            );
          }
          return null;
        })}
      </div>
    </ActiveFileProvider>
  );
}
