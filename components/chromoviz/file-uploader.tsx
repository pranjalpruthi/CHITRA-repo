"use client";

import { useState } from "react";
import { FileUploader, FileUploaderContent, FileUploaderItem, FileInput } from "@/components/extension/file-uploader";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as d3 from 'd3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { FeatureTableConverter } from "@/components/chromoviz/feature-table-converter";

const FILE_CONFIGS = {
  synteny: {
    title: "Synteny Data",
    description: "Upload synteny_data.csv file",
    tooltip: {
      title: "Synteny Data File",
      description: "Contains information about syntenic blocks between genomes",
      format: [
        { field: "ref_chr", desc: "Reference chromosome ID" },
        { field: "ref_start", desc: "Start position in reference" },
        { field: "ref_end", desc: "End position in reference" },
        { field: "query_chr", desc: "Query chromosome ID" },
        { field: "query_start", desc: "Start position in query" },
        { field: "query_end", desc: "End position in query" },
        { field: "query_strand", desc: "Orientation (+/-)" }
      ]
    },
    fileType: '.csv',
    parser: (d: any) => ({
      ...d,
      query_start: +d.query_start,
      query_end: +d.query_end,
      ref_start: +d.ref_start,
      ref_end: +d.ref_end,
      query_name: d.query_name || d.species_name || "Unknown",
      ref_species: d.ref_species || "Reference",
      qry_lvl: d.qry_lvl || "synteny",
      symbol: d.symbol || "",
      class: d.class || "synteny",
      position: d.position || "",
      GeneID: d.GeneID || ""
    })
  },
  species: {
    title: "Species Data",
    description: "Upload species_data.csv file",
    tooltip: {
      title: "Species Data File",
      description: "Contains chromosome information for each species",
      format: [
        { field: "species_name", desc: "Name of the species" },
        { field: "chr_id", desc: "Chromosome identifier" },
        { field: "chr_size_bp", desc: "Chromosome size in base pairs" },
        { field: "centromere_start", desc: "Centromere start position (optional)" },
        { field: "centromere_end", desc: "Centromere end position (optional)" }
      ]
    },
    fileType: ".csv",
    parser: (d: any) => ({
      ...d,
      chr_size_bp: +d.chr_size_bp,
      centromere_start: d.centromere_start ? +d.centromere_start : null,
      centromere_end: d.centromere_end ? +d.centromere_end : null
    })
  },
  reference: {
    title: "Reference Chromosome Sizes",
    description: "Upload ref_chromosome_sizes.csv file",
    tooltip: {
      title: "Reference Chromosome Sizes File",
      description: "Defines the sizes of chromosomes in the reference genome",
      format: [
        { field: "chromosome", desc: "Chromosome identifier" },
        { field: "size", desc: "Chromosome size in base pairs" },
        { field: "centromere_start", desc: "Centromere start position (optional)" },
        { field: "centromere_end", desc: "Centromere end position (optional)" }
      ]
    },
    fileType: ".csv",
    parser: (d: any) => ({
      ...d,
      size: +d.size,
      centromere_start: d.centromere_start ? +d.centromere_start : null,
      centromere_end: d.centromere_end ? +d.centromere_end : null
    })
  },
  annotations: {
    title: "Gene Annotations",
    description: "Upload ref_gene_annotations.csv file (optional)",
    tooltip: {
      title: "Gene Annotations File",
      description: "Contains information about gene annotations",
      format: [
        { field: "chromosome", desc: "Chromosome ID" },
        { field: "start", desc: "Start position" },
        { field: "end", desc: "End position" },
        { field: "strand", desc: "Strand (+/-)" },
        { field: "class", desc: "Gene class" },
        { field: "symbol", desc: "Gene symbol" },
        { field: "name", desc: "Gene name" }
      ]
    },
    fileType: '.csv',
    parser: (d: any) => ({
      ...d,
      start: +d.start,
      end: +d.end,
    })
  },
  breakpoints: {
    title: "Breakpoints Data",
    description: "Upload breakpoints.csv file (optional)",
    tooltip: {
      title: "Breakpoints File",
      description: "Contains information about chromosome breakpoints",
      format: [
        { field: "ref_chr", desc: "Reference chromosome ID" },
        { field: "ref_start", desc: "Start position" },
        { field: "ref_end", desc: "End position" },
        { field: "breakpoint", desc: "Breakpoint identifier" }
      ]
    },
    fileType: '.csv',
    parser: (d: any) => ({
      ...d,
      ref_start: +d.ref_start,
      ref_end: +d.ref_end,
    })
  }
} as const;

type FileType = keyof typeof FILE_CONFIGS;

interface FileUploaderProps {
  onDataLoad: (data: any) => void;
  type: FileType;
  required?: boolean;
}

const GRADIENT_CONFIGS = {
  synteny: {
    gradient: "from-blue-500/10 via-cyan-500/10 to-teal-500/10",
    hover: "hover:from-blue-500/20 hover:via-cyan-500/20 hover:to-teal-500/20"
  },
  species: {
    gradient: "from-purple-500/10 via-pink-500/10 to-rose-500/10",
    hover: "hover:from-purple-500/20 hover:via-pink-500/20 hover:to-rose-500/20"
  },
  reference: {
    gradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
    hover: "hover:from-amber-500/20 hover:via-orange-500/20 hover:to-red-500/20"
  },
  annotations: {
    gradient: "from-emerald-500/10 via-green-500/10 to-lime-500/10",
    hover: "hover:from-emerald-500/20 hover:via-green-500/20 hover:to-lime-500/20"
  },
  breakpoints: {
    gradient: "from-emerald-500/10 via-green-500/10 to-lime-500/10",
    hover: "hover:from-emerald-500/20 hover:via-green-500/20 hover:to-lime-500/20"
  }
} as const;

const FileFormatInfo = ({ config }: { config: typeof FILE_CONFIGS[FileType] }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-2 right-2">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">File format info</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[350px] p-4 space-y-2">
        <div className="space-y-2">
          <h4 className="font-medium">{config.tooltip.title}</h4>
          <p className="text-sm text-muted-foreground">
            {config.tooltip.description}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-medium">Required Fields:</p>
            <div className="grid grid-cols-1 gap-1">
              {config.tooltip.format.map((field, index) => (
                <div key={index} className="text-xs">
                  <span className="font-mono text-primary">{field.field}</span>
                  <span className="text-muted-foreground"> - {field.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground border-t pt-2">
            Download example file from above to see the correct format.
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function CSVUploader({ onDataLoad, type, required = true }: FileUploaderProps) {
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const config = FILE_CONFIGS[type];

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 10, // 10MB
    multiple: false,
    accept: {
      'text/csv': [config.fileType]
    },
  };

  const handleFileChange = async (newFiles: File[] | null) => {
    setFiles(newFiles);
    if (!newFiles || newFiles.length === 0) {
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    try {
      const file = newFiles[0];
      const text = await file.text();
      const data = await d3.csvParse(text, config.parser);
      console.log('Parsed Data:', data); // Add this line
      console.log('Processed Data:', data); // Add this line
      if (data && data.length > 0) {
        setIsValid(true);
        onDataLoad(data);
        toast.success(`Successfully loaded ${config.title}`);
      } else {
        setIsValid(false);
        toast.error(`Invalid ${config.title} format`);
      }
    } catch (error) {
      setIsValid(false);
      toast.error(`Error parsing ${config.title}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FileUploader
      value={files}
      onValueChange={handleFileChange}
      dropzoneOptions={dropZoneConfig}
      className="relative space-y-2"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FileInput className="border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors bg-gradient-to-br from-background to-muted/30 hover:from-background hover:to-muted/50">
          <div className="flex flex-col items-center justify-center p-4 text-center relative">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_CONFIGS[type].gradient} opacity-50 rounded-lg transition-colors duration-300 ${GRADIENT_CONFIGS[type].hover}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.5 }}
            />
            <Upload className="h-8 w-8 mb-2 text-muted-foreground relative z-10" />
            <p className="text-sm font-medium relative z-10">{config.title}</p>
            <p className="text-xs text-muted-foreground relative z-10">{config.description}</p>
            {!required && (
              <p className="text-xs text-muted-foreground mt-1 relative z-10">(Optional)</p>
            )}
          </div>
          <FileFormatInfo config={config} />
        </FileInput>
      </motion.div>
      
      <FileUploaderContent>
        {files?.map((file, i) => (
          <FileUploaderItem 
            key={i} 
            index={i}
            className="flex items-center gap-2 text-sm"
          >
            {isLoading ? (
              <div className="animate-spin">
                <Upload className="h-4 w-4" />
              </div>
            ) : isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span>{file.name}</span>
          </FileUploaderItem>
        ))}
      </FileUploaderContent>
    </FileUploader>
  );
}

interface FileUploaderGroupProps {
  onDataLoad: {
    synteny: (data: any) => void;
    species: (data: any) => void;
    reference: (data: any) => void;
    annotations: (data: any) => void;
    breakpoints?: (data: any) => void;
  };
  trigger?: React.ReactNode;
}

export function FileUploaderGroup({ onDataLoad, trigger }: FileUploaderGroupProps) {
  const [uploadedData, setUploadedData] = useState<{
    synteny?: any[];
    species?: any[];
    reference?: any[];
    annotations?: any[];
    breakpoints?: any[];
  }>({});

  const handleDataLoad = (type: keyof typeof onDataLoad, data: any[]) => {
    setUploadedData(prev => {
      const newData = { ...prev, [type]: data };
      
      // Only process data when all required files are uploaded
      if (newData.synteny && newData.species && newData.reference) {
        // Call onDataLoad for each type in the correct order
        onDataLoad.reference(newData.reference);
        onDataLoad.species(newData.species);
        onDataLoad.synteny(newData.synteny);
        if (newData.annotations) {
          onDataLoad.annotations(newData.annotations);
        }
        if (newData.breakpoints) {
          onDataLoad.breakpoints?.(newData.breakpoints);
        }
      }
      return newData;
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs hover:bg-white/10 hover:text-white transition-colors group"
          >
            <Upload className="h-3.5 w-3.5 group-hover:text-blue-400" />
            <span className="hidden sm:inline ml-1.5">Upload</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Data Upload</SheetTitle>
          <SheetDescription>
            Upload your data files or use the example files provided below
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Required Files
            </h3>
            <div className="space-y-2">
              <CSVUploader type="synteny" onDataLoad={(data) => handleDataLoad('synteny', data)} />
              <CSVUploader type="species" onDataLoad={(data) => handleDataLoad('species', data)} />
              <CSVUploader type="reference" onDataLoad={(data) => handleDataLoad('reference', data)} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Optional Files
            </h3>
            <CSVUploader 
              type="annotations" 
              onDataLoad={(data) => handleDataLoad('annotations', data)}
              required={false}
            />
            <CSVUploader 
              type="breakpoints" 
              onDataLoad={(data) => handleDataLoad('breakpoints', data)}
              required={false}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <FeatureTableConverter />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}