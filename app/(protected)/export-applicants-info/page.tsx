import React from 'react'

const ExportApplicantsInfoPage = () => {
  return (
    <div>ExportApplicantsInfoPage</div>
  )
}
export default ExportApplicantsInfoPage;
/* "use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ExportField {
  id: string;
  label: string;
  path: string;
}

interface EventOption {
  id: string;
  label: string;
}

const EXPORT_FIELDS: ExportField[] = [
  { id: "name", label: "Name", path: "user.name" },
  { id: "email", label: "Email", path: "user.email" },
  { id: "phone_number", label: "Phone Number", path: "phone_number" },
  { id: "bio", label: "Bio", path: "bio" },
  { id: "country", label: "Country", path: "country" },
  { id: "state", label: "State", path: "state" },
  { id: "area", label: "Area", path: "area" },
  { id: "postcode", label: "Postcode", path: "postcode" },
  { id: "student_type", label: "Student Type", path: "student_type" },
  { id: "home_country", label: "Home Country", path: "home_country" },
  { id: "course", label: "Course", path: "course" },
  { id: "major", label: "Major", path: "major" },
];

const EVENT_OPTIONS: EventOption[] = [
  { id: "1", label: "Gardening Volunteer(20.05.2025)" },
  { id: "2", label: "Clean Up Volunteer(21.05.2025)" },
  { id: "3", label: "Clean Up Volunteer(24.05.2025)" },
  { id: "4", label: "Gardening Volunteer(20.05.2025)[2]" },
];

const ExportApplicantsInfoPage: React.FC = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "name",
    "email",
    "phone_number",
  ]);
  const [selectedEvent, setSelectedEvent] = useState<string>("1");
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const {
    data: volunteers,
    isLoading,
    error,
  } = trpc.volunteers.getVolunteersWithAppliedEvents.useQuery(
    { eventId: selectedEvent },
    { enabled: true }
  );
  console.log({ volunteers });

  const handleFieldToggle = (fieldId: string): void => {
    setSelectedFields((prev: string[]) => {
      if (prev.includes(fieldId)) {
        return prev.filter((id: string) => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleSelectAll = (): void => {
    setSelectedFields(EXPORT_FIELDS.map((field: ExportField) => field.id));
  };

  const handleSelectNone = (): void => {
    setSelectedFields([]);
  };

  const getNestedValue = (
    obj: Record<string, unknown>,
    path: string
  ): string => {
    return (
      (path
        .split(".")
        .reduce(
          (prev: Record<string, unknown> | unknown, curr: string): unknown => {
            return prev &&
              typeof prev === "object" &&
              prev !== null &&
              curr in prev
              ? (prev as Record<string, unknown>)[curr]
              : "";
          },
          obj
        ) as string) || ""
    );
  };

  const prepareExportData = (): Record<string, string>[] => {
    if (!volunteers || volunteers.length === 0) return [];

    return volunteers.map((volunteer) => {
      const row: Record<string, string> = {};

      selectedFields.forEach((fieldId: string) => {
        const field = EXPORT_FIELDS.find((f) => f.id === fieldId);
        if (field) {
          row[field.label] = getNestedValue(
            volunteer as Record<string, unknown>,
            field.path
          );
        }
      });

      return row;
    });
  };

  const exportAsCSV = (data: Record<string, string>[]): void => {
    if (data.length === 0) return;

    const headers: string[] = selectedFields.map((fieldId: string) => {
      const field = EXPORT_FIELDS.find((f) => f.id === fieldId);
      return field ? field.label : fieldId;
    });

    let csvContent = headers.join(",") + "\n";

    data.forEach((row: Record<string, string>) => {
      const values = headers.map((header: string) => {
        const value = row[header] || "";
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += values.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `${
        selectedEvent === "1"
          ? "Gardening_Volunteer_20.05.2025"
          : selectedEvent === "2"
          ? "CleanUp_Volunteer_21.05.2025"
          : selectedEvent === "3"
          ? "CleanUp_Volunteer_24.05.2025"
          : "Gardening_Volunteer_20.05.2025(2)"
      }.csv`
    );
  };

  const exportAsExcel = (data: Record<string, string>[]): void => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Volunteers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `${
        selectedEvent === "1"
          ? "Gardening_Volunteer_20.05.2025"
          : selectedEvent === "2"
          ? "CleanUp_Volunteer_21.05.2025"
          : selectedEvent === "3"
          ? "CleanUp_Volunteer_24.05.2025"
          : "Gardening_Volunteer_20.05.2025(2)"
      }.xlsx`
    );
  };

  const handleExport = async (): Promise<void> => {
    if (selectedFields.length === 0) {
      alert("Please select at least one field to export");
      return;
    }

    setIsExporting(true);

    try {
      const data = prepareExportData();

      if (exportFormat === "csv") {
        exportAsCSV(data);
      } else {
        exportAsExcel(data);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Export Applicants Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="event-select" className="text-sm font-medium">
                Event
              </label>
              <Select
                value={selectedEvent}
                onValueChange={(value: string) => setSelectedEvent(value)}
              >
                <SelectTrigger id="event-select" className="w-full">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_OPTIONS.map((option: EventOption) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="format-select" className="text-sm font-medium">
                Export Format
              </label>
              <Select
                value={exportFormat}
                onValueChange={(value: string) => {
                  if (value === "csv" || value === "excel") {
                    setExportFormat(value);
                  }
                }}
              >
                <SelectTrigger id="format-select" className="w-full">
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Select Fields to Export</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedFields.length === EXPORT_FIELDS.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              disabled={selectedFields.length === 0}
            >
              Select None
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {EXPORT_FIELDS.map((field: ExportField) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field.id}`}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={(checked: boolean) => {
                    if (checked !== undefined) {
                      handleFieldToggle(field.id);
                    }
                  }}
                />
                <label
                  htmlFor={`field-${field.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm">
          {isLoading
            ? "Loading volunteers..."
            : error
            ? "Error loading volunteers"
            : `${volunteers?.length || 0} volunteers found`}
        </p>

        <Button
          onClick={handleExport}
          disabled={
            isLoading ||
            isExporting ||
            !volunteers ||
            volunteers.length === 0 ||
            selectedFields.length === 0
          }
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            "Export Data"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExportApplicantsInfoPage;
 */