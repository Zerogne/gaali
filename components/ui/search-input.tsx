import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

interface SearchInputProps
  extends React.ComponentProps<typeof InputGroupInput> {
  onEnter?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onEnter, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onEnter) {
        onEnter();
      }
      onKeyDown?.(e);
    };

    return (
      <InputGroup
        className={cn(
          "bg-gray-50 border-gray-300 focus-within:bg-white focus-within:border-blue-500",
          className
        )}
      >
        <InputGroupAddon align="inline-start">
          <Search className="w-4 h-4 text-gray-400" />
        </InputGroupAddon>
        <InputGroupInput ref={ref} onKeyDown={handleKeyDown} {...props} />
      </InputGroup>
    );
  }
);

SearchInput.displayName = "SearchInput";
