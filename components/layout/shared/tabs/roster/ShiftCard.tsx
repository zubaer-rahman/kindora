"use client";

import { Edit2, Trash2, Plus, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Shift,
  Volunteer,
  getAvatarColor,
  getFillStatus,
  formatTimeRange,
  formatDate,
  calculateFillPercent,
} from "./rosterUtils";

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  confirmed: { bg: "#EAF3DE", text: "#3B6D11", label: "Confirmed" },
  pending: { bg: "#FAEEDA", text: "#854F0B", label: "Pending" },
  absent: { bg: "#FCEBEB", text: "#A32D2D", label: "Absent" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

// ── Avatar initials ───────────────────────────────────────────────────────────

function Avatar({ volunteer }: { volunteer: Volunteer }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
      style={{ background: getAvatarColor(volunteer.id) }}
    >
      {volunteer.initials}
    </div>
  );
}

// ── Capacity pill ─────────────────────────────────────────────────────────────

function CapacityPill({ shift }: { shift: Shift }) {
  const status = getFillStatus(shift);
  const styles = {
    full: { bg: "#EAF3DE", text: "#3B6D11" },
    partial: { bg: "#FAEEDA", text: "#854F0B" },
    empty: { bg: "#FCEBEB", text: "#A32D2D" },
  }[status];
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: styles.bg, color: styles.text }}
    >
      {shift.assignedVolunteers.length}/{shift.maxVolunteers} filled
    </span>
  );
}

// ── Organiser shift card ──────────────────────────────────────────────────────

interface OrganiserShiftCardProps {
  shift: Shift;
  onEdit: (shift: Shift) => void;
  onAssign: (shift: Shift) => void;
  onUnassign: (shiftId: string, volunteerId: string) => void;
  onUpdateVolunteerStatus?: (shiftId: string, volunteerId: string, status: Volunteer["status"]) => void;
  onDelete?: (shiftId: string) => void;
}

export function OrganiserShiftCard({
  shift,
  onEdit,
  onAssign,
  onUnassign,
  onUpdateVolunteerStatus,
  onDelete,
}: OrganiserShiftCardProps) {
  const emptySlots = Math.max(
    0,
    shift.maxVolunteers - shift.assignedVolunteers.length
  );

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-[#f3f4f6]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base truncate">
              {shift.title}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              {shift.role}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(shift.date)} &middot;{" "}
            {formatTimeRange(shift.startTime, shift.endTime)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CapacityPill shift={shift} />
          <button
            onClick={() => onEdit(shift)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit shift"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(shift.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete shift"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Volunteer rows */}
      <div className="divide-y divide-[#f3f4f6]">
        {shift.assignedVolunteers.map((v) => (
          <div key={v.id} className="flex items-center gap-3 px-5 py-3">
            <Avatar volunteer={v} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {v.name}
              </p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {v.skills.slice(0, 3).map((sk) => (
                  <span
                    key={sk}
                    className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
            
            {v.status === "pending" && onUpdateVolunteerStatus ? (
              <div className="flex items-center gap-1">
                <StatusBadge status={v.status} />
                <button
                  onClick={() => onUpdateVolunteerStatus(shift.id, v.id, "confirmed")}
                  className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 hover:text-green-600 transition-colors ml-1"
                  title="Accept volunteer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUnassign(shift.id, v.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                  title="Reject volunteer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <StatusBadge status={v.status} />
                <button
                  onClick={() => onUnassign(shift.id, v.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors ml-1"
                  title="Remove volunteer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <button
            key={`empty-${i}`}
            onClick={() => onAssign(shift)}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-400 transition-colors">
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
            </div>
            <span className="text-sm text-gray-400 group-hover:text-blue-600 font-medium">
              Assign a volunteer
            </span>
          </button>
        ))}

        {shift.maxVolunteers === 0 && shift.assignedVolunteers.length === 0 && (
          <button
            onClick={() => onAssign(shift)}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors group"
          >
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm text-gray-400 group-hover:text-blue-600 font-medium">
              Assign a volunteer
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Volunteer shift card ──────────────────────────────────────────────────────

interface VolunteerShiftCardProps {
  shift: Shift;
  currentUserId: string;
  onSignup: (shiftId: string) => void;
  onWithdraw: (shiftId: string) => void;
}

export function VolunteerShiftCard({
  shift,
  currentUserId,
  onSignup,
  onWithdraw,
}: VolunteerShiftCardProps) {
  const isJoined = shift.assignedVolunteers.some((v) => v.id === currentUserId);
  const isFull =
    shift.assignedVolunteers.length >= shift.maxVolunteers && !isJoined;
  const fillPct = calculateFillPercent(shift);

  const statusPill = isJoined ? (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "#E6F1FB", color: "#185FA5" }}
    >
      Joined
    </span>
  ) : isFull ? (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "#FCEBEB", color: "#A32D2D" }}
    >
      Full
    </span>
  ) : (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "#EAF3DE", color: "#3B6D11" }}
    >
      Open
    </span>
  );

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden ${
        isJoined ? "border-[#2563EB]" : "border-[#e5e7eb]"
      }`}
    >
      <div className="px-5 pt-4 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-base">
                {shift.title}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {shift.role}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(shift.date)} &middot;{" "}
              {formatTimeRange(shift.startTime, shift.endTime)}
            </p>
          </div>
          {statusPill}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Spots filled</span>
            <span>
              {shift.assignedVolunteers.length}/{shift.maxVolunteers}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(fillPct, 100)}%`,
                background: isFull
                  ? "#A32D2D"
                  : isJoined
                  ? "#2563EB"
                  : "#3B6D11",
              }}
            />
          </div>
        </div>

        {/* Action button */}
        {isJoined ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWithdraw(shift.id)}
            className="w-full border-green-500 text-green-600 hover:bg-green-50 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            You&apos;re signed up — Withdraw
          </Button>
        ) : isFull ? (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-full text-gray-400 border-gray-200 cursor-not-allowed"
          >
            Shift full
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onSignup(shift.id)}
            className="w-full bg-[#2563EB] hover:bg-[#1d4fd8] text-white font-medium"
          >
            Sign up for this shift
          </Button>
        )}
      </div>
    </div>
  );
}
