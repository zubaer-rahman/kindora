"use client";

import { FieldValues, Path, Control, Controller, ControllerRenderProps } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps<T extends FieldValues> {
  label: string;
  id: string;
  placeholder?: string;
  control: Control<T>;
  registerName: Path<T>;
  error?: string;
  options: Option[];
  searchEnabled?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const FormSelect = <T extends FieldValues>({
  label,
  id,
  placeholder,
  control,
  registerName,
  error,
  options,
  searchEnabled = false,
  disabled = false,
  loading = false,
  className,
  description,
  value,
  onChange,
}: SelectFieldProps<T>) => {
  const [open, setOpen] = useState(false);
  const [zIndex, setZIndex] = useState(1000);
  const [inputValue, setInputValue] = useState("");

  const renderSearchableSelect = (field: ControllerRenderProps<T, Path<T>>) => {
     const getDisplayValue = () => {
      if (field.value) {
        const selectedOption = options.find((option) => option.value === field.value);
        return selectedOption ? selectedOption.label : field.value;
      }
      return "";
    };

    const handleInputChange = (value: string) => {
      setInputValue(value);
       field.onChange(value);
      onChange?.(value);
    };

    const handleOptionSelect = (optionValue: string) => {
      field.onChange(optionValue);
      onChange?.(optionValue);
      setInputValue("");  
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          setZIndex(prev => prev + 1);
           setInputValue(getDisplayValue());
        } else {
          setInputValue("");  
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-12",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            disabled={disabled || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {getDisplayValue() || placeholder || `Select or type ${label}`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0 bg-white border shadow-lg" 
          style={{ zIndex }}
          align="start"
          sideOffset={4}
        >
          <Command className="max-h-[300px] w-[var(--radix-popover-trigger-width)]">
            <CommandInput 
              placeholder={`Search or type ${label}...`} 
              className="h-9"
              disabled={disabled || loading}
              value={inputValue}
              onValueChange={handleInputChange}
            />
            <CommandList>
              <CommandEmpty className="py-2 text-center">
                {inputValue && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start bg-gray-50 border border-gray-100 rounded-md px-2 py-1 min-w-[120px]">
                      <span className="text-xs text-gray-700 font-semibold leading-tight">&quot;{inputValue}&quot; not found</span>
                      <span className="text-xs text-gray-500 mt-0.5 leading-tight">You can keep it as your input</span>
                    </div>
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-[250px] overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleOptionSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        field.value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderRegularSelect = (field: ControllerRenderProps<T, Path<T>>) => (
    <Select
      value={value || field.value}
      onValueChange={(newValue) => {
        field.onChange(newValue);
        onChange?.(newValue);
      }}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setZIndex(prev => prev + 1);
        }
      }}
      disabled={disabled || loading}
    >
      <SelectTrigger 
        id={id} 
        className={cn(
          "w-full h-12 cursor-pointer",
          error && "border-red-500",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue placeholder={placeholder || `Select ${label}`} />
        )}
      </SelectTrigger>
      <SelectContent style={{ zIndex }} className="bg-white border shadow-lg">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
            className={cn(
              option.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className={cn(error && "text-red-500")}>
          {label}
        </Label>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      <Controller
        control={control}
        name={registerName}
        render={({ field }) => (
          searchEnabled ? renderSearchableSelect(field) : renderRegularSelect(field)
        )}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};