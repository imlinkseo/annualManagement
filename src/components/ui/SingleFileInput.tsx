"use client";
import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface SingleFileInputProps
  extends Omit<
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "onChange" | "value"
    >,
    "multiple"
  > {
  value?: File | null;
  onChange?: (file: File | null) => void;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
}

const SingleFileInput = forwardRef<HTMLInputElement, SingleFileInputProps>(
  (
    {
      id,
      name,
      value,
      onChange,
      accept,
      disabled,
      required,
      className,
      placeholder = "선택된 파일 없음",
      ...rest
    },
    forwardedRef
  ) => {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const inputRef = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (
          forwardedRef as React.MutableRefObject<HTMLInputElement | null>
        ).current = node;
    };

    const [fileState, setFileState] = useState<File | null>(null);
    const selectedFile = useMemo(() => value ?? fileState, [value, fileState]);

    const handleOpenDialog = useCallback(() => {
      if (disabled) return;
      const el = innerRef.current;
      if (!el) return;
      el.value = "";
      el.click();
    }, [disabled]);

    const handleChange = useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >(
      (e) => {
        const file = e.currentTarget.files?.[0] ?? null;
        if (value === undefined) setFileState(file);
        onChange?.(file);
      },
      [onChange, value]
    );

    const styles = {
      ctn: `flex items-center gap-[24px] min-w-0`,
      button: {
        ctn: `px-[40px] py-[12px] bg-blue-50 border border-blue-25 hover:bg-white hover:border-blue-50 transition-all duration-100 rounded-[5px] cursor-pointer`,
        text: `text-[17px] text-blue-700 font-semibold`,
      },
      name: {
        base: `text-[17px]  truncate`,
        null: `text-neutral-700`,
        file: `text-neutral-900`,
      },
    };

    return (
      <div className={cn(styles.ctn, className)}>
        <input
          id={id}
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          required={required}
          disabled={disabled}
          className="sr-only"
          onChange={handleChange}
          {...rest}
        />
        <button
          type="button"
          onClick={handleOpenDialog}
          disabled={disabled}
          aria-controls={id}
          className={cn(styles.button.ctn)}
        >
          <p className={cn(styles.button.text)}>파일 선택</p>
        </button>
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              styles.name.base,
              selectedFile ? styles.name.file : styles.name.null
            )}
            title={selectedFile ? selectedFile.name : placeholder}
            aria-live="polite"
          >
            {selectedFile ? selectedFile.name : placeholder}
          </span>
        </div>
      </div>
    );
  }
);

SingleFileInput.displayName = "SingleFileInput";
export default SingleFileInput;
