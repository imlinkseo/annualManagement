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

function RadioGroup<T extends string | null>({
  name,
  options,
  selected,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <div className="flex gap-4 flex-col xxs:flex-row">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={selected === option.value}
            onChange={() => onChange(option.value)}
            className="accent-blue-500"
          />
          <p>{option.label}</p>
        </label>
      ))}
    </div>
  );
}

export default RadioGroup;
