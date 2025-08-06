interface Props {
  children: React.ReactNode;
  onClick?: () => void;
}
const TableContentContainer = ({ children, onClick }: Props) => {
  return (
    <div
      className="flex w-full h-full items-center cursor-pointer"
      onClick={onClick && onClick}
    >
      {children}
    </div>
  );
};

export default TableContentContainer;
