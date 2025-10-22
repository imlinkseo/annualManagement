import { cn } from "@/lib/utils";

export interface ThProps {
  key?: string;
  label: string;
  width: string;
}

export default function Th({ label, width }: ThProps) {
  const styles = {
    ctn: `flex justify-center items-center py-[16px] bg-blue-50 border-t border-solid border-blue-700`,
    label: `font-semibold text-[17px] text-center text-neutral-900 whitespace-nowrap`,
  };
  return (
    <th className={cn(styles.ctn, width)}>
      <p className={cn(styles.label)}>{label}</p>
    </th>
  );
}
