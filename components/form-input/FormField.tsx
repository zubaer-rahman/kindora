"use client";

import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps<T extends FieldValues> {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  registerName: Path<T>;
  error?: string;
  className?: string;
}

export const FormField = <T extends FieldValues>({
  label,
  id,
  type = "text",
  placeholder,
  register,
  registerName,
  error,
  className = "h-12",
}: FormFieldProps<T>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          {...register(registerName)}
          placeholder={placeholder}
          className={cn("resize-none", className)}
        />
      ) : (
        <Input
          type={type}
          id={id}
          {...register(registerName)}
          placeholder={placeholder}
          className={className}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};