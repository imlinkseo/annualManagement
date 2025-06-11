// components/ui/DateRangePicker.tsx
"use client";

import { format } from "date-fns";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { useState } from "react";

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChangeStart: (date: Date | undefined) => void;
  onChangeEnd: (date: Date | undefined) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
}: DateRangePickerProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handleStartSelect = (date: Date | undefined) => {
    onChangeStart(date);
    setIsStartOpen(false);

    if (endDate && date && endDate < date) {
      onChangeEnd(undefined); // reset end if before start
    }
  };

  const handleEndSelect = (date: Date | undefined) => {
    onChangeEnd(date);
    setIsEndOpen(false);

    if (startDate && date && startDate > date) {
      onChangeStart(undefined); // reset start if after end
    }
  };

  return (
    <div className="flex flex-col w-full gap-[10px]">
      {/* Start Date Picker */}
      <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`relative flex w-full justify-between text-left font-normal ${
              !startDate ? "text-gray-500" : ""
            }`}
          >
            <p>{startDate ? format(startDate, "yyyy.MM.dd") : "시작일"}</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleStartSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date Picker */}
      <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`relative flex w-full justify-between text-left font-normal ${
              !endDate ? "text-gray-500" : ""
            }`}
          >
            <p>{endDate ? format(endDate, "yyyy.MM.dd") : "종료일"}</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={handleEndSelect}
            initialFocus
            disabled={(date) => (startDate ? date < startDate : false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
