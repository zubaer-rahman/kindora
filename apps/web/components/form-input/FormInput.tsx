"use client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldValues, Path } from "react-hook-form";

interface BaseFormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  control: Control<T>;
  className?: string;
}

interface FormInputProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  placeholder?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  control,
  placeholder,
  type = "text",
  className,
  onChange,
  disabled
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
