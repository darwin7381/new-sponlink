"use client";

import * as React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
            <MagnifyingGlassIcon
              width="26"
              height="26"
              className="text-white/70"
              aria-hidden="true"
              style={{ background: 'none', padding: 0 }}
            />
          </div>
          <input
            ref={ref}
            type="text"
            className={cn(
              "block w-full pl-11 pr-12 py-2 rounded-md",
              "border border-input shadow-sm",
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
            <div className="absolute inset-y-0 right-2 flex items-center z-20">
              <button
                type="button"
                className="text-white/70 hover:text-white transition-colors"
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
                <XMarkIcon className="h-5 w-5" style={{ background: 'none' }} />
              </button>
            </div>
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