import { cn } from "@/lib/utils";

interface Props {
  title: string;
  className?: string;
}
export default function TableTitle({ title, className }: Props) {
  const styles = {
    default: `text-[20px] font-bold text-neutral-900 mb-[20px]`,
  };
  return <p className={cn(styles.default, className)}>{title}</p>;
}
