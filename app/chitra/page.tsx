'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronRight,
  Layers, // Added for Konva switch button
} from "lucide-react";
import * as d3 from 'd3';
import { KonvaSynteny } from './konva-synteny'; // Import KonvaSynteny
import { SyntenyData, ChromosomeData, ReferenceGenomeData, GeneAnnotation, ChromosomeBreakpoint } from '../types';
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
// import AiButton from "@/components/animata/button/ai-button"; // Replaced with LiquidButton
import { LiquidButton } from "@/components/ui/liquid";
import { FlipButton } from "@/components/ui/flip"; // Added FlipButton import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DetailedSyntenyView } from "./detailed-synteny-view";
import { Label } from "@/components/ui/label"
import { SyntenyTable } from "@/components/chromoviz/synteny-table"; // This is the floating button
import { InlineSyntenyDisplay } from "@/components/chromoviz/inline-synteny-display"; 
import { RawDataTablesDisplay } from "@/components/chromoviz/data-viewer-drawer"; // Changed import
import PageWrapper from '@/components/wrapper/page-wrapper';
import { FloatingHUDBar } from "@/components/chromoviz/floating-hud-bar";
import { ExampleFilesDrawer } from "@/components/chromoviz/example-files-drawer";
import { FileUploaderGroup } from "@/components/chromoviz/file-uploader";
import { TipsCarousel } from "@/components/chromoviz/tips-carousel";
import { useRouter, useSearchParams } from 'next/navigation';
import { MutationType } from "@/components/chromoviz/synteny-ribbon";
import BreathingText from "@/components/ui/breathing-text";
import { supabase } from '@/lib/supabaseClient'; // Added Supabase client
import { toast } from "sonner"; // For notifications
import { User } from '@supabase/supabase-js';

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

// Interface for the shared visualization state
interface VisualizationState {
  version: string;
  dataSetType: 'example' | 'custom_db';
  exampleDataSetPath?: string;
  datasetId?: string; // For custom data

  // Selections & Filters
  selectedSpecies: string[];
  selectedChromosomes: string[];
  selectedSyntenyIds: string[]; // Store unique IDs for synteny blocks
  alignmentFilter: 'all' | 'forward' | 'reverse';
  selectedMutationTypes: Array<[string, MutationType]>; // Serialized Map
  customSpeciesColors: Array<[string, string]>; // Serialized Map

  // Main Visualization View State
  mainViewTransform: { k: number; x: number; y: number }; // D3 zoom transform
  showAnnotations: boolean;
  showTooltips: boolean;

  // UI State
  isDetailViewOpen?: boolean; // Optional, as it might not always be relevant
  currentSelectedBlockIndex?: number; // Optional
  // Add other relevant UI states if necessary
  
  // User Info
  user_id?: string;
}

// Add a loading skeleton component
function LoadingSkeleton() {
  const messages = [
    "Analyzing Genomes...",
    "Mapping Chromosomes...",
    "Visualizing Synteny...",
    "Loading Annotations...",
    "Preparing Data...",
  ];
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 w-full p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <BreathingText
          label={message}
          staggerDuration={0.1}
          fromFontVariationSettings="'wght' 100, 'slnt' 0"
          toFontVariationSettings="'wght' 800, 'slnt' -10"
          className="text-lg font-semibold text-gray-600 dark:text-gray-300"
        />
        <div className="w-full max-w-md">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton with pulsing animation */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mt-8">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Skeleton className="h-[400px] w-full animate-pulse" />
          <Skeleton className="h-[200px] w-full animate-pulse" style={{ animationDelay: '0.1s' }} />
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Skeleton className="h-[600px] sm:h-[700px] md:h-[800px] w-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <Skeleton className="h-6 w-full max-w-lg mx-auto animate-pulse" style={{ animationDelay: '0.3s' }} />
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

const CollapsibleDetailView = ({
  isOpen,
  onToggle,
  children
}: {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn(
      "col-span-12 lg:col-span-4 h-full relative transition-all duration-200",
      !isOpen && "!col-span-1 !w-6"
    )}>
      {/* Content Container */}
      <div className={cn(
        "h-full transition-all duration-200",
        !isOpen && "opacity-0 invisible"
      )}>
        {children}
      </div>

      {/* Toggle Button */}
      <div className="absolute inset-y-0 -right-6 w-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggle}
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            "h-24 w-6 rounded-r-lg rounded-l-none",
            "border-l-0 bg-card hover:bg-accent",
            "flex items-center justify-center p-0"
          )}
        >
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </Button>
      </div>
    </div>
  );
};

// Add this component
const SpeciesColorPicker = ({ 
  species, 
  currentColor, 
  onChange 
}: { 
  species: string; 
  currentColor: string; 
  onChange: (color: string) => void; 
}) => {
  return (
    <div className="flex items-center gap-2">
      <span>{species}</span>
      <input
        type="color"
        value={currentColor}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer"
      />
    </div>
  );
};


function ChromoVizContent() {
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
  const [showConnectedOnly, setShowConnectedOnly] = useState(true);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const router = useRouter();
  const [isAtRoot, setIsAtRoot] = useState(true);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(true);
  const [selectedMutationTypes, setSelectedMutationTypes] = useState<Map<string, MutationType>>(new Map());
  const [customSpeciesColors, setCustomSpeciesColors] = useState<Map<string, string>>(new Map());
  const [showKonvaDemo, setShowKonvaDemo] = useState(false); // State for Konva demo
  const [currentShareId, setCurrentShareId] = useState<string | null>(null); // For storing the ID of a saved state
  const [isLoadingShare, setIsLoadingShare] = useState(false); // To indicate when sharing/loading shared state
  const [user, setUser] = useState<User | null>(null);
  const [currentDatasetId, setCurrentDatasetId] = useState<string | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

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
      const allSpeciesValues = speciesOptions.map(option => option.value);
      setSelectedSpecies(allSpeciesValues);
      localStorage.setItem('selectedSpecies', JSON.stringify(allSpeciesValues));
      
      // Set top N chromosomes as selected by default for each species
      const initialSelectedChromosomes: string[] = [];
      const maxChromosomesPerSpecies = 3;

      for (const speciesName in chromosomeOptions) {
        if (chromosomeOptions.hasOwnProperty(speciesName)) {
          const speciesChrOptions = chromosomeOptions[speciesName];
          // Sort chromosomes by label (e.g., Chr1, Chr2, ..., Chr10, etc.)
          // This assumes a natural sort order is desired for "top N"
          const sortedChrOptions = [...speciesChrOptions].sort((a, b) => 
            a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })
          );
          const topNChrValues = sortedChrOptions
            .slice(0, maxChromosomesPerSpecies)
            .map(option => option.value);
          initialSelectedChromosomes.push(...topNChrValues);
        }
      }
      setSelectedChromosomes(initialSelectedChromosomes);
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
  const svgRef = useRef<SVGSVGElement>(null) as React.RefObject<SVGSVGElement>;
  const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
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

    // Reset selections to ensure new data is not filtered by stale selections
    setSelectedSpecies([]);
    setSelectedChromosomes([]);
    setSelectedSynteny([]); // Also reset selected synteny blocks

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
    synteny: (data: SyntenyData[], datasetId?: string) => {
      setSyntenyData(data);
      setShowWelcomeCard(false);
      if (datasetId) setCurrentDatasetId(datasetId);
      setIsUsingExample(false);
    },
    species: (data: ChromosomeData[], datasetId?: string) => {
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
    reference: (data: any[], datasetId?: string) => {
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
    annotations: (data: GeneAnnotation[], datasetId?: string) => {
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
    breakpoints: (data: ChromosomeBreakpoint[], datasetId?: string) => {
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

  // Update the filteredData function to include chromosome filtering and connected only filter
  const filteredData = React.useMemo(() => {
    // Ensure all critical data pieces are available before full computation
    if (!referenceData?.chromosomeSizes || 
        !syntenyData || syntenyData.length === 0 || 
        !speciesData || speciesData.length === 0 || 
        !referenceSpecies) {
      console.log('FilteredData: Essential data not yet ready for full computation.', {
        hasRefSizes: !!referenceData?.chromosomeSizes,
        hasSynteny: !!syntenyData && syntenyData.length > 0,
        hasSpecies: !!speciesData && speciesData.length > 0,
        referenceSpeciesVal: referenceSpecies, // renamed to avoid conflict if referenceSpecies is a var name
      });
      // Return a minimal, safe structure if data is incomplete
      const refChrsWhenIncomplete = referenceData?.chromosomeSizes
        ? referenceData.chromosomeSizes.map(chr => ({
            species_name: referenceSpecies || "Reference", 
            chr_id: chr.chromosome,
            chr_type: 'chromosome' as 'chromosome',
            chr_size_bp: +chr.size,
            centromere_start: chr.centromere_start ? +chr.centromere_start : undefined,
            centromere_end: chr.centromere_end ? +chr.centromere_end : undefined,
            annotations: [] as GeneAnnotation[]
          }))
        : [];
      return { 
        referenceData: refChrsWhenIncomplete, 
        syntenyData: [] // Return empty synteny if critical data is missing for full processing
      };
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
    let filteredSynteny = syntenyData.filter(d =>
      (selectedSpecies.length === 0 || selectedSpecies.includes(d.query_name)) &&
      (selectedChromosomes.length === 0 || 
        (selectedChromosomes.includes(`ref:${d.ref_chr}`) || 
         selectedChromosomes.includes(`${d.query_name}:${d.query_chr}`)))
    );

    // Apply connected only filter if enabled
    if (showConnectedOnly) {
      const selectedRefChrs = selectedChromosomes.filter(chr => chr.startsWith('ref:'));
      if (selectedRefChrs.length > 0) {
        const refChrsWithoutPrefix = selectedRefChrs.map(chr => chr.replace('ref:', ''));
        filteredSynteny = filteredSynteny.filter(d => refChrsWithoutPrefix.includes(d.ref_chr));
      }
    }

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

  const handleMutationTypeSelect = useCallback((syntenyId: string, mutationType?: MutationType) => {
    setSelectedMutationTypes(prev => {
      const newMap = new Map(prev);
      if (mutationType === undefined) {
        newMap.delete(syntenyId);
      } else {
        newMap.set(syntenyId, mutationType);
      }
      return newMap;
    });
  }, []);

  const handleSpeciesColorChange = useCallback((species: string, color: string) => {
    setCustomSpeciesColors(prev => {
      const newColors = new Map(prev);
      newColors.set(species, color);
      return newColors;
    });
  }, []);

  // Save colors to localStorage when they change
  useEffect(() => {
    if (customSpeciesColors.size > 0) {
      localStorage.setItem('speciesColors', JSON.stringify(Array.from(customSpeciesColors.entries())));
    }
  }, [customSpeciesColors]);

  // Load colors from localStorage on mount
  useEffect(() => {
    const savedColors = localStorage.getItem('speciesColors');
    if (savedColors) {
      setCustomSpeciesColors(new Map(JSON.parse(savedColors)));
    }
  }, []);

  // Effect to load shared state from URL
  const searchParams = useSearchParams();
  const [processedShareId, setProcessedShareId] = useState<string | null>(null);

  useEffect(() => {
    const shareId = searchParams.get('shareId');

      if (shareId && shareId !== processedShareId) {
        const loadSharedState = async () => {
          setIsLoadingShare(true);
          setShowWelcomeCard(false);
          try {
            const { data, error: dbError } = await supabase
              .from('shared_visualizations')
              .select('visualization_state')
              .eq('id', shareId)
              .single();

            if (dbError) throw dbError;

            if (data?.visualization_state) {
              const state = data.visualization_state as VisualizationState;
              
              setProcessedShareId(shareId);

              if (state.dataSetType === 'example' && state.exampleDataSetPath) {
                await loadExampleData(state.exampleDataSetPath); 
                localStorage.setItem('lastExamplePath', state.exampleDataSetPath);
              } else if (state.dataSetType === 'custom_db' && state.datasetId) {
                // Load data from Supabase Storage
                const { data: files, error: listError } = await supabase.storage
                  .from('user-uploads')
                  .list(`${state.user_id}/${state.datasetId}`);

                if (listError) throw listError;

                const dataPromises = files.map(async (file) => {
                  const { data: blobData, error: downloadError } = await supabase.storage
                    .from('user-uploads')
                    .download(`${state.user_id}/${state.datasetId}/${file.name}`);
                  
                  if (downloadError) throw downloadError;

                  const text = await blobData.text();
                  return { name: file.name, data: text };
                });

                const loadedFiles = await Promise.all(dataPromises);
                
                // This is a simplified parsing logic. You might need to make this more robust
                // based on file names to map to the correct data type (synteny, species, etc.)
                loadedFiles.forEach(file => {
                  if (file.name.includes('synteny')) {
                    handleDataLoad.synteny(d3.csvParse(file.data, parseCSVRow));
                  } else if (file.name.includes('species')) {
                    handleDataLoad.species(d3.csvParse(file.data, parseChromosomeRow));
                  } else if (file.name.includes('ref_chromosome_sizes')) {
                    handleDataLoad.reference(d3.csvParse(file.data, parseChromosomeSizeRow));
                  } else if (file.name.includes('ref_gene_annotations')) {
                    handleDataLoad.annotations(d3.csvParse(file.data, parseGeneAnnotationRow));
                  } else if (file.name.includes('bp')) {
                    handleDataLoad.breakpoints(d3.csvParse(file.data, parseBreakpointRow));
                  }
                });
              }

              setSelectedSpecies(state.selectedSpecies || []);
              setSelectedChromosomes(state.selectedChromosomes || []);
            setAlignmentFilter(state.alignmentFilter || 'all');
            setSelectedMutationTypes(new Map(state.selectedMutationTypes || []));
            setCustomSpeciesColors(new Map(state.customSpeciesColors || []));
            
            // Defer transform application until syntenyData might be loaded by loadExampleData
            // This can be tricky if loadExampleData is async and updates state that ChromosomeSynteny depends on.
            // A more robust way might be to pass initialTransform to ChromosomeSynteny or have an effect there.
            if (state.mainViewTransform && svgRef.current && zoomBehaviorRef.current) {
                // Ensure data is loaded before applying transform if it depends on data bounds
                // For now, apply directly, but this might need refinement if loadExampleData is slow
                const transform = d3.zoomIdentity
                  .translate(state.mainViewTransform.x, state.mainViewTransform.y)
                  .scale(state.mainViewTransform.k);
                // Apply transform after a short delay to allow data to potentially load
                setTimeout(() => {
                    if (svgRef.current && zoomBehaviorRef.current) {
                        d3.select(svgRef.current).call(zoomBehaviorRef.current.transform, transform);
                    }
                }, 100); // Adjust delay as needed, or use a more robust data-loaded flag
            }
            
            setShowAnnotations(state.showAnnotations !== undefined ? state.showAnnotations : true);
            setShowTooltips(state.showTooltips !== undefined ? state.showTooltips : true);
            setIsDetailViewOpen(state.isDetailViewOpen !== undefined ? state.isDetailViewOpen : true);
            setCurrentBlockIndex(state.currentSelectedBlockIndex || 0);
            
            toast.success("Shared visualization loaded!");
          } else {
            toast.error("Could not find the shared visualization.");
            setProcessedShareId(shareId); // Mark as processed even if not found to prevent retries
          }
        } catch (e) {
          console.error("Error loading shared visualization:", e);
          toast.error("Failed to load shared visualization.");
          setProcessedShareId(shareId); // Mark as processed on error
        } finally {
          setIsLoadingShare(false);
        }
      };
      loadSharedState();
    }
  }, [searchParams, processedShareId]); // Depend on shareId from searchParams and processedShareId

  const handleShare = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to share your visualization.", {
        action: {
          label: "Sign In",
          onClick: () => router.push('/sign-in'),
        },
      });
      return null;
    }

    if (!referenceData || !zoomBehaviorRef.current) {
      toast.error("Cannot share, data or view not fully loaded.");
      return null;
    }
    setIsLoadingShare(true);
    try {
      const currentTransform = d3.zoomTransform(svgRef.current!);

      const stateToSave: VisualizationState = {
        version: "1.0",
        dataSetType: isUsingExample ? 'example' : 'custom_db',
        exampleDataSetPath: isUsingExample ? localStorage.getItem('lastExamplePath') || '/example/set1' : undefined,
        datasetId: !isUsingExample ? (currentDatasetId ?? undefined) : undefined,
        selectedSpecies,
        selectedChromosomes,
        selectedSyntenyIds: selectedSynteny.map(s => `${s.ref_chr}-${s.query_chr}-${s.ref_start}-${s.query_start}`),
        alignmentFilter,
        selectedMutationTypes: Array.from(selectedMutationTypes.entries()),
        customSpeciesColors: Array.from(customSpeciesColors.entries()),
        mainViewTransform: {
          k: currentTransform.k,
          x: currentTransform.x,
          y: currentTransform.y,
        },
        showAnnotations,
        showTooltips,
        isDetailViewOpen,
        currentSelectedBlockIndex: currentBlockIndex,
        user_id: user.id,
      };

      const { data, error: dbError } = await supabase
        .from('shared_visualizations')
        .insert([{ visualization_state: stateToSave, user_id: user.id }])
        .select('id')
        .single();

      if (dbError) {
        throw dbError;
      }

      if (data?.id) {
        const shareUrl = `${window.location.origin}${window.location.pathname}?shareId=${data.id}`;
        toast.success("Shareable link generated and copied to clipboard!");
        return shareUrl;
      }
      return null;
    } catch (e) {
      console.error("Error sharing visualization:", e);
      toast.error("Failed to create shareable link.");
      return null;
    } finally {
      setIsLoadingShare(false);
    }
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
      {/* When mainCardRef (a child) is fullscreen, this outer div should not apply fixed/z-index/backdrop styles.
          The browser handles the fullscreen layer for mainCardRef.
          We only adjust padding based on fullscreen state here. */}
      <div className={cn(
        "relative w-full bg-background flex-1 flex flex-col",
        isFullScreen ? "p-0" : "py-4 sm:py-6" // Removed fixed, z-50, backdrop-blur for isFullScreen
      )}>
        <div className={cn(
          "flex-1 flex flex-col w-full", // Removed px-4 sm:px-6 here, will be handled by inner content or fullscreen
          isFullScreen ? "h-screen p-0" : "px-4 sm:px-6" // Apply padding only when not fullscreen
        )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex-1 w-full max-w-[2000px] mx-auto flex flex-col"
              // Removed: isFullScreen && "backdrop-blur-md" to simplify stacking context
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
                  onLoadExample={loadExampleData}
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
                  onShare={handleShare} // Pass the handleShare function
                  user={user}
                />

                {/* Responsive Layout for Visualization and Details */}
                <div className="grid grid-cols-12 gap-6 flex-1 min-h-0"> {/* Increased gap */}
                  {/* Main Visualization Area */}
                  <div className={cn(
                    "transition-all duration-200",
                    selectedSynteny.length > 0
                      ? isDetailViewOpen
                        ? "col-span-12 lg:col-span-8"
                        : "col-span-12 lg:col-span-11"
                      : "col-span-12"
                  )}>
                    <Card className={cn(
                      "h-[80vh] flex flex-col", // Added fixed height
                      isFullScreen && "pb-10 h-screen" // Ensure fullscreen still takes full screen height
                    )} ref={mainCardRef}>
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
                              <CardTitle className="text-lg font-medium">Synteny Visualization</CardTitle>
                              <div className="flex items-center gap-2 ml-auto">
                                <Switch
                                  id="draggable-view"
                                  checked={showKonvaDemo}
                                  onCheckedChange={() => setShowKonvaDemo(!showKonvaDemo)}
                                  className="h-7"
                                />
                                <label htmlFor="draggable-view" className="text-sm text-muted-foreground whitespace-nowrap">
                                  Draggable View
                                </label>
                              </div>
                            </div>
                            <div className="h-8 border-l pl-4 hidden sm:block">
                              <TipsCarousel variant="compact" className="w-[300px]" />
                            </div>
                          </div>
                        </CardHeader>
                      )}

                      {isLoading ? (
                        <div className="p-4 flex-1">
                          <LoadingSkeleton />
                        </div>
                      ) : showKonvaDemo && syntenyData.length > 0 && referenceData && !showWelcomeCard ? ( // Added referenceData check for Konva
                        <div className="flex-1 min-h-0">
                          <KonvaSynteny
                            referenceData={filteredData.referenceData}
                            syntenyData={filteredData.syntenyData}
                            alignmentFilter={alignmentFilter}
                            setAlignmentFilter={setAlignmentFilter}
                            onBack={() => setShowKonvaDemo(false)}
                          />
                        </div>
                      ) : syntenyData.length > 0 && referenceData && !showWelcomeCard ? ( // Added referenceData check
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
                            setShowTooltips={setShowTooltips}
                            selectedMutationTypes={selectedMutationTypes}
                            onMutationTypeSelect={handleMutationTypeSelect}
                            customSpeciesColors={customSpeciesColors}
                            onSpeciesColorChange={handleSpeciesColorChange}
                            showConnectedOnly={showConnectedOnly}
                            setShowConnectedOnly={setShowConnectedOnly}
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
                            <div className="space-y-6">
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
                              
                              <div className="space-y-2">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                  Welcome to CHITRA
                                </h3>
                                <p className="text-xl text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">C</span>hromosome{' '}
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">I</span>nteractive{' '}
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">T</span>ool for{' '}
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">R</span>earrangement{' '}
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">A</span>nalysis
                                </p>
                              </div>

                              {/* Feature Tags */}
                              <div className="flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                  #Synteny
                                </Badge>
                                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                  #Annotations
                                </Badge>
                                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                  #Breakpoints
                                </Badge>
                                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                  #Visualization
                                </Badge>
                                <Badge variant="secondary" className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                  #Chromosomes
                                </Badge>
                              </div>

                              {/* Get Started Section */}
                              <div className="flex items-center gap-6 justify-center text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                    1
                                  </span>
                                  <span>Explore example datasets</span>
                                </div>
                                <span className="text-gray-400">or</span>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                    2
                                  </span>
                                  <span>Upload your files</span>
                                </div>
                              </div>
                            </div>

                            {/* Upload Button and More Examples - MOVED UP */}
                            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 p-4">
                              <FileUploaderGroup 
                                onDataLoad={onDataLoad}
                                user={user}
                                trigger={
                                  <LiquidButton 
                                    variant="default" // Assuming default variant aligns with a blue-ish theme
                                    size="lg" // To match h-12, lg is typically 3rem (48px)
                                    className="min-w-[190px]"
                                  >
                                    <Upload className="h-5 w-5" />
                                    <span className="text-base">Upload Files</span>
                                  </LiquidButton>
                                }
                              />

                              <ExampleFilesDrawer onLoadExample={loadExampleData}>
                                <FlipButton
                                  frontText="Examples"
                                  backText="View Sets"
                                  className="min-w-[190px] h-12 text-base" // Added h-12 and text-base
                                  frontClassName="bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300"
                                  backClassName="bg-amber-500 text-white dark:bg-amber-600 dark:text-white"
                                />
                                {/* The FileText icon is omitted as FlipButton frontText/backText expect strings. */}
                                {/* If icon is desired, FlipButton may need modification or icon placed externally. */}
                              </ExampleFilesDrawer>
                            </div>

                            {/* Example Sets Grid - NOW BELOW BUTTONS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                {
                                  id: 'set1',
                                  name: 'Basic Synteny',
                                  description: 'Simple synteny visualization between species',
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
                                },
                                {
                                  id: 'set3',
                                  name: 'Annotated Genome',
                                  description: 'Detailed genome annotations with gene information',
                                  color: 'bg-purple-400',
                                  borderColor: 'border-purple-200 dark:border-purple-800',
                                  hoverBg: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10',
                                  groupHover: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
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
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Detailed View Sidebar */}
                  {selectedSynteny.length > 0 && !showWelcomeCard && (
                    <CollapsibleDetailView
                      isOpen={isDetailViewOpen}
                      onToggle={() => setIsDetailViewOpen(prev => !prev)}
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
                    </CollapsibleDetailView>
                  )}
                </div>

                {/* Floating Synteny Table Button */}
                {!showWelcomeCard && (syntenyData.length > 0 || speciesData.length > 0 || referenceData) && (
                  <SyntenyTable
                    selectedSynteny={selectedSynteny}
                    onToggleSelection={handleSyntenyToggle}
                    onSelectBlock={(block) => {
                      const index = selectedSynteny.findIndex(b => 
                        b.ref_chr === block.ref_chr && 
                        b.query_chr === block.query_chr && 
                        b.ref_start === block.ref_start
                      );
                      if (index !== -1) {
                        setCurrentBlockIndex(index);
                      }
                    }}
                    currentBlockIndex={currentBlockIndex}
                    onExport={(data) => downloadCSV(
                      data,
                      `synteny-blocks-${new Date().toISOString().split('T')[0]}.csv`
                    )}
                  />
                )}

                {/* Inline Tables Section - Below Visualization and Details */}
                {!showWelcomeCard && (syntenyData.length > 0 || speciesData.length > 0 || referenceData) && (
                  <div className="col-span-12 mt-6 grid grid-cols-12 gap-6">
                    {/* Left Column: Raw Data Tables */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                      <Card>
                        <CardHeader className="p-3 border-b">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            Raw Data Tables
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <RawDataTablesDisplay
                            syntenyData={syntenyData}
                            speciesData={speciesData}
                            referenceData={referenceData}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Compact Selected Blocks */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                       <Card>
                         <CardHeader className="p-3 border-b">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                            Selected Blocks
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0"> {/* Padding handled by InlineSyntenyDisplay with isCompact */}
                          <InlineSyntenyDisplay
                            selectedSynteny={selectedSynteny}
                            onToggleSelection={handleSyntenyToggle}
                            onSelectBlock={(block) => {
                              const index = selectedSynteny.findIndex(b => 
                                b.ref_chr === block.ref_chr && 
                                b.query_chr === block.query_chr && 
                                b.ref_start === block.ref_start
                              );
                              if (index !== -1) {
                                setCurrentBlockIndex(index);
                              }
                            }}
                            currentBlockIndex={currentBlockIndex}
                            // No export button in compact view to save space, can be added if needed
                            // onExport={(data) => downloadCSV(
                            //   data,
                            //   `synteny-blocks-${new Date().toISOString().split('T')[0]}.csv`
                            // )}
                            isCompact={true} // Enable compact mode
                            className="w-full"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function ChromoViz() {
  return (
    <React.Suspense fallback={<LoadingSkeleton />}>
      <ChromoVizContent />
    </React.Suspense>
  );
}
