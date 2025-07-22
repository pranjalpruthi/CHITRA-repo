"use client";

import React, { useRef, useState, useCallback, useEffect, RefObject } from "react";
import * as d3 from "d3";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChromosomeScrollbarProps {
  svgRef: RefObject<SVGSVGElement>;
  containerRef: RefObject<HTMLDivElement>;
  zoomBehaviorRef: React.MutableRefObject<any>; // Consider a more specific type for d3.ZoomBehavior
  width: number;
  height: number;
}

export const ChromosomeScrollbar = ({
  svgRef,
  containerRef,
  zoomBehaviorRef,
  width,
  // height, // height prop is not used in the component logic, can be removed if not needed for future
}: ChromosomeScrollbarProps) => {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeScroll, setActiveScroll] = useState<'left' | 'right' | null>(null);

  const EXTRA_SCROLL_SPACE = 200;

  const getThumbWidth = useCallback(() => {
    if (!containerRef.current || !svgRef.current?.getBBox) return 100; // Added check for getBBox
    try {
      const contentWidth = svgRef.current.getBBox().width;
      const viewportWidth = containerRef.current.clientWidth;
      if (viewportWidth === 0) return 100; // Avoid division by zero if container not rendered
      const totalWidth = contentWidth + EXTRA_SCROLL_SPACE;
      const ratio = viewportWidth / totalWidth;
      return Math.max(50, ratio * viewportWidth);
    } catch (error) {
      // console.warn("Error calculating thumb width (SVG BBox might not be available yet):", error);
      return 100; // Default width if BBox calculation fails
    }
  }, [containerRef, svgRef]);

  const handleThumbMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!scrollThumbRef.current) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX - scrollThumbRef.current.offsetLeft);
  }, []);

  const updateThumbPosition = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !scrollTrackRef.current || !scrollThumbRef.current) return;
    
    const svgElement = svgRef.current;
    const trackElement = scrollTrackRef.current;
    const thumbElement = scrollThumbRef.current;
    
    const transform = d3.zoomTransform(svgElement);
    let bbox;
    try {
      bbox = svgElement.getBBox();
    } catch (e) {
      return;
    }

    const totalContentWidth = bbox.width;
    const viewportWidth = containerRef.current.clientWidth;

    if (totalContentWidth <= viewportWidth) {
      setScrollLeft(0);
      thumbElement.style.width = `${trackElement.clientWidth}px`;
      return;
    }

    const currentScrollX = Math.max(0, -transform.x);
    const scrollableContentWidth = totalContentWidth - viewportWidth;
    
    const scrollRatio = scrollableContentWidth > 0 ? currentScrollX / scrollableContentWidth : 0;
    
    const trackWidth = trackElement.clientWidth;
    const thumbWidth = getThumbWidth();
    
    if (thumbElement.style.width !== `${thumbWidth}px`) {
       thumbElement.style.width = `${thumbWidth}px`;
    }

    const thumbScrollableRange = trackWidth - thumbWidth;
    const newThumbLeft = scrollRatio * thumbScrollableRange;
    
    setScrollLeft(Math.max(0, Math.min(newThumbLeft, thumbScrollableRange)));
  }, [svgRef, containerRef, getThumbWidth]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svgRef.current);
    const panAmount = 50;
    const newX = currentTransform.x + (direction === 'left' ? panAmount : -panAmount);
    
    const newTransform = d3.zoomIdentity
      .translate(newX, currentTransform.y)
      .scale(currentTransform.k);

    svg.transition()
      .duration(50)
      .ease(d3.easeLinear)
      .call(zoomBehaviorRef.current.transform, newTransform)
      .on("end", () => {
        // Ensure final position is synced
        updateThumbPosition();
      });
  }, [svgRef, zoomBehaviorRef, updateThumbPosition]);

  const startContinuousScroll = (direction: 'left' | 'right') => {
    setActiveScroll(direction);
    stopContinuousScroll(); // Clear any existing interval
    handleScroll(direction); // Initial scroll
    scrollIntervalRef.current = setInterval(() => {
      handleScroll(direction);
    }, 50); // Scroll every 50ms
  };

  const stopContinuousScroll = () => {
    setActiveScroll(null);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !scrollTrackRef.current || !scrollThumbRef.current || !svgRef.current || !containerRef.current || !zoomBehaviorRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const trackRect = scrollTrackRef.current.getBoundingClientRect();
    const thumbWidth = scrollThumbRef.current.clientWidth;
    const x = clientX - trackRect.left - startX;

    const boundedX = Math.max(0, Math.min(x, trackRect.width - thumbWidth));

    const scrollRange = trackRect.width - thumbWidth;
    const scrollRatio = scrollRange > 0 ? boundedX / scrollRange : 0;

    const currentTransform = d3.zoomTransform(svgRef.current);
    let bbox;
    try {
      bbox = svgRef.current.getBBox();
    } catch (error) {
      return;
    }
    const totalContentWidth = bbox.width;
    
    const viewportWidth = containerRef.current.clientWidth;
    const scrollableWidth = totalContentWidth - viewportWidth;
    const newTranslateX = -scrollRatio * scrollableWidth;

    const newTransform = d3.zoomIdentity
      .translate(newTranslateX, currentTransform.y)
      .scale(currentTransform.k);

    d3.select(svgRef.current)
      .call(zoomBehaviorRef.current.transform, newTransform);

    setScrollLeft(boundedX);
  }, [isDragging, startX, zoomBehaviorRef, svgRef, containerRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

   useEffect(() => {
    if (!zoomBehaviorRef.current || isDragging) return;

    const zoomBehavior = zoomBehaviorRef.current;
    const eventName = "zoom.scrollbarSync";

    zoomBehavior.on(eventName, updateThumbPosition);
    updateThumbPosition(); // Initial sync

    return () => {
      zoomBehavior.on(eventName, null);
    };
  }, [zoomBehaviorRef, isDragging, updateThumbPosition]);

  return (
    <div
      className="absolute bottom-4 left-4 right-4 h-8 flex items-center gap-2 select-none"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full text-white backdrop-blur-sm transition-colors",
          "bg-primary/40 border-primary/50 hover:bg-primary/50",
          activeScroll === 'left' && "bg-primary/70 border-primary/60"
        )}
        onMouseDown={() => startContinuousScroll('left')}
        onMouseUp={stopContinuousScroll}
        onMouseLeave={stopContinuousScroll}
        onTouchStart={() => startContinuousScroll('left')}
        onTouchEnd={stopContinuousScroll}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div
        ref={scrollTrackRef}
        className="relative w-full h-3 bg-primary/10 backdrop-blur-sm rounded-full select-none flex-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollThumbRef}
          style={{
            width: `${getThumbWidth()}px`,
            left: `${scrollLeft}px`,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
          className={cn(
            "absolute top-0 h-full rounded-full bg-primary/50",
            "cursor-grab hover:bg-primary/70 active:bg-primary transition-colors",
            "select-none touch-none",
            isDragging && "cursor-grabbing bg-primary"
          )}
          onMouseDown={handleThumbMouseDown}
          onTouchStart={handleThumbMouseDown}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full text-white backdrop-blur-sm transition-colors",
          "bg-primary/40 border-primary/50 hover:bg-primary/50",
          activeScroll === 'right' && "bg-primary/70 border-primary/60"
        )}
        onMouseDown={() => startContinuousScroll('right')}
        onMouseUp={stopContinuousScroll}
        onMouseLeave={stopContinuousScroll}
        onTouchStart={() => startContinuousScroll('right')}
        onTouchEnd={stopContinuousScroll}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
