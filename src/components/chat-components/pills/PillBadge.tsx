import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PillBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * PillBadge component for displaying inline context references in the chat input.
 * Styled to be minimal and modern, similar to Cursor AI's mention pills.
 */
export function PillBadge({ children, className, onClick, ...props }: PillBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "tw-mx-0.5 tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded tw-px-1.5 tw-py-0.5 tw-align-middle tw-text-xs tw-font-normal tw-transition-colors tw-bg-accent/30 hover:tw-bg-accent/50",
        onClick && "tw-cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Badge>
  );
}
