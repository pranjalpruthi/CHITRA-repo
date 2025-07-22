export const CHROMOSOME_CONFIG = {
  HEIGHT: 10,
  SPACING: 10,
  CENTROMERE_WIDTH: 20,
  CENTROMERE_INDENT: 6,
} as const;

// Removed unused GENE_TYPE_COLORS - not used anywhere in the codebase

export const GENE_ANNOTATION_CONFIG = {
  HEIGHT: 8,
  COLORS: {
    FORWARD: '#dc2626',    // red-600 for forward strand
    REVERSE: '#2563eb',    // blue-600 for reverse strand
    transcribed_pseudogene: '#94a3b8', // slate-400
    protein_coding: '#2563eb',         // blue-600
    pseudogene: '#dc2626',            // red-600
    ncRNA: '#16a34a',                 // green-600
    tRNA: '#8b5cf6',                  // violet-500
    rRNA: '#ec4899',                  // pink-500
    default: '#6b7280'                // gray-500
  }
} as const;

export type GeneClass = keyof typeof GENE_ANNOTATION_CONFIG.COLORS;

export interface GeneAnnotation {
  chromosome: string;
  genomic_accession: string;
  start: number;
  end: number;
  strand: '+' | '-';
  class: GeneClass;
  locus_tag?: string | null;
  symbol?: string | null;
  name?: string | null;
  GeneID: string;
}

export const SYNTENY_COLORS = {
  FORWARD: '#2563eb1a',
  REVERSE: '#dc26261a',
  BLOCK_FORWARD: '#2563eb',
  BLOCK_REVERSE: '#dc2626',
  STROKE_WIDTH: {
    SMALL: 1.5,
    MEDIUM: 2.5,
    LARGE: 3.5
  },
  OPACITY: {
    DEFAULT: 0.2,
    HOVER: 0.8,
    ACTIVE: 0.9
  }
} as const;

export const OPTIMIZATION_CONFIG = {
  MIN_VISIBLE_SIZE: 1,
  MAX_VISIBLE_GENES: 10000,
  CLUSTERING_THRESHOLD: 0,
  BUFFER_FACTOR: 1.2
} as const;

// Removed unused UI_CONFIG - not used anywhere in the codebase
