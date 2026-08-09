"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn, Path } from "react-hook-form";
import type { OpportunityFormValues } from "./types";
import { FormInput } from "@/components/form-input/FormInput";
import { RECURRENCE_TYPES, WEEKDAYS } from "@/utils/constants/opportunities";

interface RecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<OpportunityFormValues>;
}

export default function RecurrenceModal({
  isOpen,
  onClose,
  form,
}: RecurrenceModalProps) {
  const handleSave = () => {
    const recurrenceType = form.getValues("recurrence.type");
    const recurrenceDays = form.getValues("recurrence.days");
    const dateRange = form.getValues("recurrence.date_range");
    const timeRange = form.getValues("recurrence.time_range");
    const occurrences = form.getValues("recurrence.occurrences");

    // Validate required fields
    if (!recurrenceType || !dateRange.start_date || !timeRange.start_time) {
      form.setError("recurrence", {
        type: "manual",
        message: "Please fill in all required fields",
      });
      return;
    }

    // For weekly recurrence, days are required
    if (recurrenceType === "weekly" && (!recurrenceDays || recurrenceDays.length === 0)) {
      form.setError("recurrence.days", {
        type: "manual",
        message: "Please select at least one day for weekly recurrence",
      });
      return;
    }

    // Set the recurrence data
    form.setValue("is_recurring", true);
    form.setValue("recurrence", {
      type: recurrenceType,
      days: recurrenceType === "weekly" ? recurrenceDays : [],
      date_range: {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date || undefined,
      },
      time_range: {
        start_time: timeRange.start_time,
        end_time: timeRange.end_time || timeRange.start_time,
      },
      occurrences: occurrences || undefined,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] sm:max-h-[586px] overflow-y-auto">
        <DialogTitle className="text-lg sm:text-xl">Recurrence Settings</DialogTitle>
        
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recurrence type</h2>
        </div>

        <div className="space-y-6 px-4 sm:px-6 pb-6">
          {/* Recurrence Type */}
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Select the pattern that suits your event
            </p>
            <RadioGroup
              defaultValue="weekly"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              onValueChange={(value) => {
                form.setValue("recurrence.type", value);
                // Clear days if not weekly
                if (value !== "weekly") {
                  form.setValue("recurrence.days", []);
                }
              }}
            >
              {RECURRENCE_TYPES.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={value} />
                  <Label htmlFor={value} className="text-sm">{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Recur Days - Only show for weekly recurrence */}
          {form.watch("recurrence.type") === "weekly" && (
            <div>
              <p className="text-xs sm:text-sm mb-2">Recur days that you select</p>
              <div className="flex flex-row flex-wrap gap-3 sm:gap-6">
                {WEEKDAYS.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center space-x-2 text-sm sm:text-base font-medium"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox rounded-full w-4 h-4 accent-blue-600"
                      checked={form.watch("recurrence.days")?.includes(day.value)}
                      onChange={() => {
                        const days = form.watch("recurrence.days") || [];
                        if (days.includes(day.value)) {
                          form.setValue(
                            "recurrence.days",
                            days.filter((d) => d !== day.value)
                          );
                        } else {
                          form.setValue("recurrence.days", [...days, day.value]);
                        }
                      }}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence Date & Time */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-4">Recurrence date & time</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              To help avoid surprises, please be specific. e.g. a few hours
              every day. KINDORA Australia recommends no more than 15 hours per
              week.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label className="text-sm">Date Range</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                    <FormInput
                      name={"recurrence.date_range.start_date" as Path<OpportunityFormValues>}
                      label=""
                      placeholder=""
                      type="date"
                      control={form.control}
                      className="w-full sm:w-[150px]"
                    />
                    <span className="hidden sm:inline">-</span>
                    <FormInput
                      name={"recurrence.date_range.end_date" as Path<OpportunityFormValues>}
                      label=""
                      placeholder=""
                      type="date"
                      control={form.control}
                      className="w-full sm:w-[150px]"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-sm">Time Range</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                    <FormInput
                      name={"recurrence.time_range.start_time" as Path<OpportunityFormValues>}
                      label=""
                      placeholder=""
                      type="time"
                      control={form.control}
                      className="w-full sm:w-[120px]"
                    />
                    <span className="hidden sm:inline">-</span>
                    <FormInput
                      name={"recurrence.time_range.end_time" as Path<OpportunityFormValues>}
                      label=""
                      placeholder=""
                      type="time"
                      control={form.control}
                      className="w-full sm:w-[120px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="endAfter" 
                    name="endType"
                    onChange={(e) => {
                      if (e.target.checked) {
                        form.setValue("recurrence.occurrences", 10);
                      }
                    }}
                  />
                  <Label htmlFor="endAfter" className="text-sm">End after</Label>
                </div>
                <FormInput
                  name={"recurrence.occurrences" as Path<OpportunityFormValues>}
                  label=""
                  placeholder="10"
                  type="number"
                  control={form.control}
                  className="w-full sm:w-[80px]"
                />
                <span className="text-sm">Occurrences</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-4">Location</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Where does the volunteer need to work from? Be specific, but
              flexible if you can. Does the work need to be done in person (at a
              physical location) or could it be done online or remotely?
            </p>
            <Input
              placeholder="21 Darling Dr, Sydney, Australia"
              className="w-full"
            />
          </div>

          {/* Number of Volunteers */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-4">
              Number of volunteers for this slot
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Which category best represents this opportunity? Volunteers use
              this to help find opportunities they are interested in supporting.
            </p>
            <Input type="number" placeholder="20" className="w-full sm:w-[120px]" />
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center sm:justify-start">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-6 py-2"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
