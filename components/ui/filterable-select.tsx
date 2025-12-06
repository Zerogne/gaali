"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface FilterableSelectOption {
  value: string
  label: string
}

interface FilterableSelectProps {
  options: FilterableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  searchPlaceholder?: string
  emptyMessage?: string
  onCreateNew?: (value: string) => Promise<string | null> // Returns the new option value or null on error
  createNewLabel?: string // Label for the "create new" option
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
  onCreateNew,
  createNewLabel = "Create new",
}: FilterableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const isHandlingSelectRef = React.useRef(false)

  // Filter and sort options
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options
    }

    const query = searchQuery.toLowerCase()
    const matching: FilterableSelectOption[] = []
    const containing: FilterableSelectOption[] = []

    options.forEach((option) => {
      const label = option.label.toLowerCase()
      if (label.startsWith(query)) {
        matching.push(option)
      } else if (label.includes(query)) {
        containing.push(option)
      }
    })

    return [...matching, ...containing]
  }, [options, searchQuery])

  // Check if search query doesn't match any existing option
  const hasExactMatch = React.useMemo(() => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase().trim()
    return options.some(opt => opt.label.toLowerCase() === query)
  }, [options, searchQuery])

  // Handle creating new value
  const handleCreateNew = React.useCallback(async () => {
    if (!onCreateNew || !searchQuery.trim() || hasExactMatch || isCreating || isHandlingSelectRef.current) {
      return
    }

    isHandlingSelectRef.current = true
    setIsCreating(true)
    try {
      const newValue = await onCreateNew(searchQuery.trim())
      if (newValue) {
        onValueChange?.(newValue)
        setOpen(false)
        setSearchQuery("")
      }
    } catch (error) {
      console.error("Error creating new value:", error)
    } finally {
      setIsCreating(false)
      // Reset the ref after a short delay to allow state updates to complete
      setTimeout(() => {
        isHandlingSelectRef.current = false
      }, 100)
    }
  }, [onCreateNew, searchQuery, hasExactMatch, isCreating, onValueChange])

  // Handle Enter key in search input
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onCreateNew && searchQuery.trim() && !hasExactMatch) {
      e.preventDefault()
      handleCreateNew()
    }
  }, [onCreateNew, searchQuery, hasExactMatch, handleCreateNew])

  // Single handler for option selection to prevent infinite loops
  const handleOptionSelect = React.useCallback((selectedValue: string) => {
    if (isHandlingSelectRef.current) return
    
    // Check if it's a create new option
    if (selectedValue.startsWith("__create_new")) {
      if (!isCreating && onCreateNew && searchQuery.trim() && !hasExactMatch) {
        handleCreateNew()
      }
      return
    }

    // Find the option
    const option = options.find(opt => opt.value === selectedValue)
    if (!option) return

    const newValue = option.value === value ? "" : option.value
    // Only update if value actually changed
    if (newValue !== value) {
      isHandlingSelectRef.current = true
      // Use requestAnimationFrame to batch state updates
      requestAnimationFrame(() => {
        onValueChange?.(newValue)
        setOpen(false)
        setSearchQuery("")
        // Reset the ref after state updates
        setTimeout(() => {
          isHandlingSelectRef.current = false
        }, 100)
      })
    } else {
      // Just close if selecting the same value
      setOpen(false)
      setSearchQuery("")
    }
  }, [options, value, onValueChange, isCreating, onCreateNew, searchQuery, hasExactMatch, handleCreateNew])

  const selectedOption = options.find((opt) => opt.value === value)

  // Reset search query when popover closes
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchQuery("")
      isHandlingSelectRef.current = false
    }
  }, [])

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
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={handleKeyDown}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            {filteredOptions.length === 0 && !onCreateNew && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {filteredOptions.length === 0 && onCreateNew && searchQuery.trim() && !hasExactMatch && (
              <CommandEmpty>
                <div className="py-2">
                  <p className="text-sm text-muted-foreground mb-2">{emptyMessage}</p>
                  <CommandItem
                    value={`__create_new_empty_${searchQuery}`}
                    onSelect={handleOptionSelect}
                    disabled={isCreating}
                    className="text-primary cursor-pointer"
                  >
                    {isCreating ? "Хадгалж байна..." : `"${searchQuery}" ${createNewLabel} (Enter)`}
                  </CommandItem>
                </div>
              </CommandEmpty>
            )}
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleOptionSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
                {onCreateNew && searchQuery.trim() && !hasExactMatch && (
                  <CommandItem
                    value={`__create_new_${searchQuery}`}
                    onSelect={handleOptionSelect}
                    disabled={isCreating}
                    className="text-primary cursor-pointer border-t"
                  >
                    <span className="mr-2">+</span>
                    {isCreating ? "Хадгалж байна..." : `"${searchQuery}" ${createNewLabel} (Enter)`}
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
