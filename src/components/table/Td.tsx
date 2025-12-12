import React, { useRef, useState } from "react";
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLParagraphElement | null>(null);

  const styles = {
    ctn: {
      base: `relative flex items-center overflow-hidden`,
      default: `justify-center py-[26px] px-[8px]`,
      title: `justify-start bg-blue-50 px-[20px] py-[22px]`,
      node: `justify-start p-2.5`,
    },
    content: {
      base: `text-[17px] text-center whitespace-nowrap truncate`,
      default: `text-neutral-700 font-semibold`,
      title: `text-neutral-900 font-semibold`,
      node: ``,
    },
    isMe: `text-blue-700 font-normal`,
    tooltip: {
      ctn: `fixed z-[9999] max-w-[400px] px-3 py-2 rounded bg-neutral-700 text-white text-[14px] leading-snug break-words shadow-lg pointer-events-none`,
    },
  };

  function onRenderContent(content: string | React.ReactNode) {
    if (typeof content === "string") {
      return (
        <p
          ref={textRef}
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

  function handleMouseEnter(
    e: React.MouseEvent<HTMLTableCellElement, MouseEvent>
  ) {
    if (typeof content !== "string") return;
    const el = textRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth) {
      setMousePos({ x: e.clientX + 8, y: e.clientY + 8 });
      setShowTooltip(true);
    }
  }

  function handleMouseMove(
    e: React.MouseEvent<HTMLTableCellElement, MouseEvent>
  ) {
    if (!showTooltip) return;
    setMousePos({ x: e.clientX + 8, y: e.clientY + 8 });
  }

  function handleMouseLeave() {
    setShowTooltip(false);
  }

  return (
    <td
      className={cn(styles.ctn.base, width, styles.ctn[type])}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {onRenderContent(content)}
      {showTooltip && typeof content === "string" && (
        <div
          className={cn(styles.tooltip.ctn)}
          style={{ top: mousePos.y, left: mousePos.x }}
        >
          {content}
        </div>
      )}
    </td>
  );
}
