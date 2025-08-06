"use client";

import { useState } from "react";
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (day: Date) => {
    if (onSelect) {
      onSelect(day);
    }
  };

  const renderDays = () => {
    const days: JSX.Element[] = []; // ✅ 타입 명시

    const monthStart = startOfMonth(currentMonth);
    const startDay = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentMonth);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelectedDay = selected && isSameDay(date, selected);
      const isDisabled = disabled ? disabled(date) : false;
      const isCurrentDay = isToday(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(date)}
          disabled={isDisabled}
          className={`flex h-9 w-9 items-center justify-center rounded-md text-sm
                    ${isSelectedDay ? "text-primary-foreground bg-primary" : ""}
                    ${
                      isCurrentDay && !isSelectedDay
                        ? "border border-primary text-primary"
                        : ""
                    }
                    ${
                      !isSelectedDay && !isCurrentDay
                        ? "text-foreground hover:bg-accent"
                        : ""
                    }
                    ${
                      isDisabled
                        ? "cursor-not-allowed text-muted-foreground opacity-50"
                        : "cursor-pointer"
                    }
                `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="p-3">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded-md p-2 hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-md p-2 hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="flex h-9 w-9 items-center justify-center text-xs text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
}
