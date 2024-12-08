import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Check as CheckIcon,
  X,
  ChevronDown,
  XCircle,
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
  "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none group/badge",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-border",
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

  /**
   * The current selected values.
   */
  value: string[];

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
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

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
      value,
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...value];
        newSelectedValues.pop();
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = value.includes(option)
        ? value.filter((val) => val !== option)
        : [...value, option];
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = value.slice(0, maxCount);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (value.length > 0 && value.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        onValueChange(allValues);
      }
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            variant="outline"
            className={cn(
              "relative flex w-full min-h-9 h-auto items-center text-left",
              "px-3 py-1.5 text-sm",
              "bg-zinc-50/10 dark:bg-background/20",
              "hover:bg-zinc-100/20 dark:hover:bg-accent/20 hover:text-accent-foreground",
              "border border-border/50 dark:border-border/30 shadow-sm",
              "backdrop-blur-md",
              "focus-visible:ring-1 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1 pe-7">
                {value.slice(0, maxCount).map((val) => {
                  const option = options.find((o) => o.value === val);
                  const IconComponent = option?.icon;
                  return (
                    <Badge
                      key={val}
                      variant={variant || "default"}
                      className={cn(
                        "max-w-[200px] truncate group/item text-[11px] px-1.5 py-0.5",
                        "bg-accent/30 dark:bg-accent/20 hover:bg-accent/40 dark:hover:bg-accent/30",
                        "border border-border/50 dark:border-border/30",
                        "backdrop-blur-md",
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      <span className="flex items-center gap-1.5 pe-1 truncate">
                        {IconComponent && (
                          <IconComponent className="h-3 w-3 shrink-0 opacity-70" />
                        )}
                        <span className="truncate">{option?.label}</span>
                      </span>
                      <div
                        role="button"
                        tabIndex={0}
                        className="ml-1 ring-offset-background rounded-full opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleOption(val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleOption(val);
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {option?.label}</span>
                      </div>
                    </Badge>
                  );
                })}
                {value.length > maxCount && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "truncate group/item",
                      isAnimating ? "animate-bounce" : "",
                      multiSelectVariants({ variant })
                    )}
                    style={{ animationDuration: `${animation}s` }}
                  >
                    <span>+{value.length - maxCount} more</span>
                    <div
                      role="button"
                      tabIndex={0}
                      className="ml-1 ring-offset-background rounded-full opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearExtraOptions();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          clearExtraOptions();
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Clear extra selections</span>
                    </div>
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <div className={cn(
              "absolute right-3 flex items-center gap-2",
              value.length > 0 ? "text-foreground" : "text-muted-foreground"
            )}>
              {value.length > 0 && (
                <div
                  role="button"
                  tabIndex={0}
                  className="ring-offset-background rounded-full opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClear();
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear all</span>
                </div>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden border border-border/50 dark:border-border/30 shadow-md bg-zinc-50/10 dark:bg-background/40 backdrop-blur-xl"
          align="start"
          side="bottom"
          sideOffset={4}
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command className="max-h-[300px]">
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
              className="h-9 px-3 border-0 focus:ring-0 bg-zinc-50/10 dark:bg-background/20"
            />
            <CommandList className="max-h-[250px] overflow-auto">
              <CommandEmpty className="py-2 text-xs text-center text-muted-foreground">No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent/30 dark:hover:bg-accent/20 hover:text-accent-foreground aria-selected:bg-accent/40 dark:aria-selected:bg-accent/30 aria-selected:text-accent-foreground"
                >
                  <div
                    className={cn(
                      "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-primary/50 dark:border-primary/30",
                      "transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1",
                      value.length > 0 && value.length === options.length
                        ? "bg-primary/90 dark:bg-primary/80 text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </div>
                  <span className="font-medium text-xs">
                    {value.length > 0 && value.length === options.length ? "Deselect All" : "Select All"}
                  </span>
                </CommandItem>
                <CommandSeparator className="my-1" />
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  const IconComponent = option.icon;
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent/30 dark:hover:bg-accent/20 hover:text-accent-foreground aria-selected:bg-accent/40 dark:aria-selected:bg-accent/30 aria-selected:text-accent-foreground"
                    >
                      <div
                        className={cn(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-primary/50 dark:border-primary/30",
                          "transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1",
                          isSelected
                            ? "bg-primary/90 dark:bg-primary/80 text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </div>
                      <span className="flex items-center gap-2 truncate">
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{option.label}</span>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && value.length > 0 && (
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