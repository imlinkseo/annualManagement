"use client";

import { JSX, useState } from "react";
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
import DropDown from "../dropdown/DropDown";

interface CalendarProps {
  captionLayout?: "buttons" | "dropdown" | "dropdown-buttons";
  fromYear?: number;
  toYear?: number;
  mode?: "single" | "range";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}

export function Calendar({
  captionLayout = "buttons",
  fromYear,
  toYear,
  selected,
  onSelect,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selected ?? new Date()
  );

  const goToPreviousMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (fromYear && prev.getFullYear() < fromYear) return;
    setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (toYear && next.getFullYear() > toYear) return;
    setCurrentMonth(next);
  };

  const handleDateSelect = (day: Date) => {
    onSelect?.(day);
  };

  const renderDays = () => {
    const days: JSX.Element[] = [];

    const monthStart = startOfMonth(currentMonth);
    const startDay = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentMonth);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
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

  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  const startYear = fromYear ?? currentYear - 50;
  const endYear = toYear ?? currentYear + 50;

  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  const monthItems = months.map((label, idx) => ({ [label]: idx }));
  const yearItems = years.map((year) => ({ [`${year}`]: year }));

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

        {captionLayout === "dropdown-buttons" ? (
          <div className="flex items-center gap-2 w-full">
            <div className="w-full">
              <DropDown
                label={months[currentMonthIndex]}
                items={monthItems}
                currentValue={months[currentMonthIndex]}
                onChangeKey={() => {}}
                className="w-full"
                onChangeValue={(value) => {
                  const monthIndex = Number(value);
                  setCurrentMonth(
                    new Date(currentYear, monthIndex, currentMonth.getDate())
                  );
                }}
              />
            </div>

            <div className="w-full">
              <DropDown
                label={`${currentYear}`}
                items={yearItems}
                currentValue={`${currentYear}`}
                onChangeKey={() => {}}
                className="w-full"
                onChangeValue={(value) => {
                  const yearNum = Number(value);
                  setCurrentMonth(
                    new Date(yearNum, currentMonthIndex, currentMonth.getDate())
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
        )}

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
