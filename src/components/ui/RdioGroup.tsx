// components/ui/RadioGroup.tsx
"use client";

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
}

function RadioGroup<T extends string>({
  name,
  options,
  selected,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <div className="flex gap-4">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-1 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selected === option.value}
            onChange={() => onChange(option.value)}
            className="accent-blue-500"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export default RadioGroup;
