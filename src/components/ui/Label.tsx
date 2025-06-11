import React from "react";

interface Props {
  className?: string;
  label: string;
}

const Label = ({ className, label }: Props) => {
  return (
    <label
      className={`${className} bg-gray-900 text-white  text-md justify-center items-center flex font-semibold p-2 whitespace-nowrap rounded-md min-w-[60px] shrink-0 h-10`}
    >
      {label}
    </label>
  );
};

export default Label;
