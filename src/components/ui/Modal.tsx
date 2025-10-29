"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  closeOnOverlay?: boolean;
  hideCloseButton?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  className,
  closeOnOverlay = true,
  hideCloseButton = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof window === "undefined") return null;
  if (!open) return null;

  const styles = {
    portalCtn: `fixed inset-0 z-[999]`,
    overlay: `absolute inset-0 bg-black/40 backdrop-blur-[2px]`,
    panelCtn: `absolute inset-0 flex items-center justify-center p-4 sm:p-6`,
    panel: `w-full max-w-[750px] rounded-[10px] bg-white shadow-2xl ring-1 ring-black/5`,
    panelIn: `data-[enter=true]:animate-[fadeIn_.2s_ease-out] data-[enter=true]:opacity-100`,
    layout: {
      ctn: `flex flex-col`,
      header: `flex items-start justify-between gap-4 pt-[24px] pr-[14px] pb-[24px] pl-[24px]`,
      title: `text-[19px] font-semibold text-neutral-900`,
      closeBtn: `inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.98] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white`,
      content: `px-[20px] text-neutral-700 dark:text-neutral-200`,
      footer: `flex items-center justify-center gap-2.5 px-6 py-[20px]`,
    },
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return createPortal(
    <div className={cn(styles.portalCtn)}>
      <div
        className={cn(styles.overlay)}
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div className={cn(styles.panelCtn)}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          data-enter
          className={cn(styles.panel, styles.panelIn, className)}
          onClick={stop}
        >
          <div className={cn(styles.layout.ctn)}>
            <div className={cn(styles.layout.header)}>
              <h2 id="modal-title" className={cn(styles.layout.title)}>
                {title}
              </h2>
              {!hideCloseButton && (
                <button
                  type="button"
                  aria-label="닫기"
                  className={cn(styles.layout.closeBtn)}
                  onClick={onClose}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="17"
                    viewBox="0 0 16 17"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.13775e-05 14.8566L14.3109 0.545772L15.9087 2.14355L1.59785 16.4544L7.13775e-05 14.8566Z"
                      fill="#888888"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.68904 0.54597L15.9999 14.8568L14.4021 16.4546L0.0912622 2.14375L1.68904 0.54597Z"
                      fill="#888888"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className={cn(styles.layout.content)}>{children}</div>
            <div className={cn(styles.layout.footer)}>{actions}</div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
