interface Props {
  children: React.ReactNode;
}

export default function TableContainer({ children }: Props) {
  return (
    <div className="rounded-md overflow-auto">
      <div className="min-w-[300px]">{children}</div>
    </div>
  );
}
