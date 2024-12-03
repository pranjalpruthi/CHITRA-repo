'use client'

import { SyntenyData } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, MousePointerClick, X } from "lucide-react"

interface SyntenyTableProps {
  selectedSynteny: SyntenyData[]
  onToggleSelection: (link: SyntenyData) => void
  onExport?: (data: SyntenyData[]) => void
}

function downloadCSV(data: SyntenyData[], filename: string) {
  const headers = [
    'Reference Species',
    'Reference Chromosome',
    'Reference Start (Mb)',
    'Reference End (Mb)',
    'Query Species',
    'Query Chromosome',
    'Query Start (Mb)',
    'Query End (Mb)',
    'Size (Mb)',
    'Orientation'
  ]

  const rows = data.map(link => [
    link.ref_species,
    link.ref_chr,
    (link.ref_start / 1_000_000).toFixed(2),
    (link.ref_end / 1_000_000).toFixed(2),
    link.query_name,
    link.query_chr,
    (link.query_start / 1_000_000).toFixed(2),
    (link.query_end / 1_000_000).toFixed(2),
    ((link.ref_end - link.ref_start) / 1_000_000).toFixed(2),
    link.query_strand === '+' ? 'Forward' : 'Reverse'
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function SyntenyTable({ selectedSynteny, onToggleSelection, onExport }: SyntenyTableProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-sm font-medium">Selected Synteny Blocks</CardTitle>
            <Badge variant="secondary">
              {selectedSynteny.length} selected
            </Badge>
          </div>
          {selectedSynteny.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onExport) {
                  onExport(selectedSynteny)
                } else {
                  downloadCSV(
                    selectedSynteny,
                    `synteny-blocks-${new Date().toISOString().split('T')[0]}.csv`
                  )
                }
              }}
              className="ml-auto"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Reference</TableHead>
                <TableHead className="w-[150px]">Query</TableHead>
                <TableHead className="w-[180px] hidden sm:table-cell">Position (Mb)</TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">Size</TableHead>
                <TableHead className="w-[120px] hidden lg:table-cell">Orientation</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSynteny.map((link) => (
                <TableRow 
                  key={`${link.ref_chr}-${link.query_chr}-${link.ref_start}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onToggleSelection(link)}
                >
                  <TableCell className="font-medium">
                    {`${link.ref_species} ${link.ref_chr}`}
                    <div className="text-xs text-muted-foreground md:hidden">
                      {`${((link.ref_end - link.ref_start) / 1_000_000).toFixed(2)} Mb ${link.query_strand === '+' ? '➜' : '⟲'}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    {`${link.query_name} ${link.query_chr}`}
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {`${(link.ref_start / 1_000_000).toFixed(2)}-${(link.ref_end / 1_000_000).toFixed(2)} Mb`}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {`${(link.ref_start / 1_000_000).toFixed(2)}-${(link.ref_end / 1_000_000).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {`${((link.ref_end - link.ref_start) / 1_000_000).toFixed(2)} Mb`}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {link.query_strand === '+' ? (
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        Forward ➜
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        Reverse ⟲
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelection(link)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {selectedSynteny.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={6} 
                    className="h-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <MousePointerClick className="h-4 w-4" />
                      <p>Click on synteny ribbons to select them</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}