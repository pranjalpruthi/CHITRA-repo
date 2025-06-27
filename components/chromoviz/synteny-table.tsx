'use client'

import { SyntenyData } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, GripHorizontal, MousePointerClick, Table as TableIcon, X, ChevronUp, ChevronLeft, ChevronRight , AlertCircle} from "lucide-react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { useState, useEffect, useRef } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SyntenyTableProps {
  selectedSynteny: SyntenyData[]
  onToggleSelection: (link: SyntenyData) => void
  onExport?: (data: SyntenyData[]) => void
  onSelectBlock?: (link: SyntenyData) => void
  currentBlockIndex?: number
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

export function SyntenyTable({ 
  selectedSynteny, 
  onToggleSelection, 
  onExport,
  onSelectBlock,
  currentBlockIndex = 0
}: SyntenyTableProps) {
  const [hasShownFirstToast, setHasShownFirstToast] = useState(false)
  const [hasNewSelection, setHasNewSelection] = useState(false)
  
  useEffect(() => {
    if (selectedSynteny.length === 1 && !hasShownFirstToast) {
      toast.info(
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-blue-700 dark:text-blue-300">
              First Block Selected!
            </p>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
              Click the floating button to view selected synteny blocks.
            </p>
          </div>
        </div>,
        {
          duration: 5000,
          position: "bottom-left",
          className: "bg-background/95 backdrop-blur-sm border-blue-200 dark:border-blue-800",
        }
      );
      setHasShownFirstToast(true);
    }
  }, [selectedSynteny.length, hasShownFirstToast]);

  // Effect to detect new selections for button animation
  useEffect(() => {
    if (selectedSynteny.length > 0) {
      setHasNewSelection(true);
      const timer = setTimeout(() => setHasNewSelection(false), 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [selectedSynteny]);

  return (
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
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "relative rounded-full p-0 overflow-hidden",
                "bg-white/95 dark:bg-black/80 backdrop-blur-xl",
                "border-none shadow-lg hover:shadow-xl",
                "transition-all duration-300 ease-out",
                "hover:scale-105 active:scale-95",
                "cursor-pointer",
                "h-16 w-16 md:w-auto md:px-6",
                "hover:bg-blue-500 dark:hover:bg-blue-950/50",
                "group",
                hasNewSelection && "ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-950 animate-pulse" // Added animate-pulse
              )}
            >
              <div className="relative flex items-center justify-center gap-2">
                <TableIcon className="h-5 w-5 text-gray-700 dark:text-white group-hover:text-white transition-colors" />
                <span className="hidden md:inline-block font-medium text-gray-700 dark:text-white group-hover:text-white transition-colors">
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
          </PopoverTrigger>
          
          <PopoverContent 
            side="top" 
            align="end"
            className="w-96 p-0 bg-background/90 backdrop-blur-xl rounded-xl border shadow-2xl"
          >
            <div className="flex flex-col max-h-[70vh]">
              <div className="p-4 border-b bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TableIcon className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold tracking-tight">Selected Blocks</h3>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 rounded-full px-2">
                      {selectedSynteny.length}
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
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>

              <div className="overflow-auto p-4">
                {selectedSynteny.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-8">
                    <div className="w-12 h-12 rounded-full bg-blue-500/5 flex items-center justify-center">
                      <MousePointerClick className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">Click on synteny ribbons to select them</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedSynteny.map((link, index) => (
                      <motion.div
                        key={`${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.ref_start}`}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          transition: {
                            duration: 0.2
                          }
                        }}
                        exit={{ opacity: 0 }}
                      >
                        <Card
                          className={cn(
                            "relative group transition-all duration-200",
                            "hover:bg-blue-500/5 dark:hover:bg-blue-500/10",
                            "border-none ring-1 ring-black/5 dark:ring-white/10",
                            "shadow-sm hover:shadow-md cursor-pointer",
                            index === currentBlockIndex && [
                              "ring-2 ring-blue-500 dark:ring-blue-400",
                              "bg-blue-500/5 dark:bg-blue-500/10",
                              "shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_1px_3px_0_rgba(59,130,246,0.1)]",
                              "dark:shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_1px_3px_0_rgba(59,130,246,0.2)]"
                            ]
                          )}
                          onClick={() => onSelectBlock?.(link)}
                        >
                          <CardContent className="p-4">
                            <div
                              className="absolute -top-1.5 -right-1.5 z-10 
                                opacity-0 group-hover:opacity-100 
                                transition-opacity duration-200"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSelection(link);
                                }}
                                className={cn(
                                  "h-7 w-7 rounded-full",
                                  "bg-background/80 backdrop-blur-sm",
                                  "ring-1 ring-black/5 dark:ring-white/10",
                                  "shadow-lg hover:shadow-xl",
                                  "transition-all duration-200",
                                  "hover:bg-red-500/10 hover:text-red-500",
                                  "hover:scale-110 active:scale-95"
                                )}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            
                            <div 
                              className={cn(
                                "space-y-2",
                                index === currentBlockIndex && "text-blue-600 dark:text-blue-400"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium tracking-tight">
                                  {link.ref_species} {link.ref_chr}
                                </span>
                                <ChevronUp className={cn(
                                  "h-4 w-4 rotate-90",
                                  index === currentBlockIndex 
                                    ? "text-blue-500"
                                    : "text-muted-foreground"
                                )} />
                                <span className="font-medium tracking-tight">
                                  {link.query_name} {link.query_chr}
                                </span>
                              </div>
                              
                              <div className={cn(
                                "text-sm space-y-1.5",
                                index === currentBlockIndex 
                                  ? "text-blue-600/80 dark:text-blue-400/80"
                                  : "text-muted-foreground"
                              )}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-wider opacity-70">
                                    Position
                                  </span>
                                  <span className="font-medium">
                                    {(link.ref_start / 1_000_000).toFixed(2)}-
                                    {(link.ref_end / 1_000_000).toFixed(2)} Mb
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-wider opacity-70">
                                    Size
                                  </span>
                                  <span className="font-medium">
                                    {((link.ref_end - link.ref_start) / 1_000_000).toFixed(2)} Mb
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-wider opacity-70">
                                    Orientation
                                  </span>
                                  <Badge variant="secondary" className={cn(
                                    "rounded-full px-2 font-medium tracking-tight text-xs",
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

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
              <span>View selected blocks ({selectedSynteny.length})</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}
