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
  Minimize2,
  Maximize2,
  ZoomOut,
} from "lucide-react";
import * as d3 from 'd3';
import { SyntenyData, ChromosomeData, ReferenceGenomeData, GeneAnnotation } from '../types';
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
  const [referenceData, setReferenceData] = useState<ChromosomeData[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedChromosomes, setSelectedChromosomes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceGenomeData, setReferenceGenomeData] = useState<ReferenceGenomeData | null>(null);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  
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
    Array.from(new Set(referenceData.map(d => d.species_name)))
      .map(species => ({
        label: species.replace('_', ' '),
        value: species,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [referenceData]
  );

  // Update the chromosome options to include species information
  const chromosomeOptions = React.useMemo(() => {
    const options: { [species: string]: ChromosomeOption[] } = {};
    
    referenceData.forEach(d => {
      if (!options[d.species_name]) {
        options[d.species_name] = [];
      }
      options[d.species_name].push({
        label: d.chr_id,
        value: d.chr_id,
        species: d.species_name
      });
    });

    // Add reference genome chromosomes
    if (referenceGenomeData?.chromosomeSizes) {
      const refSpecies = referenceData[0]?.species_name || 'Reference';
      options[refSpecies] = referenceGenomeData.chromosomeSizes.map(chr => ({
        label: chr.chromosome,
        value: chr.chromosome,
        species: refSpecies
      }));
    }

    return options;
  }, [referenceData, referenceGenomeData]);

  // Set initial selections when data is loaded
  useEffect(() => {
    if (referenceData.length > 0 && selectedSpecies.length === 0 && isInitialized) {
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
  }, [referenceData, speciesOptions, chromosomeOptions, selectedSpecies, isInitialized]);

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

  // Get reference species from synteny data
  const referenceSpecies = React.useMemo(() => {
    if (syntenyData.length === 0) return null;
    return syntenyData[0].ref_species;
  }, [syntenyData]);

  // Modified load data function to handle example data
  const loadExampleData = async () => {
    setIsLoading(true);
    setError(null);
    setIsUsingExample(true);
    try {
      const [syntenyResponse, referenceResponse, refChromosomeSizes, geneAnnotations] = 
        await Promise.all([
          d3.csv('/synteny_data.csv', parseCSVRow),
          d3.csv('/species_data.csv', parseChromosomeRow),
          d3.csv('/ref_chromosome_sizes.csv', parseChromosomeSizeRow),
          d3.csv('/ref_gene_annotations.csv', parseGeneAnnotationRow)
        ]);

      console.log('Loaded gene annotations:', geneAnnotations); // Debug log

      if (!syntenyResponse || !referenceResponse) {
        throw new Error('Failed to load example data');
      }

      setSyntenyData(syntenyResponse);
      setReferenceData(referenceResponse);
      setReferenceGenomeData({
        chromosomeSizes: refChromosomeSizes,
        geneAnnotations: geneAnnotations
      });

      // Debug log after setting data
      console.log('Reference genome data set:', {
        chromosomeSizes: refChromosomeSizes,
        geneAnnotations: geneAnnotations
      });
    } catch (err) {
      console.error('Error loading data:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for file uploads
  const handleSyntenyData = (data: any) => {
    setSyntenyData(data);
    setUploadedFiles(prev => ({ ...prev, synteny: true }));
    setIsUsingExample(false);
  };

  const handleSpeciesData = (data: any) => {
    setReferenceData(data);
    setUploadedFiles(prev => ({ ...prev, species: true }));
    setIsUsingExample(false);
  };

  const handleChromosomeData = (data: any) => {
    setReferenceGenomeData(prev => prev ? {
      chromosomeSizes: prev.chromosomeSizes,
      geneAnnotations: data
    } : null);
    setUploadedFiles(prev => ({ ...prev, reference: true }));
    setIsUsingExample(false);
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
    if (!referenceGenomeData || !referenceSpecies) {
      console.log('Missing reference data:', { referenceGenomeData, referenceSpecies });
      return { referenceData, syntenyData };
    }

    // Create reference chromosome data from ref_chromosome_sizes.csv
    const referenceChromosomes = referenceGenomeData.chromosomeSizes
      .filter(chr => 
        selectedChromosomes.length === 0 || 
        selectedChromosomes.includes(chr.chromosome)
      )
      .map(chr => ({
        species_name: referenceSpecies,
        chr_id: chr.chromosome,
        chr_type: 'chromosome',
        chr_size_bp: +chr.size,
        centromere_start: chr.centromere_start ? +chr.centromere_start : null,
        centromere_end: chr.centromere_end ? +chr.centromere_end : null,
        annotations: referenceGenomeData.geneAnnotations?.filter(
          gene => gene.chromosome === chr.chromosome
        ) || []
      }));

    if (selectedSpecies.length === 0 && selectedChromosomes.length === 0) {
      return {
        referenceData: [
          ...referenceData.filter(d => d.species_name !== referenceSpecies),
          ...referenceChromosomes
        ],
        syntenyData
      };
    }

    // Filter for selected species and chromosomes
    const filteredReference = [
      ...referenceData.filter(d => 
        (selectedSpecies.length === 0 || selectedSpecies.includes(d.species_name)) &&
        (selectedChromosomes.length === 0 || selectedChromosomes.includes(d.chr_id)) &&
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
        (selectedChromosomes.includes(d.ref_chr) || selectedChromosomes.includes(d.query_chr)))
    );

    return { 
      referenceData: filteredReference, 
      syntenyData: filteredSynteny 
    };
  }, [referenceData, syntenyData, selectedSpecies, selectedChromosomes, referenceSpecies, referenceGenomeData]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadExampleData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen w-full max-w-[2000px] mx-auto"
        >

          {/* Updated Header with ShinyRotatingBorderButton */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center justify-between mb-4 p-4 rounded-lg",
              "bg-background/60 backdrop-blur-md border border-border/50"
            )}
          >
            <div className="flex flex-col items-center w-full gap-2">
              <ShinyRotatingBorderButton className="!p-3">
                <span className="text-3xl font-bold tracking-tight">CHITRA</span>
              </ShinyRotatingBorderButton>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Genomics</Badge>
                <Badge variant="secondary" className="text-xs">Visualization</Badge>
                <Badge variant="secondary" className="text-xs">Interactive</Badge>
              </div>
            </div>

            <p className="text-lg text-muted-foreground">
              CHromosome Interactive Tool for Rearrangement Analysis
            </p>



            <div className="absolute right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>



          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-12 space-y-3"
            >
              {/* Controls Cards remain the same */}
              <Card className="p-3">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data Controls
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter Sheet */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Database className="h-4 w-4" />
                          {selectedSpecies.length === speciesOptions.length && 
                           selectedChromosomes.length === Object.values(chromosomeOptions).flat().length ? (
                            <span className="flex items-center gap-2">
                              All Data Shown
                              <Badge variant="secondary" className="ml-1">
                                {speciesOptions.length + Object.values(chromosomeOptions).flat().length} items
                              </Badge>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Filtered View
                              <Badge variant="default" className="ml-1">
                                {selectedSpecies.length + selectedChromosomes.length} selected
                              </Badge>
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent 
                        side="right" 
                        className="w-full sm:max-w-md"
                      >
                        <SheetHeader>
                          <SheetTitle>Data Filters</SheetTitle>
                          <SheetDescription>
                            Configure which species and chromosomes to display
                          </SheetDescription>
                        </SheetHeader>
                        
                        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                          <div className="mt-6 space-y-6">
                            {/* Species Filter Section */}
                            <FilterSection
                              title="Species"
                              count={selectedSpecies.length}
                              total={speciesOptions.length}
                              onClear={() => setSelectedSpecies([])}
                            >
                              <MultiSelect
                                value={selectedSpecies}
                                options={speciesOptions}
                                onValueChange={setSelectedSpecies}
                                placeholder="Filter by species..."
                              />
                            </FilterSection>

                            <Separator className="my-4" />

                            {/* Chromosomes Filter Section */}
                            <FilterSection
                              title="Chromosomes"
                              count={selectedChromosomes.length}
                              total={Object.values(chromosomeOptions).flat().length}
                              onClear={() => setSelectedChromosomes([])}
                            >
                              <div className="space-y-4">
                                {Object.entries(chromosomeOptions).map(([species, chromosomes]) => {
                                  // Only show species that are selected (or all if none selected)
                                  if (selectedSpecies.length > 0 && !selectedSpecies.includes(species)) {
                                    return null;
                                  }

                                  const selectedCount = selectedChromosomes.filter(chr => 
                                    chromosomes.some(opt => opt.value === chr)
                                  ).length;

                                  return (
                                    <motion.div
                                      key={species}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Label className="text-sm font-medium">
                                            {species.replace('_', ' ')}
                                          </Label>
                                          <FilterBadge 
                                            count={selectedCount} 
                                            total={chromosomes.length} 
                                          />
                                        </div>
                                        {selectedCount > 0 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const otherChromosomes = selectedChromosomes.filter(chr => 
                                                !chromosomes.some(opt => opt.value === chr)
                                              );
                                              setSelectedChromosomes(otherChromosomes);
                                            }}
                                            className="h-7 px-2 text-xs"
                                          >
                                            Clear
                                          </Button>
                                        )}
                                      </div>
                                      <MultiSelect
                                        value={selectedChromosomes.filter(chr => 
                                          chromosomes.some(opt => opt.value === chr)
                                        )}
                                        options={chromosomes}
                                        onValueChange={(values) => {
                                          const otherChromosomes = selectedChromosomes.filter(chr => 
                                            !chromosomes.some(opt => opt.value === chr)
                                          );
                                          setSelectedChromosomes([...otherChromosomes, ...values]);
                                        }}
                                        placeholder={`Select chromosomes...`}
                                      />
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </FilterSection>

                            {/* Clear All Button */}
                            {(selectedSpecies.length > 0 || selectedChromosomes.length > 0) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSpecies([]);
                                  setSelectedChromosomes([]);
                                }}
                                disabled={isLoading}
                                className="w-full gap-2"
                              >
                                <X className="h-4 w-4" />
                                Clear all filters
                              </Button>
                            )}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>

                    {/* Data Upload Sheet */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Upload className="h-4 w-4" />
                          Data Upload
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Data Upload</SheetTitle>
                          <SheetDescription>
                            Upload your data files or use the feature table converter
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="mt-6 space-y-6">
                          {/* Required Files Section */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Required Files</h3>
                            <div className="space-y-2">
                              <CSVUploader type="synteny" onDataLoad={handleSyntenyData} />
                              <CSVUploader type="species" onDataLoad={handleSpeciesData} />
                              <CSVUploader type="reference" onDataLoad={handleChromosomeData} />
                            </div>
                          </div>

                          <Separator />

                          {/* Optional Files Section */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Optional Files</h3>
                            <CSVUploader 
                              type="annotations" 
                              onDataLoad={(data) => {
                                setReferenceGenomeData(prev => prev ? {
                                  chromosomeSizes: prev.chromosomeSizes,
                                  geneAnnotations: data
                                } : null);
                              }} 
                              required={false}
                            />
                          </div>

                          <Separator />

                          {/* Feature Table Converter Section */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Feature Table Converter</h3>
                            <FeatureTableConverter />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <AiButton 
                      onClick={handleGenerateVisualization}
                      disabled={!canGenerateVisualization || isLoading}
                      className="sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate
                        </>
                      )}
                    </AiButton>

                    <Button
                      onClick={loadExampleData}
                      disabled={isLoading}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Load Example
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* New Layout for Visualization and Details */}
              <div className="grid grid-cols-12 gap-4">
                {/* Main Visualization Area */}
                <div className="col-span-12 lg:col-span-8">
                  <Card className="overflow-hidden h-[800px]">
                    {isLoading ? (
                      <div className="p-4">
                        <Skeleton className="h-[700px] w-full" />
                      </div>
                    ) : syntenyData.length > 0 ? (
                      <>
                        <ChromosomeSynteny
                          referenceData={filteredData.referenceData}
                          syntenyData={filteredData.syntenyData}
                          referenceGenomeData={referenceGenomeData}
                          selectedSynteny={selectedSynteny}
                          onSyntenySelect={handleSyntenySelection}
                          width={1400}
                          height={800}
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
                        />
                      </>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground"
                      >
                        <Upload className="h-10 w-10 mb-3" />
                        <h3 className="text-base font-medium">No Data Available</h3>
                        <p className="text-sm">Upload files or load example data</p>
                      </motion.div>
                    )}
                  </Card>
                </div>

                {/* Detailed View Sidebar */}
                <div className={cn(
                  "col-span-12 lg:col-span-4",
                  isDetailedViewFullscreen && "fixed inset-0 z-50"
                )}>
                  <Card className={cn(
                    "h-[800px] overflow-hidden",
                    isDetailedViewFullscreen && "h-screen"
                  )}>
                    <CardHeader className="p-4 border-b shrink-0">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4" />
                        Selected Block Details
                        {selectedSynteny.length > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {selectedSynteny.length} selected
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-4rem)]">
                      {selectedSynteny.length > 0 ? (
                        <DetailedSyntenyView
                          selectedBlock={selectedSynteny[0]}
                          referenceData={filteredData.referenceData}
                          onBlockClick={handleSyntenyToggle}
                          selectedSynteny={selectedSynteny}
                          onToggleSelection={handleSyntenyToggle}
                          isFullscreen={isDetailedViewFullscreen}
                          onFullscreen={setIsDetailedViewFullscreen}
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                          <MousePointerClick className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p>Select a synteny block to view details</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Add Synteny Table - Full Width */}
                <div className="col-span-12">
                  <SyntenyTable 
                    selectedSynteny={selectedSynteny}
                    onToggleSelection={handleSyntenyToggle}
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
    </PageWrapper>
  );
}
