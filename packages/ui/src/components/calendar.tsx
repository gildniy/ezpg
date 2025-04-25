"use client";

import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button";
import { useLanguage } from "../contexts/language-context";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { language: currentLanguage } = useLanguage();

  return (
    <DayPicker
      locale={currentLanguage === "ko" ? ko : undefined}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        caption: "flex justify-center relative items-center h-8",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-6 w-6 bg-transparent p-0 text-muted-foreground hover:text-foreground",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 mb-1",
        head_cell:
          "text-muted-foreground text-center font-normal text-[0.7rem] h-6 flex items-center justify-center",
        row: "grid grid-cols-7 mt-0",
        cell: "text-center relative p-0 focus-within:relative focus-within:z-20 h-8",
        day: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 p-0 font-normal text-xs aria-selected:opacity-100 mx-auto",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent/30 text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent/50 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props: {
          className?: string;
          size?: number;
          disabled?: boolean;
          orientation?: "left" | "right" | "up" | "down";
        }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-3.5 w-3.5" />;
          }
          return <ChevronRight className="h-3.5 w-3.5" />;
        },
      }}
      {...props}
      captionLayout="dropdown"
      startMonth={new Date(1900, 0)}
      endMonth={new Date(2100, 11)}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
