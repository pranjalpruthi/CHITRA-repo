'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, Transition } from 'motion/react'
import useMeasure from 'react-use-measure'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  CellContext
} from '@tanstack/react-table'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/components/motion-primitives/morphing-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/animate-ui/radix/tabs"
import { Input } from "@/components/ui/input"
import { Database, X, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyntenyData, ChromosomeData, GeneAnnotation, ReferenceGenomeData } from "@/app/types"
import { cn } from "@/lib/utils"

// Props for the RawDataTablesDisplay component
interface RawDataTablesDisplayProps {
  syntenyData?: SyntenyData[]
  speciesData?: ChromosomeData[]
  referenceData?: ReferenceGenomeData | null // Allow null
  className?: string
}

interface DataViewerDrawerProps {
  children: React.ReactNode
  syntenyData?: SyntenyData[]
  speciesData?: ChromosomeData[]
  referenceData?: ReferenceGenomeData | null // Allow null
  isVertical?: boolean
}

// Create a virtualized table component
function VirtualTable<T>({ 
  data, 
  columns, 
  filterColumn 
}: { 
  data: T[]
  columns: any[]
  filterColumn?: string
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })

  const { rows } = table.getRowModel()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // approximate row height
    overscan: 10,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

  return (
    <div className="space-y-2.5">
      {filterColumn && (
        <Input
          placeholder={`Filter by ${filterColumn}...`}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}
      
      <div ref={parentRef} className="h-[60vh] overflow-auto border rounded-md">
        <table className="w-full">
          <thead className="sticky top-0 bg-background border-b z-10">{/* Added z-index */}{table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th 
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background" // Ensure header bg for sticky
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "h-8 flex items-center gap-1.5 px-1", // Reduced padding
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow: any) => {
              const row = rows[virtualRow.index]
              return (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  {row.getVisibleCells().map((cell: any) => (
                    <td key={cell.id} className="p-3 text-sm"> {/* Reduced padding, smaller text */}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground pt-1"> {/* Smaller text */}
        Showing {rows.length} rows
      </div>
    </div>
  )
}

// Column definitions for each table type
const columnHelper = createColumnHelper<any>()

const syntenyColumns = [
  columnHelper.accessor('query_name', { header: 'Query Name', size: 140 }),
  columnHelper.accessor('query_chr', { header: 'Query Chr', size: 90 }),
  columnHelper.accessor('query_start', { header: 'Query Start', size: 110, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('query_end', { header: 'Query End', size: 110, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('query_strand', { header: 'Strand', size: 70 }),
  columnHelper.accessor('ref_chr', { header: 'Ref Chr', size: 90 }),
  columnHelper.accessor('ref_start', { header: 'Ref Start', size: 110, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('ref_end', { header: 'Ref End', size: 110, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('ref_species', { header: 'Ref Species', size: 140 }),
  columnHelper.accessor('symbol', { header: 'Symbol', size: 90 }),
  columnHelper.accessor('class', { header: 'Class', size: 110 }),
  columnHelper.accessor('GeneID', { header: 'Gene ID', size: 110 }),
]

const speciesColumns = [
  columnHelper.accessor('species_name', { header: 'Species Name', size: 150 }),
  columnHelper.accessor('chr_id', { header: 'Chr ID', size: 110 }),
  columnHelper.accessor('chr_type', { header: 'Type', size: 90 }),
  columnHelper.accessor('chr_size_bp', { header: 'Size (bp)', size: 120, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('centromere_start', { header: 'Centro. Start', size: 130, cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A' }),
  columnHelper.accessor('centromere_end', { header: 'Centro. End', size: 130, cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A' }),
]

const referenceColumns = [
  columnHelper.accessor('chromosome', { header: 'Chromosome', size: 120 }),
  columnHelper.accessor('size', { header: 'Size', size: 120, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('centromere_start', { header: 'Centro. Start', size: 140, cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A' }),
  columnHelper.accessor('centromere_end', { header: 'Centro. End', size: 140, cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A' }),
]

const geneColumns = [
  columnHelper.accessor('chromosome', { header: 'Chr', size: 100 }),
  columnHelper.accessor('genomic_accession', { header: 'Accession', size: 140 }),
  columnHelper.accessor('start', { header: 'Start', size: 110, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('end', { header: 'End', size: 110, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('strand', { header: 'Strand', size: 70 }),
  columnHelper.accessor('class', { header: 'Class', size: 140 }),
  columnHelper.accessor('symbol', { header: 'Symbol', size: 90, cell: (info: CellContext<any, string>) => info.getValue() || 'N/A' }),
  columnHelper.accessor('name', { header: 'Name', size: 180, cell: (info: CellContext<any, string>) => info.getValue() || 'N/A' }),
  columnHelper.accessor('locus_tag', { header: 'Locus Tag', size: 110, cell: (info: CellContext<any, string>) => info.getValue() || 'N/A' }),
  columnHelper.accessor('GeneID', { header: 'Gene ID', size: 110 }),
]

const breakpointColumns = [
  columnHelper.accessor('ref_chr', { header: 'Ref Chr', size: 160 }),
  columnHelper.accessor('ref_start', { header: 'Start Pos', size: 130, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('ref_end', { header: 'End Pos', size: 130, cell: (info: CellContext<any, number>) => info.getValue().toLocaleString() }),
  columnHelper.accessor('breakpoint', { header: 'Breakpoint Type', size: 140 }),
]

// New component to display raw data tables directly
export function RawDataTablesDisplay({
  syntenyData,
  speciesData,
  referenceData,
  className,
}: RawDataTablesDisplayProps) {
  const TABS = [
    { id: 'synteny', label: 'Synteny', data: syntenyData, columns: syntenyColumns, filterColumn: 'query_name' },
    { id: 'species', label: 'Species', data: speciesData, columns: speciesColumns, filterColumn: 'species_name' },
    { id: 'reference', label: 'Reference', data: referenceData?.chromosomeSizes, columns: referenceColumns, filterColumn: 'chromosome' },
    { id: 'genes', label: 'Genes', data: referenceData?.geneAnnotations, columns: geneColumns, filterColumn: 'symbol' },
    { id: 'breakpoints', label: 'Breakpoints', data: referenceData?.breakpoints, columns: breakpointColumns, filterColumn: 'ref_chr' },
  ];
  const [ref, { height }] = useMeasure();
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const transition: Transition = {
    type: "spring",
    duration: 0.4,
    bounce: 0.2,
  };

  return (
    <div className={cn("w-full", className)}>
      <Tabs defaultValue="synteny" onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 text-xs">
          {TABS.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="py-1.5 px-2">{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        <motion.div animate={{ height: height || "auto" }} transition={transition}>
        <div ref={ref}>
        <AnimatePresence initial={false} mode="wait">
          {TABS.map(tab =>
            activeTab === tab.id ? (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={transition}
              >
                <TabsContent value={tab.id} className="mt-3">
                  {tab.data && tab.data.length > 0 ? (
                    <VirtualTable
                      data={tab.data as any[]}
                      columns={tab.columns}
                      filterColumn={tab.filterColumn}
                    />
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No {tab.label.toLowerCase()} data loaded
                    </div>
                  )}
                </TabsContent>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        </div>
      </motion.div>
      </Tabs>
    </div>
  );
}

export function DataViewerDrawer({
  children,
  syntenyData,
  speciesData,
  referenceData,
}: DataViewerDrawerProps) {
  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 24,
      }}
    >
      <MorphingDialogTrigger>
        {children}
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: '12px',
          }}
          className='relative h-auto w-[90vw] max-w-7xl border border-gray-100 bg-background'
        >
          <ScrollArea className='h-[90vh]'>
            <div className='relative p-6'>
              <MorphingDialogTitle className='text-foreground text-2xl font-bold mb-4'>
                Raw Data Viewer
              </MorphingDialogTitle>
              <div className='mt-4'>
                <RawDataTablesDisplay
                  syntenyData={syntenyData}
                  speciesData={speciesData}
                  referenceData={referenceData}
                />
              </div>
            </div>
          </ScrollArea>
          <MorphingDialogClose className='text-zinc-500' />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
