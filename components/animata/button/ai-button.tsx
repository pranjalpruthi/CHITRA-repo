import { useEffect, useMemo, useState } from "react";
import { Sparkle } from "lucide-react";
import { loadFull } from "tsparticles";
import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { cn } from "@/lib/utils";

interface AiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'simple';
}

const defaultOptions: ISourceOptions = {
  key: "star",
  name: "Star",
  particles: {
    number: {
      value: 20,
      density: {
        enable: false,
      },
    },
    color: {
      value: ["#7c3aed", "#bae6fd", "#a78bfa", "#93c5fd", "#0284c7", "#fafafa", "#38bdf8"],
    },
    shape: {
      type: "star",
      options: {
        star: {
          sides: 4,
        },
      },
    },
    opacity: {
      value: 0.8,
    },
    size: {
      value: { min: 1, max: 4 },
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      enable: true,
      direction: "clockwise",
      animation: {
        enable: true,
        speed: 10,
        sync: false,
      },
    },
    links: {
      enable: false,
    },
    reduceDuplicates: true,
    move: {
      enable: true,
      center: {
        x: 100,
        y: 35,
      },
    },
  },
  interactivity: {
    events: {},
  },
  smooth: true,
  fpsLimit: 120,
  background: {
    color: "transparent",
    size: "cover",
  },
  fullScreen: {
    enable: false,
  },
  detectRetina: true,
  absorbers: [
    {
      enable: true,
      opacity: 0,
      size: {
        value: 1,
        density: 1,
        limit: {
          radius: 5,
          mass: 5,
        },
      },
      position: {
        x: 100,
        y: 35,
      },
    },
  ],
  emitters: [
    {
      autoPlay: true,
      fill: true,
      life: {
        wait: true,
      },
      rate: {
        quantity: 5,
        delay: 0.5,
      },
      position: {
        x: 100,
        y: 35,
      },
    },
  ],
};

function AiButton({ children, className, disabled, variant = 'default', ...props }: AiButtonProps) {
  const [particleState, setParticlesReady] = useState<"loaded" | "ready">();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setParticlesReady("loaded");
    });
  }, []);

  const modifiedOptions = useMemo(() => {
    const options = { ...defaultOptions };
    options.autoPlay = isHovering && !disabled;
    
    if (variant === 'simple') {
      options.particles = {
        ...options.particles,
        color: {
          value: ["#22c55e", "#86efac", "#4ade80", "#bbf7d0", "#16a34a"]
        }
      };
    } else {
      options.particles = {
        ...options.particles,
        color: {
          value: ["#7c3aed", "#bae6fd", "#a78bfa", "#93c5fd", "#0284c7", "#fafafa", "#38bdf8"]
        }
      };
    }
    
    return options;
  }, [isHovering, disabled, variant]);

  const gradientClasses = {
    default: "bg-white/90 dark:bg-black/50 backdrop-blur-md border-[1px] border-indigo-200/50 dark:border-white/20",
    simple: "bg-transparent"
  };

  const innerGradientClasses = {
    default: "bg-transparent text-gray-700 dark:text-white hover:bg-white/10 dark:hover:bg-white/5",
    simple: "text-gray-700 dark:text-white hover:bg-white/10 dark:hover:bg-white/5"
  };

  return (
    <button
      className={cn(
        "group relative rounded-md transition-transform hover:scale-105 active:scale-102",
        gradientClasses[variant],
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        "h-8",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={disabled}
      {...props}
    >
      <div className={cn(
        "relative flex h-full items-center justify-center gap-2 rounded-md px-3 text-sm",
        innerGradientClasses[variant]
      )}>
        {children}
      </div>
      {!!particleState && !disabled && (
        <Particles
          id="generate-viz"
          className={cn(
            "pointer-events-none absolute -bottom-4 -left-4 -right-4 -top-4 z-0 opacity-0 transition-opacity",
            particleState === "ready" && "group-hover:opacity-100"
          )}
          particlesLoaded={async () => {
            setParticlesReady("ready");
          }}
          options={modifiedOptions}
        />
      )}
    </button>
  );
}

export default AiButton;
