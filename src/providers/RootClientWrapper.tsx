// app/RootClientWrapper.tsx
"use client";

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function RootClientWrapper({ children }: Props) {
  return <>{children}</>;
}
