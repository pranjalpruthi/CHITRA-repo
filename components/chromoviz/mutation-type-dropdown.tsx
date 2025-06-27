"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Circle, ArrowRight } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { SyntenyData } from "@/app/types";
import { MutationType, MUTATION_COLORS } from "@/components/chromoviz/synteny-ribbon";
import { cn } from "@/lib/utils";

const MarqueeText = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setShouldAnimate(textRef.current.offsetWidth > containerRef.current.offsetWidth);
    }
  }, [text]);

  if (!shouldAnimate) {
    return <span>{text}</span>;
  }

  return (
    <div 
      ref={containerRef} 
      className="overflow-hidden relative w-[40px]"
      onMouseEnter={() => setShouldAnimate(true)}
      onMouseLeave={() => setShouldAnimate(false)}
    >
      <motion.div
        ref={textRef}
        animate={shouldAnimate ? {
          x: [-10, -((textRef.current?.offsetWidth || 0) + 10)],
        } : { x: 0 }}
        transition={shouldAnimate ? {
          duration: Math.max(2, ((textRef.current?.offsetWidth || 0) / 50)),
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
          repeatDelay: 0.5,
        } : undefined}
        className="whitespace-nowrap"
      >
        {text}
      </motion.div>
    </div>
  );
};

interface MutationTypeDropdownProps {
  selectedSynteny: SyntenyData[];
  selectedMutationTypes: Map<string, MutationType>;
  onMutationTypeSelect: (syntenyId: string, mutationType?: MutationType) => void; // Allow undefined for 'None'
  customSpeciesColors?: Map<string, string>; // This prop is passed but not used directly here. Consider if it's needed.
}

export const MutationTypeDropdown = React.memo(({
  selectedSynteny,
  selectedMutationTypes,
  onMutationTypeSelect,
}: MutationTypeDropdownProps) => {
  const handleMutationTypeSelect = useCallback((syntenyId: string, type?: MutationType) => {
    requestAnimationFrame(() => {
      onMutationTypeSelect(syntenyId, type);
    });
  }, [onMutationTypeSelect]);

  const formatPosition = (pos: number) => {
    if (pos >= 1000000) {
      return `${(pos / 1000000).toFixed(1)}Mb`;
    } else if (pos >= 1000) {
      return `${(pos / 1000).toFixed(1)}kb`;
    }
    return `${pos}bp`;
  };

  const getSyntenyLabel = (link: SyntenyData) => {
    const refPos = formatPosition(link.ref_start);
    const queryPos = formatPosition(link.query_start);
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs font-medium">
            <div className="flex items-center gap-1 bg-blue-50 rounded-full px-1.5 py-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-[8px] text-blue-700 uppercase tracking-wide">R</span>
            </div>
            {link.ref_chr}
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1 bg-purple-50 rounded-full px-1.5 py-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span className="text-[8px] text-purple-700 uppercase tracking-wide">Q</span>
            </div>
            {link.query_chr}
          </div>
          <Badge variant="secondary" className="h-4 text-[10px] px-1 font-normal overflow-hidden">
            <MarqueeText text={link.query_name || 'Species 2'} />
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="text-[10px] text-muted-foreground">
            {refPos} - {queryPos}
          </div>
          <div className="text-[10px] text-muted-foreground">
            ({link.query_strand === '+' ? 'Forward' : 'Reverse'})
          </div>
        </div>
      </div>
    );
  };

  if (selectedSynteny.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-7 gap-2"
        >
          <div className="flex items-center gap-1.5">
            <Circle className="h-3 w-3" />
            <span className="hidden md:inline">Color Tags</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Mutation Types</span>
          <span className="text-xs text-muted-foreground">
            {selectedSynteny.length} selected
          </span>
        </DropdownMenuLabel>
        <div className="max-h-[300px] overflow-y-auto">
          {selectedSynteny.map(link => {
            const syntenyId = `${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}`;
            const currentType = selectedMutationTypes.get(syntenyId);
            
            return (
              <DropdownMenuItem 
                key={syntenyId} 
                className="flex items-center gap-2 py-2"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex-1">
                  {getSyntenyLabel(link)}
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 gap-1.5"
                      >
                        <div 
                          className="h-2.5 w-2.5 rounded-full" 
                          style={{ 
                            backgroundColor: currentType ? MUTATION_COLORS[currentType] : 'currentColor',
                            opacity: currentType ? 1 : 0.5
                          }} 
                        />
                        <span className="text-xs min-w-[50px]">{currentType || 'None'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      side="right" 
                      align="start"
                      className="max-h-[200px] overflow-y-auto"
                    >
                      <DropdownMenuItem 
                        onClick={() => handleMutationTypeSelect(syntenyId, undefined)}
                        className="gap-2"
                      >
                        <div className="h-2.5 w-2.5 rounded-full opacity-50 border" />
                        None
                      </DropdownMenuItem>
                      {Object.entries(MUTATION_COLORS).map(([type, color]) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => handleMutationTypeSelect(syntenyId, type as MutationType)}
                          className="gap-2"
                        >
                          <div 
                            className="h-2.5 w-2.5 rounded-full" 
                            style={{ backgroundColor: color }} 
                          />
                          {type}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

MutationTypeDropdown.displayName = 'MutationTypeDropdown';
