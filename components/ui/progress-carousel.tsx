"use client";
import React, { createContext, useContext, useEffect, useState, useRef, RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SliderContextType {
  activeSlider: string;
  setActiveSlider: (value: string) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  direction: number;
  setDirection: (direction: number) => void;
  duration: number;
}

const SliderContext = createContext<SliderContextType>({
  activeSlider: "",
  setActiveSlider: () => {},
  currentIndex: 0,
  setCurrentIndex: () => {},
  direction: 0,
  setDirection: () => {},
  duration: 5000,
});

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export function ProgressSlider({
  children,
  activeSlider,
  duration = 5000,
  className,
  items,
}: {
  children: React.ReactNode;
  activeSlider: string;
  duration?: number;
  className?: string;
  items: { id: string; src: string; title: string; desc: string }[];
}) {
  const [currentSlider, setCurrentSlider] = useState(activeSlider);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setCurrentSlider(items[(currentIndex + 1) % items.length].id);
    }, duration);

    return () => clearInterval(interval);
  }, [currentIndex, items, duration]);

  return (
    <SliderContext.Provider
      value={{
        activeSlider: currentSlider,
        setActiveSlider: setCurrentSlider,
        currentIndex,
        setCurrentIndex,
        direction,
        setDirection,
        duration,
      }}
    >
      <div ref={containerRef} className={cn("relative rounded-3xl overflow-hidden", className)}>
        <CustomCursor
          containerRef={containerRef as RefObject<HTMLDivElement>}
          onClickLeft={() => {
            setDirection(-1);
            setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
            setCurrentSlider(items[(currentIndex - 1 + items.length) % items.length].id);
          }}
          onClickRight={() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % items.length);
            setCurrentSlider(items[(currentIndex + 1) % items.length].id);
          }}
        />
        {children}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className="h-1.5 rounded-full bg-white/50"
              animate={{
                width: index === currentIndex ? 24 : 6,
                opacity: index === currentIndex ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </SliderContext.Provider>
  );
}

export function SliderWrapper({
  children,
  value,
  className,
  onClick,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
  onClick?: () => void;
}) {
  const { activeSlider, direction } = useContext(SliderContext);
  
  return (
    <AnimatePresence initial={false} custom={direction}>
      {activeSlider === value && (
        <motion.div
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          className={cn(className, "will-change-transform")}
          onClick={onClick}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CustomCursorProps {
  containerRef: RefObject<HTMLDivElement>;
  onClickLeft: () => void;
  onClickRight: () => void;
}

interface MousePosition {
  x: number;
  y: number;
}

const CustomCursor: React.FC<CustomCursorProps> = ({
  containerRef,
  onClickLeft,
  onClickRight,
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState<boolean>(false);
  const [rotation, setRotation] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ 
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        
        setIsInside(isInside);
        
        if (isInside) {
          const centerX = rect.width / 2;
          setRotation(e.clientX - rect.left < centerX);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isInside && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        if (e.clientX - rect.left < centerX) {
          onClickLeft();
        } else {
          onClickRight();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [containerRef, isInside, onClickLeft, onClickRight]);

  return (
    <AnimatePresence>
      {isInside && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute z-50 pointer-events-none"
          style={{
            left: mousePosition.x - 25,
            top: mousePosition.y - 25,
          }}
        >
          <motion.div
            className="flex items-center justify-center w-[50px] h-[50px] bg-white/20 backdrop-blur-sm text-white rounded-full"
            animate={{
              rotate: rotation ? 180 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ArrowRight size={24} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function SliderBtnGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent",
      "backdrop-blur-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-3",
      className
    )}>
      {children}
    </div>
  );
}

export function SliderBtn({
  children,
  value,
  className,
  progressBarClass,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}) {
  const { activeSlider, duration } = useContext(SliderContext);
  const isActive = activeSlider === value;

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-lg p-2",
        isActive ? "bg-white/20" : "hover:bg-white/10",
        "transition-colors duration-300",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      {isActive && (
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-white rounded-full",
            progressBarClass
          )}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.button>
  );
} 