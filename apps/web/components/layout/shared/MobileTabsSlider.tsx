"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TabItem {
  label: string;
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

interface MobileTabsSliderProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  showSeparator?: boolean;
  separatorClassName?: string;
}

export default function MobileTabsSlider({
  tabs,
  activeTab,
  onTabChange,
  className,
  showSeparator = true,
  separatorClassName,
}: MobileTabsSliderProps) {
  return (
    <div className={cn("block md:hidden", className)}>
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide py-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            variant={activeTab === tab.value ? "default" : "ghost"}
            className={cn(
              "flex-shrink-0 h-10 px-4 sm:px-5 rounded-[20px] transition-all whitespace-nowrap shadow-sm text-sm",
              activeTab === tab.value
                ? "bg-[#246BFD] text-white hover:bg-[#246BFD]/90 shadow-lg"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200"
            )}
          >
            {tab.icon && <span className="mr-1 sm:mr-2">{tab.icon}</span>}
            <span className="font-semibold">
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </span>
          </Button>
        ))}
      </div>

      {showSeparator && (
        <div className=" ">
          <Separator
            className={cn(
              " bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200  border-gray-200",
              separatorClassName
            )}
          />
        </div>
      )}
    </div>
  );
}
