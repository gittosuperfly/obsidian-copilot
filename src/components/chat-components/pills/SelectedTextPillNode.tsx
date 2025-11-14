import React from "react";
import {
  $getRoot,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
} from "lexical";
import { BasePillNode, SerializedBasePillNode } from "./BasePillNode";
import { TruncatedPillText } from "./TruncatedPillText";
import { PillBadge } from "./PillBadge";
import { usePillMaxWidth } from "./pillUtils";
import { openFileInWorkspace } from "@/utils";
import { TFile } from "obsidian";

export interface SerializedSelectedTextPillNode extends SerializedBasePillNode {
  selectedTextId: string;
  noteTitle: string;
  notePath: string;
  startLine: number;
  endLine: number;
}

export class SelectedTextPillNode extends BasePillNode {
  __selectedTextId: string;
  __noteTitle: string;
  __notePath: string;
  __startLine: number;
  __endLine: number;

  static getType(): string {
    return "selected-text-pill";
  }

  static clone(node: SelectedTextPillNode): SelectedTextPillNode {
    return new SelectedTextPillNode(
      node.__selectedTextId,
      node.__noteTitle,
      node.__notePath,
      node.__startLine,
      node.__endLine,
      node.__key
    );
  }

  constructor(
    selectedTextId: string,
    noteTitle: string,
    notePath: string,
    startLine: number,
    endLine: number,
    key?: NodeKey
  ) {
    super(noteTitle, key);
    this.__selectedTextId = selectedTextId;
    this.__noteTitle = noteTitle;
    this.__notePath = notePath;
    this.__startLine = startLine;
    this.__endLine = endLine;
  }

  getClassName(): string {
    return "selected-text-pill-wrapper";
  }

  getDataAttribute(): string {
    return "data-lexical-selected-text-pill";
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    span.className = "selected-text-pill-wrapper";
    return span;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (node.hasAttribute("data-lexical-selected-text-pill")) {
          return {
            conversion: convertSelectedTextPillElement,
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  static importJSON(serializedNode: SerializedSelectedTextPillNode): SelectedTextPillNode {
    const { selectedTextId, noteTitle, notePath, startLine, endLine } = serializedNode;
    return $createSelectedTextPillNode(selectedTextId, noteTitle, notePath, startLine, endLine);
  }

  exportJSON(): SerializedSelectedTextPillNode {
    return {
      ...super.exportJSON(),
      selectedTextId: this.__selectedTextId,
      noteTitle: this.__noteTitle,
      notePath: this.__notePath,
      startLine: this.__startLine,
      endLine: this.__endLine,
      type: "selected-text-pill",
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-selected-text-pill", "true");
    element.setAttribute("data-selected-text-id", this.__selectedTextId);
    element.setAttribute("data-note-title", this.__noteTitle);
    element.setAttribute("data-note-path", this.__notePath);
    element.setAttribute("data-start-line", this.__startLine.toString());
    element.setAttribute("data-end-line", this.__endLine.toString());
    const lineRange =
      this.__startLine === this.__endLine
        ? `L${this.__startLine}`
        : `L${this.__startLine}-${this.__endLine}`;
    element.textContent = `${this.__noteTitle} ${lineRange}`;
    return { element };
  }

  getTextContent(): string {
    const lineRange =
      this.__startLine === this.__endLine
        ? `L${this.__startLine}`
        : `L${this.__startLine}-${this.__endLine}`;
    return `${this.__noteTitle} ${lineRange}`;
  }

  getSelectedTextId(): string {
    return this.__selectedTextId;
  }

  getNoteTitle(): string {
    return this.__noteTitle;
  }

  getNotePath(): string {
    return this.__notePath;
  }

  getStartLine(): number {
    return this.__startLine;
  }

  getEndLine(): number {
    return this.__endLine;
  }

  decorate(): JSX.Element {
    return <SelectedTextPillComponent node={this} />;
  }
}

interface SelectedTextPillComponentProps {
  node: SelectedTextPillNode;
}

function SelectedTextPillComponent({ node }: SelectedTextPillComponentProps): JSX.Element {
  const maxWidth = usePillMaxWidth();
  const noteTitle = node.getNoteTitle();
  const notePath = node.getNotePath();
  const startLine = node.getStartLine();
  const endLine = node.getEndLine();
  const lineRange = startLine === endLine ? `L${startLine}` : `L${startLine}-${endLine}`;
  const tooltipContent = (
    <div className="tw-text-left">
      <div>{notePath}</div>
      <div className="tw-text-xs tw-text-faint">{lineRange}</div>
    </div>
  );

  const handleClick = async () => {
    const file = app.vault.getAbstractFileByPath(notePath);
    if (file instanceof TFile) {
      await openFileInWorkspace(file);
    }
  };

  return (
    <PillBadge onClick={handleClick}>
      <div className="tw-flex tw-items-center tw-gap-1.5">
        <TruncatedPillText
          content={noteTitle}
          openBracket=""
          closeBracket=""
          tooltipContent={tooltipContent}
          maxWidth={maxWidth}
        />
        <span className="tw-text-[10px] tw-text-faint">{lineRange}</span>
      </div>
    </PillBadge>
  );
}

function convertSelectedTextPillElement(domNode: HTMLElement): DOMConversionOutput | null {
  const selectedTextId = domNode.getAttribute("data-selected-text-id");
  const noteTitle = domNode.getAttribute("data-note-title");
  const notePath = domNode.getAttribute("data-note-path");
  const startLine = domNode.getAttribute("data-start-line");
  const endLine = domNode.getAttribute("data-end-line");
  if (selectedTextId && noteTitle && notePath && startLine && endLine) {
    const node = $createSelectedTextPillNode(
      selectedTextId,
      noteTitle,
      notePath,
      parseInt(startLine, 10),
      parseInt(endLine, 10)
    );
    return { node };
  }
  return null;
}

// Utility functions
export function $createSelectedTextPillNode(
  selectedTextId: string,
  noteTitle: string,
  notePath: string,
  startLine: number,
  endLine: number
): SelectedTextPillNode {
  return new SelectedTextPillNode(selectedTextId, noteTitle, notePath, startLine, endLine);
}

export function $isSelectedTextPillNode(
  node: LexicalNode | null | undefined
): node is SelectedTextPillNode {
  return node instanceof SelectedTextPillNode;
}

export function $findSelectedTextPills(): SelectedTextPillNode[] {
  const root = $getRoot();
  const pills: SelectedTextPillNode[] = [];

  function traverse(node: LexicalNode) {
    if (node instanceof SelectedTextPillNode) {
      pills.push(node);
    }

    if ("getChildren" in node && typeof node.getChildren === "function") {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    }
  }

  traverse(root);
  return pills;
}

export function $removePillsBySelectedTextId(selectedTextId: string): number {
  const root = $getRoot();
  let removedCount = 0;

  function traverse(node: any): void {
    if ($isSelectedTextPillNode(node) && node.getSelectedTextId() === selectedTextId) {
      node.remove();
      removedCount++;
    } else if (typeof node.getChildren === "function") {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    }
  }

  traverse(root);
  return removedCount;
}
