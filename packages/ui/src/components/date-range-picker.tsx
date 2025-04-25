"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useLanguage } from "../contexts/language-context";
import {
  format,
  isToday,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { CustomCalendar } from "./custom-calendar";

interface DateRangePickerProps {
  className?: string;
  onChange?: (dates: { from: Date; to: Date }) => void;
  defaultValue?: { from: Date; to: Date };
}

type QuickSelectOption = {
  label: string;
  value: string;
  getDates: () => { from: Date; to: Date };
};

export function DateRangePicker({
  className,
  onChange,
  defaultValue = { from: new Date(), to: new Date() },
}: DateRangePickerProps) {
  const { t, language: currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dates, setDates] = useState<{ from: Date; to: Date }>(defaultValue);

  const locale = currentLanguage === "ko" ? ko : undefined;

  // 빠른 선택 옵션
  const quickSelectOptions: QuickSelectOption[] = [
    {
      label: "오늘",
      value: "today",
      getDates: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      label: "어제",
      value: "yesterday",
      getDates: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      label: "이번 주",
      value: "thisWeek",
      getDates: () => {
        const today = new Date();
        return {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        };
      },
    },
    {
      label: "이번 달",
      value: "thisMonth",
      getDates: () => {
        const today = new Date();
        return {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
      },
    },
    {
      label: "최근 7일",
      value: "last7Days",
      getDates: () => {
        const today = new Date();
        return {
          from: subDays(today, 6),
          to: today,
        };
      },
    },
    {
      label: "최근 30일",
      value: "last30Days",
      getDates: () => {
        const today = new Date();
        return {
          from: subDays(today, 29),
          to: today,
        };
      },
    },
  ];

  // 날짜 범위 선택 처리
  const handleSelect = (range: Date | { from: Date; to: Date } | undefined) => {
    // For range mode, we only handle range objects
    if (
      range &&
      typeof range === "object" &&
      "from" in range &&
      "to" in range
    ) {
      setDates(range);
      onChange?.(range);

      // 범위가 완전히 선택되면 팝업 닫기
      if (range.from && range.to && !isSameDay(range.from, range.to)) {
        setIsOpen(false);
      }
    }
  };

  // 빠른 선택 처리
  const handleQuickSelect = (option: QuickSelectOption) => {
    const selectedDates = option.getDates();
    setDates(selectedDates);
    onChange?.(selectedDates);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd", {
      locale: locale,
    });
  };

  // 당일 날짜 여부 확인
  const isTodaySelected = isToday(dates.from) && isToday(dates.to);
  const isSameDaySelected = isSameDay(dates.from, dates.to);

  // 날짜 표시 텍스트 생성
  const displayText = () => {
    if (!dates.from || !dates.to) return t("selectDateRange");

    const fromText = formatDate(dates.from);
    const toText = formatDate(dates.to);

    // 시작일과 종료일이 같은 경우
    if (isSameDaySelected) {
      return (
        <span className="flex items-center">
          <span className="font-medium">{fromText}</span>
          {isTodaySelected && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-sm">
              오늘
            </span>
          )}
        </span>
      );
    }

    // 시작일과 종료일이 다른 경우
    return (
      <span className="flex items-center">
        <span className="font-medium">{fromText}</span>
        <span className="mx-1 text-gray-400">~</span>
        <span className="font-medium">{toText}</span>
        {isToday(dates.to) && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-sm">
            오늘
          </span>
        )}
      </span>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[280px] justify-between border-gray-200 dark:border-gray-700 dark:bg-gray-800 ${className}`}
          onClick={() => setIsOpen(true)}
        >
          <span>{displayText()}</span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-sm border-gray-200 dark:border-gray-700 rounded-md overflow-hidden z-50"
        align="start"
      >
        <div className="p-1 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm overflow-hidden">
            <div className="p-1.5 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-1">
              {quickSelectOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSelect(option)}
                  className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <CustomCalendar
              mode="range"
              selected={dates}
              onSelect={handleSelect}
              className="border-0"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
