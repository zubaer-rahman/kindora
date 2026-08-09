import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeFiltersCount: number;
  onClearAllFilters: () => void;
}

export default function FilterDialog({
  isOpen,
  onOpenChange,
  activeFiltersCount,
  onClearAllFilters,
}: FilterDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md h-[80vh] overflow-hidden p-0 border-0 shadow-2xl [&>button]:p-1 [&>button]:cursor-pointer [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:rounded-full">
        <DialogTitle className="sr-only">
          Filter Opportunities
        </DialogTitle>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Filter className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                Filter Opportunities
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Refine your search to find the perfect match
              </p>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">
                  {activeFiltersCount} active filter
                  {activeFiltersCount !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAllFilters}
                  className="text-white hover:bg-white/20 text-xs px-3 py-1 h-auto"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border">
              <FilterSidebar />
            </div>
          </div>
        </div>

        <div className="bg-white border-t p-4 rounded-b-lg">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 font-medium bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 