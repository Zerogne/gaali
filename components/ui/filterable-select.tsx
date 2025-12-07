"use client";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Edit, Search, Loader2 } from "lucide-react";
import * as React from "react";

interface FilterableSelectOption {
  value: string;
  label: string;
}

interface FilterableSelectProps {
  options: FilterableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onEdit?: (value: string, newLabel: string) => Promise<string | null>; // Returns the updated option value or null on error
  editable?: boolean; // Whether items can be edited inline
  onCreateNew?: (label: string) => Promise<string | null>; // Returns the new option value or null on error
  createNewLabel?: string; // Label to show when creating new item (e.g., "Create '...'")
}

export function FilterableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Сонгох...",
  disabled = false,
  className,
  searchPlaceholder = "Хайх...",
  emptyMessage = "Олдсонгүй",
  onEdit,
  editable = true,
  onCreateNew,
  createNewLabel,
}: FilterableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const isHandlingSelectRef = React.useRef(false);
  const onValueChangeRef = React.useRef(onValueChange);
  const lastSelectedValueRef = React.useRef<string | undefined>(value);
  const commandValueRef = React.useRef<string | undefined>(undefined);
  const preventSelectRef = React.useRef(false);
  const isTypingRef = React.useRef(false);

  // Keep ref in sync with prop
  React.useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  // Update last selected value when value prop changes externally
  // But only if we're not currently handling a selection
  React.useEffect(() => {
    if (!isHandlingSelectRef.current && !preventSelectRef.current) {
      lastSelectedValueRef.current = value;
    }
  }, [value]);

  // Filter and sort options
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    const query = searchQuery.toLowerCase();
    const matching: FilterableSelectOption[] = [];
    const containing: FilterableSelectOption[] = [];

    options.forEach((option) => {
      const label = option.label.toLowerCase();
      if (label.startsWith(query)) {
        matching.push(option);
      } else if (label.includes(query)) {
        containing.push(option);
      }
    });

    return [...matching, ...containing];
  }, [options, searchQuery]);

  // Check if search query doesn't match any existing option
  const hasExactMatch = React.useMemo(() => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return options.some((opt) => opt.label.toLowerCase() === query);
  }, [options, searchQuery]);

  // Handle editing existing value
  const handleEdit = React.useCallback(
    async (itemValue: string, newLabel: string) => {
      if (
        !onEdit ||
        !newLabel.trim() ||
        isEditing ||
        isHandlingSelectRef.current
      ) {
        return;
      }

      isHandlingSelectRef.current = true;
      setIsEditing(true);
      try {
        const updatedValue = await onEdit(itemValue, newLabel.trim());
        if (updatedValue) {
          // Use ref to prevent dependency issues
          onValueChangeRef.current?.(updatedValue);
          setOpen(false);
          setSearchQuery("");
          setEditingValue(null);
        }
      } catch (error) {
        console.error("Error editing value:", error);
      } finally {
        setIsEditing(false);
        // Reset the ref after a short delay to allow state updates to complete
        setTimeout(() => {
          isHandlingSelectRef.current = false;
        }, 100);
      }
    },
    [onEdit, isEditing]
  );


  // Handle creating a new item
  const handleCreateNew = React.useCallback(
    async (label: string) => {
      if (!onCreateNew || !label.trim() || isCreating || isHandlingSelectRef.current) {
        return;
      }

      isHandlingSelectRef.current = true;
      setIsCreating(true);
      try {
        const newValue = await onCreateNew(label.trim());
        if (newValue) {
          // Use ref to prevent dependency issues
          onValueChangeRef.current?.(newValue);
          setOpen(false);
          setSearchQuery("");
        }
      } catch (error) {
        console.error("Error creating new value:", error);
      } finally {
        setIsCreating(false);
        // Reset the ref after a short delay to allow state updates to complete
        setTimeout(() => {
          isHandlingSelectRef.current = false;
        }, 100);
      }
    },
    [onCreateNew, isCreating]
  );

  // Handle Enter key in search input
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        e.preventDefault();

        // Check if we're editing an existing item (explicitly clicked edit icon)
        if (editingValue && onEdit && editable) {
          const selectedOption = options.find(
            (opt) => opt.value === editingValue
          );
          if (selectedOption && searchQuery.trim() !== selectedOption.label) {
            handleEdit(editingValue, searchQuery.trim());
            return;
          }
        }

        // Check if we have a selected value and user typed something different - edit that item
        if (value && onEdit && editable && !hasExactMatch) {
          const selectedOption = options.find((opt) => opt.value === value);
          if (selectedOption && searchQuery.trim() !== selectedOption.label) {
            handleEdit(value, searchQuery.trim());
            return;
          }
        }

        // If no exact match and onCreateNew is provided, create a new item
        if (!hasExactMatch && onCreateNew && !editingValue && !value) {
          handleCreateNew(searchQuery.trim());
          return;
        }

        // If we have a value selected but user typed something new, try to create
        if (!hasExactMatch && onCreateNew && searchQuery.trim()) {
          handleCreateNew(searchQuery.trim());
          return;
        }
      }
    },
    [
      onEdit,
      searchQuery,
      hasExactMatch,
      handleEdit,
      editingValue,
      options,
      editable,
      value,
      onCreateNew,
      handleCreateNew,
    ]
  );

  // Stable handler reference stored in ref to prevent re-creation
  const handleOptionSelectRef = React.useRef<
    ((selectedValue: string) => void) | undefined
  >(undefined);

  // Single handler for option selection to prevent infinite loops
  const handleOptionSelect = React.useCallback(
    (selectedValue: string) => {
      // Multiple guards to prevent infinite loops
      if (isHandlingSelectRef.current || preventSelectRef.current) {
        return;
      }

      // Prevent if this is the same value we just processed
      if (selectedValue === commandValueRef.current) {
        return;
      }

      // Set guard immediately
      preventSelectRef.current = true;
      isHandlingSelectRef.current = true;
      commandValueRef.current = selectedValue;

      // Use requestAnimationFrame to ensure this runs after any pending renders
      requestAnimationFrame(() => {
        try {

          // Find the option
          const option = options.find((opt) => opt.value === selectedValue);
          if (!option) {
            preventSelectRef.current = false;
            isHandlingSelectRef.current = false;
            commandValueRef.current = undefined;
            return;
          }

          const currentValue = value;
          const newValue = option.value === currentValue ? "" : option.value;

          // Prevent re-selection if this value was just selected
          if (
            newValue === lastSelectedValueRef.current &&
            newValue === currentValue
          ) {
            setOpen(false);
            setSearchQuery("");
            preventSelectRef.current = false;
            isHandlingSelectRef.current = false;
            commandValueRef.current = undefined;
            return;
          }

          // Only update if value actually changed
          if (newValue !== currentValue) {
            lastSelectedValueRef.current = newValue;
            // Close popover and clear search first
            setOpen(false);
            setSearchQuery("");
            // Use ref to call callback to prevent dependency issues
            onValueChangeRef.current?.(newValue);
          } else {
            // Just close if selecting the same value
            setOpen(false);
            setSearchQuery("");
          }
        } finally {
          // Reset guards after a delay
          setTimeout(() => {
            preventSelectRef.current = false;
            isHandlingSelectRef.current = false;
            commandValueRef.current = undefined;
          }, 500);
        }
      });
    },
    [
      options,
      value,
    ]
  );

  // Store handler in ref for stable reference
  React.useEffect(() => {
    handleOptionSelectRef.current = handleOptionSelect;
  }, [handleOptionSelect]);

  // Wrapper that uses ref to prevent re-render issues
  const stableHandleOptionSelect = React.useCallback(
    (selectedValue: string) => {
      // Additional guard at the wrapper level - prevent during typing
      if (
        preventSelectRef.current ||
        isHandlingSelectRef.current ||
        isTypingRef.current
      ) {
        return;
      }
      // Use a microtask to defer execution and prevent render loops
      Promise.resolve().then(() => {
        if (
          !preventSelectRef.current &&
          !isHandlingSelectRef.current &&
          !isTypingRef.current
        ) {
          handleOptionSelectRef.current?.(selectedValue);
        }
      });
    },
    []
  );

  const selectedOption = options.find((opt) => opt.value === value);

  // Direct selection handler that bypasses all guards
  const handleDirectSelect = React.useCallback(
    (optionValue: string) => {
      if (!isHandlingSelectRef.current) {
        // Direct selection should always work, bypass prevent flags
        preventSelectRef.current = false;
        isTypingRef.current = false;
        
        // Use a direct call to ensure it executes
        Promise.resolve().then(() => {
          if (!isHandlingSelectRef.current) {
            handleOptionSelectRef.current?.(optionValue);
          }
        });
      }
    },
    []
  );

  // Click handler for regular options - bypass cmdk's onSelect
  const handleOptionClick = React.useCallback(
    (optionValue: string) => (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      handleDirectSelect(optionValue);
    },
    [handleDirectSelect]
  );

  // Click handler for edit button
  const handleEditClick = React.useCallback(
    (optionValue: string, optionLabel: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isEditing && onEdit && editable) {
        setEditingValue(optionValue);
        setSearchQuery(optionLabel);
        // Focus the input
        setTimeout(() => {
          const input = document.querySelector(
            "[cmdk-input]"
          ) as HTMLInputElement;
          if (input) {
            input.focus();
            input.select();
          }
        }, 100);
      }
    },
    [isEditing, onEdit, editable]
  );

  // Memoize the command list content to prevent cmdk from re-rendering unnecessarily
  const commandListContent = React.useMemo(() => {
    // Show create new option if no exact match and onCreateNew is provided
    const showCreateNew = !hasExactMatch && 
      searchQuery.trim() && 
      onCreateNew && 
      !isCreating &&
      !editingValue;

    if (filteredOptions.length === 0 && !showCreateNew) {
      return <CommandEmpty>{emptyMessage}</CommandEmpty>;
    }

    return (
      <CommandGroup>
        {filteredOptions.map((option) => (
          <CommandItem
            key={option.value}
            value={option.value}
            onSelect={(selectedValue) => {
              // Handle onSelect as fallback when onClick doesn't fire
              if (selectedValue === option.value && !isHandlingSelectRef.current) {
                handleDirectSelect(option.value);
              }
            }}
            onClick={handleOptionClick(option.value)}
            data-prevent-select="true"
            className="group cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                value === option.value ? "opacity-100" : "opacity-0"
              )}
            />
            <span className="flex-1">{option.label}</span>
            {editable && onEdit && (
              <button
                type="button"
                onClick={handleEditClick(option.value, option.label)}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                title="Edit"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </CommandItem>
        ))}
        {showCreateNew && (
          <CommandItem
            value={`__create__${searchQuery}`}
            onSelect={() => {
              if (!isHandlingSelectRef.current) {
                handleCreateNew(searchQuery.trim());
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isHandlingSelectRef.current) {
                handleCreateNew(searchQuery.trim());
              }
            }}
            className="cursor-pointer text-blue-600 font-medium"
          >
            <span className="flex-1">
              {createNewLabel ? createNewLabel.replace("...", `"${searchQuery.trim()}"`) : `+ Нэмэх "${searchQuery.trim()}"`}
            </span>
            {isCreating && (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            )}
          </CommandItem>
        )}
      </CommandGroup>
    );
  }, [
    filteredOptions,
    emptyMessage,
    value,
    handleOptionClick,
    handleEditClick,
    editable,
    onEdit,
    hasExactMatch,
    searchQuery,
    onCreateNew,
    isCreating,
    editingValue,
    createNewLabel,
    handleCreateNew,
  ]);

  // Reset search query when popover closes
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery("");
      setEditingValue(null);
      isHandlingSelectRef.current = false;
      preventSelectRef.current = false;
      isTypingRef.current = false;
      commandValueRef.current = undefined;
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={(newValue) => {
                // Set typing flag immediately and prevent selections
                isTypingRef.current = true;
                preventSelectRef.current = true;
                setSearchQuery(newValue);
                // Reset typing flag after user stops typing
                clearTimeout((window as any).__filterableSelectTypingTimeout);
                (window as any).__filterableSelectTypingTimeout = setTimeout(
                  () => {
                    isTypingRef.current = false;
                    preventSelectRef.current = false;
                  },
                  500
                );
              }}
              onKeyDown={handleKeyDown}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>{commandListContent}</CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
