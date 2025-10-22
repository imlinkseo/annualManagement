import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useId, useState } from "react";

interface Props {
  label: string;
  items: { [key: string]: string | number }[];
  currentValue: string;
  onChangeKey: (key: string) => void;
  onChangeValue?: (value: string | number) => void;
  className?: string;
}

const DropDown = ({
  label,
  items,
  currentValue,
  onChangeKey,
  onChangeValue,
  className,
}: Props) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  const styles = {
    trigger: {
      ctn: `flex justify-between w-full border border-solid border-neutral-300 px-[20px] py-[16.5px] rounded-[5px]`,
      icon: `h-6 w-6 text-blue-700`,
    },
    menuContent: {
      ctn: `max-h-[245px] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto bg-white`,
    },
    menuItem: {
      text: `group-hover:text-neutral-900 text-neutral-700`,
    },
  };
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className={cn(styles.trigger.ctn, className)}>
        {label}
        {open ? (
          <ChevronUpIcon className={cn(styles.trigger.icon)} />
        ) : (
          <ChevronDownIcon className={cn(styles.trigger.icon)} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(styles.menuContent.ctn)}>
        {items.map((item) => {
          const [key, value] = Object.entries(item)[0];
          return (
            <DropdownMenuItem
              key={key + id}
              className={cn(
                key === label || value === currentValue ? "bg-blue-50" : ""
              )}
              onClick={() => {
                onChangeKey(key);
                onChangeValue?.(value);
              }}
            >
              <p
                className={cn(
                  styles.menuItem.text,
                  (key === label || value === currentValue) && "text-blue-700"
                )}
              >
                {key}
              </p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropDown;
