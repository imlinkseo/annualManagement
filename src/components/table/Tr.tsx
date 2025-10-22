import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  isMe?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Tr({ children, isMe, onClick, className }: Props) {
  const styles = {
    ctn: `w-full flex flex-nowrap hover:bg-neutral-50 border-b border-solid border-neutral-300`,
    isMe: `bg-blue-25 cursor-pointer`,
  };
  return (
    <tr
      className={cn(styles.ctn, isMe === true && styles.isMe, className)}
      onClick={onClick && onClick}
    >
      {children}
    </tr>
  );
}
