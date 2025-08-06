interface Props {
  children: React.ReactNode;
}

export default function PageContainer({ children }: Props) {
  return <div className="mt-2 h-full flex gap-5 flex-col p-2">{children}</div>;
}
