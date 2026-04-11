"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, FieldValues, Path } from "react-hook-form";

interface BaseFormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  control: Control<T>;
  className?: string;
}

interface FormCheckboxProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  onCheckedChange?: (checked: boolean) => void;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  control,
  onCheckedChange,
  className,
}: FormCheckboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-start space-x-3 space-y-0 ${className}`}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (onCheckedChange) onCheckedChange(!!checked);
              }}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="cursor-pointer">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
