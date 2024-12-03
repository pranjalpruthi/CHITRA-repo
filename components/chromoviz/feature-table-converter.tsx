"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader, FileInput } from "@/components/extension/file-uploader";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

interface ProcessingStatus {
  stage: 'uploading' | 'parsing' | 'processing' | 'complete';
  progress: number;
}

interface GeneAnnotation {
  chromosome: string;
  genomic_accession: string;
  start: number;
  end: number;
  strand: string;
  class: string;
  locus_tag: string;
  symbol: string;
  name: string;
  GeneID: string;
}

export function FeatureTableConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({ 
    stage: 'uploading', 
    progress: 0 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<{
    chromosomeSizes: any[];
    geneAnnotations: any[];
  } | null>(null);

  const processFeatureTable = async (file: File) => {
    setIsProcessing(true);
    setStatus({ stage: 'uploading', progress: 0 });

    try {
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 25);
          setStatus({ stage: 'uploading', progress });
        }
      };

      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      setStatus({ stage: 'parsing', progress: 25 });

      const lines = content.split('\n');
      const totalLines = lines.length;
      let processedLines = 0;

      // Track chromosome sizes
      const chromosomeSizes = new Map<string, number>();
      const geneAnnotations: any[] = [];

      for (const line of lines) {
        if (!line.startsWith('#') && line.trim()) {
          const fields = line.split('\t');
          
          // Skip malformed lines
          if (fields.length < 10) continue;

          const [
            feature,
            className,
            ,  // assembly
            ,  // assembly_unit
            ,  // seq_type
            chromosome,
            accession,
            start,
            end,
            strand,
            ,  // product_accession
            ,  // non-redundant_refseq
            ,  // related_accession
            name,
            symbol,
            geneId,
          ] = fields;

          // Update chromosome sizes
          const currentEnd = parseInt(end);
          const currentMax = chromosomeSizes.get(chromosome) || 0;
          if (currentEnd > currentMax) {
            chromosomeSizes.set(chromosome, currentEnd);
          }

          // Only collect gene features
          if (feature === 'gene') {
            geneAnnotations.push({
              chromosome: chromosome.trim(),
              genomic_accession: accession.trim(),
              start: parseInt(start),
              end: parseInt(end),
              strand: strand.trim(),
              class: className.trim(),
              locus_tag: fields[16]?.trim() || '',
              symbol: symbol?.trim() || '',
              name: name?.trim() || '',
              GeneID: geneId?.trim() || ''
            });
          }
        }

        processedLines++;
        if (processedLines % 1000 === 0) {
          setStatus({ 
            stage: 'processing', 
            progress: 25 + Math.floor((processedLines / totalLines) * 75)
          });
        }
      }

      // Convert chromosome sizes to array format
      const chromosomeSizesArray = Array.from(chromosomeSizes.entries()).map(([chromosome, size]) => ({
        chromosome,
        size,
        centromere_start: null,
        centromere_end: null
      }));

      if (chromosomeSizesArray.length === 0 || geneAnnotations.length === 0) {
        throw new Error('No valid data extracted from feature table');
      }

      setProcessedData({
        chromosomeSizes: chromosomeSizesArray,
        geneAnnotations
      });
      
      setStatus({ stage: 'complete', progress: 100 });
      toast.success('Feature table processed successfully');
    } catch (error) {
      console.error('Error processing feature table:', error);
      toast.error(error instanceof Error ? error.message : 'Error processing feature table');
      setIsProcessing(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    // Helper function to escape and format CSV values
    const formatCSVValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape values containing commas, quotes, or newlines
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Format headers
    const headers = Object.keys(data[0]).join(',');
    
    // Format rows with proper escaping
    const rows = data.map(obj => 
      Object.values(obj)
        .map(formatCSVValue)
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusMessage = () => {
    switch (status.stage) {
      case 'uploading':
        return 'Uploading file...';
      case 'parsing':
        return 'Parsing feature table...';
      case 'processing':
        return 'Processing annotations...';
      case 'complete':
        return 'Processing complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Feature Table Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <FileUploader
          value={file ? [file] : null}
          onValueChange={(files) => {
            const newFile = files?.[0] || null;
            setFile(newFile);
            if (newFile) processFeatureTable(newFile);
          }}
          dropzoneOptions={{
            maxFiles: 1,
            accept: {
              'text/plain': ['.txt', '.ft']
            },
            maxSize: 1024 * 1024 * 2048 // 2GB
          }}
        >
          <FileInput className="border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Feature Table</p>
              <p className="text-xs text-muted-foreground">Drop your feature table here</p>
            </div>
          </FileInput>
        </FileUploader>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={status.progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{getStatusMessage()}</span>
              <span>{status.progress}%</span>
            </div>
          </div>
        )}

        {processedData && (
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Note about chromosome sizes</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>Chromosome sizes are estimated based on the last annotated feature position. 
                     This may not reflect the complete chromosome length as it excludes non-coding regions 
                     beyond the last gene and other structural elements. For accurate chromosome sizes, 
                     please refer to genome assembly data.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              onClick={() => downloadCSV(processedData.chromosomeSizes, 'ref_chromosome_sizes.csv')}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Chromosome Sizes
            </Button>
            <Button
              onClick={() => downloadCSV(processedData.geneAnnotations, 'ref_gene_annotations.csv')}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Gene Annotations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}