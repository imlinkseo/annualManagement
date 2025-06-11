import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface Props {
  label: string;
  items: string[];
  currentValue: string;
  onChangeValue: (value: string) => void;
  className?: string;
}

const DropDown = ({
  label,
  items,
  currentValue,
  onChangeValue,
  className,
}: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${className} flex flex-[1_0_0] items-center justify-between self-stretch rounded-[5px]  bg-white px-5 text-sm font-medium text-[#1E2124] focus:text-[#1E2124] focus:outline-none focus:ring-0`}
      >
        {label}
        <ChevronDownIcon className="ml-2 h-5 w-5 text-black" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[245px] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto bg-white">
        {items.map((item) => (
          <DropdownMenuItem
            key={item}
            className={`${
              item === label || item === currentValue ? "bg-[#ECF2FE]" : ""
            } cursor-pointer`}
            onClick={() => onChangeValue(item)}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropDown;
