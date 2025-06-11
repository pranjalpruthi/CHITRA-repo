"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import pako from "pako";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileUploader, FileInput } from "@/components/extension/file-uploader";
import { Download, Upload, FileSpreadsheet, AlertCircle, HelpCircle, Link } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const InfoDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <HelpCircle className="h-4 w-4 mr-2" />
        <span>How-to Guide</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Feature Table Converter Guide</DialogTitle>
        <DialogDescription>
          A quick guide on how to find and use NCBI Feature Tables with CHITRA.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="aspect-video w-full">
          <video
            src="/media/faeturetable.mp4"
            controls
            className="w-full h-full rounded-lg bg-black"
          />
        </div>
        <div className="space-y-2 text-sm">
          <p><strong>What it does:</strong> This tool processes feature table files from NCBI to generate two essential CSV files for CHITRA.</p>
          <p><strong>Output files:</strong></p>
          <ul className="list-disc list-inside ml-4 text-muted-foreground">
            <li><code>ref_chromosome_sizes.csv</code>: Contains the size of each chromosome.</li>
            <li><code>ref_gene_annotations.csv</code>: Contains detailed gene annotation data.</li>
          </ul>
          <p><strong>Where to get files:</strong> You can download feature table files from the NCBI FTP server. These files usually end with <code>_feature_table.txt.gz</code>.</p>
          <Button asChild variant="link" className="p-0 h-auto">
            <a
              href="https://ftp.ncbi.nlm.nih.gov/genomes/refseq/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link className="h-3 w-3 mr-1" />
              NCBI RefSeq FTP Server
            </a>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const FeatureTableInfo = () => {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center gap-2 text-sm">
            <HelpCircle className="h-4 w-4" />
            How to use the Feature Table Converter
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pl-6 text-sm text-muted-foreground">
            <p>
              This tool converts NCBI Feature Tables into annotation files compatible with CHITRA.
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Download a Feature Table from the NCBI FTP server:
                <a
                  href="https://ftp.ncbi.nlm.nih.gov/genomes/refseq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  ftp.ncbi.nlm.nih.gov
                </a>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Example directory: <a href="https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/405/GCF_000001405.40_GRCh38.p14/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GRCh38.p14 Genome Assembly</a></li>
                  <li>Example feature table: <a href="https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/405/GCF_000001405.40_GRCh38.p14/GCF_000001405.40_GRCh38.p14_feature_table.txt.gz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Feature Table File (.txt.gz)</a></li>
                </ul>
              </li>
              <li>Upload the downloaded .ft or .txt or .txt.gz file.</li>
              <li>
                You will receive two CSV files:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>ref_chromosome_sizes.csv</li>
                  <li>ref_gene_annotations.csv</li>
                </ul>
              </li>
            </ol>
            <p className="text-xs pt-2 border-t">
              Feature Tables contain comprehensive genomic data, including gene locations and other features, which this converter processes for visualization.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export function FeatureTableConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [ftpUrl, setFtpUrl] = useState("");
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'uploading',
    progress: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<{
    chromosomeSizes: any[];
    geneAnnotations: any[];
  } | null>(null);

  const processFeatureTableContent = async (content: string) => {
    setStatus({ stage: 'parsing', progress: 25 });

    const lines = content.split('\n');
    const totalLines = lines.length;
    let processedLines = 0;

    // Track chromosome sizes
    const chromosomeSizes = new Map<string, number>();
    const geneAnnotations: any[] = [];

    for (const line of lines) {
      processedLines++;
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
          rawChromosome,
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

        const chromosome = (rawChromosome || "").trim() || (accession || "").trim();

        // Update chromosome sizes
        const currentEnd = parseInt(end);
        const currentMax = chromosomeSizes.get(chromosome) || 0;
        if (currentEnd > currentMax) {
          chromosomeSizes.set(chromosome, currentEnd);
        }

        // Only collect gene features
        if (feature === 'gene') {
          geneAnnotations.push({
            chromosome: chromosome,
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
  };

  const processFeatureTableFile = async (file: File) => {
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
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });

      await processFeatureTableContent(content);
    } catch (error) {
      console.error('Error processing feature table file:', error);
      toast.error(error instanceof Error ? error.message : 'Error processing feature table file');
    } finally {
      setIsProcessing(false);
    }
  };

  const processFeatureTableFromUrl = async () => {
    if (!ftpUrl) {
      toast.error("Please enter a valid NCBI FTP URL.");
      return;
    }

    setIsProcessing(true);
    setStatus({ stage: 'uploading', progress: 0 });
    toast.info("Fetching data from URL...");

    try {
      // Convert FTP URL to HTTP URL for fetching
      const httpUrl = ftpUrl.replace("ftp://", "https://");
      const response = await axios.get(httpUrl, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 50);
            setStatus({ stage: 'uploading', progress });
          }
        },
      });

      let content: string;
      if (httpUrl.endsWith('.gz')) {
        toast.info("Decompressing file...");
        setStatus({ stage: 'parsing', progress: 50 });
        const decompressedData = pako.inflate(response.data);
        content = new TextDecoder('utf-8').decode(decompressedData);
      } else {
        content = new TextDecoder('utf-8').decode(response.data);
      }
      
      await processFeatureTableContent(content);

    } catch (error) {
      console.error('Error fetching or processing from URL:', error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch or process data from the URL.");
    } finally {
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Feature Table Converter
          </CardTitle>
          <InfoDialog />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter NCBI FTP URL (e.g., ftp://...)"
              value={ftpUrl}
              onChange={(e) => setFtpUrl(e.target.value)}
              disabled={isProcessing}
              className="text-xs"
            />
          </div>
          <Button onClick={processFeatureTableFromUrl} disabled={isProcessing || !ftpUrl} className="w-full">
            Fetch and Process from URL
          </Button>
        </div>

        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-muted-foreground/20"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-muted-foreground/20"></div>
        </div>

        <FileUploader
          value={file ? [file] : null}
          onValueChange={(files) => {
            const newFile = files?.[0] || null;
            setFile(newFile);
            if (newFile) processFeatureTableFile(newFile);
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

        <FeatureTableInfo />

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
