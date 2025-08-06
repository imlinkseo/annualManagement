interface Props {
  children: React.ReactNode;
}

export default function TableContainer({ children }: Props) {
  return <div className="rounded-md overflow-hidden">{children}</div>;
}
