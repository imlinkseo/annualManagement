import { useId } from "react";
import Tr from "@/components/table/Tr";
import Th, { ThProps } from "@/components/table/Th";

interface Props {
  columns: ThProps[];
  isMe?: boolean;
  className?: string;
}

export default function ThTr({ columns, isMe, className }: Props) {
  const id = useId();
  return (
    <Tr isMe={isMe} className={className}>
      {columns.map((cell, idx) => (
        <Th key={id + `Th` + idx} label={cell.label} width={cell.width} />
      ))}
    </Tr>
  );
}
