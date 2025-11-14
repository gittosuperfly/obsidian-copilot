import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}

interface TabItemProps {
  tab: TabItem;
  isSelected: boolean;
  onClick: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({ tab, isSelected, onClick }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="tab"
      tabIndex={0}
      id={`tab-${tab.id}`}
      aria-controls={`tabpanel-${tab.id}`}
      aria-selected={isSelected}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "tw-relative tw-flex tw-items-center tw-gap-1.5",
        "tw-py-3 tw-pr-4",
        "tw-text-base",
        "tw-font-medium tw-leading-none",
        "tw-text-muted hover:tw-text-normal",
        "tw-transition-colors tw-duration-150",
        "tw-cursor-pointer tw-select-none"
      )}
    >
      <span className="tw-flex tw-items-center tw-gap-2 tw-leading-none">
        <span
          className={cn(
            "tw-flex tw-items-center tw-justify-center",
            "tw-text-[1.05rem] tw-leading-none",
            isSelected ? "tw-text-accent" : "tw-text-muted"
          )}
        >
          {tab.icon}
        </span>
        {tab.label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "tw-absolute tw-inset-x-0 tw-bottom-[-2px]",
          "tw-h-0.5 tw-rounded-full",
          "tw-transition-colors tw-duration-150",
          isSelected ? "tw-bg-accent" : "tw-bg-transparent"
        )}
      />
    </div>
  );
};

interface TabContentProps {
  id: string;
  children: React.ReactNode;
  isSelected: boolean;
}

export const TabContent: React.FC<TabContentProps> = ({ id, children, isSelected }) => {
  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={cn(
        "tw-pt-4",
        "tw-transition-all tw-duration-200 tw-ease-in-out",
        isSelected ? "tw-translate-y-0 tw-opacity-100" : "tw-translate-y-2 tw-opacity-0"
      )}
    >
      {children}
    </div>
  );
};
