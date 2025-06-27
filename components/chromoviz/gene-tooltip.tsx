"use client";

import React from "react";
import { GeneAnnotation } from "@/config/chromoviz.config"; // Assuming GeneAnnotation is exported from here or from app/types

interface GeneTooltipProps {
  gene: GeneAnnotation;
  x: number;
  y: number;
}

export function GeneTooltip({ gene, x, y }: GeneTooltipProps) {
  if (!gene) return null;

  return (
    <div
      className="absolute z-50 p-2 text-sm bg-background border rounded-lg shadow-lg pointer-events-none"
      style={{
        left: x + 10,
        top: y - 10,
        maxWidth: '300px',
        // Ensure tooltip doesn't go off-screen, basic example:
        transform: y < 150 ? 'translateY(20px)' : 'translateY(-100%)', 
      }}
    >
      <div className="font-medium">{gene.symbol || gene.locusTag || 'Unknown gene'}</div>
      <div className="text-xs text-muted-foreground">
        {gene.name && <div>{gene.name}</div>}
        <div>
          {gene.chromosome}:{gene.start.toLocaleString()}-{gene.end.toLocaleString()}
        </div>
        <div>Strand: {gene.strand}</div>
        <div>Type: {gene.class}</div>
      </div>
    </div>
  );
}
