"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeamsWithCollision = ({
  className,
}: {
  className?: string;
}) => {
  const beamsRef = useRef<HTMLDivElement>(null);
  const numBeams = 30;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!beamsRef.current || !isClient) return;

    const beamElements = beamsRef.current.children;
    const positions = new Array(beamElements.length).fill(null).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    }));

    let animationFrameId: number;

    const animate = () => {
      positions.forEach((pos, i) => {
        if (!beamElements[i]) return;

        pos.x += pos.dx;
        pos.y += pos.dy;

        if (pos.x < 0 || pos.x > window.innerWidth) pos.dx *= -1;
        if (pos.y < 0 || pos.y > window.innerHeight) pos.dy *= -1;

        const beam = beamElements[i] as HTMLElement;
        beam.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isClient]);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "fixed inset-0 opacity-30 pointer-events-none overflow-hidden",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      {Array.from({ length: numBeams }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[20vw] h-[20vw] rounded-full"
          style={{
            background: `radial-gradient(circle at center, 
              ${[
                "rgba(123, 97, 255, 0.3)",
                "rgba(0, 204, 177, 0.3)",
                "rgba(28, 160, 251, 0.3)",
                "rgba(255, 196, 20, 0.3)",
              ][i % 4]} 0%,
              transparent 70%)`,
            transform: isClient
              ? `translate(${Math.random() * 100}vw, ${Math.random() * 100}vh)`
              : "translate(0, 0)",
          }}
        />
      ))}
    </div>
  );
};
