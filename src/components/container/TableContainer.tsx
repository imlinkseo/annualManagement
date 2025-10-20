import { cn } from "@/lib/utils";
interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function TableContainer({ children, className }: Props) {
  const styles = { ctn: `border-t border-solid border-blue-700` };
  return <table className={cn(styles.ctn, className)}>{children}</table>;
}
