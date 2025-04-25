"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/language-context";
import type { Locale } from "date-fns";

interface CustomCalendarProps {
  mode?: "single" | "range";
  selected?: Date | { from: Date; to: Date };
  onSelect?: (date: Date | { from: Date; to: Date }) => void;
  className?: string;
  locale?: Locale;
}

export function CustomCalendar({
  mode = "single",
  selected,
  onSelect,
  className,
  locale,
}: CustomCalendarProps) {
  const { language: currentLanguage } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const localeObj = currentLanguage === "ko" ? ko : undefined;

  // 초기 선택된 날짜 설정
  useEffect(() => {
    if (selected) {
      if (mode === "single" && selected instanceof Date) {
        setSelectedDate(selected);
      } else if (
        mode === "range" &&
        typeof selected === "object" &&
        "from" in selected
      ) {
        setSelectedRange(selected);
      }
    }
  }, [selected, mode]);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 날짜 선택 처리
  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      setSelectedDate(date);
      onSelect?.(date);
    } else if (mode === "range") {
      if (!selectedRange || (selectedRange.from && selectedRange.to)) {
        // 새로운 범위 시작
        const newRange = { from: date, to: date };
        setSelectedRange(newRange);
        onSelect?.(newRange);
      } else if (selectedRange.from && !selectedRange.to) {
        // 범위 완성
        let newRange;
        if (date < selectedRange.from) {
          newRange = { from: date, to: selectedRange.from };
        } else {
          newRange = { from: selectedRange.from, to: date };
        }
        setSelectedRange(newRange);
        onSelect?.(newRange);
      }
    }
  };

  // 마우스 호버 처리 (범위 선택 모드에서 사용)
  const handleDateHover = (date: Date) => {
    if (mode === "range" && selectedRange?.from && !selectedRange.to) {
      setHoverDate(date);
    }
  };

  // 현재 달의 날짜 배열 생성
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // 요일 헤더 생성
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 날짜가 범위 내에 있는지 확인
  const isInRange = (date: Date) => {
    if (!selectedRange) return false;

    // 선택된 범위가 있는 경우
    if (selectedRange.from && selectedRange.to) {
      return date >= selectedRange.from && date <= selectedRange.to;
    }

    // 범위 선택 중인 경우 (호버 효과)
    if (selectedRange.from && hoverDate) {
      return (
        (date >= selectedRange.from && date <= hoverDate) ||
        (date >= hoverDate && date <= selectedRange.from)
      );
    }

    return false;
  };

  // 날짜가 범위의 시작인지 확인
  const isRangeStart = (date: Date) => {
    return selectedRange?.from && isSameDay(date, selectedRange.from);
  };

  // 날짜가 범위의 끝인지 확인
  const isRangeEnd = (date: Date) => {
    return selectedRange?.to && isSameDay(date, selectedRange.to);
  };

  // 날짜 클래스 생성
  const getDateClasses = (date: Date) => {
    return cn(
      "flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors",
      {
        "bg-blue-500 text-white":
          (mode === "single" &&
            selectedDate &&
            isSameDay(date, selectedDate)) ||
          isRangeStart(date) ||
          isRangeEnd(date),
        "bg-blue-100 dark:bg-blue-900/30":
          mode === "range" &&
          isInRange(date) &&
          !isRangeStart(date) &&
          !isRangeEnd(date),
        "bg-gray-100 dark:bg-gray-800 font-medium":
          isToday(date) &&
          !(
            mode === "single" &&
            selectedDate &&
            isSameDay(date, selectedDate)
          ) &&
          !isRangeStart(date) &&
          !isRangeEnd(date),
        "text-gray-400 dark:text-gray-600": !isSameMonth(date, currentDate),
        "hover:bg-gray-100 dark:hover:bg-gray-800":
          !(
            mode === "single" &&
            selectedDate &&
            isSameDay(date, selectedDate)
          ) &&
          !isRangeStart(date) &&
          !isRangeEnd(date),
      },
    );
  };

  // 현재 달의 날짜들
  const daysInMonth = getDaysInMonth();

  // 달력 그리드에 표시할 날짜 배열 생성 (이전 달, 현재 달, 다음 달 포함)
  const calendarDays = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = 일요일, 6 = 토요일

    // 이전 달의 날짜들 (첫 주를 채우기 위함)
    const prevMonthDays: Date[] = [];
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(firstDayOfMonth.getDate() - (i + 1));
      prevMonthDays.push(date);
    }

    // 다음 달의 날짜들 (마지막 주를 채우기 위함)
    const lastDayOfMonth = endOfMonth(currentDate);
    const remainingDays = 6 - lastDayOfMonth.getDay(); // 마지막 주에 필요한 다음 달 날짜 수

    const nextMonthDays: Date[] = [];
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(lastDayOfMonth.getDate() + i);
      nextMonthDays.push(date);
    }

    return [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  };

  // 날짜 배열을 주 단위로 분할
  const weeks = () => {
    const days = calendarDays();
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  return (
    <div className={cn("p-3 bg-white dark:bg-gray-800 rounded-md", className)}>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-medium">
          {format(currentDate, "yyyy년 MM월", { locale: localeObj })}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs text-gray-500 dark:text-gray-400 h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div>
        {weeks().map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((date, dateIndex) => (
              <div
                key={dateIndex}
                className="p-0.5 text-center"
                onMouseEnter={() => handleDateHover(date)}
              >
                <button
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={getDateClasses(date)}
                  disabled={!isSameMonth(date, currentDate)}
                >
                  {date.getDate()}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
