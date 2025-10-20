import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function SizeContainer({ children, className }: Props) {
  const styles = {
    ctn: `max-w-[1920px] w-full`,
  };
  return <div className={cn(styles.ctn, className)}>{children}</div>;
}
