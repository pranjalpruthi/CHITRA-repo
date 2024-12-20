'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChromosomeSynteny } from './chromosome-synteny';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Moon, 
  Sun, 
  RefreshCw, 
  Upload,
  ArrowRight, 
  FileSpreadsheet,
  Database,
  ZoomIn,
  X,
  MousePointerClick,
  MonitorUp,
  Minimize2,
  Maximize2,
  ZoomOut,
  BookOpen,
  FileText,
  TableProperties,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import * as d3 from 'd3';
import { SyntenyData, ChromosomeData, ReferenceGenomeData, GeneAnnotation, ChromosomeBreakpoint } from '../types';
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSVUploader } from "@/components/chromoviz/file-uploader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShinyRotatingBorderButton } from "@/components/ui/shiny-rotating-border-button";
import { cn } from "@/lib/utils";
import AiButton from "@/components/animata/button/ai-button";
import { FeatureTableConverter } from "@/components/chromoviz/feature-table-converter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailedSyntenyView } from "./detailed-synteny-view";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SyntenyTable } from "@/components/chromoviz/synteny-table";
import PageWrapper from '@/components/wrapper/page-wrapper';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { FilterDrawer } from '@/components/chromoviz/filter-drawer';
import { GuideSheet } from "@/components/chromoviz/guide";
import { FloatingHUDBar } from "@/components/chromoviz/floating-hud-bar";
import { ExampleFilesDrawer } from "@/components/chromoviz/example-files-drawer";
import { FileUploaderGroup } from "@/components/chromoviz/file-uploader";
import { config } from 'process';
import { TipsCarousel } from "@/components/chromoviz/tips-carousel";
import { useRouter } from 'next/navigation';

const parseCSVRow = (d: any): any => {
  return {
    ...d,
    query_start: +d.query_start,
    query_end: +d.query_end,
    ref_start: +d.ref_start,
    ref_end: +d.ref_end
  };
};

const parseChromosomeRow = (d: any): any => {
  return {
    ...d,
    chr_size_bp: +d.chr_size_bp,
    centromere_start: d.centromere_start ? +d.centromere_start : null,
    centromere_end: d.centromere_end ? +d.centromere_end : null
  };
};

function parseChromosomeSizeRow(d: d3.DSVRowString): ReferenceGenomeData['chromosomeSizes'][0] {
  return {
    chromosome: d.chromosome,
    size: +d.size,
    centromere_start: d.centromere_start ? +d.centromere_start : undefined,
    centromere_end: d.centromere_end ? +d.centromere_end : undefined
  };
}

function parseGeneAnnotationRow(d: d3.DSVRowString): GeneAnnotation {
  return {
    chromosome: d.chromosome,
    genomic_accession: d.genomic_accession,
    start: +d.start,
    end: +d.end,
    strand: d.strand as '+' | '-',
    class: d.class,
    locus_tag: d.locus_tag,
    symbol: d.symbol,
    name: d.name,
    GeneID: d.GeneID
  };
}

function parseBreakpointRow(d: d3.DSVRowString): ChromosomeBreakpoint {
  return {
    ref_chr: d.ref_chr,
    ref_start: +d.ref_start,
    ref_end: +d.ref_end,
    breakpoint: d.breakpoint
  };
}

// Add a loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-4 w-full">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      <Skeleton className="h-px w-full" /> {/* Separator */}

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Skeleton className="h-[400px] w-full" /> {/* Upload Card */}
          <Skeleton className="h-[200px] w-full" /> {/* Controls Card */}
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Skeleton className="h-[600px] sm:h-[700px] md:h-[800px] w-full" />
          <Skeleton className="h-6 w-full max-w-lg mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Add this utility function at the top of the file
function downloadCSV(data: SyntenyData[], filename: string) {
  // Define CSV headers
  const headers = [
    'Reference Species',
    'Reference Chromosome',
    'Reference Start (Mb)',
    'Reference End (Mb)',
    'Query Species',
    'Query Chromosome',
    'Query Start (Mb)',
    'Query End (Mb)',
    'Size (Mb)',
    'Orientation'
  ];

  // Convert data to CSV rows
  const rows = data.map(link => [
    link.ref_species,
    link.ref_chr,
    (link.ref_start / 1_000_000).toFixed(2),
    (link.ref_end / 1_000_000).toFixed(2),
    link.query_name,
    link.query_chr,
    (link.query_start / 1_000_000).toFixed(2),
    (link.query_end / 1_000_000).toFixed(2),
    ((link.ref_end - link.ref_start) / 1_000_000).toFixed(2),
    link.query_strand === '+' ? 'Forward' : 'Reverse'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add this type for grouped chromosome options
interface ChromosomeOption {
  label: string;
  value: string;
  species: string;
}

// Add new components for better organization
const FilterBadge = ({ count, total }: { count: number; total: number }) => (
  <Badge 
    variant={count === total ? "secondary" : "default"}
    className="ml-2 text-xs"
  >
    {count}/{total}
  </Badge>
);

const FilterSection = ({
  title,
  count,
  total,
  onClear,
  children
}: {
  title: string;
  count: number;
  total: number;
  onClear: () => void;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{title}</Label>
        <FilterBadge count={count} total={total} />
      </div>
      {count > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 px-2 text-xs"
        >
          Clear
        </Button>
      )}
    </div>
    {children}
  </div>
);

export default function ChromoViz() {
  const { theme, setTheme } = useTheme();
  const [syntenyData, setSyntenyData] = useState<SyntenyData[]>([]);
  const [speciesData, setSpeciesData] = useState<ChromosomeData[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceGenomeData | null>(null);
  const [geneAnnotations, setGeneAnnotations] = useState<GeneAnnotation[]>([]);
  const [breakpointsData, setBreakpointsData] = useState<ChromosomeBreakpoint[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedChromosomes, setSelectedChromosomes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number>(800);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const [showTooltips, setShowTooltips] = useState(true);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const router = useRouter();
  const [isAtRoot, setIsAtRoot] = useState(true);
  
  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedSpecies');
    if (saved) {
      setSelectedSpecies(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  // Create options for the MultiSelect component
  const speciesOptions = React.useMemo(() => 
    Array.from(new Set(speciesData.map(d => d.species_name)))
      .map(species => ({
        label: species.replace('_', ' '),
        value: species,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [speciesData]
  );

  // Update the chromosome options to include species information
  const chromosomeOptions = React.useMemo(() => {
    const options: { [species: string]: ChromosomeOption[] } = {};
    
    speciesData.forEach(d => {
      if (!options[d.species_name]) {
        options[d.species_name] = [];
      }
      options[d.species_name].push({
        label: d.chr_id,
        value: `${d.species_name}:${d.chr_id}`, // Make value unique by including species
        species: d.species_name
      });
    });

    // Add reference genome chromosomes
    if (referenceData?.chromosomeSizes) {
      const refSpecies = 'Reference';
      options[refSpecies] = referenceData.chromosomeSizes.map(chr => ({
        label: chr.chromosome,
        value: `ref:${chr.chromosome}`, // Prefix reference chromosomes
        species: refSpecies
      }));
    }

    return options;
  }, [speciesData, referenceData]);

  // Helper function to extract chromosome ID from combined value
  const getChromosomeId = (value: string) => {
    const parts = value.split(':');
    return parts[parts.length - 1];
  };

  // Helper function to extract species from combined value
  const getSpeciesFromValue = (value: string) => {
    return value.split(':')[0];
  };

  // Set initial selections when data is loaded
  useEffect(() => {
    if (speciesData.length > 0 && selectedSpecies.length === 0 && isInitialized) {
      // Only set all species as selected by default if there are no saved selections
      const allSpecies = speciesOptions.map(option => option.value);
      setSelectedSpecies(allSpecies);
      localStorage.setItem('selectedSpecies', JSON.stringify(allSpecies));
      
      // Set all chromosomes as selected by default
      setSelectedChromosomes(
        Object.values(chromosomeOptions)
          .flat()
          .map(option => option.value)
      );
    }
  }, [speciesData, speciesOptions, chromosomeOptions, selectedSpecies, isInitialized]);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('selectedSpecies', JSON.stringify(selectedSpecies));
    }
  }, [selectedSpecies, isInitialized]);

  const [isUsingExample, setIsUsingExample] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState({
    synteny: false,
    species: false,
    reference: false
  });
  const [selectedSynteny, setSelectedSynteny] = useState<SyntenyData[]>([]);
  const [alignmentFilter, setAlignmentFilter] = useState<'all' | 'forward' | 'reverse'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDetailedViewFullscreen, setIsDetailedViewFullscreen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<any>(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);

  // Get reference species from synteny data
  const referenceSpecies = React.useMemo(() => {
    if (syntenyData.length === 0) return null;
    return syntenyData[0].ref_species;
  }, [syntenyData]);

  // Modify the loadExampleData function to include breakpoints
  const loadExampleData = async (path: string = '/example/set1') => {
    setIsLoading(true);
    setError(null);
    setIsUsingExample(true);
    setShowWelcomeCard(false);
    try {
      // Load required files first
      const [syntenyResponse, referenceResponse, refChromosomeSizes] = 
        await Promise.all([
          d3.csv(`${path}/synteny_data.csv`, parseCSVRow),
          d3.csv(`${path}/species_data.csv`, parseChromosomeRow),
          d3.csv(`${path}/ref_chromosome_sizes.csv`, parseChromosomeSizeRow),
        ]);

      // Load optional files - don't fail if they don't exist
      let geneAnnotations: GeneAnnotation[] = [];
      let breakpoints: ChromosomeBreakpoint[] = [];
      
      try {
        geneAnnotations = await d3.csv(`${path}/ref_gene_annotations.csv`, parseGeneAnnotationRow);
      } catch (e) {
        console.log('Gene annotations file not found - this is optional');
      }

      try {
        breakpoints = await d3.csv(`${path}/bp.csv`, parseBreakpointRow);
      } catch (e) {
        console.log('Breakpoints file not found - this is optional');
      }

      setSyntenyData(syntenyResponse);
      setSpeciesData(referenceResponse);
      setReferenceData({
        chromosomeSizes: refChromosomeSizes,
        geneAnnotations: geneAnnotations,
        breakpoints: breakpoints
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for file uploads
  const handleDataLoad = {
    synteny: (data: SyntenyData[]) => {
      console.log('Loading synteny data:', data);
      setSyntenyData(data);
      setShowWelcomeCard(false);
    },
    species: (data: ChromosomeData[]) => {
      console.log('Loading species data:', data);
      setSpeciesData(prev => {
        const newData = [...data];
        // Sort to ensure reference species is at the bottom
        newData.sort((a, b) => {
          if (a.species_name === 'Reference') return 1;
          if (b.species_name === 'Reference') return -1;
          return a.species_name.localeCompare(b.species_name);
        });
        return newData;
      });
    },
    reference: (data: any[]) => {
      console.log('Loading reference data:', data);
      setReferenceData(prev => ({
        ...prev,
        chromosomeSizes: data.map(d => ({
          chromosome: d.chromosome,
          size: +d.size,
          centromere_start: d.centromere_start ? +d.centromere_start : undefined,
          centromere_end: d.centromere_end ? +d.centromere_end : undefined
        }))
      }));
    },
    annotations: (data: GeneAnnotation[]) => {
      console.log('Loading annotation data:', data);
      setReferenceData(prev => {
        if (!prev) {
          return {
            chromosomeSizes: [],
            geneAnnotations: data,
            breakpoints: []
          };
        }
        return {
          ...prev,
          geneAnnotations: data,
          breakpoints: prev.breakpoints
        };
      });
    },
    breakpoints: (data: ChromosomeBreakpoint[]) => {
      console.log('Loading breakpoints data:', data);
      setBreakpointsData(data);
      setReferenceData(prev => {
        if (!prev) {
          return {
            chromosomeSizes: [],
            geneAnnotations: [],
            breakpoints: data
          };
        }
        return {
          ...prev,
          breakpoints: data
        };
      });
    }
  };

  const canGenerateVisualization = uploadedFiles.synteny && 
    uploadedFiles.species && 
    uploadedFiles.reference;

  const handleGenerateVisualization = () => {
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Update the filteredData function to include chromosome filtering
  const filteredData = React.useMemo(() => {
    if (!referenceData || !referenceSpecies) {
      console.log('Missing reference data:', { referenceData, referenceSpecies });
      return { referenceData: speciesData, syntenyData };
    }

    // Create reference chromosome data from ref_chromosome_sizes.csv
    const referenceChromosomes = referenceData.chromosomeSizes
      .filter(chr => 
        selectedChromosomes.length === 0 || 
        selectedChromosomes.includes(`ref:${chr.chromosome}`)
      )
      .map(chr => ({
        species_name: referenceSpecies,
        chr_id: chr.chromosome,
        chr_type: 'chromosome',
        chr_size_bp: +chr.size,
        centromere_start: chr.centromere_start ? +chr.centromere_start : undefined,
        centromere_end: chr.centromere_end ? +chr.centromere_end : undefined,
        annotations: referenceData.geneAnnotations?.filter(
          gene => gene.chromosome === chr.chromosome
        ) || []
      }));

    if (selectedSpecies.length === 0 && selectedChromosomes.length === 0) {
      return {
        referenceData: [
          ...speciesData.filter(d => d.species_name !== referenceSpecies),
          ...referenceChromosomes
        ],
        syntenyData
      };
    }

    // Filter for selected species and chromosomes
    const filteredReference = [
      ...speciesData.filter(d => 
        (selectedSpecies.length === 0 || selectedSpecies.includes(d.species_name)) &&
        (selectedChromosomes.length === 0 || selectedChromosomes.includes(`${d.species_name}:${d.chr_id}`)) &&
        d.species_name !== referenceSpecies
      ),
      ...referenceChromosomes
    ];

    // Always put reference genome at bottom
    filteredReference.sort((a, b) => {
      if (a.species_name === referenceSpecies) return 1;
      if (b.species_name === referenceSpecies) return -1;
      return a.species_name.localeCompare(b.species_name);
    });

    // Filter synteny data based on both species and chromosomes
    const filteredSynteny = syntenyData.filter(d =>
      (selectedSpecies.length === 0 || selectedSpecies.includes(d.query_name)) &&
      (selectedChromosomes.length === 0 || 
        (selectedChromosomes.includes(`ref:${d.ref_chr}`) || 
         selectedChromosomes.includes(`${d.query_name}:${d.query_chr}`)))
    );

    return { 
      referenceData: filteredReference, 
      syntenyData: filteredSynteny 
    };
  }, [speciesData, syntenyData, selectedSpecies, selectedChromosomes, referenceSpecies, referenceData]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Modify the selection handler to be more robust
  const handleSyntenySelection = (link: SyntenyData, isSelected: boolean) => {
    setSelectedSynteny(prev => {
      // Check if the link already exists in selection
      const exists = prev.some(l => 
        l.ref_chr === link.ref_chr && 
        l.query_chr === link.query_chr && 
        l.ref_start === link.ref_start
      );

      if (isSelected && !exists) {
        return [...prev, link];
      } else if (!isSelected && exists) {
        return prev.filter(l => 
          l.ref_chr !== link.ref_chr || 
          l.query_chr !== link.query_chr || 
          l.ref_start !== link.ref_start
        );
      }
      return prev;
    });
  };

  // Unified toggle handler for both visualization and table
  const handleSyntenyToggle = (link: SyntenyData) => {
    setSelectedSynteny(prev => {
      const exists = prev.some(l => 
        l.ref_chr === link.ref_chr && 
        l.query_chr === link.query_chr && 
        l.ref_start === link.ref_start
      );
      
      return exists
        ? prev.filter(l => 
            l.ref_chr !== link.ref_chr || 
            l.query_chr !== link.query_chr || 
            l.ref_start !== link.ref_start
          )
        : [...prev, link];
    });
  };

  const toggleLayout = () => {
    setIsVerticalLayout(prev => !prev);
  };

  const onDataLoad = handleDataLoad;

  // Add this useEffect to handle height adjustments
  useEffect(() => {
    if (!mainCardRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        setContainerHeight(height);
      }
    });

    resizeObserver.observe(mainCardRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleResetToWelcome = () => {
    setSyntenyData([]);
    setSpeciesData([]);
    setReferenceData(null);
    setGeneAnnotations([]);
    setBreakpointsData([]);
    setSelectedSpecies([]);
    setSelectedChromosomes([]);
    setSelectedSynteny([]);
    setShowWelcomeCard(true);
    setIsUsingExample(true);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Button 
          onClick={() => loadExampleData()} 
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className={cn(
        "relative w-full bg-background flex-1 flex flex-col",
        isFullScreen ? "fixed inset-0 z-50 backdrop-blur-md p-0" : "py-4 sm:py-6"
      )}>
        <div className={cn(
          "flex-1 flex flex-col w-full px-4 sm:px-6",
          isFullScreen && "h-screen p-0"
        )}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex-1 w-full max-w-[2000px] mx-auto flex flex-col",
              isFullScreen && "backdrop-blur-md"
            )}
          >
            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4 h-full">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-12 flex flex-col h-full"
              >
                {/* Controls Bar */}
                <FloatingHUDBar
                  onGenerateVisualization={handleGenerateVisualization}
                  onLoadExample={loadExampleData}
                  canGenerateVisualization={canGenerateVisualization}
                  isLoading={isLoading}
                  selectedSpecies={selectedSpecies}
                  setSelectedSpecies={setSelectedSpecies}
                  selectedChromosomes={selectedChromosomes}
                  setSelectedChromosomes={setSelectedChromosomes}
                  speciesOptions={speciesOptions}
                  chromosomeOptions={chromosomeOptions}
                  referenceGenomeData={referenceData}
                  syntenyData={syntenyData}
                  onDataLoad={onDataLoad}
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                  showTooltips={showTooltips}
                  onToggleTooltips={() => setShowTooltips(!showTooltips)}
                  onResetToWelcome={handleResetToWelcome}
                  speciesData={speciesData}
                />


                {/* Responsive Layout for Visualization and Details */}
                <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                  {/* Main Visualization Area */}
                  <div className={selectedSynteny.length > 0 ? "col-span-12 lg:col-span-8 h-full" : "col-span-12 h-full"}>
                    <Card className="h-full flex flex-col" ref={mainCardRef}>
                      {/* Modified Card Header with integrated Tips and Back Button */}
                      {referenceData && !showWelcomeCard && (
                        <CardHeader className="p-4 border-b">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetToWelcome}
                                className="h-8 px-2 text-xs font-medium text-red-600 dark:text-red-400 
                                  hover:bg-red-500/10 transition-colors group [&_svg]:stroke-red-500
                                  sm:bg-red-500/20 sm:hover:bg-red-500/30"
                              >
                                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Go Back</span>
                              </Button>
                              <CardTitle className="text-lg font-medium">Chromosome Visualization</CardTitle>
                            </div>
                            <div className="h-8 border-l pl-4 hidden sm:block">
                              <TipsCarousel variant="compact" className="w-[300px]" />
                            </div>
                          </div>
                        </CardHeader>
                      )}

                      {isLoading ? (
                        <div className="p-4 flex-1">
                          <Skeleton className="h-full w-full" />
                        </div>
                      ) : syntenyData.length > 0 && !showWelcomeCard ? (
                        <div className="flex-1 min-h-0">
                          <ChromosomeSynteny
                            referenceData={filteredData.referenceData}
                            syntenyData={filteredData.syntenyData}
                            referenceGenomeData={referenceData}
                            selectedSynteny={selectedSynteny}
                            onSyntenySelect={handleSyntenySelection}
                            width="100%"
                            height="100%"
                            alignmentFilter={alignmentFilter}
                            setAlignmentFilter={setAlignmentFilter}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onReset={handleReset}
                            onFullscreen={toggleFullscreen}
                            isFullscreen={isFullscreen}
                            svgRef={svgRef}
                            containerRef={containerRef}
                            zoomBehaviorRef={zoomBehaviorRef}
                            showAnnotations={showAnnotations}
                            setShowAnnotations={setShowAnnotations}
                            selectedChromosomes={selectedChromosomes}
                            showTooltips={showTooltips}
                          />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-12 max-w-4xl w-full"
                          >
                            {/* Header */}
                            <div className="space-y-4">
                              <div className="relative w-20 h-20 mx-auto">
                                <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/20 blur-2xl rounded-full" />
                                <div className="relative flex items-center justify-center w-full h-full 
                                  bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full 
                                  border border-blue-200 dark:border-blue-800 
                                  shadow-lg shadow-blue-500/20"
                                >
                                  <MonitorUp className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                                </div>
                              </div>
                              
                              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Welcome to Chitra
                              </h3>
                              <p className="text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                                Get started by exploring our example datasets or upload your own files
                              </p>
                            </div>

                            {/* Example Sets Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                {
                                  id: 'set1',
                                  name: 'Basic Synteny',
                                  description: 'Simple synteny visualization between two species',
                                  color: 'bg-blue-400',
                                  borderColor: 'border-blue-200 dark:border-blue-800',
                                  hoverBg: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
                                  groupHover: 'group-hover:text-blue-500 dark:group-hover:text-blue-400'
                                },
                                {
                                  id: 'set2',
                                  name: 'Multi-Species',
                                  description: 'Complex synteny relationships across multiple species',
                                  color: 'bg-emerald-400',
                                  borderColor: 'border-emerald-200 dark:border-emerald-800',
                                  hoverBg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10',
                                  groupHover: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
                                  badge: 'Gene Annotations'
                                },
                                {
                                  id: 'set3',
                                  name: 'Annotated Genome',
                                  description: 'Detailed genome annotations with gene information',
                                  color: 'bg-purple-400',
                                  borderColor: 'border-purple-200 dark:border-purple-800',
                                  hoverBg: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10',
                                  groupHover: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
                                  badge: 'Gene Annotations'
                                }
                              ].map((set) => (
                                <motion.button
                                  key={set.id}
                                  onClick={() => loadExampleData(`/example/${set.id}`)}
                                  className={cn(
                                    "w-full text-left p-4 rounded-lg transition-all border",
                                    set.borderColor,
                                    set.hoverBg,
                                    "group"
                                  )}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${set.color}`} />
                                    <div className="flex-1">
                                      <div className={cn(
                                        "font-medium text-base transition-colors",
                                        set.groupHover
                                      )}>
                                        {set.name}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {set.description}
                                      </div>
                                      {set.badge && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 
                                            px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {set.badge}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>

                            {/* Upload Button and More Examples */}
                            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 p-4">
                              <FileUploaderGroup 
                                onDataLoad={onDataLoad}
                                trigger={
                                  <AiButton 
                                    className="w-full sm:min-w-[200px] h-12 relative bg-blue-500/10 
                                      dark:bg-blue-500/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 
                                      transition-colors"
                                    color="blue"
                                  >
                                    <Upload className="h-5 w-5" />
                                    <span className="text-base">Upload Files</span>
                                  </AiButton>
                                }
                              />

                              <ExampleFilesDrawer onLoadExample={loadExampleData}>
                                <AiButton
                                  variant="simple"
                                  color="amber"
                                  className="w-full sm:min-w-[200px] h-12 relative bg-amber-500/10 
                                    dark:bg-amber-500/20 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 
                                    transition-colors"
                                >
                                  <FileText className="h-5 w-5" />
                                  <span className="text-base">Examples</span>
                                </AiButton>
                              </ExampleFilesDrawer>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Detailed View Sidebar */}
                  {selectedSynteny.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="col-span-12 lg:col-span-4 h-full"
                    >
                      <Card className="h-full flex flex-col">
                        <CardHeader className="p-4 border-b shrink-0">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MousePointerClick className="h-4 w-4" />
                            Selected Block Details
                            <Badge variant="secondary" className="ml-auto">
                              {selectedSynteny.length} selected
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[calc(100%-4rem)]">
                          <DetailedSyntenyView
                            selectedBlock={selectedSynteny[currentBlockIndex]}
                            referenceData={filteredData.referenceData}
                            onBlockClick={handleSyntenyToggle}
                            selectedSynteny={selectedSynteny}
                            onToggleSelection={handleSyntenyToggle}
                            isFullscreen={isDetailedViewFullscreen}
                            onFullscreen={setIsDetailedViewFullscreen}
                            showTooltips={showTooltips}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                  {/* Add Synteny Table - Full Width */}
                  <div className="col-span-12">
                    <SyntenyTable 
                      selectedSynteny={selectedSynteny}
                      onToggleSelection={handleSyntenyToggle}
                      onSelectBlock={(block) => {
                        // Simply set the current block index instead of reordering
                        const index = selectedSynteny.findIndex(b => 
                          b.ref_chr === block.ref_chr && 
                          b.query_chr === block.query_chr && 
                          b.ref_start === block.ref_start
                        );
                        setCurrentBlockIndex(index); // You'll need to add this state
                      }}
                      currentBlockIndex={currentBlockIndex} // Add this prop
                      onExport={(data) => downloadCSV(
                        data,
                        `synteny-blocks-${new Date().toISOString().split('T')[0]}.csv`
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
