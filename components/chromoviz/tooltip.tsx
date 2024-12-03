"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ChromosomeData, SyntenyData, GeneAnnotation } from "@/app/types";
import React from "react";

export function getChromosomeTooltip(chr: ChromosomeData): JSX.Element {
  const mbSize = (chr.chr_size_bp / 1_000_000).toFixed(2);          
  const centromereInfo = chr.centromere_start && chr.centromere_end
    ? {
        start: (chr.centromere_start / 1_000_000).toFixed(2),
        end: (chr.centromere_end / 1_000_000).toFixed(2)
      }
    : null;
  
  return (
    <div className="space-y-4 p-1 min-w-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="bg-gradient-to-r from-indigo-50 to-blue-50 text-gray-800 dark:from-indigo-950/30 dark:to-blue-950/30 dark:text-gray-100 dark:border-blue-800/30"
          >
            Chromosome
          </Badge>
          <span className="text-sm font-medium dark:text-gray-200">
            {chr.chr_id}
          </span>
        </div>
        <Badge 
          variant="secondary"
          className="bg-blue-100/50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30"
        >
          {mbSize} Mb
        </Badge>
      </div>

      {/* Species Info */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700"
        >
          Species
        </Badge>
        <span className="text-sm text-muted-foreground dark:text-gray-300">
          {chr.species_name}
        </span>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-2 gap-3">
        {/* Type */}
        <div className="space-y-1.5">
          <Badge 
            variant="outline" 
            className="bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700"
          >
            Type
          </Badge>
          <div className="text-sm text-muted-foreground dark:text-gray-300 pl-1">
            {chr.chr_type || 'Unknown'}
          </div>
        </div>

        {/* Structure */}
        {chr.centromere_start && (
          <div className="space-y-1.5">
            <Badge 
              variant="outline" 
              className="bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700"
            >
              Structure
            </Badge>
            <div className="text-sm text-muted-foreground dark:text-gray-300 pl-1">
              {chr.centromere_start ? 'Metacentric/Submetacentric' : 'Acrocentric'}
            </div>
          </div>
        )}
      </div>

      {/* Centromere Info */}
      {centromereInfo && (
        <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className="bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700"
            >
              Centromere Position
            </Badge>
            <Badge 
              variant="secondary"
              className="bg-indigo-100/50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100 dark:border-indigo-800/30"
            >
              {centromereInfo.start}-{centromereInfo.end} Mb
            </Badge>
          </div>

          {/* Centromere Position Visualization */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 dark:bg-indigo-600"
              style={{ 
                width: `${((Number(centromereInfo.end) - Number(centromereInfo.start)) / (chr.chr_size_bp / 1_000_000)) * 100}%`,
                marginLeft: `${(Number(centromereInfo.start) / (chr.chr_size_bp / 1_000_000)) * 100}%`,
                transition: 'all 0.3s ease-in-out'
              }}
            />
          </div>
        </div>
      )}

      {/* Size Comparison */}
      <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700"
          >
            Size Category
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              Number(mbSize) > 100 ? "bg-green-100 text-green-900 dark:bg-green-950/50 dark:text-green-100 dark:border-green-800/30" :
              Number(mbSize) > 50 ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-100 dark:border-yellow-800/30" :
              "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-100 dark:border-orange-800/30"
            )}
          >
            {Number(mbSize) > 100 ? 'Large Chromosome' : 
             Number(mbSize) > 50 ? 'Medium Chromosome' : 
             'Small Chromosome'}
          </Badge>
        </div>

        {/* Size Visualization */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600"
            style={{ 
              width: `${(Number(mbSize) / Math.max(150, Number(mbSize))) * 100}%`,
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function getSyntenyTooltip(link: SyntenyData): JSX.Element {
  const refMb = {
    start: (link.ref_start / 1_000_000).toFixed(2),
    end: (link.ref_end / 1_000_000).toFixed(2)
  };
  const queryMb = {
    start: (link.query_start / 1_000_000).toFixed(2),
    end: (link.query_end / 1_000_000).toFixed(2)
  };
  const size = ((link.ref_end - link.ref_start) / 1_000_000).toFixed(2);
  
  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 dark:from-blue-950/30 dark:to-purple-950/30 dark:text-gray-100 dark:border-blue-800/30">
          Syntenic Block
        </Badge>
        <Badge 
          variant={link.query_strand === '+' ? 'default' : 'destructive'}
          className="flex items-center gap-1"
        >
          {link.query_strand === '+' ? (
            <>Forward <ArrowRight className="h-3 w-3" /></>
          ) : (
            <><ArrowLeft className="h-3 w-3" /> Reverse</>
          )}
        </Badge>
      </div>

      {/* Reference Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30">
            Reference
          </Badge>
          <span className="text-sm text-muted-foreground">{link.ref_species}</span>
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium dark:text-gray-200">{link.ref_chr}</span>
          <Badge variant="secondary" className="bg-blue-100/50 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30">
            {refMb.start}-{refMb.end} Mb
          </Badge>
        </div>
      </div>

      {/* Query Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-100 dark:border-purple-800/30">
            Query
          </Badge>
          <span className="text-sm text-muted-foreground">{link.query_name}</span>
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium dark:text-gray-200">{link.query_chr}</span>
          <Badge variant="secondary" className="bg-purple-100/50 dark:bg-purple-950/50 dark:text-purple-100 dark:border-purple-800/30">
            {queryMb.start}-{queryMb.end} Mb
          </Badge>
        </div>
      </div>

      {/* Properties Section */}
      <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700">
            Size
          </Badge>
          <span className="text-sm font-medium dark:text-gray-200">{size} Mb</span>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700">
            Conservation
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              Number(size) > 10 ? "bg-green-100 text-green-900 dark:bg-green-950/50 dark:text-green-100 dark:border-green-800/30" :
              Number(size) > 5 ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-100 dark:border-yellow-800/30" :
              Number(size) > 1 ? "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-100 dark:border-orange-800/30" :
              "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-100 dark:border-red-800/30"
            )}
          >
            {calculateConservation(Number(size))}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600"
          style={{ 
            width: `${(Number(size) / Math.max(15, Number(size))) * 100}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
    </div>
  );
}

export function getGeneAnnotationTooltip(annotation: GeneAnnotation): string {
  const positionMb = {
    start: (annotation.start / 1_000_000).toFixed(2),
    end: (annotation.end / 1_000_000).toFixed(2)
  };
  
  const size = ((annotation.end - annotation.start) / 1_000).toFixed(1); // Size in kb
  
  return `
    ${annotation.symbol || 'Unknown Gene'}
    ─────────────────
    Name: ${annotation.name || 'N/A'}
    Type: ${annotation.class}
    Location: ${positionMb.start}-${positionMb.end} Mb
    Size: ${size} kb
    Strand: ${annotation.strand === '+' ? 'Forward ➜' : 'Reverse ⟲'}
    ─────────────────
    Details:
    • Accession: ${annotation.genomic_accession}
    • Gene ID: ${annotation.GeneID}
    ${annotation.locus_tag ? `• Locus: ${annotation.locus_tag}` : ''}
  `.trim();
}

function calculateConservation(sizeMb: number): string {
  if (sizeMb > 10) return 'Large conserved block';
  if (sizeMb > 5) return 'Medium conserved block';
  if (sizeMb > 1) return 'Small conserved block';
  return 'Micro-synteny';
}

export interface GeneTooltipData {
  symbol: string;
  strand: '+' | '-';
  class: string;
  position: string;
  isCluster?: boolean;
  geneCount?: number;
  name?: string;
  locus_tag?: string;
  GeneID: string;
}


export function Tooltip({ info }: { info: any }) {
  if (!info || !info.isOpen) return null;

  // Extract gene data if it exists
  const geneData = info.type === 'gene' && info.data ? info.data : null;

  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        mass: 1
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        mass: 0.8,
        delay: i * 0.1
      }
    }),
    exit: { opacity: 0, y: 10 }
  };

  // Handle string content
  if (typeof info.content === 'string' || React.isValidElement(info.content)) {
    return (
      <AnimatePresence>
        {info.isOpen && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
              "bg-white dark:bg-gray-950 rounded-lg shadow-lg",
              "border border-border dark:border-gray-800"
            )}
          >
            <div className="p-4 text-sm whitespace-pre-line dark:text-gray-100">
              {info.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Handle gene data content
  return (
    <AnimatePresence>
      {info.isOpen && (
        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
            "bg-white dark:bg-gray-950 rounded-lg shadow-lg",
            "border border-border dark:border-gray-800"
          )}
        >
          <div className="p-4 space-y-3">
            <motion.div 
              variants={contentVariants}
              custom={0}
              className="flex items-center justify-between gap-2"
            >
              <span className="font-medium text-lg dark:text-gray-100">
                {geneData?.symbol}
              </span>
              <Badge 
                variant="outline"
                className={cn(
                  "transition-all duration-300 flex items-center gap-1",
                  geneData?.strand === '+' 
                    ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/30" 
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/30"
                )}
              >
                {geneData?.strand === '+' ? (
                  <>
                    Forward <ArrowRight className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-3 w-3" /> Reverse
                  </>
                )}
              </Badge>
            </motion.div>

            {geneData?.isCluster && (
              <motion.div
                variants={contentVariants}
                custom={1}
                className="flex items-center gap-2"
              >
                <Badge 
                  variant="outline"
                  className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/30"
                >
                  🔍 Cluster of {geneData.geneCount} genes
                </Badge>
              </motion.div>
            )}

            <motion.div
              variants={contentVariants}
              custom={2}
              className="space-y-2 text-sm text-muted-foreground dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className="bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
                >
                  {geneData?.class}
                </Badge>
                <span>{geneData?.position} Mb</span>
              </div>
              {geneData?.name && (
                <div className="dark:text-gray-300">Name: {geneData.name}</div>
              )}
              {geneData?.locus_tag && (
                <div className="dark:text-gray-300">Locus: {geneData.locus_tag}</div>
              )}
              <div className="dark:text-gray-300">ID: {geneData.GeneID}</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const GENE_ANNOTATION_CONFIG = {
  HEIGHT: 8,
  SPACING: 2,
  COLORS: {
    transcribed_pseudogene: '#94a3b8',
    protein_coding: '#dc2626',
    pseudogene: '#dc2626',
    ncRNA: '#16a34a',
    tRNA: '#8b5cf6',
    rRNA: '#ec4899',
    default: '#6b7280'
  } as const,
}

interface HoverTooltipProps {
  hoveredBlock: SyntenyData | null;
  hoveredChromosome: {
    size: number;
    isRef: boolean;
    position?: number;
    gene?: GeneAnnotation;
  } | null,
  selectedBlock: SyntenyData;
  className?: string;
}

export function HoverTooltip({ 
  hoveredBlock, 
  hoveredChromosome, 
  selectedBlock,
  className 
}: HoverTooltipProps) {
  return (
    <AnimatePresence>
      {(hoveredBlock || hoveredChromosome) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 25,
              mass: 1
            }
          }}
          exit={{ 
            opacity: 0, 
            y: 20, 
            scale: 0.95,
            transition: {
              duration: 0.2
            }
          }}
          className={cn(
            "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
            "bg-white dark:bg-gray-950 rounded-lg shadow-lg",
            "border border-border dark:border-gray-800",
            className
          )}
        >
          <div className="space-y-4 p-4 min-w-[300px]">
            {hoveredBlock && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 dark:from-blue-950/30 dark:to-purple-950/30 dark:text-gray-100 dark:border-blue-800/30"
                  >
                    Syntenic Region
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="bg-blue-100/50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30"
                  >
                    {((hoveredBlock.ref_end - hoveredBlock.ref_start) / 1_000_000).toFixed(2)} Mb
                  </Badge>
                </div>

                {/* Reference Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30">
                      Reference
                    </Badge>
                    <span className="text-sm text-muted-foreground">{hoveredBlock.ref_species} {hoveredBlock.ref_chr}</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100/50 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30">
                    {(hoveredBlock.ref_start / 1_000_000).toFixed(2)}-{(hoveredBlock.ref_end / 1_000_000).toFixed(2)} Mb
                  </Badge>
                </div>
              </>
            )}
            
            {hoveredChromosome && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-indigo-50 to-blue-50 text-gray-800 dark:from-indigo-950/30 dark:to-blue-950/30 dark:text-gray-100 dark:border-blue-800/30"
                  >
                    {hoveredChromosome.isRef ? 'Reference Position' : 'Query Position'}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="bg-blue-100/50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800/30"
                  >
                    {hoveredChromosome.position 
                      ? `${(hoveredChromosome.position / 1_000_000).toFixed(2)} Mb`
                      : `${(hoveredChromosome.size / 1_000_000).toFixed(2)} Mb total`
                    }
                  </Badge>
                </div>

                {/* Gene Info if available */}
                {hoveredChromosome.gene && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:border-gray-700">
                        Gene
                      </Badge>
                      <span className="text-sm font-medium dark:text-gray-200">
                        {hoveredChromosome.gene.symbol || 'Unknown'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100/50 dark:bg-gray-900/50 dark:text-gray-100">
                      {hoveredChromosome.gene.class || 'Unknown Type'}
                    </Badge>
                  </div>
                )}
              </>
            )}

            {/* Single Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600"
                style={{ 
                  width: hoveredBlock 
                    ? `${((hoveredBlock.ref_end - hoveredBlock.ref_start) / hoveredBlock.ref_end) * 100}%`
                    : `${(hoveredChromosome?.position || 0) / (hoveredChromosome?.size || 1) * 100}%`,
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}