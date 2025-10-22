import React, { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", asChild = false, children, ...props }, ref) => {
    const baseStyles =
      "w-full flex items-center justify-between border border-solid border-neutral-300 cursor-pointer rounded-[5px] bg-white p-[15px]  placeholder:text-gray-600  disabled:pointer-events-none";

    const disabledStyles =
      "disabled:bg-neutral-300 disabled:cursor-not-allowed ";

    const styles = `${baseStyles} ${disabledStyles} ${className}`;

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

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7 1.66602C7.36819 1.66602 7.66667 1.96449 7.66667 2.33268V4.16605L13.332 4.16612V2.33268C13.332 1.96449 13.6305 1.66602 13.9987 1.66602C14.3669 1.66602 14.6654 1.96449 14.6654 2.33268V4.16614L16.4994 4.16616C17.3278 4.16617 17.9993 4.83774 17.9993 5.66616V15.9995C17.9993 16.8279 17.3278 17.4995 16.4993 17.4995H4.5C3.67157 17.4995 3 16.8279 3 15.9995V5.66602C3 4.83758 3.67158 4.16601 4.50002 4.16602L6.33333 4.16604V2.33268C6.33333 1.96449 6.63181 1.66602 7 1.66602ZM4.5 5.49935C4.40795 5.49935 4.33333 5.57397 4.33333 5.66602V7.66618H16.666V5.66616C16.666 5.57411 16.5914 5.49949 16.4994 5.49949L4.5 5.49935ZM4.33333 15.9995V8.99951H16.666V15.9995C16.666 16.0915 16.5914 16.1662 16.4993 16.1662H4.5C4.40795 16.1662 4.33333 16.0915 4.33333 15.9995ZM6.83464 11.6663C6.3744 11.6663 6.0013 12.0394 6.0013 12.4997C6.0013 12.9599 6.3744 13.333 6.83464 13.333C7.29487 13.333 7.66797 12.9599 7.66797 12.4997C7.66797 12.0394 7.29487 11.6663 6.83464 11.6663ZM10.5 11.6663C10.0398 11.6663 9.66667 12.0394 9.66667 12.4997C9.66667 12.9599 10.0398 13.333 10.5 13.333C10.9602 13.333 11.3333 12.9599 11.3333 12.4997C11.3333 12.0394 10.9602 11.6663 10.5 11.6663ZM13.3353 12.4997C13.3353 12.0394 13.7084 11.6663 14.1686 11.6663C14.6289 11.6663 15.002 12.0394 15.002 12.4997C15.002 12.9599 14.6289 13.333 14.1686 13.333C13.7084 13.333 13.3353 12.9599 13.3353 12.4997Z"
            fill={props.disabled ? "#8A949E" : "#005BE3"}
          />
        </svg>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
