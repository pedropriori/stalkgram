"use client";

import { useEffect } from "react";
import { useLoading } from "../contexts/loading-context";

export function ClearLoadingOnMount() {
  const { setLoading } = useLoading();

  useEffect(() => {
    // Desativar loading quando o componente montar (página carregada)
    setLoading(false);
  }, [setLoading]);

  return null;
}

