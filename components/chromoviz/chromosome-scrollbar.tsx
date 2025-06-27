"use client";

import React, { useRef, useState, useCallback, useEffect, RefObject } from "react";
import * as d3 from "d3";
import { cn } from "@/lib/utils";

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

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!scrollThumbRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX - scrollThumbRef.current.offsetLeft);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollTrackRef.current || !scrollThumbRef.current || !svgRef.current || !containerRef.current || !zoomBehaviorRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const trackRect = scrollTrackRef.current.getBoundingClientRect();
    const thumbWidth = scrollThumbRef.current.clientWidth;
    const x = e.clientX - trackRect.left - startX;

    const boundedX = Math.max(-EXTRA_SCROLL_SPACE, Math.min(x, trackRect.width - thumbWidth));

    const scrollRange = trackRect.width - thumbWidth + EXTRA_SCROLL_SPACE;
    const scrollRatio = scrollRange > 0 ? (boundedX + EXTRA_SCROLL_SPACE) / scrollRange : 0;

    const currentTransform = d3.zoomTransform(svgRef.current);
    const bbox = svgRef.current.getBBox();
    const totalContentWidth = bbox.width + EXTRA_SCROLL_SPACE;
    
    // Use containerRef.current.clientWidth for the viewport width
    const viewportWidth = containerRef.current.clientWidth;
    const newTranslateX = -scrollRatio * (totalContentWidth - viewportWidth); // Adjusted to use viewportWidth

    const newTransform = d3.zoomIdentity
      .translate(newTranslateX, currentTransform.y)
      .scale(currentTransform.k);

    d3.select(svgRef.current)
      .call(zoomBehaviorRef.current.transform, newTransform);

    setScrollLeft(boundedX);
  }, [isDragging, startX, zoomBehaviorRef, svgRef, containerRef]); // Removed width prop dependency

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Effect to update scrollbar thumb when SVG transform changes from other sources
   useEffect(() => {
    if (!svgRef.current || !containerRef.current || !scrollTrackRef.current || !scrollThumbRef.current || isDragging || !zoomBehaviorRef.current?.on) return;

    const svgElement = svgRef.current;
    const trackElement = scrollTrackRef.current;
    const thumbElement = scrollThumbRef.current;

    const updateThumbPositionFromTransform = () => {
      if (!svgRef.current || !containerRef.current || !trackElement || !thumbElement) return;
      
      const transform = d3.zoomTransform(svgElement);
      let bbox;
      try {
        bbox = svgElement.getBBox();
      } catch (e) {
        // console.warn("BBox not available for thumb update");
        return;
      }

      const totalContentWidth = bbox.width + EXTRA_SCROLL_SPACE;
      const viewportWidth = containerRef.current.clientWidth;

      if (totalContentWidth <= viewportWidth) {
        setScrollLeft(0);
        return;
      }

      const currentScrollX = Math.max(0, -transform.x); // Content scrolled left
      const scrollableContentWidth = totalContentWidth - viewportWidth;
      
      const scrollRatio = scrollableContentWidth > 0 ? currentScrollX / scrollableContentWidth : 0;
      
      const trackWidth = trackElement.clientWidth;
      const thumbWidth = getThumbWidth(); // Recalculate thumb width as it might change
      
      // Ensure thumbWidth is correctly reflected if it changed
      if (thumbElement.style.width !== `${thumbWidth}px`) {
         thumbElement.style.width = `${thumbWidth}px`;
      }

      const thumbScrollableRange = trackWidth - thumbWidth;
      const newThumbLeft = scrollRatio * thumbScrollableRange;
      
      setScrollLeft(Math.max(0, Math.min(newThumbLeft, thumbScrollableRange)));
    };
    
    // Listen to zoom events on the main SVG to sync scrollbar
    const zoomBehavior = zoomBehaviorRef.current;
    const eventName = "zoom.scrollbarSync";

    zoomBehavior.on(eventName, updateThumbPositionFromTransform);
    updateThumbPositionFromTransform(); // Initial sync

    return () => {
      zoomBehavior.on(eventName, null); // Clean up listener
    };
  }, [svgRef, containerRef, zoomBehaviorRef, isDragging, getThumbWidth, width]); // Added width as it affects overall layout

  return (
    <div
      className="absolute bottom-4 left-4 right-4 h-6 select-none"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={scrollTrackRef}
        className="relative w-full h-2 bg-muted rounded-full select-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollThumbRef}
          style={{
            width: `${getThumbWidth()}px`,
            left: `${scrollLeft}px`, // Ensure 'px' unit
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
          className={cn(
            "absolute top-0 h-full rounded-full bg-primary/50",
            "cursor-grab hover:bg-primary/70 transition-colors",
            "select-none touch-none",
            isDragging && "cursor-grabbing bg-primary"
          )}
          onMouseDown={handleThumbMouseDown}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
};
