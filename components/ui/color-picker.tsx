"use client";

import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 items-center">
      <div
        className="w-8 h-8 rounded border"
        style={{ backgroundColor: color }}
      />
      <Input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-24"
      />
    </div>
  );
} 