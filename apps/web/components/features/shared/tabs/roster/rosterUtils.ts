export type VolunteerStatus = "confirmed" | "pending" | "absent";

export interface Volunteer {
  id: string;
  name: string;
  initials: string;
  skills: string[];
  status: VolunteerStatus;
}

export interface Shift {
  id: string;
  postId: string;
  title: string;
  date: string; // ISO date string e.g. "2025-10-06"
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  role: string; // e.g. "Front-end Dev"
  maxVolunteers: number;
  assignedVolunteers: Volunteer[];
}

const AVATAR_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#10B981",
  "#F59E0B",
  "#06B6D4",
  "#84CC16",
  "#EF4444",
  "#6366F1",
];

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function groupShiftsByDate(shifts: Shift[]): Record<string, Shift[]> {
  return shifts.reduce<Record<string, Shift[]>>((acc, shift) => {
    if (!acc[shift.date]) acc[shift.date] = [];
    acc[shift.date].push(shift);
    return acc;
  }, {});
}

export function calculateFillPercent(shift: Shift): number {
  if (shift.maxVolunteers === 0) return 0;
  return Math.round(
    (shift.assignedVolunteers.length / shift.maxVolunteers) * 100
  );
}

export function getFillStatus(shift: Shift): "full" | "partial" | "empty" {
  const count = shift.assignedVolunteers.length;
  if (count === 0) return "empty";
  if (count >= shift.maxVolunteers) return "full";
  return "partial";
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === "00"
    ? `${displayHour}${ampm}`
    : `${displayHour}:${minute}${ampm}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    days.push(new Date(year, month, d));
  return days;
}

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function countStats(shifts: Shift[]) {
  const allAssigned = shifts.flatMap((s) => s.assignedVolunteers);
  const uniqueIds = new Set(allAssigned.map((v) => v.id));
  const confirmed = allAssigned.filter((v) => v.status === "confirmed").length;
  const pending = allAssigned.filter((v) => v.status === "pending").length;
  const filled = shifts.filter(
    (s) => s.assignedVolunteers.length >= s.maxVolunteers
  ).length;
  return {
    totalRostered: uniqueIds.size,
    shiftsFilled: filled,
    totalShifts: shifts.length,
    confirmed,
    pending,
  };
}
