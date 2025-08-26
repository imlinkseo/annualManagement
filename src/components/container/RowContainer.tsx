import Label from "@/components/ui/Label";
import { LabelProps } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

interface Props {
  label: LabelProps;
  children: React.ReactNode;
  className?: string;
  isContainer?: boolean;
}

export default function RowContainer({
  label,
  children,
  className,
  isContainer = true,
}: Props) {
  const styles = {
    wrapper: `w-full h-full flex border-b border-[#d0d0d0] bg-[#e0e0e0] delay-150 duration-300 ease-in-out transition-colors hover:bg-[#d0d0d0]`,
    container: `py-2 px-3 xxs:py-5 xxs:px-4 w-full`,
  };
  return (
    <div className={cn(styles.wrapper, className)}>
      <Label {...label} />
      <div className={cn(isContainer && styles.container)}>{children}</div>
    </div>
  );
}
