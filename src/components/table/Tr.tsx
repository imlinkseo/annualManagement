import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function Tr({ children }: Props) {
  const styles = { ctn: `w-full flex flex-nowrap` };
  return <tr className={cn(styles.ctn)}>{children}</tr>;
}
