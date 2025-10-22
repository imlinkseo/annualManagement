import { useId } from "react";
import { ThProps } from "./Th";
import Tr from "@/components/table/Tr";
import Td, { TdProps, TdType } from "@/components/table/Td";

interface Props {
  columns: ThProps[];
  row: TdProps[];
  isMe?: boolean;
  onClick?: () => void;
}

export default function TdTr({ columns, row, isMe, onClick }: Props) {
  const id = useId();
  return (
    <Tr isMe={isMe} onClick={onClick && onClick}>
      {row.map((cell, idx) => {
        const column = columns.filter((column) => column.key === cell.key)[0];
        const width = column.width;

        function onCheckIsTdType(key: string): key is TdType {
          return ["title", "default", "node"].includes(key);
        }
        function onMakeType(key?: string) {
          if (key && onCheckIsTdType(key)) {
            return key;
          } else {
            return undefined;
          }
        }
        const type = onMakeType(column?.key);
        return (
          <Td
            key={id + `td` + idx}
            content={cell.content}
            width={width}
            isMe={isMe}
            type={type}
          />
        );
      })}
    </Tr>
  );
}
