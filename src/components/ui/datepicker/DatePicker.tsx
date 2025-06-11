"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import * as PopoverPrimitive from "@radix-ui/react-popover";

interface Props {
  disabled?: boolean;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export default function DatePicker({ disabled, selected, onSelect }: Props) {
  const [isStartOpen, setIsStartOpen] = useState(false);

  const handleStartSelect = (date: Date | undefined) => {
    onSelect?.(date);
    setIsStartOpen(false);
  };

  return (
    <div className="w-full">
      <PopoverPrimitive.Root open={isStartOpen} onOpenChange={setIsStartOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            disabled={disabled}
            className={`w-full relative flex justify-between text-left font-normal ${
              !selected ? "text-gray-500" : ""
            }`}
          >
            <p className={`${!selected ? "text-gray-400" : "text-black"}`}>
              {selected ? format(selected, "yyyy.MM.dd") : "날짜"}
            </p>
          </Button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            sideOffset={8}
            className="z-[9999] w-auto rounded-md bg-white p-4 shadow-lg"
          >
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleStartSelect}
              initialFocus
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
