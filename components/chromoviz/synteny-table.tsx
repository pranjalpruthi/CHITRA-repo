'use client'

import { SyntenyData } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, GripHorizontal, MousePointerClick, Table as TableIcon, X, ChevronUp } from "lucide-react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { useState, useEffect, useRef } from "react"
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
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        panelRef.current && 
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

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
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-background/90 backdrop-blur-xl border-l shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="p-8 border-b bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TableIcon className="h-6 w-6 text-blue-500" />
                    <h3 className="text-lg font-semibold tracking-tight">Selected Blocks</h3>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 rounded-full px-3">
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
                      className={cn(
                        "h-8 w-8 rounded-full",
                        "bg-background/80 backdrop-blur-sm",
                        "ring-1 ring-black/5 dark:ring-white/10",
                        "shadow-sm hover:shadow-md",
                        "transition-all duration-200",
                        "hover:bg-red-500/10 hover:text-red-500",
                        "hover:scale-110 active:scale-95",
                        "focus:outline-none focus:ring-2 focus:ring-red-500"
                      )}
                    >
                      <motion.div
                        whileTap={{ rotate: 90 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      >
                        <X className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8">
                {selectedSynteny.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 py-12">
                    <div className="w-16 h-16 rounded-full bg-blue-500/5 flex items-center justify-center">
                      <MousePointerClick className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">Click on synteny ribbons to select them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSynteny.map((link) => (
                      <Card
                        key={`${link.ref_chr}-${link.query_chr}-${link.ref_start}`}
                        className="relative group hover:bg-muted/30 transition-all duration-300 border-none ring-1 ring-black/5 dark:ring-white/10 shadow-sm hover:shadow-md"
                      >
                        <CardContent className="p-6">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute -top-2 -right-2 z-10"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const button = document.activeElement as HTMLElement;
                                button?.blur();
                                onToggleSelection(link);
                              }}
                              className={cn(
                                "h-8 w-8 rounded-full",
                                "bg-background/80 backdrop-blur-sm",
                                "opacity-0 group-hover:opacity-100",
                                "ring-1 ring-black/5 dark:ring-white/10",
                                "shadow-lg hover:shadow-xl",
                                "transition-all duration-200",
                                "hover:bg-red-500/10 hover:text-red-500",
                                "hover:scale-110 active:scale-95",
                                "focus:outline-none focus:ring-2 focus:ring-red-500"
                              )}
                            >
                              <motion.div
                                whileTap={{ rotate: 90 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                              >
                                <X className="h-4 w-4" />
                              </motion.div>
                            </Button>
                          </motion.div>
                          
                          <motion.div
                            layout
                            className="space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium tracking-tight">{link.ref_species} {link.ref_chr}</span>
                              <ChevronUp className="h-4 w-4 rotate-90 text-muted-foreground" />
                              <span className="font-medium tracking-tight">{link.query_name} {link.query_chr}</span>
                            </div>
                            
                            <div className="text-sm space-y-2 text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider opacity-70">Position</span>
                                <span className="font-medium">{(link.ref_start / 1_000_000).toFixed(2)}-{(link.ref_end / 1_000_000).toFixed(2)} Mb</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider opacity-70">Size</span>
                                <span className="font-medium">{((link.ref_end - link.ref_start) / 1_000_000).toFixed(2)} Mb</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider opacity-70">Orientation</span>
                                <Badge variant="secondary" className={cn(
                                  "rounded-full px-3 font-medium tracking-tight",
                                  link.query_strand === '+' 
                                    ? "bg-blue-500/10 text-blue-500" 
                                    : "bg-red-500/10 text-red-500"
                                )}>
                                  {link.query_strand === '+' ? 'Forward ➜' : 'Reverse ⟲'}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
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
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-lg animate-pulse delay-75" />
          
          <Button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "relative rounded-full p-0 overflow-hidden",
              "bg-white/95 dark:bg-black/80 backdrop-blur-xl",
              "border-none shadow-lg hover:shadow-xl",
              "transition-all duration-300 ease-out",
              "hover:scale-105 active:scale-95",
              "cursor-grab active:cursor-grabbing",
              "h-16 w-16 md:w-auto md:px-6",
              "hover:text-white",
              hasNewSelection && "ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-950"
            )}
          >
            <div className="relative flex items-center justify-center gap-2">
              <TableIcon className="h-5 w-5 text-gray-700 dark:text-white hover:text-white transition-colors" />
              <span className="hidden md:inline-block font-medium text-gray-700 dark:text-white hover:text-white transition-colors">
                Selected Blocks
              </span>
              
              {selectedSynteny.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 md:static md:scale-100"
                >
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center",
                      "bg-blue-500 text-white border-2 border-white dark:border-gray-950",
                      "text-xs font-semibold",
                      "md:border-0"
                    )}
                  >
                    {selectedSynteny.length}
                  </Badge>
                </motion.div>
              )}
            </div>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="sr-only">Selected Blocks</span>
              </TooltipTrigger>
              <TooltipContent 
                side="left"
                className="flex items-center gap-2 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm"
              >
                <TableIcon className="h-4 w-4" />
                <span>Selected Blocks</span>
                {selectedSynteny.length > 0 && (
                  <Badge variant="secondary">
                    {selectedSynteny.length}
                  </Badge>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </>
  )
}