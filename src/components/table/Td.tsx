import { cn } from "@/lib/utils";

interface Props {
  content: string;
  width: string;
}

export default function Td({ content, width }: Props) {
  const styles = {
    ctn: `flex justify-center items-center py-[16px] transition-all bg-white border-t border-solid border-blue-700 hover:bg-blue-50`,
    content: `font-semibold text-[17px] text-center text-neutral-700 whitespace-nowrap`,
  };
  return (
    <th className={cn(styles.ctn, width)}>
      <p className={cn(styles.content)}>{content}</p>
    </th>
  );
}
