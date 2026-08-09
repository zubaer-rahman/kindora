"use client";

import { FieldValues, Path, UseFormRegister, UseFormSetValue, PathValue } from "react-hook-form";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  label: string;
  id: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  registerName: Path<T>;
  error?: string;
  options: Option[];
  setValue: UseFormSetValue<T>;
  value?: string;
}

export const SelectField = <T extends FieldValues>({
  label,
  id,
  placeholder,
  registerName,
  error,
  options,
  setValue,
  value = "",
}: SelectFieldProps<T>) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="border-[0.5px] border-[#CBCBCB] px-3 py-2 rounded-lg">
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={(e) => {
              setValue(registerName, e.target.value as PathValue<T, Path<T>>);
            }}
            className="w-full h-6 px-2 py-0 focus:outline-none text-sm appearance-none pr-8"
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};