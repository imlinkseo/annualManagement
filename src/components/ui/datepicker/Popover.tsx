"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type PopoverContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({
  open: controlledOpen,
  onOpenChange,
  children,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setUncontrolledOpen(newOpen);
    }
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

interface TriggerChildProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
}

type TriggerChild = React.ReactElement<TriggerChildProps>;

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function PopoverTrigger({
  asChild = false,
  children,
}: PopoverTriggerProps) {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("PopoverTrigger must be used within a Popover");
  }

  const { open, setOpen } = context;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(!open);
  };

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "asChild=true일 때 children은 단일 React element여야 합니다."
      );
    }

    const child = children as TriggerChild;

    // 기존 onClick 유지 + 토글 추가
    return React.cloneElement(child, {
      onClick: (e) => {
        child.props.onClick?.(e);
        handleClick(e);
      },
    });
  }
}

interface PopoverContentProps {
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}

export function PopoverContent({
  align = "center",
  className = "",
  children,
}: PopoverContentProps) {
  const context = useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error("PopoverContent must be used within a Popover");
  }

  const { open, setOpen } = context;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        open
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-2 rounded-md border bg-white shadow-lg ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
}
