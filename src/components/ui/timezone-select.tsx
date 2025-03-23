"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 主要時區列表 - 按區域分組
// 包含 IANA 時區標識符和顯示名稱
const TIMEZONE_OPTIONS = [
  // 亞洲區
  { value: "Asia/Taipei", label: "台北 (GMT+8)" },
  { value: "Asia/Shanghai", label: "上海 (GMT+8)" },
  { value: "Asia/Tokyo", label: "東京 (GMT+9)" },
  { value: "Asia/Singapore", label: "新加坡 (GMT+8)" },
  { value: "Asia/Hong_Kong", label: "香港 (GMT+8)" },
  { value: "Asia/Seoul", label: "首爾 (GMT+9)" },
  { value: "Asia/Bangkok", label: "曼谷 (GMT+7)" },

  // 北美區
  { value: "America/New_York", label: "紐約 (GMT-5)" },
  { value: "America/Los_Angeles", label: "洛杉磯 (GMT-8)" },
  { value: "America/Chicago", label: "芝加哥 (GMT-6)" },
  { value: "America/Toronto", label: "多倫多 (GMT-5)" },
  { value: "America/Vancouver", label: "溫哥華 (GMT-8)" },

  // 歐洲區
  { value: "Europe/London", label: "倫敦 (GMT+0)" },
  { value: "Europe/Paris", label: "巴黎 (GMT+1)" },
  { value: "Europe/Berlin", label: "柏林 (GMT+1)" },
  { value: "Europe/Rome", label: "羅馬 (GMT+1)" },
  { value: "Europe/Amsterdam", label: "阿姆斯特丹 (GMT+1)" },

  // 大洋洲
  { value: "Australia/Sydney", label: "悉尼 (GMT+10)" },
  { value: "Australia/Melbourne", label: "墨爾本 (GMT+10)" },
  { value: "Pacific/Auckland", label: "奧克蘭 (GMT+12)" },

  // 標準時區
  { value: "UTC", label: "世界標準時間 (UTC)" }
];

export type TimezoneSelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function TimezoneSelect({
  value,
  onChange,
  className,
}: TimezoneSelectProps) {
  const [open, setOpen] = React.useState(false);

  // 查找當前選中的時區標籤
  const selectedOption = TIMEZONE_OPTIONS.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : value;

  // 獲取當前瀏覽器的時區
  const getBrowserTimezone = (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (error) {
      console.error("獲取瀏覽器時區錯誤:", error);
      return "UTC";
    }
  };

  // 如果沒有值，初始化為瀏覽器時區
  React.useEffect(() => {
    if (!value) {
      const browserTimezone = getBrowserTimezone();
      onChange(browserTimezone);
    }
  }, [value, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {displayValue || "選擇時區..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="搜尋時區..." />
          <CommandEmpty>找不到符合的時區</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {TIMEZONE_OPTIONS.map((timezone) => (
              <CommandItem
                key={timezone.value}
                value={timezone.value}
                onSelect={(currentValue: string) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === timezone.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {timezone.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 