"use client";

import { cn } from "@/lib/utils";
import {
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import Label from "./Label";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
  onChangeValue?: (value: string) => void;
  name?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    { label, className, onChangeValue, name, onChange, value, ...props },
    ref
  ) => {
    const styles = useMemo(
      () => ({
        ctn: `bg-white px-[20px] py-[16.5px] h-[120px] rounded-[5px] border-[1px] border-solid border-neutral-300 w-full resize-none`,
        text: {
          value: `font-medium text-[17px] text-neutral-900`,
          placeholder: `placeholder:font-medium placeholder:text-[17px] placeholder:text-neutral-500`,
        },
      }),
      []
    );

    const [isComposing, setIsComposing] = useState(false);
    const [innerValue, setInnerValue] = useState(
      typeof value === "string" ? value : value == null ? "" : String(value)
    );

    useEffect(() => {
      if (isComposing) return;
      const next =
        typeof value === "string" ? value : value == null ? "" : String(value);
      setInnerValue(next);
    }, [value, isComposing]);

    return (
      <div className="flex flex-col items-start gap-2.5 w-full">
        {label && <Label label={label} required={props.required} name={name} />}
        <textarea
          ref={ref}
          className={cn(
            styles.ctn,
            className,
            styles.text.value,
            styles.text.placeholder
          )}
          name={name}
          required={props.required}
          value={innerValue}
          onCompositionStart={(e) => {
            setIsComposing(true);
            props.onCompositionStart?.(e);
          }}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            const v = e.currentTarget.value;
            setInnerValue(v);
            onChangeValue?.(v);
            props.onCompositionEnd?.(e);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setInnerValue(v);
            onChange?.(e);
            if (!isComposing) onChangeValue?.(v);
          }}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
