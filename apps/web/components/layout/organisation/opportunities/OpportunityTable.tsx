import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { Opportunity } from "@/types/opportunities";
import { createOpportunityTableColumns } from "./OpportunityTableColumns";

interface OpportunityTableProps {
  data: Opportunity[];
  activeTab: string;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onTitleClick: (opportunityId: string) => void;
  actionsMode?: "organisation" | "mentor";
}

export default function OpportunityTable({
  data,
  activeTab,
  isLoading,
  currentPage,
  totalPages,
  onTitleClick,
  actionsMode = "organisation",
}: OpportunityTableProps) {
  const columns = createOpportunityTableColumns({ activeTab, onTitleClick, actionsMode });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: { pagination: { pageIndex: currentPage - 1, pageSize: 4 } },
  });

  return (
    <div className="hidden md:block px-4 flex-1 min-h-[400px]">
      <div className="flex items-center py-3 px-6 bg-gray-50 text-sm text-gray-500 rounded-md">
        {table.getHeaderGroups().map((headerGroup) => (
          <React.Fragment key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className={
                  header.id === "opportunity"
                    ? "flex-1"
                    : header.id === "startDateTime"
                    ? "w-[140px] text-center"
                    : header.id === "actions"
                    ? "w-[60px] text-center"
                    : "w-[120px] text-center"
                }
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10 text-gray-500 min-h-[300px]">
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div className="flex justify-center items-center py-10 text-gray-500 min-h-[300px]">
          No opportunities found.
        </div>
      ) : (
        <div className="min-h-[300px]">
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center py-4 px-6 border-b last:border-b-0 hover:bg-gray-50 min-h-[64px]"
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  className={
                    cell.column.id === "opportunity"
                      ? "flex-1"
                      : cell.column.id === "startDateTime"
                      ? "w-[140px] text-center"
                      : cell.column.id === "actions"
                      ? "w-[60px] text-center"
                      : "w-[120px] text-center"
                  }
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
