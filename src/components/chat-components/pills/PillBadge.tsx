import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PillBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * PillBadge component for displaying inline context references in the chat input.
 * Styled to be minimal and modern, similar to Cursor AI's mention pills.
 */
export function PillBadge({ children, className, ...props }: PillBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "tw-mx-0.5 tw-inline-flex tw-items-center tw-gap-1.5 tw-border tw-border-solid tw-px-1.5 tw-py-0.5 tw-align-middle tw-text-xs tw-font-normal tw-transition-colors tw-bg-accent/30 tw-border-border/60 hover:tw-border-border hover:tw-bg-accent/50",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
}
