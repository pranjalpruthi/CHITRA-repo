'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, Transition } from 'motion/react'
import { useMediaQuery } from '@/hooks/use-media-query'
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/animate-ui/radix/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [globalFilter, setGlobalFilter] = useState('')
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  })

  const { rows } = table.getRowModel()
  const parentRef = useRef<HTMLDivElement>(null)

  // Use a simpler map for mobile to ensure reliability
  const mobileContent = (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.id} className="p-3 border rounded-md">
          {row.getVisibleCells().map((cell: any) => (
            <div key={cell.id} className="flex justify-between text-xs py-0.5">
              <span className="font-bold text-muted-foreground pr-2">
                {flexRender(cell.column.columnDef.header, cell.getContext())}:
              </span>
              <span className="text-right truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Standard row height for desktop
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-xs h-8 text-xs flex-grow"
        />
        {filterColumn && (
          <Input
            placeholder={`Filter by ${filterColumn}...`}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-xs h-8 text-xs flex-grow"
          />
        )}
      </div>
      
      <div ref={parentRef} className="h-[60vh] overflow-auto border rounded-md">
        {isMobile ? (
          mobileContent
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-background border-b z-10">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <th 
                      key={header.id}
                      className="h-10 px-2 text-left align-middle font-medium text-muted-foreground bg-background text-xs"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <Button
                          variant="ghost"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "h-8 flex items-center gap-1.5 px-1",
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
                      <td key={cell.id} className="p-2 text-xs">
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
        )}
      </div>
      <div className="text-xs text-muted-foreground pt-1">
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

function SkeletonLoader() {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
      <div className="border rounded-md p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground animate-pulse">
        Fetching data from the cosmos...
      </div>
    </div>
  )
}

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

  return (
    <div className={cn("w-full", className)}>
      <Tabs defaultValue="synteny" className="mt-2">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 text-xs">
          {TABS.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="py-1.5 px-2">{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-3">
            {!tab.data ? (
              <SkeletonLoader />
            ) : tab.data.length > 0 ? (
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
        ))}
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
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent showOverlay={false}>
        <div className="w-full relative">
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 z-10">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
          <div className="h-[90vh] p-4">
            <DrawerHeader>
              <DrawerTitle className='text-foreground text-2xl font-bold mb-4'>
                Raw Data Viewer
              </DrawerTitle>
            </DrawerHeader>
            <div className='mt-4'>
              <RawDataTablesDisplay
                syntenyData={syntenyData}
                speciesData={speciesData}
                referenceData={referenceData}
              />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
