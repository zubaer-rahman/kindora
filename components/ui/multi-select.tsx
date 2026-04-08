// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string;
    /** The unique value associated with the option. */
    value: string;
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];
  
  /** The current selected values (for controlled component). */
  value?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * Enable manual input functionality in the search field.
   * Optional, defaults to false.
   */
  manualInputEnabled?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      value,
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      manualInputEnabled = false,
      className,
      ...props
    },
    ref
  ) => {
    // Use value prop if provided (controlled), otherwise use defaultValue (uncontrolled)
    const initialValue = value !== undefined ? value : defaultValue;
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(initialValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [tempInputValue, setTempInputValue] = React.useState("");

    // Update selectedValues when value or defaultValue changes
    React.useEffect(() => {
      const newValue = value !== undefined ? value : defaultValue;
      setSelectedValues(newValue);
    }, [value, defaultValue]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        // Just prevent default behavior, custom input is already added
        event.preventDefault();
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const handleInputChange = (value: string) => {
      setInputValue(value);
      setTempInputValue(value);
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    // Create enhanced options that include custom values
    const enhancedOptions = [
      ...options,
      ...selectedValues
        .filter(val => !options.find(opt => opt.value === val))
        .map(val => ({ value: val, label: val, icon: undefined }))
    ];

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={(isOpen) => {
          setIsPopoverOpen(isOpen);
          if (!isOpen) {
            // Add temporary input as permanent selection when closing
            if (manualInputEnabled && tempInputValue.trim()) {
              const trimmedValue = tempInputValue.trim();
              const isExistingOption = options.find(opt => opt.value.toLowerCase() === trimmedValue.toLowerCase());
              const isAlreadySelected = selectedValues.includes(trimmedValue);
              
              if (!isExistingOption && !isAlreadySelected) {
                const newSelectedValues = [...selectedValues, trimmedValue];
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
              }
            }
            setInputValue("");
            setTempInputValue("");
          }
        }}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
              className
            )}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-wrap items-center">
                {selectedValues.slice(0, maxCount).map((value) => {
                  const option = enhancedOptions.find((o) => o.value === value);
                  const IconComponent = option?.icon;
                  return (
                    <Badge
                      key={value}
                      className={cn(
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {IconComponent && (
                        <IconComponent className="h-4 w-4 mr-2" />
                      )}
                      {option?.label}
                      <div
                        role="button"
                        tabIndex={0}
                        className="ml-2 h-4 w-4 cursor-pointer hover:text-destructive transition-colors"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleOption(value);
                          }
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </div>
                    </Badge>
                  );
                })}
                
                {/* Show dynamic badge for current input */}
                {manualInputEnabled && tempInputValue.trim() && 
                 !options.find(opt => opt.value.toLowerCase() === tempInputValue.trim().toLowerCase()) &&
                 !selectedValues.includes(tempInputValue.trim()) && (
                  <Badge
                    className={cn(
                      "border-blue-200 bg-blue-50 text-blue-700",
                      multiSelectVariants({ variant })
                    )}
                  >
                    {tempInputValue.trim()}
                    <div
                      role="button"
                      tabIndex={0}
                      className="ml-2 h-4 w-4 cursor-pointer hover:text-destructive transition-colors"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setTempInputValue("");
                        setInputValue("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          setTempInputValue("");
                          setInputValue("");
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </div>
                  </Badge>
                )}

                {selectedValues.length > maxCount && (
                  <Badge
                    className={cn(
                      "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                      isAnimating ? "animate-bounce" : "",
                      multiSelectVariants({ variant })
                    )}
                    style={{ animationDuration: `${animation}s` }}
                  >
                    {`+ ${selectedValues.length - maxCount} more`}
                    <div
                      role="button"
                      tabIndex={0}
                      className="ml-2 h-4 w-4 cursor-pointer hover:text-destructive transition-colors"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        clearExtraOptions();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          clearExtraOptions();
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </div>
                  </Badge>
                )}
                
                {/* Show placeholder when no values and no temp input */}
                {selectedValues.length === 0 && !tempInputValue.trim() && (
                  <span className="text-sm text-muted-foreground mx-3">
                    {placeholder}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                {selectedValues.length > 0 && (
                  <div
                    role="button"
                    tabIndex={0}
                    className="h-4 mx-2 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleClear();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        handleClear();
                      }
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </div>
                )}
                {selectedValues.length > 0 && (
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                )}
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder={manualInputEnabled ? "Search or type options..." : "Search..."}
              onKeyDown={handleInputKeyDown}
              value={inputValue}
              onValueChange={handleInputChange}
            />
            <CommandList>
              <CommandEmpty className="py-2 text-center">
                {manualInputEnabled && inputValue && (
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
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.length === enhancedOptions.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem>
                {enhancedOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect"; 