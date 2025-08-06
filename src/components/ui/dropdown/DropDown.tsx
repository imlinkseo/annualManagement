import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useId } from "react";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${className} w-full h-full min-h-[40px] flex flex-[1_0_0] items-center justify-between self-stretch rounded-[5px]  bg-white px-5 text-sm font-medium text-[#1E2124] focus:text-[#1E2124] focus:outline-none focus:ring-0`}
      >
        {label}
        <ChevronDownIcon className="ml-2 h-5 w-5 text-black" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[245px] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto bg-white">
        {items.map((item) => {
          const [key, value] = Object.entries(item)[0];

          return (
            <DropdownMenuItem
              key={key + id}
              className={`${
                key === label || value === currentValue ? "bg-[#ECF2FE]" : ""
              } cursor-pointer`}
              onClick={() => {
                onChangeKey(key);
                onChangeValue?.(value);
              }}
            >
              {key}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropDown;
