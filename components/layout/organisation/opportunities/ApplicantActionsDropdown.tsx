"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Loader2, UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicantActionsDropdownProps {
  isMentorForOpportunity: boolean;
  isMarkingAsMentor: boolean;
  onToggleMentor: () => void;
}

export function ApplicantActionsDropdown({
  isMentorForOpportunity,
  isMarkingAsMentor,
  onToggleMentor,
}: ApplicantActionsDropdownProps) {
  return (
    <div className="absolute top-4 right-4 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:bg-white hover:shadow-md hover:border-gray-300/80 transition-all duration-200 cursor-pointer group"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-xl"
          sideOffset={8}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onToggleMentor();
            }}
            disabled={isMarkingAsMentor}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm",
              "hover:bg-gradient-to-r hover:shadow-sm",
              "focus:bg-gradient-to-r focus:shadow-sm focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              isMentorForOpportunity
                ? "hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50"
                : "hover:from-emerald-50 hover:to-emerald-100/50 focus:from-emerald-50 focus:to-emerald-100/50"
            )}
          >
            {isMarkingAsMentor ? (
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-5 h-5">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
                <span className="text-gray-600">
                  {isMentorForOpportunity ? "Removing..." : "Marking..."}
                </span>
              </div>
            ) : isMentorForOpportunity ? (
              <>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                  <UserMinus className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">
                    Remove as Mentor
                  </span>
                  <span className="text-xs text-gray-500">
                    Revoke mentor privileges
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">
                    Assign as Mentor
                  </span>
                  <span className="text-xs text-gray-500">
                    Grant mentor privileges
                  </span>
                </div>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
