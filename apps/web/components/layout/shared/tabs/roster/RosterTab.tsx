"use client";

import { useState } from "react";
import {
  List,
  Calendar,
  Plus,
  Download,
  Bell,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganiserShiftCard, VolunteerShiftCard } from "./ShiftCard";
import { RosterCalendar } from "./RosterCalendar";
import { AssignModal } from "./AssignModal";
import { ShiftModal, ShiftFormData } from "./ShiftModal";
import { Shift, Volunteer, countStats, formatDate, formatTimeRange } from "./rosterUtils";

type ViewMode = "list" | "calendar";

export interface RosterTabProps {
  postId: string;
  role: "organiser" | "volunteer";
  recruits: Volunteer[];
  shifts: Shift[];
  currentUserId?: string;
  onShiftCreate?: (data: Omit<Shift, "id" | "assignedVolunteers">) => void;
  onShiftUpdate?: (shiftId: string, data: Partial<Shift>) => void;
  onAssign?: (shiftId: string, volunteerId: string) => void;
  onUnassign?: (shiftId: string, volunteerId: string) => void;
  onSignup?: (shiftId: string) => void;
  onWithdraw?: (shiftId: string) => void;
  onDeleteShift?: (shiftId: string) => void;
  onUpdateVolunteerStatus?: (shiftId: string, volunteerId: string, status: Volunteer["status"]) => void;
  onExport?: () => void;
  onSendReminders?: () => void;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent + "1A" }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Volunteer signed-up banner ────────────────────────────────────────────────

function SignedUpBanner({ shift }: { shift: Shift }) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3 border"
      style={{ background: "#E6F1FB", borderColor: "#185FA5" }}
    >
      <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#185FA5" }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: "#185FA5" }}>
          You&apos;re signed up: {shift.title}
        </p>
        <p className="text-xs" style={{ color: "#185FA5", opacity: 0.8 }}>
          {formatDate(shift.date)} &middot;{" "}
          {formatTimeRange(shift.startTime, shift.endTime)}
        </p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function RosterTab({
  postId,
  role,
  recruits,
  shifts,
  currentUserId,
  onShiftCreate,
  onShiftUpdate,
  onAssign,
  onUnassign,
  onSignup,
  onWithdraw,
  onDeleteShift,
  onUpdateVolunteerStatus,
  onExport,
  onSendReminders,
}: RosterTabProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [assignTarget, setAssignTarget] = useState<Shift | null>(null);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState("");

  // ── Organiser helpers ─────────────────────────────────────────────────────

  function openCreateShift(date?: string) {
    setEditTarget(null);
    setDefaultDate(date ?? "");
    setIsShiftModalOpen(true);
  }

  function openEditShift(shift: Shift) {
    setEditTarget(shift);
    setIsShiftModalOpen(true);
  }

  function handleShiftSave(data: ShiftFormData) {
    if (editTarget) {
      onShiftUpdate?.(editTarget.id, data);
    } else {
      onShiftCreate?.({ ...data, postId });
    }
  }

  function handleAssign(shiftId: string, volunteerId: string) {
    onAssign?.(shiftId, volunteerId);
    // Optimistically reflect assignment in the modal
    if (assignTarget?.id === shiftId) {
      const volunteer = recruits.find((r) => r.id === volunteerId);
      if (volunteer) {
        setAssignTarget((prev) =>
          prev
            ? {
                ...prev,
                assignedVolunteers: [
                  ...prev.assignedVolunteers,
                  { ...volunteer, status: "pending" as const },
                ],
              }
            : prev
        );
      }
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const myShift = currentUserId
    ? shifts.find((s) =>
        s.assignedVolunteers.some((v) => v.id === currentUserId)
      )
    : undefined;

  const stats = countStats(shifts);

  // Keep assignTarget in sync with latest shifts prop
  const syncedAssignTarget = assignTarget
    ? shifts.find((s) => s.id === assignTarget.id) ?? assignTarget
    : null;

  return (
    <div className="space-y-5">
      <div className="w-full border-b border-[#F1F1F1]" />

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">Roster</h2>

        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "calendar"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {/* ── ORGANISER ────────────────────────────────────────────────────── */}
      {role === "organiser" && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Volunteers rostered"
              value={stats.totalRostered}
              icon={<Users className="w-4 h-4" />}
              accent="#2563EB"
            />
            <StatCard
              label="Shifts filled"
              value={`${stats.shiftsFilled}/${stats.totalShifts}`}
              icon={<CheckCircle2 className="w-4 h-4" />}
              accent="#3B6D11"
            />
            <StatCard
              label="Confirmed"
              value={stats.confirmed}
              icon={<CheckCircle2 className="w-4 h-4" />}
              accent="#3B6D11"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Clock className="w-4 h-4" />}
              accent="#854F0B"
            />
          </div>

          {/* List view */}
          {view === "list" && (
            <div className="space-y-4">
              {shifts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#e5e7eb] rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No shifts created yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click &quot;Add new shift&quot; below to get started.
                  </p>
                </div>
              ) : (
                shifts.map((shift) => (
                  <OrganiserShiftCard
                    key={shift.id}
                    shift={shift}
                    onEdit={openEditShift}
                    onAssign={(s) => setAssignTarget(s)}
                    onUnassign={(shiftId, volunteerId) =>
                      onUnassign?.(shiftId, volunteerId)
                    }
                    onUpdateVolunteerStatus={onUpdateVolunteerStatus}
                    onDelete={onDeleteShift}
                  />
                ))
              )}

              <button
                onClick={() => openCreateShift()}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#e5e7eb] rounded-xl text-sm text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add new shift
              </button>

              {shifts.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={onExport}
                    className="flex items-center gap-2 sm:flex-1"
                  >
                    <Download className="w-4 h-4" />
                    Export Roster
                  </Button>
                  <Button
                    onClick={onSendReminders}
                    className="flex items-center gap-2 sm:flex-1 bg-[#2563EB] hover:bg-[#1d4fd8] text-white"
                  >
                    <Bell className="w-4 h-4" />
                    Send Reminders
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Calendar view */}
          {view === "calendar" && (
            <RosterCalendar
              shifts={shifts}
              role="organiser"
              currentUserId={currentUserId}
              onShiftClick={(shift) => openEditShift(shift)}
              onSlotClick={(date) => openCreateShift(date)}
            />
          )}
        </>
      )}

      {/* ── VOLUNTEER ────────────────────────────────────────────────────── */}
      {role === "volunteer" && (
        <>
          {myShift && <SignedUpBanner shift={myShift} />}

          {view === "list" && (
            <div className="space-y-4">
              {shifts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#e5e7eb] rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No shifts available yet. Check back soon.
                  </p>
                </div>
              ) : (
                shifts.map((shift) => (
                  <VolunteerShiftCard
                    key={shift.id}
                    shift={shift}
                    currentUserId={currentUserId ?? ""}
                    onSignup={(shiftId) => onSignup?.(shiftId)}
                    onWithdraw={(shiftId) => onWithdraw?.(shiftId)}
                  />
                ))
              )}
            </div>
          )}

          {view === "calendar" && (
            <RosterCalendar
              shifts={shifts}
              role="volunteer"
              currentUserId={currentUserId}
              onShiftClick={() => {}}
              onSlotClick={() => {}}
              onSignup={onSignup}
              onWithdraw={onWithdraw}
            />
          )}
        </>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AssignModal
        isOpen={!!syncedAssignTarget}
        onClose={() => setAssignTarget(null)}
        shift={syncedAssignTarget}
        recruits={recruits}
        onAssign={handleAssign}
      />

      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleShiftSave}
        postId={postId}
        initialShift={editTarget}
        defaultDate={defaultDate}
      />
    </div>
  );
}
