"use client";

import { useState } from "react";
import { FileUploader, FileUploaderContent, FileUploaderItem, FileInput } from "@/components/extension/file-uploader";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as d3 from 'd3';

const FILE_CONFIGS = {
  synteny: {
    title: "Synteny Data",
    description: "Upload synteny_data.csv file",
    fileType: '.csv',
    parser: (d: any) => ({
      ...d,
      query_start: +d.query_start,
      query_end: +d.query_end,
      ref_start: +d.ref_start,
      ref_end: +d.ref_end
    })
  },
  species: {
    title: "Species Data",
    description: "Upload species_data.csv file",
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
    fileType: ".csv",
    parser: (d: any) => ({
      chromosome: d.chromosome,
      genomicAccession: d.genomic_accession,
      start: +d.start,
      end: +d.end,
      strand: d.strand,
      class: d.class,
      locusTag: d.locus_tag || null,
      symbol: d.symbol || null,
      name: d.name || null,
      geneId: d.GeneID
    })
  }
} as const;

type FileType = keyof typeof FILE_CONFIGS;

interface FileUploaderProps {
  onDataLoad: (data: any) => void;
  type: FileType;
  required?: boolean;
}

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
      <FileInput className="border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">{config.title}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          {!required && (
            <p className="text-xs text-muted-foreground mt-1">(Optional)</p>
          )}
        </div>
      </FileInput>
      
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