import React from "react";

interface Props {
  className?: string;
  title: string;
}

const PageTitle = ({ className, title }: Props) => {
  return (
    <p className={`${className} text-xl font-semibold uppercase`}>{title}</p>
  );
};

export default PageTitle;
