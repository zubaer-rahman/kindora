"use client";

import { Button } from "@/components/ui/button";
import MobileTabsSlider from "@/components/layout/shared/MobileTabsSlider";

interface TabItem {
  label: string;
  count: number;
  value: "open" | "draft" | "recruited" | "archived";
}

interface OpportunityTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  openCount?: number;
  draftCount?: number;
  recruitedCount?: number;
  archivedCount?: number;
}

export default function OpportunityTabs({
  activeTab,
  onTabChange,
  openCount = 0,
  draftCount = 0,
  recruitedCount = 0,
  archivedCount = 0,
}: OpportunityTabsProps) {
  const tabs: TabItem[] = [
    { label: "Open", count: openCount, value: "open" },
    { label: "Recent", count: draftCount, value: "draft" },
    { label: "Recruited", count: recruitedCount, value: "recruited" },
    { label: "Archived", count: archivedCount, value: "archived" },
  ];

  const mobileTabs = tabs.map((tab) => ({
    label: tab.label,
    value: tab.value,
    count: tab.count,
  }));

  return (
    <div className="mb-4 ">
      <div className="hidden md:grid md:grid-cols-4 w-full max-w-full overflow-hidden bg-[#F1F1F2] rounded-[30px]">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            variant={activeTab === tab.value ? "default" : "ghost"}
            className={`
              h-10 w-full px-2 rounded-[24px] transition-all
              ${activeTab === tab.value
                ? "bg-[#246BFD] text-white hover:bg-[#246BFD]/90"
                : "bg-transparent text-gray-600 hover:bg-[#246BFD]/10 hover:text-[#246BFD]"
              }
            `}
          >
            <span className="truncate">
              {tab.label} ({tab.count})
            </span>
          </Button>
        ))}
      </div>

      <MobileTabsSlider
        tabs={mobileTabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
}
