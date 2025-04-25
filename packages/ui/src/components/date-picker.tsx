"use client";

import { CalendarIcon } from "lucide-react";
import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useLanguage } from "../contexts/language-context";
import { CustomCalendar } from "./custom-calendar";

interface DatePickerProps {
  className?: string;
  onChange?: (date: Date | undefined) => void;
  value?: Date;
  defaultValue?: Date;
}

export function DatePicker({
  className,
  onChange,
  value,
  defaultValue = new Date(),
}: DatePickerProps) {
  const { language: currentLanguage } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(
    value !== undefined
      ? value
      : defaultValue !== undefined
        ? defaultValue
        : new Date(),
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  const handleSelect = (
    selectedDate: Date | { from: Date; to: Date } | undefined,
  ) => {
    // For single mode, we only handle Date objects
    if (selectedDate && selectedDate instanceof Date) {
      if (value === undefined) {
        setDate(selectedDate);
      }
      onChange?.(selectedDate);
      setIsOpen(false);
    }
  };

  const displayText = () => {
    if (!date) return <span>날짜 선택</span>;

    const formattedDate = format(date, "yyyy-MM-dd", {
      locale: currentLanguage === "ko" ? ko : undefined,
    });

    if (isToday(date)) {
      return (
        <span className="flex items-center">
          <span className="font-medium">{formattedDate}</span>
          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-sm">
            오늘
          </span>
        </span>
      );
    }

    return <span className="font-medium">{formattedDate}</span>;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[180px] justify-start text-left font-normal border-gray-200 dark:border-gray-700 dark:bg-gray-800 ${className}`}
          onClick={() => setIsOpen(true)}
        >
          {displayText()}
          <CalendarIcon className="ml-auto h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-sm border-gray-200 dark:border-gray-700 rounded-md overflow-hidden z-50"
        align="start"
      >
        <div className="p-1 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CustomCalendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="bg-white dark:bg-gray-800 rounded-sm shadow-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
