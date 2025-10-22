"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface Option<T> {
  label: string;
  value: T;
}

interface RadioGroupProps<T> {
  name: string;
  options: Option<T>[];
  selected: T;
  onChange: (value: T) => void;
  eachWidth?: string;
}

function RadioGroup<T extends string | null>({
  name,
  options,
  selected,
  onChange,
  eachWidth,
}: RadioGroupProps<T>) {
  const styles = {
    ctn: "flex gap-[24px] items-center",
    labelCtn: `flex items-center gap-[6px]  cursor-pointer`,
    label: `text-[17px] text-neutral-900`,
  };
  return (
    <div className={cn(styles.ctn)}>
      {options.map((option) => (
        <label key={option.value} className={cn(styles.labelCtn, eachWidth)}>
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={selected === option.value}
            onChange={() => onChange(option.value)}
            className="accent-blue-500"
          />
          <p className={cn(styles.label)}>{option.label}</p>
        </label>
      ))}
    </div>
  );
}

export default RadioGroup;
