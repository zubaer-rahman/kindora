"use client";

import {
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
  PathValue,
} from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PhoneFieldProps<T extends FieldValues> {
  label: string;
  id: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  registerName: Path<T>;
  error?: string;
  value?: string;
  setValue: UseFormSetValue<T>;
  customClass?: string;
}

export const PhoneField = <T extends FieldValues>({
  label,
  id,
  placeholder,
  registerName,
  error,
  value,
  setValue,
  customClass = "h-12",
}: PhoneFieldProps<T>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <PhoneInput
        id={id}
        international
        defaultCountry="AU"
        value={value}
        onChange={(newValue) => {
          setValue(registerName, newValue as PathValue<T, Path<T>>);
        }}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          customClass
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
