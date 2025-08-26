import React, { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", size = "md", asChild = false, children, ...props },
    ref
  ) => {
    const baseStyles =
      "cursor-pointer h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1  items-center rounded-md  disabled:pointer-events-none";

    const disabledStyles =
      "disabled:opacity-70 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100";

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-10 py-2 px-4",
      lg: "h-11 px-8",
    };

    const styles = `${baseStyles} ${sizes[size]} ${disabledStyles} ${className}`;

    if (asChild) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.cloneElement(children as any, {
        className: styles,
        ref,
        ...props,
      });
    }

    return (
      <button className={styles} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
