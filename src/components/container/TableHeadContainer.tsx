interface Props {
  children: React.ReactNode;
}

const TableHeadContainer = ({ children }: Props) => {
  return <div className="flex w-full">{children}</div>;
};

export default TableHeadContainer;
