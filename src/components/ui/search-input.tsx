"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  showSearchButton?: boolean;
  searchButtonText?: string;
  containerClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    className, 
    onSearch, 
    showSearchButton = true, 
    searchButtonText = "Search", 
    containerClassName,
    buttonClassName,
    iconClassName,
    placeholder = "Search...",
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState<string>(props.value as string || "");
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(value);
      }
    };

    React.useEffect(() => {
      if (props.value !== undefined) {
        setValue(props.value as string);
      }
    }, [props.value]);

    return (
      <form 
        className={cn("relative flex w-full", containerClassName)} 
        onSubmit={handleSubmit}
      >
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={cn("flex items-center justify-center", iconClassName)}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M19 19L14.65 14.65M14.65 14.65C15.9942 13.3058 16.8 11.4885 16.8 9.4C16.8 5.2236 13.4764 1.9 9.3 1.9C5.1236 1.9 1.8 5.2236 1.8 9.4C1.8 13.5764 5.1236 16.9 9.3 16.9C11.3885 16.9 13.2058 16.0942 14.55 14.75L14.65 14.65Z" 
                  stroke="black" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <input
            ref={ref}
            type="text"
            className={cn(
              "block w-full pl-11 pr-12 py-2 rounded-md",
              "border border-input bg-background shadow-sm",
              "placeholder:text-muted-foreground/70",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "transition-all duration-200",
              "text-base", 
              showSearchButton ? "rounded-r-none border-r-0" : "",
              className
            )}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (props.onChange) {
                props.onChange(e);
              }
            }}
            placeholder={placeholder}
            {...props}
          />
          
          {value && (
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setValue("");
                if (props.onChange) {
                  const event = {
                    target: { value: "" }
                  } as React.ChangeEvent<HTMLInputElement>;
                  props.onChange(event);
                }
                if (onSearch) {
                  onSearch("");
                }
              }}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {showSearchButton && (
          <Button 
            type="submit"
            className={cn(
              "rounded-l-none h-full flex-shrink-0 transition-all duration-200 min-w-[100px] px-6",
              buttonClassName
            )}
          >
            {searchButtonText}
          </Button>
        )}
      </form>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput }; 