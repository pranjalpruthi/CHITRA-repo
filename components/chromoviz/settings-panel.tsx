"use client";

import { Settings2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface SettingsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customSpeciesColors: Map<string, string>;
  onSpeciesColorChange: (species: string, color: string) => void;
  speciesData: { species_name: string }[];
}

export function SettingsPanel({ 
  isOpen, 
  onOpenChange,
  customSpeciesColors,
  onSpeciesColorChange,
  speciesData
}: SettingsPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Species Colors</SheetTitle>
        </SheetHeader>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Customize Colors</span>
            <Badge variant="secondary" className="text-[10px]">
              Beta
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {Array.from(new Set(speciesData.map(d => d.species_name))).map(species => (
            <div key={species} className="flex items-center justify-between gap-2">
              <Label className="text-sm">{species}</Label>
              <input
                type="color"
                value={customSpeciesColors.get(species) || '#000000'}
                onChange={(e) => onSpeciesColorChange(species, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}