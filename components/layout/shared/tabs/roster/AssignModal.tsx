"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Shift,
  Volunteer,
  getAvatarColor,
  formatTimeRange,
  formatDate,
} from "./rosterUtils";

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  recruits: Volunteer[];
  onAssign: (shiftId: string, volunteerId: string) => void;
}

export function AssignModal({
  isOpen,
  onClose,
  shift,
  recruits,
  onAssign,
}: AssignModalProps) {
  const [search, setSearch] = useState("");

  if (!shift) return null;

  const assignedIds = new Set(shift.assignedVolunteers.map((v) => v.id));

  const filtered = recruits.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Assign Volunteer
          </DialogTitle>
          <div className="mt-1">
            <p className="text-sm font-medium text-gray-700">{shift.title}</p>
            <p className="text-xs text-gray-500">
              {formatDate(shift.date)} &middot;{" "}
              {formatTimeRange(shift.startTime, shift.endTime)}
            </p>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative flex-shrink-0 mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 text-sm"
          />
        </div>

        {/* Recruits list */}
        <div className="flex-1 overflow-y-auto min-h-0 mt-2 -mx-6 px-6">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              No recruits found
            </p>
          ) : (
            <div className="divide-y divide-[#f3f4f6]">
              {filtered.map((recruit) => {
                const isAssigned = assignedIds.has(recruit.id);
                return (
                  <div
                    key={recruit.id}
                    className="flex items-center gap-3 py-3"
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      style={{ background: getAvatarColor(recruit.id) }}
                    >
                      {recruit.initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {recruit.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {recruit.skills.slice(0, 4).map((sk) => (
                          <span
                            key={sk}
                            className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    {isAssigned ? (
                      <div className="flex items-center gap-1 text-xs font-medium text-green-600 flex-shrink-0">
                        <Check className="w-4 h-4" />
                        Assigned
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onAssign(shift.id, recruit.id)}
                        className="flex-shrink-0 bg-[#2563EB] hover:bg-[#1d4fd8] text-white text-xs h-8 px-3"
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-3 border-t border-[#f3f4f6]">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full font-medium"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
