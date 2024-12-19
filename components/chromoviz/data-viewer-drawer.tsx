'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useState } from 'react'
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
  DrawerTrigger, 
  DrawerContent,
  DrawerHeader, 
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Database, X, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyntenyData, ChromosomeData, GeneAnnotation, ReferenceGenomeData } from "@/app/types"
import { cn } from "@/lib/utils"

interface DataViewerDrawerProps {
  children: React.ReactNode
  syntenyData?: SyntenyData[]
  speciesData?: ChromosomeData[]
  referenceData?: ReferenceGenomeData
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
      
      <div ref={parentRef} className="h-[calc(80vh-200px)] overflow-auto border rounded-md">
        <table className="w-full">
          <thead className="sticky top-0 bg-background border-b">
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th 
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "h-8 flex items-center gap-1.5",
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
                <tr key={row.id} className="border-b">
                  {row.getVisibleCells().map((cell: any) => (
                    <td key={cell.id} className="p-4">
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
      <div className="text-sm text-muted-foreground">
        Showing {rows.length} rows
      </div>
    </div>
  )
}

// Column definitions for each table type
const columnHelper = createColumnHelper<any>()

const syntenyColumns = [
  columnHelper.accessor('query_name', {
    header: 'Query Name',
    size: 150,
  }),
  columnHelper.accessor('query_chr', {
    header: 'Query Chr',
    size: 100,
  }),
  columnHelper.accessor('query_start', {
    header: 'Query Start',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('query_end', {
    header: 'Query End',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('query_strand', {
    header: 'Strand',
    size: 80,
  }),
  columnHelper.accessor('ref_chr', {
    header: 'Ref Chr',
    size: 100,
  }),
  columnHelper.accessor('ref_start', {
    header: 'Ref Start',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('ref_end', {
    header: 'Ref End',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('ref_species', {
    header: 'Ref Species',
    size: 150,
  }),
  columnHelper.accessor('symbol', {
    header: 'Symbol',
    size: 100,
  }),
  columnHelper.accessor('class', {
    header: 'Class',
    size: 120,
  }),
  columnHelper.accessor('GeneID', {
    header: 'Gene ID',
    size: 120,
  }),
]

const speciesColumns = [
  columnHelper.accessor('species_name', {
    header: 'Species Name',
    size: 150,
  }),
  columnHelper.accessor('chr_id', {
    header: 'Chromosome ID',
    size: 120,
  }),
  columnHelper.accessor('chr_type', {
    header: 'Type',
    size: 100,
  }),
  columnHelper.accessor('chr_size_bp', {
    header: 'Size (bp)',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('centromere_start', {
    header: 'Centromere Start',
    size: 140,
    cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A',
  }),
  columnHelper.accessor('centromere_end', {
    header: 'Centromere End',
    size: 140,
    cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A',
  }),
]

const referenceColumns = [
  columnHelper.accessor('chromosome', {
    header: 'Chromosome',
    size: 120,
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('centromere_start', {
    header: 'Centromere Start',
    size: 140,
    cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A',
  }),
  columnHelper.accessor('centromere_end', {
    header: 'Centromere End',
    size: 140,
    cell: (info: CellContext<any, number>) => info.getValue()?.toLocaleString() ?? 'N/A',
  }),
]

const geneColumns = [
  columnHelper.accessor('chromosome', {
    header: 'Chromosome',
    size: 120,
  }),
  columnHelper.accessor('genomic_accession', {
    header: 'Accession',
    size: 150,
  }),
  columnHelper.accessor('start', {
    header: 'Start',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('end', {
    header: 'End',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('strand', {
    header: 'Strand',
    size: 80,
  }),
  columnHelper.accessor('class', {
    header: 'Class',
    size: 150,
  }),
  columnHelper.accessor('symbol', {
    header: 'Symbol',
    size: 100,
    cell: (info: CellContext<any, number>) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
    cell: (info: CellContext<any, number>) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('locus_tag', {
    header: 'Locus Tag',
    size: 120,
    cell: (info: CellContext<any, number>) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('GeneID', {
    header: 'Gene ID',
    size: 120,
  }),
]

const breakpointColumns = [
  columnHelper.accessor('ref_chr', {
    header: 'Reference Chromosome',
    size: 180,
  }),
  columnHelper.accessor('ref_start', {
    header: 'Start Position',
    size: 140,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('ref_end', {
    header: 'End Position',
    size: 140,
    cell: (info: CellContext<any, number>) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('breakpoint', {
    header: 'Breakpoint Type',
    size: 150,
  }),
]

export function DataViewerDrawer({
  children,
  syntenyData,
  speciesData,
  referenceData,
  isVertical
}: DataViewerDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>Data Viewer</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="p-4">
            <Tabs defaultValue="synteny" className="mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="synteny">Synteny</TabsTrigger>
                <TabsTrigger value="species">Species</TabsTrigger>
                <TabsTrigger value="reference">Reference</TabsTrigger>
                <TabsTrigger value="genes">Genes</TabsTrigger>
                <TabsTrigger value="breakpoints">Breakpoints</TabsTrigger>
              </TabsList>

              <TabsContent value="synteny" className="mt-4">
                {syntenyData ? (
                  <VirtualTable 
                    data={syntenyData} 
                    columns={syntenyColumns}
                    filterColumn="query_name"
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No synteny data loaded
                  </div>
                )}
              </TabsContent>

              <TabsContent value="species" className="mt-4">
                {speciesData ? (
                  <VirtualTable 
                    data={speciesData} 
                    columns={speciesColumns}
                    filterColumn="species_name"
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No species data loaded
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reference" className="mt-4">
                {referenceData?.chromosomeSizes ? (
                  <VirtualTable 
                    data={referenceData.chromosomeSizes} 
                    columns={referenceColumns}
                    filterColumn="chromosome"
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No reference data loaded
                  </div>
                )}
              </TabsContent>

              <TabsContent value="genes" className="mt-4">
                {referenceData?.geneAnnotations ? (
                  <VirtualTable 
                    data={referenceData.geneAnnotations} 
                    columns={geneColumns}
                    filterColumn="symbol"
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No gene annotation data loaded
                  </div>
                )}
              </TabsContent>

              <TabsContent value="breakpoints" className="mt-4">
                {referenceData?.breakpoints ? (
                  <VirtualTable 
                    data={referenceData.breakpoints} 
                    columns={breakpointColumns}
                    filterColumn="ref_chr"
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No breakpoint data loaded
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 