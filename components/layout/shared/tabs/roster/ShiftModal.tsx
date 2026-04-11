"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shift } from "./rosterUtils";

export interface ShiftFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  maxVolunteers: number;
}

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShiftFormData) => void;
  postId: string;
  initialShift?: Shift | null;
  defaultDate?: string;
}

const EMPTY_FORM: ShiftFormData = {
  title: "",
  date: "",
  startTime: "09:00",
  endTime: "17:00",
  role: "",
  maxVolunteers: 5,
};

export function ShiftModal({
  isOpen,
  onClose,
  onSave,
  initialShift,
  defaultDate,
}: ShiftModalProps) {
  const [form, setForm] = useState<ShiftFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ShiftFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialShift) {
        setForm({
          title: initialShift.title,
          date: initialShift.date,
          startTime: initialShift.startTime,
          endTime: initialShift.endTime,
          role: initialShift.role,
          maxVolunteers: initialShift.maxVolunteers,
        });
      } else {
        setForm({ ...EMPTY_FORM, date: defaultDate ?? "" });
      }
      setErrors({});
    }
  }, [isOpen, initialShift, defaultDate]);

  function set<K extends keyof ShiftFormData>(key: K, value: ShiftFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof ShiftFormData, string>> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.date) e.date = "Date is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.endTime) e.endTime = "End time is required";
    if (form.startTime >= form.endTime)
      e.endTime = "End time must be after start time";
    if (!form.role.trim()) e.role = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(form);
    onClose();
  }

  const isEdit = !!initialShift;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Shift" : "Create New Shift"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shift Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Morning Orientation"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={errors.title ? "border-red-400" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={errors.date ? "border-red-400" : ""}
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className={errors.startTime ? "border-red-400" : ""}
              />
              {errors.startTime && (
                <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className={errors.endTime ? "border-red-400" : ""}
              />
              {errors.endTime && (
                <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Role Label <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Front-end Dev"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className={errors.role ? "border-red-400" : ""}
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Max volunteers */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Volunteers <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.maxVolunteers}
              onChange={(e) =>
                set("maxVolunteers", Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#2563EB] hover:bg-[#1d4fd8] text-white font-medium"
            >
              {isEdit ? "Save Changes" : "Create Shift"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
