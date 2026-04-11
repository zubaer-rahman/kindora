"use client";

import { FieldValues, Path, UseFormRegister, UseFormSetValue, PathValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps<T extends FieldValues> {
  label?: string;
  id: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  registerName: Path<T>;
  error?: string;
  options: Option[];
  setValue: UseFormSetValue<T>;
  value?: string[];
  className?: string;
  disabled?: boolean;
  manualInputEnabled?: boolean;
}

export const MultiSelectField = <T extends FieldValues>({
  label,
  id,
  placeholder,
  registerName,
  register,
  error,
  options,
  setValue,
  className = "",
  value = [],
  disabled = false,
  manualInputEnabled = false,
}: MultiSelectFieldProps<T>) => {
  const handleValueChange = (newValue: string[]) => {
    setValue(registerName, newValue as PathValue<T, Path<T>>);
  };

  return (
    <div className={cn("space-y-2 relative", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {/* Hidden input to ensure field is registered with react-hook-form */}
      <input
        type="hidden"
        {...register(registerName)}
      />

      <MultiSelect
        options={options}
        onValueChange={handleValueChange}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        manualInputEnabled={manualInputEnabled}
        className={cn(
          "w-full",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};