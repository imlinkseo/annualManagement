import { cn } from "@/lib/utils";

export type TdType = "title" | "default" | "node";

export interface TdProps {
  key?: string;
  content: string | React.ReactNode;
  width?: string;
  isMe?: boolean;
  type?: TdType;
}

export default function Td({
  content,
  width,
  isMe,
  type = "default",
}: TdProps) {
  const styles = {
    ctn: {
      base: `flex items-center  overflow-hidden `,
      default: `justify-center  py-[26px]  px-[8px]`,
      title: `justify-start bg-blue-50 px-[20px] py-[22px]`,
      node: `justify-start p-2.5`,
    },
    content: {
      base: ` text-[17px] text-center  whitespace-nowrap truncate `,
      default: `text-neutral-700 font-semibold`,
      title: `text-neutral-900 font-semibold`,
      node: ``,
    },
    isMe: `text-blue-700 font-normal`,
  };

  function onRenderContent(content: string | React.ReactNode) {
    if (typeof content === "string") {
      return (
        <p
          className={cn(
            styles.content.base,
            styles.content[type],
            isMe === true && styles.isMe
          )}
        >
          {content}
        </p>
      );
    } else {
      return content;
    }
  }
  return (
    <td className={cn(styles.ctn.base, width, styles.ctn[type])}>
      {onRenderContent(content)}
    </td>
  );
}
