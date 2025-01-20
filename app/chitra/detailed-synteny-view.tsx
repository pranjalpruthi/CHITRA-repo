'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { SyntenyData, ChromosomeData } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Info, 
  Minimize2, 
  Maximize2, 
  Settings, 
  Save, 
  Lock, 
  Unlock, 
  MoreVertical, 
  Image, 
  X, 
  FileType 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { HoverTooltip, GENE_ANNOTATION_CONFIG as TOOLTIP_GENE_CONFIG } from "@/components/chromoviz/tooltip";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

// Add configuration types
interface SyntenyViewConfig {
  visual: {
    ribbonOpacity: number;
    blockOpacity: number;
    trackWidth: number;
    gapAngle: number;
    colors: {
      reference: string;
      query: string;
      forwardStrand: string;
      reverseStrand: string;
    };
  };
  annotations: {
    show: boolean;
    height: number;
    spacing: number;
    colors: typeof TOOLTIP_GENE_CONFIG.COLORS;
  };
  scale: {
    showTicks: boolean;
    tickCount: number;
    tickLength: number;
    showLabels: boolean;
  };
  interaction: {
    enableZoom: boolean;
    zoomExtent: [number, number];
    showTooltips: boolean;
  };
  markers: {
    tickLength: number;
    textOffset: number;
    fontSize: number;
    strokeWidth: number;
    markerRadius: number;
    dashPattern: [number, number];
    colors: {
      reference: string;
      query: string;
    };
  };
}

interface DetailedSyntenyViewProps {
  selectedBlock: SyntenyData;
  referenceData: ChromosomeData[];
  onBlockClick: (block: SyntenyData) => void;
  selectedSynteny: SyntenyData[];
  onToggleSelection: (block: SyntenyData) => void;
  isFullscreen?: boolean;
  onFullscreen?: (isFullscreen: boolean) => void;
  config?: Partial<SyntenyViewConfig>;
  onConfigChange?: (config: SyntenyViewConfig) => void;
  showTooltips?: boolean;
}

const defaultConfig: SyntenyViewConfig = {
  visual: {
    ribbonOpacity: 0.6,
    blockOpacity: 0.8,
    trackWidth: 0.15,
    gapAngle: 0.1,
    colors: {
      reference: '#e6effd',
      query: '#f5ebff',
      forwardStrand: '#3b82f6',
      reverseStrand: '#ef4444',
    },
  },
  annotations: {
    show: true,
    height: 8,
    spacing: 2,
    colors: TOOLTIP_GENE_CONFIG.COLORS,
  },
  scale: {
    showTicks: true,
    tickCount: 10,
    tickLength: 5,
    showLabels: true,
  },
  interaction: {
    enableZoom: true,
    zoomExtent: [0.5, 5],
    showTooltips: true,
  },
  markers: {
    tickLength: 20,
    textOffset: 30,
    fontSize: 10,
    strokeWidth: 1,
    markerRadius: 2,
    dashPattern: [2, 2],
    colors: {
      reference: '#3b82f6',
      query: '#8b5cf6'
    }
  }
};

export function DetailedSyntenyView({
  selectedBlock,
  referenceData,
  onBlockClick,
  selectedSynteny,
  onToggleSelection,
  isFullscreen = false,
  onFullscreen,
  config: userConfig,
  onConfigChange,
  showTooltips = true,
}: DetailedSyntenyViewProps & {
  onConfigChange?: (config: SyntenyViewConfig) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<SyntenyData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredChromosome, setHoveredChromosome] = useState<{
    size: number;
    isRef: boolean;
    position?: number;
    gene?: any;
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<SyntenyViewConfig>({ ...defaultConfig, ...userConfig });
  const [isGraphFixed, setIsGraphFixed] = useState(false);
  const [viewBoxDimensions, setViewBoxDimensions] = useState({ width: 1400, height: 1400 });

  // Add fullscreen handling
  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
        onFullscreen?.(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        onFullscreen?.(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onFullscreen?.(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreen]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentZoom = d3.zoomTransform(svg.node() as any);
    svg.transition()
      .duration(750)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        currentZoom.scale(currentZoom.k * 1.2)
      );
    setZoom(currentZoom.k * 1.2);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentZoom = d3.zoomTransform(svg.node() as any);
    svg.transition()
      .duration(750)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        currentZoom.scale(currentZoom.k * 0.8)
      );
    setZoom(currentZoom.k * 0.8);
  };

  const handleReset = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(750)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      );
    setZoom(1);
  };

  // Replace the existing handleSaveAsSVG function with these new export functions
  const handleExportImage = useCallback(async (format: 'png' | 'jpg') => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const clone = svgElement.cloneNode(true) as SVGSVGElement;
      const bbox = svgElement.getBBox();
      
      // Add padding (50px on each side)
      const padding = 50;
      const totalWidth = bbox.width + (padding * 2);
      const totalHeight = bbox.height + (padding * 2) + 30; // Extra 30px for credits
      
      // Check dark mode once at the beginning
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Update clone dimensions with padding
      clone.setAttribute('width', `${totalWidth}`);
      clone.setAttribute('height', `${totalHeight}`);
      clone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${totalWidth} ${totalHeight}`);
      
      // Add styles with dark mode consideration
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        ${isDarkMode ? `
          text, .text-foreground, .chromosome-label { 
            fill: #ffffff !important;
            color: #ffffff !important;
          }
          .text-muted-foreground {
            fill: #a1a1aa !important;
            color: #a1a1aa !important;
          }
        ` : ''}
      `;
      clone.insertBefore(styleElement, clone.firstChild);

      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([
        '<?xml version="1.0" standalone="no"?>\r\n',
        svgData
      ], { type: 'image/svg+xml;charset=utf-8' });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      const scale2x = 2;
      canvas.width = totalWidth * scale2x;
      canvas.height = totalHeight * scale2x;
      
      // Use the same isDarkMode value for background
      ctx.fillStyle = isDarkMode ? '#020817' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const url = URL.createObjectURL(svgBlob);
      const img = document.createElement('img') as HTMLImageElement;
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.scale(scale2x, scale2x);
          ctx.drawImage(img, 0, 0, totalWidth, totalHeight);
          
          // Add credits
          ctx.scale(0.5, 0.5);
          ctx.fillStyle = isDarkMode ? '#a1a1aa' : '#94a3b8';
          ctx.font = '24px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('© 2025 CHITRA', totalWidth * 2 - 20, totalHeight * 2 - 20);
          
          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
          const quality = format === 'png' ? 1 : 0.95;
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `chromoviz-synteny-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(downloadLink.href);
            URL.revokeObjectURL(url);
            resolve(true);
          }, mimeType, quality);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  }, [svgRef]);

  const handleSaveAsSVG = useCallback(() => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    const bbox = svgElement.getBBox();
    
    // Add padding (50px on each side)
    const padding = 50;
    const totalWidth = bbox.width + (padding * 2);
    const totalHeight = bbox.height + (padding * 2) + 30; // Extra 30px for credits
    
    // Check dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Update clone dimensions with padding
    clone.setAttribute('width', `${totalWidth}`);
    clone.setAttribute('height', `${totalHeight}`);
    clone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${totalWidth} ${totalHeight}`);
    
    // Add styles for dark mode
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      ${isDarkMode ? `
        text, .text-foreground, .chromosome-label { 
          fill: #ffffff !important;
          color: #ffffff !important;
        }
        .text-muted-foreground {
          fill: #a1a1aa !important;
          color: #a1a1aa !important;
        }
      ` : ''}
    `;
    clone.insertBefore(styleElement, clone.firstChild);

    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([
      '<?xml version="1.0" standalone="no"?>\r\n',
      svgData
    ], { type: 'image/svg+xml;charset=utf-8' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(svgBlob);
    downloadLink.download = `chromoviz-synteny-${new Date().toISOString().split('T')[0]}.svg`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(downloadLink.href);
  }, [svgRef]);

  const refChromosome = selectedBlock ? referenceData.find(d => 
    d.species_name === selectedBlock.ref_species && d.chr_id === selectedBlock.ref_chr
  ) : null;

  const queryChromosome = selectedBlock ? referenceData.find(d => 
    d.species_name === selectedBlock.query_name && d.chr_id === selectedBlock.query_chr
  ) : null;

  // Add resize observer to update viewBox
  useEffect(() => {
    if (!containerRef.current) return;

    const updateViewBox = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      setViewBoxDimensions({
        width: rect.width,
        height: rect.height
      });
    };

    // Initial update
    updateViewBox();

    // Create resize observer
    const resizeObserver = new ResizeObserver(updateViewBox);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update SVG rendering code to use new dimensions
  useEffect(() => {
    if (!svgRef.current || !selectedBlock) return;

    const zoomBehavior = d3.zoom()
      .scaleExtent(config.interaction.zoomExtent)
      .on('zoom', (event) => {
        if (!svgRef.current) return;
        const g = d3.select(svgRef.current).select('g');
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Only apply zoom behavior if graph is not fixed
    if (!isGraphFixed) {
      svg.call(zoomBehavior as any);
    }

    // Helper function to format base pairs
    const formatBase = (value: number) => {
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}Mb`;
      } else if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}kb`;
      }
      return `${value}bp`;
    };

    const width = viewBoxDimensions.width;
    const height = viewBoxDimensions.height;
    const margin = { 
      top: height * 0.07,    // 7% of height
      right: width * 0.07,   // 7% of width
      bottom: height * 0.07, // 7% of height
      left: width * 0.07     // 7% of width
    };
    
    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    // Create layers
    const ribbonLayer = g.append('g').attr('class', 'ribbon-layer');
    const chromosomeLayer = g.append('g').attr('class', 'chromosome-layer');
    const syntenyLayer = g.append('g').attr('class', 'synteny-layer');
    const labelLayer = g.append('g').attr('class', 'label-layer');

    // Dimensions
    const radius = Math.min(width, height) * 0.3;
    const innerRadius = radius * 0.8;
    const trackWidth = radius * config.visual.trackWidth;
    const gapAngle = Math.PI * config.visual.gapAngle;

    if (!refChromosome || !queryChromosome) return;

    // Calculate the relative sizes and adjust track width
    const maxChrSize = Math.max(refChromosome.chr_size_bp, queryChromosome.chr_size_bp);
    const refRelativeSize = refChromosome.chr_size_bp / maxChrSize;
    const queryRelativeSize = queryChromosome.chr_size_bp / maxChrSize;

    // Adjust arc angles based on relative sizes
    const refArcLength = Math.PI - (2 * gapAngle);
    const queryArcLength = Math.PI - (2 * gapAngle);

    // Create scales with adjusted ranges
    const refScale = d3.scaleLinear()
      .domain([0, refChromosome.chr_size_bp])
      .range([gapAngle, gapAngle + (refArcLength * refRelativeSize)]);

    const queryScale = d3.scaleLinear()
      .domain([0, queryChromosome.chr_size_bp])
      .range([Math.PI + gapAngle, Math.PI + gapAngle + (queryArcLength * queryRelativeSize)]);

    // Update arc definitions with new angles
    const refArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius + trackWidth)
      .startAngle(gapAngle)
      .endAngle(gapAngle + (refArcLength * refRelativeSize));

    const queryArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius + trackWidth)
      .startAngle(Math.PI + gapAngle)
      .endAngle(Math.PI + gapAngle + (queryArcLength * queryRelativeSize));

    chromosomeLayer.append('path')
      .attr('d', refArc({} as any) as string)
        .attr('fill', config.visual.colors.reference)
        .attr('stroke', '#d1d5db')
        .attr('cursor', 'pointer')
        .on('mousemove', (event) => {
          const [x, y] = d3.pointer(event);
          const angle = Math.atan2(y, x) + Math.PI / 2;
          const position = refScale.invert(angle);
          setHoveredChromosome({
            size: refChromosome.chr_size_bp,
            isRef: true,
            position: Math.round(position)
          });
          setHoveredBlock(selectedBlock);
        })
        .on('mouseleave', () => {
          setHoveredChromosome(null);
          setHoveredBlock(null);
        });

    // Add reference label
    const refEndAngle = gapAngle + (refArcLength * refRelativeSize);
    const refMidAngle = gapAngle + (refArcLength * refRelativeSize / 2);
    const refLabelX = (innerRadius + trackWidth + 80) * Math.cos(refMidAngle - Math.PI/2);
    const refLabelY = (innerRadius + trackWidth + 80) * Math.sin(refMidAngle - Math.PI/2);
    
    chromosomeLayer.append('text')
      .attr('class', 'chromosome-label')
      .attr('transform', `translate(${refLabelX}, ${refLabelY})`)
      .attr('text-anchor', refMidAngle > Math.PI ? 'end' : 'start')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'currentColor')
      .attr('font-size', '14px')
      .text(`Reference: ${refChromosome.species_name} ${refChromosome.chr_id}`);

    chromosomeLayer.append('path')
      .attr('d', queryArc({} as any) as string)
      .attr('fill', config.visual.colors.query)
      .attr('stroke', '#d1d5db')
      .attr('cursor', 'pointer')
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event);
        const angle = Math.atan2(y, x) + Math.PI / 2;
        const position = queryScale.invert(angle);
        setHoveredChromosome({
          size: queryChromosome.chr_size_bp,
          isRef: false,
          position: Math.round(position)
        });
        setHoveredBlock(selectedBlock);
      })
      .on('mouseleave', () => {
        setHoveredChromosome(null);
        setHoveredBlock(null);
      });

    // Add query label
    const queryStartAngle = Math.PI + gapAngle;
    const queryMidAngle = queryStartAngle + (queryArcLength * queryRelativeSize / 2);
    const queryLabelX = (innerRadius + trackWidth + 80) * Math.cos(queryMidAngle - Math.PI/2);
    const queryLabelY = (innerRadius + trackWidth + 80) * Math.sin(queryMidAngle - Math.PI/2);
    
    chromosomeLayer.append('text')
      .attr('class', 'chromosome-label')
      .attr('transform', `translate(${queryLabelX}, ${queryLabelY})`)
      .attr('text-anchor', queryMidAngle > 2 * Math.PI || queryMidAngle < Math.PI ? 'start' : 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'currentColor')
      .attr('font-size', '14px')
      .text(`Query: ${queryChromosome.species_name} ${queryChromosome.chr_id}`);

    // Add gene annotations for reference chromosome
    if (refChromosome && refChromosome.annotations && config.annotations.show) {
      const annotationGroup = chromosomeLayer.append('g')
        .attr('class', 'ref-annotations');

      refChromosome.annotations.forEach((gene) => {
        const startAngle = refScale(gene.start);
        const endAngle = refScale(gene.end);
        
        // Create an arc for each gene annotation
        const annotationArc = d3.arc()
          .innerRadius(innerRadius + trackWidth)
          .outerRadius(innerRadius + trackWidth + config.annotations.height)
          .startAngle(startAngle)
          .endAngle(endAngle);

        annotationGroup.append('path')
          .attr('d', annotationArc({} as any) as string)
          .attr('fill', config.annotations.colors[gene.class as keyof typeof config.annotations.colors] || config.annotations.colors.default)
          .attr('cursor', 'pointer')
          .on('mouseover', (event) => {
            const [x, y] = d3.pointer(event);
            setHoveredChromosome({
              size: refChromosome.chr_size_bp,
              isRef: true,
              position: Math.round(refScale.invert(Math.atan2(y, x) + Math.PI / 2)),
              gene: gene
            });
          })
          .on('mouseleave', () => {
            setHoveredChromosome(null);
          });
      });
    }

    // Draw ribbon
    const ribbon = d3.ribbon()
      .radius(innerRadius)
      .padAngle(0.02)
      .source((d) => ({
        startAngle: refScale(selectedBlock.ref_start),
        endAngle: refScale(selectedBlock.ref_end),
        radius: innerRadius
      }))
      .target((d) => ({
        startAngle: queryScale(selectedBlock.query_start),
        endAngle: queryScale(selectedBlock.query_end),
        radius: innerRadius
      }));

    // Add ribbon with gradient
    const gradientId = `ribbon-gradient-${selectedBlock.query_strand}`;
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', config.visual.colors.forwardStrand)
      .attr('stop-opacity', 0.2);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', config.visual.colors.forwardStrand)
      .attr('stop-opacity', 0.6);

    // Create a properly typed data object for the ribbon
    const ribbonData = {
      source: {
        startAngle: refScale(selectedBlock.ref_start),
        endAngle: refScale(selectedBlock.ref_end),
        radius: innerRadius
      },
      target: {
        startAngle: queryScale(selectedBlock.query_start),
        endAngle: queryScale(selectedBlock.query_end),
        radius: innerRadius
      }
    };

    // Update the ribbon path hover interactions
    ribbonLayer.append('path')
      .datum(ribbonData)
      .attr('d', ribbon as any)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', config.visual.colors.forwardStrand)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer')
      .attr('class', 'synteny-block')
      .on('mouseenter', (event) => {
        event.stopPropagation();
        setHoveredBlock(selectedBlock);
        setHoveredChromosome(null);
      })
      .on('mouseleave', (event) => {
        event.stopPropagation();
        setHoveredBlock(null);
      });

    // Draw synteny blocks
    const blockColor = selectedBlock.query_strand === '+' ? config.visual.colors.forwardStrand : config.visual.colors.reverseStrand;
    
    // Reference block
    syntenyLayer.append('path')
      .attr('d', refArc
        .startAngle(refScale(selectedBlock.ref_start))
        .endAngle(refScale(selectedBlock.ref_end))({} as any) as string)
      .attr('fill', blockColor)
      .attr('opacity', config.visual.blockOpacity)
      .attr('cursor', 'pointer')
      .attr('class', 'synteny-block')
      .on('mouseenter', (event) => {
        event.stopPropagation();
        setHoveredBlock(selectedBlock);
        setHoveredChromosome(null);
      })
      .on('mouseleave', (event) => {
        event.stopPropagation();
        setHoveredBlock(null);
      });

    // Query block
    syntenyLayer.append('path')
      .attr('d', queryArc
        .startAngle(queryScale(selectedBlock.query_start))
        .endAngle(queryScale(selectedBlock.query_end))({} as any) as string)
      .attr('fill', blockColor)
      .attr('opacity', config.visual.blockOpacity)
      .attr('cursor', 'pointer')
      .attr('class', 'synteny-block')
      .on('mouseenter', (event) => {
        event.stopPropagation();
        setHoveredBlock(selectedBlock);
        setHoveredChromosome(null);
      })
      .on('mouseleave', (event) => {
        event.stopPropagation();
        setHoveredBlock(null);
      });

    // Add circular scale
    const addCircularScale = (isRef: boolean) => {
      const scale = isRef ? refScale : queryScale;
      const baseRadius = innerRadius + trackWidth;
      const tickCount = config.scale.tickCount;
      const chromosomeSize = isRef ? refChromosome.chr_size_bp : queryChromosome.chr_size_bp;
      
      const ticks = d3.range(0, chromosomeSize, chromosomeSize / tickCount);
      
      ticks.forEach(tick => {
        const angle = scale(tick);
        const x1 = baseRadius * Math.cos(angle - Math.PI / 2);
        const y1 = baseRadius * Math.sin(angle - Math.PI / 2);
        const x2 = (baseRadius + config.scale.tickLength) * Math.cos(angle - Math.PI / 2);
        const y2 = (baseRadius + config.scale.tickLength) * Math.sin(angle - Math.PI / 2);
        const textX = (baseRadius + config.scale.tickLength + 15) * Math.cos(angle - Math.PI / 2);
        const textY = (baseRadius + config.scale.tickLength + 15) * Math.sin(angle - Math.PI / 2);
        
        // Add tick line
        labelLayer.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1);

        // Add tick label
        if (config.scale.showLabels) {
          const formattedTick = tick >= 1000000 
            ? `${(tick / 1000000).toFixed(1)}M` 
            : tick >= 1000 
              ? `${(tick / 1000).toFixed(0)}K` 
              : tick.toString();

          labelLayer.append('text')
            .attr('x', textX)
            .attr('y', textY)
            .attr('text-anchor', angle > Math.PI ? 'end' : 'start')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '5px')
            .attr('fill', '#64748b')
            .text(formattedTick);
        }
      });
    };

    // Replace addPositionTick function with new arc-based version
    const addPositionTick = (angle: number, position: number, isRef: boolean) => {
      const tickRadius = innerRadius + trackWidth;
      const { markers } = config;
      
      labelLayer.append('line')
        .attr('x1', tickRadius * Math.cos(angle - Math.PI / 2))
        .attr('y1', tickRadius * Math.sin(angle - Math.PI / 2))
        .attr('x2', (tickRadius + markers.tickLength) * Math.cos(angle - Math.PI / 2))
        .attr('y2', (tickRadius + markers.tickLength) * Math.sin(angle - Math.PI / 2))
        .attr('stroke', isRef ? markers.colors.reference : markers.colors.query)
        .attr('stroke-width', markers.strokeWidth)
        .attr('stroke-dasharray', `${markers.dashPattern[0]},${markers.dashPattern[1]}`);

      const textX = (tickRadius + markers.textOffset) * Math.cos(angle - Math.PI / 2);
      const textY = (tickRadius + markers.textOffset) * Math.sin(angle - Math.PI / 2);
      const labelAngle = (angle * 180 / Math.PI - 90) % 360;
      const rotateAngle = labelAngle > 90 && labelAngle < 270 ? labelAngle + 180 : labelAngle;
      
      const formattedPosition = position >= 1_000_000 
        ? `${(position / 1_000_000).toFixed(1)}M`
        : position >= 1_000 
          ? `${(position / 1_000).toFixed(0)}K`
          : position.toString();
      
      labelLayer.append('text')
        .attr('x', textX)
        .attr('y', textY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('transform', `rotate(${rotateAngle}, ${textX}, ${textY})`)
        .attr('font-size', `${markers.fontSize}px`)
        .attr('font-weight', '400')
        .attr('fill', isRef ? markers.colors.reference : markers.colors.query)
        .text(formattedPosition);
        
      labelLayer.append('circle')
        .attr('cx', tickRadius * Math.cos(angle - Math.PI / 2))
        .attr('cy', tickRadius * Math.sin(angle - Math.PI / 2))
        .attr('r', markers.markerRadius)
        .attr('fill', isRef ? markers.colors.reference : markers.colors.query);
    };

    // Add circular scales
    addCircularScale(true);   // Reference
    addCircularScale(false);  // Query

    // Add position ticks with badges
    addPositionTick(refScale(selectedBlock.ref_start), selectedBlock.ref_start, true);
    addPositionTick(refScale(selectedBlock.ref_end), selectedBlock.ref_end, true);
    addPositionTick(queryScale(selectedBlock.query_start), selectedBlock.query_start, false);
    addPositionTick(queryScale(selectedBlock.query_end), selectedBlock.query_end, false);

    // Replace the size indicator text with a Glass Neumorphic Badge
    const sizeIndicator = g.append('g')
      .attr('transform', 'translate(0,0)');

    // Add background pill
    sizeIndicator.append('rect')
      .attr('x', -50)
      .attr('y', -15)
      .attr('width', 100)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('fill', 'rgba(255,255,255,0.4)')
      .attr('stroke', 'rgba(255,255,255,0.5)')
      .attr('stroke-width', 1);

    // Add text
    sizeIndicator.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '16px')
      .attr('fill', 'currentColor')
      .text(`${((selectedBlock.ref_end - selectedBlock.ref_start) / 1_000_000).toFixed(1)}Mb`);

    // Cleanup
    return () => {
      svg.on('.zoom', null); // Remove zoom behavior on cleanup
    };
  }, [selectedBlock, referenceData, onBlockClick, config, isGraphFixed, viewBoxDimensions]);

  const handleConfigChange = (newConfig: Partial<SyntenyViewConfig>) => {
    const updatedConfig = {
      ...config,
      ...newConfig,
      visual: { ...config.visual, ...newConfig.visual },
      annotations: { ...config.annotations, ...newConfig.annotations },
      scale: { ...config.scale, ...newConfig.scale },
      interaction: { ...config.interaction, ...newConfig.interaction },
    };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex flex-col",
        isFullscreen && "fixed inset-0 bg-background/95 backdrop-blur-sm z-50"
      )}
    >
      {/* Controls Header - Updated to take full width in fullscreen */}
      <div className={cn(
        "flex items-center justify-between p-2 border-b",
        isFullscreen && "w-full"
      )}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="h-8 w-8 p-0"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleSaveAsSVG}>
                <FileType className="h-4 w-4 mr-2" />
                Save as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportImage('png')}>
                <Image className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportImage('jpg')}>
                <Image className="h-4 w-4 mr-2" />
                Export as JPG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Badge variant="secondary">
            {Math.round(zoom * 100)}%
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isGraphFixed ? "default" : "outline"}
            size="sm"
            onClick={() => setIsGraphFixed(!isGraphFixed)}
            className="h-8 w-8 p-0"
          >
            {isGraphFixed ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            disabled={isGraphFixed}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0"
            disabled={isGraphFixed}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            disabled={isGraphFixed}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content Area - Updated to take full width */}
      <div className={cn(
        "relative flex-1 min-h-0",
        isFullscreen && "w-full h-full flex items-center justify-center"
      )}>
        {/* Info Card - Left side */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "absolute top-2 left-2 z-20",
                isFullscreen && "fixed top-[80px]"
              )}
            >
              <Card className="w-[300px] bg-white/40 dark:bg-gray-950/40 backdrop-blur-md border-white/50 dark:border-gray-800/50">
                <div className="flex justify-between items-center p-3 border-b">
                  <h4 className="font-medium text-sm">Block Information</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInfo(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4 space-y-4">
                  {/* Reference Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50/50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 border-blue-200/50 dark:border-blue-800/50"
                      >
                        Reference
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedBlock?.ref_species}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="secondary" className="bg-blue-100/50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
                        Chr: {selectedBlock?.ref_chr}
                      </Badge>
                      <Badge variant="outline" className="bg-white/40 dark:bg-gray-950/40">
                        {((refChromosome?.chr_size_bp ?? 0) / 1_000_000).toFixed(1)}Mb
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline" className="flex-1">
                        Start: {(selectedBlock?.ref_start! / 1_000_000).toFixed(1)}Mb
                      </Badge>
                      <Badge variant="outline" className="flex-1">
                        End: {(selectedBlock?.ref_end! / 1_000_000).toFixed(1)}Mb
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Query Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="bg-purple-50/50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-100 border-purple-200/50 dark:border-purple-800/50"
                      >
                        Query
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedBlock?.query_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="secondary" className="bg-purple-100/50 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100">
                        Chr: {selectedBlock?.query_chr}
                      </Badge>
                      <Badge variant="outline" className="bg-white/40 dark:bg-gray-950/40">
                        {((queryChromosome?.chr_size_bp ?? 0) / 1_000_000).toFixed(1)}Mb
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline" className="flex-1">
                        Start: {(selectedBlock?.query_start! / 1_000_000).toFixed(1)}Mb
                      </Badge>
                      <Badge variant="outline" className="flex-1">
                        End: {(selectedBlock?.query_end! / 1_000_000).toFixed(1)}Mb
                      </Badge>
                    </div>
                    <Badge 
                      variant={selectedBlock?.query_strand === '+' ? 'default' : 'destructive'}
                      className="w-full justify-center"
                    >
                      {selectedBlock?.query_strand === '+' ? 'Forward Strand' : 'Reverse Strand'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Config Card */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "absolute top-2 left-2 z-20",
                isFullscreen && "fixed top-[80px]"
              )}
            >
              <Card className="w-[400px] bg-white/40 dark:bg-gray-950/40 backdrop-blur-md border-white/50 dark:border-gray-800/50">
                <div className="flex justify-between items-center p-3 border-b">
                  <h4 className="font-medium text-sm">Settings</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfig(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <Tabs defaultValue="visual" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
                      <TabsTrigger value="annotations" className="text-xs">Annot.</TabsTrigger>
                      <TabsTrigger value="scale" className="text-xs">Scale</TabsTrigger>
                      <TabsTrigger value="interaction" className="text-xs">Inter.</TabsTrigger>
                      <TabsTrigger value="markers" className="text-xs">Markers</TabsTrigger>
                    </TabsList>

                    {/* Visual Tab */}
                    <TabsContent value="visual" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Ribbon Opacity</Label>
                          <Slider
                            value={[config.visual.ribbonOpacity * 100]}
                            onValueChange={([value]) => 
                              handleConfigChange({ 
                                visual: {
                                  ...config.visual,
                                  ribbonOpacity: value / 100 
                                }
                              })
                            }
                            max={100}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Block Opacity</Label>
                          <Slider
                            value={[config.visual.blockOpacity * 100]}
                            onValueChange={([value]) => 
                              handleConfigChange({ 
                                visual: {
                                  ...config.visual,
                                  blockOpacity: value / 100 
                                }
                              })
                            }
                            max={100}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Track Width</Label>
                          <Slider
                            value={[config.visual.trackWidth * 100]}
                            onValueChange={([value]) => 
                              handleConfigChange({ 
                                visual: { ...config.visual, trackWidth: value / 100 } 
                              })
                            }
                            max={50}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Gap Angle</Label>
                          <Slider
                            value={[config.visual.gapAngle * 100]}
                            onValueChange={([value]) => 
                              handleConfigChange({ 
                                visual: { ...config.visual, gapAngle: value / 100 } 
                              })
                            }
                            max={50}
                            step={1}
                            className="h-4"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Reference Color</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-6"
                                style={{ backgroundColor: config.visual.colors.reference }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                              <Input
                                type="color"
                                value={config.visual.colors.reference}
                                onChange={(e) => 
                                  handleConfigChange({
                                    visual: { 
                                      ...config.visual,
                                      colors: { 
                                        ...config.visual.colors,
                                        reference: e.target.value 
                                      } 
                                    }
                                  })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Query Color</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-6"
                                style={{ backgroundColor: config.visual.colors.query }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                              <Input
                                type="color"
                                value={config.visual.colors.query}
                                onChange={(e) => 
                                  handleConfigChange({
                                    visual: { 
                                      ...config.visual,
                                      colors: { 
                                        ...config.visual.colors,
                                        query: e.target.value 
                                      } 
                                    }
                                  })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Annotations Tab */}
                    <TabsContent value="annotations" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Show Annotations</Label>
                        <Switch
                          checked={config.annotations.show}
                          onCheckedChange={(checked) =>
                            handleConfigChange({
                              annotations: { 
                                ...config.annotations, 
                                show: checked 
                              }
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Height</Label>
                          <Slider
                            value={[config.annotations.height]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                annotations: { 
                                  ...config.annotations, 
                                  height: value 
                                }
                              })
                            }
                            max={20}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Spacing</Label>
                          <Slider
                            value={[config.annotations.spacing]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                annotations: { 
                                  ...config.annotations, 
                                  spacing: value 
                                }
                              })
                            }
                            max={10}
                            step={1}
                            className="h-4"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Scale Tab */}
                    <TabsContent value="scale" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Show Ticks</Label>
                        <Switch
                          checked={config.scale.showTicks}
                          onCheckedChange={(checked) =>
                            handleConfigChange({
                              scale: { 
                                ...config.scale, 
                                showTicks: checked 
                              }
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tick Count</Label>
                          <Slider
                            value={[config.scale.tickCount]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                scale: { 
                                  ...config.scale, 
                                  tickCount: value 
                                }
                              })
                            }
                            min={4}
                            max={20}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Tick Length</Label>
                          <Slider
                            value={[config.scale.tickLength]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                scale: { 
                                  ...config.scale, 
                                  tickLength: value 
                                }
                              })
                            }
                            max={20}
                            step={1}
                            className="h-4"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Interaction Tab */}
                    <TabsContent value="interaction" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Enable Zoom</Label>
                        <Switch
                          checked={config.interaction.enableZoom}
                          onCheckedChange={(checked) =>
                            handleConfigChange({
                              interaction: { 
                                ...config.interaction, 
                                enableZoom: checked 
                              }
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Zoom Min</Label>
                          <Slider
                            value={[config.interaction.zoomExtent[0] * 100]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                interaction: { 
                                  ...config.interaction, 
                                  zoomExtent: [
                                    value / 100,
                                    config.interaction.zoomExtent[1]
                                  ] 
                                }
                              })
                            }
                            min={10}
                            max={100}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Zoom Max</Label>
                          <Slider
                            value={[config.interaction.zoomExtent[1] * 100]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                interaction: { 
                                  ...config.interaction, 
                                  zoomExtent: [
                                    config.interaction.zoomExtent[0],
                                    value / 100
                                  ] 
                                }
                              })
                            }
                            min={100}
                            max={1000}
                            step={10}
                            className="h-4"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Show Tooltips</Label>
                        <Switch
                          checked={config.interaction.showTooltips}
                          onCheckedChange={(checked) =>
                            handleConfigChange({
                              interaction: { ...config.interaction, showTooltips: checked }
                            })
                          }
                        />
                      </div>
                    </TabsContent>

                    {/* Markers Tab */}
                    <TabsContent value="markers" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tick Length</Label>
                          <Slider
                            value={[config.markers.tickLength]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                markers: { 
                                  ...config.markers, 
                                  tickLength: value 
                                }
                              })
                            }
                            min={10}
                            max={40}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Text Offset</Label>
                          <Slider
                            value={[config.markers.textOffset]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                markers: { 
                                  ...config.markers, 
                                  textOffset: value 
                                }
                              })
                            }
                            min={20}
                            max={60}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Font Size</Label>
                          <Slider
                            value={[config.markers.fontSize]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                markers: { 
                                  ...config.markers, 
                                  fontSize: value 
                                }
                              })
                            }
                            min={8}
                            max={16}
                            step={1}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Marker Radius</Label>
                          <Slider
                            value={[config.markers.markerRadius]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                markers: { 
                                  ...config.markers, 
                                  markerRadius: value 
                                }
                              })
                            }
                            min={1}
                            max={5}
                            step={0.5}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Stroke Width</Label>
                          <Slider
                            value={[config.markers.strokeWidth]}
                            onValueChange={([value]) =>
                              handleConfigChange({
                                markers: { 
                                  ...config.markers, 
                                  strokeWidth: value 
                                }
                              })
                            }
                            min={0.5}
                            max={3}
                            step={0.5}
                            className="h-4"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Dash Pattern</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={config.markers.dashPattern[0]}
                              onChange={(e) =>
                                handleConfigChange({
                                  markers: {
                                    ...config.markers,
                                    dashPattern: [Number(e.target.value), config.markers.dashPattern[1]]
                                  }
                                })
                              }
                              className="h-8"
                            />
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={config.markers.dashPattern[1]}
                              onChange={(e) =>
                                handleConfigChange({
                                  markers: {
                                    ...config.markers,
                                    dashPattern: [config.markers.dashPattern[0], Number(e.target.value)]
                                  }
                                })
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Reference Color</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-6"
                                style={{ backgroundColor: config.markers.colors.reference }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                              <Input
                                type="color"
                                value={config.markers.colors.reference}
                                onChange={(e) =>
                                  handleConfigChange({
                                    markers: {
                                      ...config.markers,
                                      colors: {
                                        ...config.markers.colors,
                                        reference: e.target.value
                                      }
                                    }
                                  })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Query Color</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-6"
                                style={{ backgroundColor: config.markers.colors.query }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                              <Input
                                type="color"
                                value={config.markers.colors.query}
                                onChange={(e) =>
                                  handleConfigChange({
                                    markers: {
                                      ...config.markers,
                                      colors: {
                                        ...config.markers.colors,
                                        query: e.target.value
                                      }
                                    }
                                  })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Container - Updated to take full width in fullscreen */}
        <div className={cn(
          "w-full h-full",
          isFullscreen ? "relative w-screen h-screen" : "relative aspect-square"
        )}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${viewBoxDimensions.width} ${viewBoxDimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
          />
          
          <HoverTooltip 
            hoveredBlock={hoveredBlock}
            hoveredChromosome={hoveredChromosome}
            selectedBlock={selectedBlock}
            showTooltips={showTooltips}
          />
        </div>
      </div>
    </div>
  );
}