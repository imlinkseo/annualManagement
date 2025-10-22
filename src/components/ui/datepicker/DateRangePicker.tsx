// components/ui/DateRangePicker.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { cn } from "@/lib/utils";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChangeStart: (date: Date | undefined) => void;
  onChangeEnd?: (date: Date | undefined) => void;
  isEndDateDisabled?: boolean;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  isEndDateDisabled = false,
}: DateRangePickerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handleStartSelect = (date: Date | undefined) => {
    onChangeStart(date);
    setStartOpen(false);

    if (endDate && date && endDate < date) {
      onChangeEnd?.(date);
    }
  };

  const handleEndSelect = (date: Date | undefined) => {
    onChangeEnd?.(date);
    setEndOpen(false);

    if (startDate && date && startDate > date) {
      onChangeStart(date);
    }
  };

  const styles = {
    ctn: `flex w-full gap-[10px] items-center`,
    text: `text-neutral-900 text-[16px]`,
    buttonText: `text-neutral-900 text-[17px]`,
    buttonTextDisabled: `text-neutral-700`,
  };

  return (
    <>
      <div className={cn(styles.ctn)}>
        <Button onClick={() => setStartOpen(true)}>
          <p className={cn(styles.buttonText)}>
            {startDate ? format(startDate, "yyyy.MM.dd") : "시작일"}
          </p>
        </Button>
        <p className={cn(styles.text)}>~</p>
        <Button
          onClick={() => !isEndDateDisabled && setEndOpen(true)}
          disabled={isEndDateDisabled}
        >
          <p
            className={cn(
              styles.buttonText,
              isEndDateDisabled && styles.buttonTextDisabled
            )}
          >
            {endDate ? format(endDate, "yyyy.MM.dd") : "종료일"}
          </p>
        </Button>
      </div>

      <Dialog
        open={startOpen}
        onClose={() => setStartOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-4 shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-2">
              <Dialog.Title className="text-lg font-medium">
                시작일 선택
              </Dialog.Title>
              <button onClick={() => setStartOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartSelect}
              initialFocus
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={endOpen}
        onClose={() => setEndOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-4 shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-2">
              <Dialog.Title className="text-lg font-medium">
                종료일 선택
              </Dialog.Title>
              <button onClick={() => setEndOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndSelect}
              initialFocus
              disabled={(date) => {
                if (isEndDateDisabled) return true;
                return startDate ? date < startDate : false;
              }}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
