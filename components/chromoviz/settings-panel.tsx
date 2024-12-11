"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CHROMOSOME_CONFIG,
  GENE_ANNOTATION_CONFIG,
  OPTIMIZATION_CONFIG,
} from "@/config/chromoviz.config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const menuCategories = [
  { 
    label: "Chromosome", 
    slug: "chromosome", 
    menuWidth: 320, 
    menuHeight: 240 
  },
  {
    label: "Annotations",
    slug: "annotations",
    menuWidth: 320,
    menuHeight: 320,
  },
  { 
    label: "Performance", 
    slug: "performance", 
    menuWidth: 320, 
    menuHeight: 240 
  },
] as const;

interface SettingsPanelProps {
  config: {
    chromosomeHeight: number;
    chromosomeSpacing: number;
    annotationHeight: number;
    annotationSpacing: number;
    maxTracks: number;
    minVisibleSize: number;
    maxVisibleGenes: number;
    clusteringThreshold: number;
    showAnnotations: boolean;
    geneColors: {
      forward: string;
      reverse: string;
    };
  };
  onConfigChange: (newConfig: Partial<SettingsPanelProps["config"]>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function ChromosomeSettings({ 
  config, 
  onChange 
}: { 
  config: SettingsPanelProps["config"];
  onChange: (key: keyof SettingsPanelProps["config"]) => (value: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Height ({config.chromosomeHeight}px)</Label>
        <Slider
          value={[config.chromosomeHeight]}
          min={12}
          max={48}
          step={2}
          defaultValue={[CHROMOSOME_CONFIG.HEIGHT]}
          onValueChange={v => onChange("chromosomeHeight")(v[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Spacing ({config.chromosomeSpacing}px)</Label>
        <Slider
          value={[config.chromosomeSpacing]}
          min={5}
          max={30}
          step={1}
          defaultValue={[CHROMOSOME_CONFIG.SPACING]}
          onValueChange={v => onChange("chromosomeSpacing")(v[0])}
        />
      </div>
    </div>
  );
}

function AnnotationSettings({ 
  config, 
  onNumberChange,
  onColorChange,
  onToggleChange,
}: { 
  config: SettingsPanelProps["config"];
  onNumberChange: (key: keyof SettingsPanelProps["config"]) => (value: number) => void;
  onColorChange: (key: string) => (color: string) => void;
  onToggleChange: (key: keyof SettingsPanelProps["config"]) => (value: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">Show Annotations</Label>
        <Switch
          checked={config.showAnnotations}
          onCheckedChange={value => onToggleChange("showAnnotations")(value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Height ({config.annotationHeight}px)</Label>
        <Slider
          value={[config.annotationHeight]}
          min={4}
          max={16}
          step={1}
          defaultValue={[GENE_ANNOTATION_CONFIG.HEIGHT]}
          onValueChange={v => onNumberChange("annotationHeight")(v[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Spacing ({config.annotationSpacing}px)</Label>
        <Slider
          value={[config.annotationSpacing]}
          min={1}
          max={8}
          step={1}
          defaultValue={[GENE_ANNOTATION_CONFIG.SPACING]}
          onValueChange={v => onNumberChange("annotationSpacing")(v[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Max Tracks ({config.maxTracks})</Label>
        <Slider
          value={[config.maxTracks]}
          min={1}
          max={10}
          step={1}
          defaultValue={[GENE_ANNOTATION_CONFIG.MAX_TRACKS]}
          onValueChange={v => onNumberChange("maxTracks")(v[0])}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Forward Color</Label>
          <input
            type="color"
            value={config.geneColors.forward}
            onChange={e => onColorChange("forward")(e.target.value)}
            className="w-full h-8 rounded-md cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Reverse Color</Label>
          <input
            type="color"
            value={config.geneColors.reverse}
            onChange={e => onColorChange("reverse")(e.target.value)}
            className="w-full h-8 rounded-md cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function PerformanceSettings({ 
  config, 
  onChange 
}: { 
  config: SettingsPanelProps["config"];
  onChange: (key: keyof SettingsPanelProps["config"]) => (value: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Min Visible Size ({config.minVisibleSize}px)</Label>
        <Slider
          value={[config.minVisibleSize]}
          min={0.5}
          max={5}
          step={0.5}
          defaultValue={[OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE]}
          onValueChange={v => onChange("minVisibleSize")(v[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Max Visible Genes ({config.maxVisibleGenes})</Label>
        <Slider
          value={[config.maxVisibleGenes]}
          min={1000}
          max={20000}
          step={1000}
          defaultValue={[OPTIMIZATION_CONFIG.MAX_VISIBLE_GENES]}
          onValueChange={v => onChange("maxVisibleGenes")(v[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Clustering Threshold ({config.clusteringThreshold})</Label>
        <Slider
          value={[config.clusteringThreshold]}
          min={0}
          max={10}
          step={0.5}
          defaultValue={[OPTIMIZATION_CONFIG.CLUSTERING_THRESHOLD]}
          onValueChange={v => onChange("clusteringThreshold")(v[0])}
        />
      </div>
    </div>
  );
}

export function SettingsPanel({ 
  config, 
  onConfigChange, 
  isOpen, 
  onOpenChange 
}: SettingsPanelProps) {
  const [subMenuSelected, setSubMenuSelected] = useState("chromosome");
  const [hasChanges, setHasChanges] = useState(false);

  const handleNumberChange = (key: keyof SettingsPanelProps["config"]) => (value: number) => {
    setHasChanges(true);
    onConfigChange({ [key]: value });
  };

  const handleColorChange = (key: string) => (color: string) => {
    setHasChanges(true);
    onConfigChange({
      geneColors: {
        ...config.geneColors,
        [key]: color,
      },
    });
  };

  const handleToggleChange = (key: keyof SettingsPanelProps["config"]) => (value: boolean) => {
    setHasChanges(true);
    onConfigChange({ [key]: value });
  };

  const handleApplyChanges = () => {
    onOpenChange(false);
    setHasChanges(false);
  };

  const handleResetToDefaults = () => {
    onConfigChange({
      chromosomeHeight: CHROMOSOME_CONFIG.HEIGHT,
      chromosomeSpacing: CHROMOSOME_CONFIG.SPACING,
      annotationHeight: GENE_ANNOTATION_CONFIG.HEIGHT,
      annotationSpacing: GENE_ANNOTATION_CONFIG.SPACING,
      maxTracks: GENE_ANNOTATION_CONFIG.MAX_TRACKS,
      minVisibleSize: OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE,
      maxVisibleGenes: OPTIMIZATION_CONFIG.MAX_VISIBLE_GENES,
      clusteringThreshold: OPTIMIZATION_CONFIG.CLUSTERING_THRESHOLD,
      showAnnotations: true,
      geneColors: {
        forward: GENE_ANNOTATION_CONFIG.COLORS.FORWARD,
        reverse: GENE_ANNOTATION_CONFIG.COLORS.REVERSE,
      },
    });
    setHasChanges(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background/95 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Settings</span>
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

        <NavigationMenu
          setSubMenuSelected={setSubMenuSelected}
          subMenuSelected={subMenuSelected}
        />

        <div className="mt-4 space-y-6">
          {subMenuSelected === "chromosome" && (
            <ChromosomeSettings
              config={config}
              onChange={handleNumberChange}
            />
          )}
          {subMenuSelected === "annotations" && (
            <AnnotationSettings
              config={config}
              onNumberChange={handleNumberChange}
              onColorChange={handleColorChange}
              onToggleChange={handleToggleChange}
            />
          )}
          {subMenuSelected === "performance" && (
            <PerformanceSettings
              config={config}
              onChange={handleNumberChange}
            />
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefaults}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset to Defaults
            </Button>
            {hasChanges && (
              <Button
                onClick={handleApplyChanges}
                size="sm"
              >
                Apply Changes
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NavigationMenu({
  setSubMenuSelected,
  subMenuSelected,
}: {
  setSubMenuSelected: (slug: string) => void;
  subMenuSelected: string;
}) {
  return (
    <nav className="flex flex-row gap-1">
      {menuCategories.map((button) => (
        <button
          key={button.slug}
          onClick={() => setSubMenuSelected(button.slug)}
          className={cn(
            "relative inline-flex w-fit transform-gpu whitespace-nowrap rounded-md px-2 py-1.5",
            "font-medium text-sm transition-colors duration-300",
            "hover:text-foreground",
            subMenuSelected === button.slug ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="relative z-10">{button.label}</span>
          <AnimatePresence>
            {subMenuSelected === button.slug && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-muted rounded-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </button>
      ))}
    </nav>
  );
}