"use client";

import { LoadingProvider } from "../contexts/loading-context";

export function LoadingProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LoadingProvider>{children}</LoadingProvider>;
}



