'use client'

import { SyntenyData } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, GripHorizontal, MousePointerClick, Table as TableIcon, X, ChevronUp } from "lucide-react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewSelection, setHasNewSelection] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setHasNewSelection(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen && selectedSynteny.length > 0) {
      setHasNewSelection(true)
    }
  }, [selectedSynteny.length, isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-background/80 backdrop-blur-sm border-l shadow-lg"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TableIcon className="h-5 w-5" />
                    <h3 className="font-semibold">Selected Blocks</h3>
                    <Badge variant="secondary">
                      {selectedSynteny.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
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
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {selectedSynteny.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
                    <MousePointerClick className="h-8 w-8" />
                    <p>Click on synteny ribbons to select them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSynteny.map((link) => (
                      <Card
                        key={`${link.ref_chr}-${link.query_chr}-${link.ref_start}`}
                        className="relative group hover:bg-muted/50 transition-colors"
                      >
                        <CardContent className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleSelection(link)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{link.ref_species} {link.ref_chr}</span>
                              <ChevronUp className="h-4 w-4 rotate-90" />
                              <span className="font-medium">{link.query_name} {link.query_chr}</span>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Position: {(link.ref_start / 1_000_000).toFixed(2)}-{(link.ref_end / 1_000_000).toFixed(2)} Mb</div>
                              <div>Size: {((link.ref_end - link.ref_start) / 1_000_000).toFixed(2)} Mb</div>
                              <div className="flex items-center gap-2">
                                Orientation: 
                                <Badge variant="secondary" className={cn(
                                  link.query_strand === '+' 
                                    ? "bg-blue-500/10 text-blue-500" 
                                    : "bg-red-500/10 text-red-500"
                                )}>
                                  {link.query_strand === '+' ? 'Forward ➜' : 'Reverse ⟲'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        whileHover={{ scale: 1.02 }}
        whileDrag={{ scale: 1.05 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-300/30 dark:bg-blue-500/30 blur-2xl rounded-2xl" />
          <div className="absolute inset-0 bg-blue-300/20 dark:bg-blue-400/20 blur-xl rounded-2xl" />
          
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="relative bg-white/90 dark:bg-black/50 backdrop-blur-md border-[1.5px] border-indigo-200 dark:border-white/20 rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing h-auto"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-white">
              <TableIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Selected Blocks</span>
              {selectedSynteny.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedSynteny.length}
                </Badge>
              )}
            </div>
          </Button>
        </div>
      </motion.div>
    </>
  )
}