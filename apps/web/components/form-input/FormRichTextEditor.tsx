import React from "react";
import {
  Control,
  FieldValues,
  Path,
} from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { TiptapEditor } from "./rich-text-editor/TiptapEditor";

interface FormRichTextEditorProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
}

export function FormRichTextEditor<T extends FieldValues>({
  name,
  control,
  label,
  description,
  className = "",
  placeholder,
}: FormRichTextEditorProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <TiptapEditor<T> field={field} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
