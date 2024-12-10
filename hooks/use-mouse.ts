"use client";
import { useCallback, useState } from "react";

export const useMouse = () => {
  const [state, setState] = useState<{
    elementX: number | null;
    elementY: number | null;
  }>({
    elementX: null,
    elementY: null,
  });

  const ref = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setState({ elementX: x, elementY: y });
    };

    element.addEventListener("mousemove", handleMouseMove);
    return () => element.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return [state, ref] as const;
};