import { cn } from "@/lib/utils";
import React from "react";
import { Status } from "@/types/types";

interface Props {
  items: TabItemProps[];
  currentValue: string;
  onChange: (value: Status) => void;
}

interface TabItemProps {
  label: string;
  value: Status;
  isSelected?: boolean;
  onChange?: (value: Status) => void;
}

const TabItem = ({ label, value, isSelected, onChange }: TabItemProps) => {
  const styles = {
    ctn: {
      default: `pb-2.5 cursor-pointer group border-b border-solid border-transparent hover:border-blue-700 transition-all duration-100`,
      selected: `border-blue-700`,
    },
    label: {
      default: `text-[20px] font-bold text-neutral-900 group-hover:text-blue-700 transition-all duration-100`,
      selected: `text-blue-700`,
    },
  };
  return (
    <div className={cn(styles.ctn.default, isSelected && styles.ctn.selected)}>
      <p
        className={cn(
          styles.label.default,
          isSelected && styles.label.selected
        )}
        onClick={() => {
          if (onChange !== undefined) {
            onChange(value);
          }
        }}
      >
        {label}
      </p>
    </div>
  );
};

export default function Tab({ items, currentValue, onChange }: Props) {
  const styles = { ctn: `flex w-full justify-end items-center gap-[20px]` };
  return (
    <div className={cn(styles.ctn)}>
      {items.map((item, idx) => (
        <TabItem
          key={item.label + idx}
          label={item.label}
          value={item.value}
          isSelected={item.value === currentValue}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
