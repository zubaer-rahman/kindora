# Common Components

This folder contains reusable components for the volunteer dashboard and opportunity browsing.

## Components

### 1. FilterSidebar
A filter sidebar component with commitment type checkboxes and category filters with icons.

**Usage:**
```tsx
import { FilterSidebar } from "@/components/common";

<FilterSidebar className="optional-class" />
```

**Features:**
- Commitment Type filters (Work based, Event based)
- Category filters with icons and arrows
- Integrates with SearchContext for filter state management

### 2. OpportunityCard
A card component for displaying opportunity information, styled to match the landing page design.

**Usage:**
```tsx
import { OpportunityCard } from "@/components/common";
import { Opportunity } from "@/types/opportunities";

<OpportunityCard opportunity={opportunity} />
```

**Props:**
- `opportunity: Opportunity` - The opportunity object to display

### 3. SearchBarRight
A search bar component positioned on the right side of the layout.

**Usage:**
```tsx
import { SearchBarRight } from "@/components/common";

<SearchBarRight 
  onSearch={(query, location) => {
    // Handle search
  }}
  initialQuery=""
  initialLocation=""
/>
```

**Props:**
- `onSearch?: (query: string, location: string) => void` - Callback when search is submitted
- `initialQuery?: string` - Initial search query
- `initialLocation?: string` - Initial location
- `className?: string` - Additional CSS classes

### 4. DashboardLayout
A complete dashboard layout component that combines all the above components.

**Usage:**
```tsx
import { DashboardLayout } from "@/components/common";
import { Opportunity } from "@/types/opportunities";

<DashboardLayout
  title="Opportunity in Australia"
  resultsCount={4000}
  opportunities={opportunities}
  isLoading={false}
  tabs={[
    { label: "Opportunity", value: "opportunity" },
    { label: "Subject 2", value: "subject2" },
    { label: "My proposal", value: "proposal" },
  ]}
  activeTab="opportunity"
  onTabChange={(value) => setTab(value)}
  sortOptions={[
    { label: "Recent", value: "recent" },
    { label: "Oldest", value: "oldest" },
  ]}
  sortBy="recent"
  onSortChange={(value) => setSortBy(value)}
  onSearch={(query, location) => {
    // Handle search
  }}
/>
```

**Props:**
- `title?: string` - Page title
- `resultsCount?: number` - Total number of results
- `opportunities: Opportunity[]` - Array of opportunities to display
- `isLoading?: boolean` - Loading state
- `tabs?: Array<{ label: string; value: string }>` - Tab configuration
- `activeTab?: string` - Currently active tab
- `onTabChange?: (value: string) => void` - Tab change handler
- `sortOptions?: Array<{ label: string; value: string }>` - Sort options
- `sortBy?: string` - Current sort value
- `onSortChange?: (value: string) => void` - Sort change handler
- `onSearch?: (query: string, location: string) => void` - Search handler
- `className?: string` - Additional CSS classes

### 5. OpportunityDashboardView
A complete view component that fetches opportunities and displays them using the DashboardLayout.

**Usage:**
```tsx
import { OpportunityDashboardView } from "@/components/common";

<OpportunityDashboardView
  title="Opportunity in Australia"
  tabs={[
    { label: "Opportunity", value: "opportunity" },
    { label: "Subject 2", value: "subject2" },
    { label: "My proposal", value: "proposal" },
  ]}
  activeTab="opportunity"
  onTabChange={(value) => setTab(value)}
/>
```

**Props:**
- `title?: string` - Page title
- `tabs?: Array<{ label: string; value: string }>` - Tab configuration
- `activeTab?: string` - Currently active tab
- `onTabChange?: (value: string) => void` - Tab change handler
- `className?: string` - Additional CSS classes

## Integration with SearchContext

All components integrate with the `SearchContext` for filter state management. Make sure your page is wrapped with the SearchContext provider.

## Example: Using in Volunteer Dashboard

```tsx
"use client";

import { OpportunityDashboardView } from "@/components/common";
import { useState } from "react";

export default function VolunteerOpportunityDashboard() {
  const [activeTab, setActiveTab] = useState("opportunity");

  return (
    <OpportunityDashboardView
      title="Opportunity in Australia"
      tabs={[
        { label: "Opportunity", value: "opportunity" },
        { label: "Subject 2", value: "subject2" },
        { label: "My proposal", value: "proposal" },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

