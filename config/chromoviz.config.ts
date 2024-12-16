export const CHROMOSOME_CONFIG = {
  HEIGHT: 24,
  SPACING: 10,
  TELOMERE_RADIUS: 12,
  CENTROMERE_WIDTH: 20,
  CENTROMERE_INDENT: 6,
  ANNOTATION_HEIGHT: 8,
  ANNOTATION_SPACING: 2,
} as const;

export const GENE_TYPE_COLORS = {
  gene: '#4ade80',       // Green
  exon: '#2563eb',       // Blue
  CDS: '#f43f5e',        // Red
  pseudogene: '#a855f7'  // Purple
} as const;

export const GENE_ANNOTATION_CONFIG = {
  HEIGHT: 8,
  SPACING: 2,
  TRACK_SPACING: 8,
  MAX_TRACKS: 3,
  ARROW_SIZE: 4,
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
  genomicAccession: string;
  start: number;
  end: number;
  strand: '+' | '-';
  class: GeneClass;
  locusTag?: string | null;
  symbol?: string | null;
  name?: string | null;
  geneId: string;
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

export const UI_CONFIG = {
  STRAND_INDICATORS: {
    FORWARD: '⏩',
    REVERSE: '⏪',
  },
  BADGE_STYLES: {
    base: "px-2 py-0.5 rounded-full text-xs font-medium",
    colors: {
      cluster: "bg-blue-100 text-blue-800 border border-blue-200",
      forward: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      reverse: "bg-rose-100 text-rose-800 border border-rose-200",
      default: "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }
} as const;
