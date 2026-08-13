import React from "react";

interface ToolbarButtonProps {
  isActive?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  children: React.ReactNode;
}

export const ToolbarButton = ({
  isActive,
  onClick,
  title,
  children,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-1.5 sm:px-2 py-1.5 transition-colors rounded hover:bg-accent cursor-pointer min-w-[32px] sm:min-w-[36px] ${
      isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:text-accent-foreground"
    }`}
    title={title}
  >
    {children}
  </button>
);