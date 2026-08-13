"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabOption {
    label: string;
    value: string;
    count?: number;
}

interface CustomTabsProps {
    tabs: TabOption[];
    activeTab: string;
    onTabChange: (value: string) => void;
    className?: string;
}

export default function CustomTabs({
    tabs,
    activeTab,
    onTabChange,
    className,
}: CustomTabsProps) {
    return (
        <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            className={cn("w-full sm:w-auto", className)}
        >
            <TabsList className="bg-transparent p-0 h-auto rounded-none w-full justify-start border-none shadow-none gap-0">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-5 py-2 text-sm text-muted-foreground font-medium data-[state=active]:text-foreground rounded-none bg-transparent shadow-none hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-b-[3px] border-transparent data-[state=active]:border-b-primary dark:data-[state=active]:border-transparent dark:data-[state=active]:border-b-primary data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none transition-all"
                    >
                        {tab.label}
                        {tab.count !== undefined && ` (${tab.count})`}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
