"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react"; // Assuming you might want to type the icon prop more strictly

interface AlignmentFilterButtonProps {
  filter: 'all' | 'forward' | 'reverse';
  currentFilter: 'all' | 'forward' | 'reverse';
  onClick: (filter: 'all' | 'forward' | 'reverse') => void;
  icon: LucideIcon | React.ElementType; // Allow for Lucide icons or other React components
  label: string;
}

export const AlignmentFilterButton = ({ 
  filter, 
  currentFilter, 
  onClick, 
  icon: Icon, 
  label 
}: AlignmentFilterButtonProps) => {
  const getColorClasses = (type: 'all' | 'forward' | 'reverse') => {
    switch(type) {
      case 'forward':
        return {
          active: 'border-blue-500 text-blue-500',
          hover: 'hover:border-blue-500/50 hover:text-blue-500'
        };
      case 'reverse':
        return {
          active: 'border-red-500 text-red-500',
          hover: 'hover:border-red-500/50 hover:text-red-500'
        };
      default: // 'all'
        return {
          active: 'border-primary text-primary',
          hover: 'hover:border-primary/50 hover:text-primary'
        };
    }
  };

  const colors = getColorClasses(filter);

  return (
    <button
      onClick={() => onClick(filter)}
      className={cn(
        'group relative inline-flex h-7 items-center justify-center overflow-hidden rounded-md px-3',
        'bg-background border transition-all duration-200',
        filter === currentFilter 
          ? colors.active
          : 'border-border ' + colors.hover + ' text-muted-foreground'
      )}
    >
      <div className="inline-flex items-center whitespace-nowrap">
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </div>
    </button>
  );
};
