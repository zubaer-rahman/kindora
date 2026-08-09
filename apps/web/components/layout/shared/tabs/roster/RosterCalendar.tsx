"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Shift,
  getWeekDays,
  getMonthDays,
  getMondayOfWeek,
  toISODate,
  timeToMinutes,
  formatTimeRange,
  formatDate,
  getAvatarColor,
} from "./rosterUtils";

type CalendarMode = "week" | "month";

interface RosterCalendarProps {
  shifts: Shift[];
  role: "organiser" | "volunteer";
  currentUserId?: string;
  onShiftClick: (shift: Shift) => void;
  onSlotClick: (date: string) => void;
  onSignup?: (shiftId: string) => void;
  onWithdraw?: (shiftId: string) => void;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HOUR_START = 6;
const HOUR_END = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const SLOT_HEIGHT = 56;

// ── Shift block (week view) ───────────────────────────────────────────────────

function ShiftBlock({
  shift,
  role,
  currentUserId,
  onClick,
}: {
  shift: Shift;
  role: "organiser" | "volunteer";
  currentUserId?: string;
  onClick: () => void;
}) {
  const startMin = timeToMinutes(shift.startTime);
  const endMin = timeToMinutes(shift.endTime);
  const top = ((startMin - HOUR_START * 60) / 60) * SLOT_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 28);
  const isFull = shift.assignedVolunteers.length >= shift.maxVolunteers;
  const isJoined =
    !!currentUserId &&
    shift.assignedVolunteers.some((v) => v.id === currentUserId);

  let bg = "#246BFD";
  if (role === "volunteer") {
    bg = isJoined ? "#2563EB" : isFull ? "#9ca3af" : "#22c55e";
  }

  const canClick = role === "organiser" || !isFull;

  return (
    <div
      title={`${shift.title} — ${formatTimeRange(shift.startTime, shift.endTime)}`}
      onClick={canClick ? onClick : undefined}
      style={{
        position: "absolute",
        top: `${top}px`,
        height: `${height}px`,
        left: "2px",
        right: "2px",
        background: bg,
        color: "#fff",
        borderRadius: "6px",
        padding: "2px 5px",
        fontSize: "10px",
        lineHeight: "1.3",
        overflow: "hidden",
        cursor: canClick ? "pointer" : "default",
        opacity: isFull && role === "volunteer" ? 0.7 : 1,
        zIndex: 10,
      }}
    >
      <div className="font-semibold truncate">{shift.title}</div>
      {height > 28 && (
        <div className="opacity-90">
          {shift.assignedVolunteers.length}/{shift.maxVolunteers}
        </div>
      )}
    </div>
  );
}

// ── Shift detail side panel ───────────────────────────────────────────────────

function ShiftDetailPanel({
  shift,
  role,
  currentUserId,
  onClose,
  onSignup,
  onWithdraw,
}: {
  shift: Shift;
  role: "organiser" | "volunteer";
  currentUserId?: string;
  onClose: () => void;
  onSignup?: (shiftId: string) => void;
  onWithdraw?: (shiftId: string) => void;
}) {
  const isJoined =
    !!currentUserId &&
    shift.assignedVolunteers.some((v) => v.id === currentUserId);
  const isFull = shift.assignedVolunteers.length >= shift.maxVolunteers;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-[#e5e7eb] shadow-xl z-50 flex flex-col">
      <div className="flex items-start justify-between p-4 border-b border-[#f3f4f6]">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{shift.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(shift.date)} &middot;{" "}
            {formatTimeRange(shift.startTime, shift.endTime)}
          </p>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
            {shift.role}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Volunteers ({shift.assignedVolunteers.length}/{shift.maxVolunteers})
        </p>
        {shift.assignedVolunteers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No volunteers assigned yet
          </p>
        ) : (
          <div className="space-y-3">
            {shift.assignedVolunteers.map((v) => (
              <div key={v.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{ background: getAvatarColor(v.id) }}
                >
                  {v.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {v.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{v.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {role === "volunteer" && (
        <div className="p-4 border-t border-[#f3f4f6]">
          {isJoined ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWithdraw?.(shift.id)}
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
            >
              Withdraw
            </Button>
          ) : isFull ? (
            <Button size="sm" disabled className="w-full text-gray-400">
              Shift full
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onSignup?.(shift.id)}
              className="w-full bg-[#2563EB] hover:bg-[#1d4fd8] text-white"
            >
              Sign up
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Weekly calendar ───────────────────────────────────────────────────────────

function WeekCalendar({
  weekStart,
  shifts,
  role,
  currentUserId,
  onShiftClick,
  onSlotClick,
}: {
  weekStart: Date;
  shifts: Shift[];
  role: "organiser" | "volunteer";
  currentUserId?: string;
  onShiftClick: (shift: Shift) => void;
  onSlotClick: (date: string) => void;
}) {
  const days = getWeekDays(weekStart);
  const shiftsByDate: Record<string, Shift[]> = {};
  for (const d of days) {
    const key = toISODate(d);
    shiftsByDate[key] = shifts.filter((s) => s.date === key);
  }
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: "640px" }}>
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-[#e5e7eb]">
          <div className="py-2" />
          {days.map((d, i) => {
            const isToday = toISODate(d) === toISODate(new Date());
            return (
              <div key={i} className="py-2 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  {DAY_LABELS[i]}
                </p>
                <p
                  className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center mx-auto rounded-full ${
                    isToday ? "bg-[#2563EB] text-white" : "text-gray-900"
                  }`}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8">
          {/* Hour labels */}
          <div>
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: `${SLOT_HEIGHT}px` }}
                className="border-b border-[#f3f4f6] flex items-start justify-end pr-2 pt-1"
              >
                <span className="text-xs text-gray-400">
                  {h === 12 ? "12PM" : h > 12 ? `${h - 12}PM` : `${h}AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, di) => {
            const dateStr = toISODate(d);
            const dayShifts = shiftsByDate[dateStr] ?? [];
            return (
              <div
                key={di}
                style={{
                  position: "relative",
                  height: `${TOTAL_HOURS * SLOT_HEIGHT}px`,
                }}
                className="border-l border-[#f3f4f6]"
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    className={`border-b border-[#f3f4f6] ${
                      role === "organiser"
                        ? "hover:bg-blue-50 cursor-pointer transition-colors"
                        : ""
                    }`}
                    onClick={
                      role === "organiser"
                        ? () => onSlotClick(dateStr)
                        : undefined
                    }
                  />
                ))}
                {dayShifts.map((shift) => (
                  <ShiftBlock
                    key={shift.id}
                    shift={shift}
                    role={role}
                    currentUserId={currentUserId}
                    onClick={() => onShiftClick(shift)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Monthly calendar ──────────────────────────────────────────────────────────

function MonthCalendar({
  year,
  month,
  shifts,
  role,
  currentUserId,
  onShiftClick,
  onSlotClick,
}: {
  year: number;
  month: number;
  shifts: Shift[];
  role: "organiser" | "volunteer";
  currentUserId?: string;
  onShiftClick: (shift: Shift) => void;
  onSlotClick: (date: string) => void;
}) {
  const days = getMonthDays(year, month);
  const today = toISODate(new Date());

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-[#e5e7eb]">
        {DAY_LABELS.map((l) => (
          <div
            key={l}
            className="py-2 text-center text-xs font-semibold text-gray-500"
          >
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          if (!d) {
            return (
              <div
                key={`pad-${i}`}
                className="border-b border-r border-[#f3f4f6] min-h-[80px] bg-gray-50"
              />
            );
          }
          const dateStr = toISODate(d);
          const dayShifts = shifts.filter((s) => s.date === dateStr);
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              className={`border-b border-r border-[#f3f4f6] min-h-[80px] p-1 ${
                role === "organiser"
                  ? "hover:bg-blue-50 cursor-pointer transition-colors"
                  : ""
              }`}
              onClick={
                role === "organiser" ? () => onSlotClick(dateStr) : undefined
              }
            >
              <div
                className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isToday ? "bg-[#2563EB] text-white" : "text-gray-700"
                }`}
              >
                {d.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayShifts.slice(0, 3).map((shift) => {
                  const isJoined =
                    !!currentUserId &&
                    shift.assignedVolunteers.some((v) => v.id === currentUserId);
                  const isFull =
                    shift.assignedVolunteers.length >= shift.maxVolunteers;
                  let blockBg = "#246BFD";
                  if (role === "volunteer") {
                    blockBg = isJoined ? "#2563EB" : isFull ? "#9ca3af" : "#22c55e";
                  }
                  return (
                    <div
                      key={shift.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (role === "organiser" || !isFull) onShiftClick(shift);
                      }}
                      className="rounded px-1 py-0.5 text-white text-[10px] truncate cursor-pointer"
                      style={{ background: blockBg }}
                    >
                      {shift.title}
                    </div>
                  );
                })}
                {dayShifts.length > 3 && (
                  <div className="text-[10px] text-gray-400 pl-1">
                    +{dayShifts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function RosterCalendar({
  shifts,
  role,
  currentUserId,
  onShiftClick,
  onSlotClick,
  onSignup,
  onWithdraw,
}: RosterCalendarProps) {
  const [mode, setMode] = useState<CalendarMode>("week");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMondayOfWeek(new Date())
  );
  const today = new Date();
  const [monthYear, setMonthYear] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  function prevPeriod() {
    if (mode === "week") {
      setWeekStart((d) => {
        const n = new Date(d);
        n.setDate(n.getDate() - 7);
        return n;
      });
    } else {
      setMonthYear(({ year, month }) => {
        const d = new Date(year, month - 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
      });
    }
  }

  function nextPeriod() {
    if (mode === "week") {
      setWeekStart((d) => {
        const n = new Date(d);
        n.setDate(n.getDate() + 7);
        return n;
      });
    } else {
      setMonthYear(({ year, month }) => {
        const d = new Date(year, month + 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
      });
    }
  }

  function goToday() {
    setWeekStart(getMondayOfWeek(new Date()));
    const t = new Date();
    setMonthYear({ year: t.getFullYear(), month: t.getMonth() });
  }

  const weekEnd = getWeekDays(weekStart)[6];
  const periodLabel =
    mode === "week"
      ? `${weekStart.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        })} – ${weekEnd.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : `${MONTH_NAMES[monthYear.month]} ${monthYear.year}`;

  function handleShiftClick(shift: Shift) {
    setSelectedShift(shift);
    onShiftClick(shift);
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="text-xs h-8 px-3"
          >
            Today
          </Button>
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {periodLabel}
          </span>
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(["week", "month"] as CalendarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        {mode === "week" ? (
          <WeekCalendar
            weekStart={weekStart}
            shifts={shifts}
            role={role}
            currentUserId={currentUserId}
            onShiftClick={handleShiftClick}
            onSlotClick={onSlotClick}
          />
        ) : (
          <MonthCalendar
            year={monthYear.year}
            month={monthYear.month}
            shifts={shifts}
            role={role}
            currentUserId={currentUserId}
            onShiftClick={handleShiftClick}
            onSlotClick={onSlotClick}
          />
        )}
      </div>

      {/* Shift detail side panel */}
      {selectedShift && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedShift(null)}
          />
          <ShiftDetailPanel
            shift={selectedShift}
            role={role}
            currentUserId={currentUserId}
            onClose={() => setSelectedShift(null)}
            onSignup={onSignup}
            onWithdraw={onWithdraw}
          />
        </>
      )}
    </div>
  );
}
