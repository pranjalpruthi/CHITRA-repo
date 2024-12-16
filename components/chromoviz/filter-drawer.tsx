'use client'

import React from 'react'
import { Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/ui/multi-select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { motion } from 'framer-motion'

interface FilterBadgeProps {
  count: number
  total: number
}

const FilterBadge = ({ count, total }: FilterBadgeProps) => (
  <Badge 
    variant={count === total ? "secondary" : "default"}
    className="ml-2 text-xs"
  >
    {count}/{total}
  </Badge>
)

interface FilterSectionProps {
  title: string
  count: number
  total: number
  onClear: () => void
  children: React.ReactNode
}

const FilterSection = ({
  title,
  count,
  total,
  onClear,
  children
}: FilterSectionProps) => {
  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  }, [onClear]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{title}</Label>
          <FilterBadge count={count} total={total} />
        </div>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};

interface ChromosomeOption {
  label: string
  value: string
  species: string
}

interface FilterDrawerProps {
  selectedSpecies: string[]
  setSelectedSpecies: (species: string[]) => void
  selectedChromosomes: string[]
  setSelectedChromosomes: (chromosomes: string[]) => void
  speciesOptions: { label: string; value: string }[]
  chromosomeOptions: { [species: string]: ChromosomeOption[] }
  referenceGenomeData?: {
    chromosomeSizes: { chromosome: string }[]
  }
  syntenyData?: {
    ref_chr: string
    query_chr: string
    query_name: string
  }[]
  isLoading?: boolean
  children?: React.ReactNode
}

export const FilterDrawer = ({ 
  children,
  selectedSpecies,
  setSelectedSpecies,
  selectedChromosomes,
  setSelectedChromosomes,
  speciesOptions,
  chromosomeOptions,
  referenceGenomeData,
  syntenyData,
  isLoading
}: FilterDrawerProps) => {
  // Get connected query chromosomes for selected reference chromosomes
  const getConnectedQueryChromosomes = (refChrs: string[]) => {
    if (!syntenyData) return [];
    
    const refChrsWithoutPrefix = refChrs.map(chr => chr.replace('ref:', ''));
    
    // Use a Map to ensure uniqueness based on value
    const uniqueChromosomes = new Map();
    
    syntenyData
      .filter(syn => refChrsWithoutPrefix.includes(syn.ref_chr))
      .forEach(syn => {
        const value = `${syn.query_name}:${syn.query_chr}`;
        if (!uniqueChromosomes.has(value)) {
          uniqueChromosomes.set(value, {
            label: `${syn.query_name} ${syn.query_chr}`,
            value: value,
            species: syn.query_name
          });
        }
      });
    
    return Array.from(uniqueChromosomes.values());
  };

  // Get unique query chromosomes based on selected reference chromosomes
  const connectedQueryChromosomes = React.useMemo(() => {
    const selectedRefChrs = selectedChromosomes.filter(chr => chr.startsWith('ref:'));
    return getConnectedQueryChromosomes(selectedRefChrs);
  }, [selectedChromosomes, syntenyData]);

  // Automatically update selected chromosomes when reference selection changes
  React.useEffect(() => {
    const selectedRefChrs = selectedChromosomes.filter(chr => chr.startsWith('ref:'));
    
    if (selectedRefChrs.length > 0) {
      // Get all connected chromosomes for the selected reference chromosomes
      const connectedChrs = getConnectedQueryChromosomes(selectedRefChrs);
      
      // If no query chromosomes are explicitly selected, don't auto-select any
      const hasSelectedQueryChrs = selectedChromosomes.some(chr => 
        !chr.startsWith('ref:')
      );

      if (hasSelectedQueryChrs) {
        // If query chromosomes are selected, filter to keep only valid connections
        const connectedValues = connectedChrs.map(chr => chr.value);
        const currentQueryChrs = selectedChromosomes.filter(chr => 
          !chr.startsWith('ref:') && connectedValues.includes(chr)
        );
        
        setSelectedChromosomes([...selectedRefChrs, ...currentQueryChrs]);
      } else {
        // If no query chromosomes are selected, just keep the reference selection
        setSelectedChromosomes(selectedRefChrs);
      }
    }
  }, [selectedChromosomes.filter(chr => chr.startsWith('ref:')).join(','), syntenyData]);

  // Add this function to filter synteny data based on selections
  const getFilteredSyntenyData = (data: typeof syntenyData) => {
    if (!data) return [];
    
    return data.filter(syn => {
      const refChr = `ref:${syn.ref_chr}`;
      const queryChr = `${syn.query_name}:${syn.query_chr}`;
      
      // If no chromosomes are selected, show all
      if (selectedChromosomes.length === 0) return true;
      
      // Only show ribbons between selected chromosomes
      return selectedChromosomes.includes(refChr) && 
             selectedChromosomes.includes(queryChr);
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="fixed bottom-0 left-0 right-0 rounded-t-[10px] bg-white dark:bg-background/40 backdrop-blur-xl border-t border-border/50 dark:border-border/30 shadow-lg">
        <div className="mx-auto w-full max-w-none md:max-w-none">
          {/* Handle - only show on mobile */}
          <div className="sticky top-0 flex w-full items-center justify-center bg-transparent pt-3 md:hidden">
            <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-border/20" />
          </div>

          <div className="h-[85vh] md:h-[75vh] overflow-y-auto overscroll-contain px-3 md:px-4">
            <DrawerHeader className="pb-4 sticky top-0 bg-white dark:bg-background/40 backdrop-blur-xl z-10 border-b border-border/50 dark:border-border/30">
              <DrawerTitle className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                Data Filters
              </DrawerTitle>
              <DrawerDescription className="text-xs md:text-sm text-muted-foreground">
                Configure which species and chromosomes to display
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 py-4">
              {/* Species Filter Section */}
              <div className="space-y-6">
                <FilterSection
                  title="Species"
                  count={selectedSpecies.length}
                  total={speciesOptions.length}
                  onClear={() => {
                    setSelectedSpecies([]);
                    const remainingChromosomes = selectedChromosomes.filter(chr => 
                      chr.startsWith('ref:')
                    );
                    setSelectedChromosomes(remainingChromosomes);
                  }}
                >
                  <MultiSelect
                    value={selectedSpecies}
                    options={speciesOptions}
                    onValueChange={setSelectedSpecies}
                    placeholder="Filter by species..."
                    className="mt-1.5"
                    disabled={isLoading}
                    maxCount={2}
                    modalPopover={true}
                  />
                </FilterSection>

                {/* Reference Chromosomes Section */}
                {referenceGenomeData?.chromosomeSizes && (
                  <FilterSection
                    title="Reference Chromosomes"
                    count={selectedChromosomes.filter(chr => chr.startsWith('ref:')).length}
                    total={referenceGenomeData.chromosomeSizes.length}
                    onClear={() => {
                      setSelectedChromosomes([]);
                    }}
                  >
                    <MultiSelect
                      value={selectedChromosomes.filter(chr => chr.startsWith('ref:'))}
                      options={referenceGenomeData.chromosomeSizes.map(chr => ({
                        label: chr.chromosome,
                        value: `ref:${chr.chromosome}`
                      }))}
                      onValueChange={(values) => {
                        // When reference chromosomes change, update selection but keep existing query selections
                        const currentQueryChrs = selectedChromosomes.filter(chr => !chr.startsWith('ref:'));
                        setSelectedChromosomes([...values, ...currentQueryChrs]);
                      }}
                      placeholder="Select reference chromosomes..."
                      className="mt-1.5"
                      disabled={isLoading}
                      maxCount={10}
                      modalPopover={true}
                    />
                  </FilterSection>
                )}

                {/* Connected Query Chromosomes Section - Read Only Display */}
                {connectedQueryChromosomes.length > 0 && (
                  <FilterSection
                    title="Connected Query Chromosomes"
                    count={connectedQueryChromosomes.length}
                    total={connectedQueryChromosomes.length}
                    onClear={() => {}}
                  >
                    <div className="mt-2 space-y-2">
                      {connectedQueryChromosomes.map((chr) => (
                        <div key={chr.value} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {chr.label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </FilterSection>
                )}
              </div>

              {/* Species Chromosomes Sections */}
              <div className="space-y-6">
                {/* Species Chromosomes Section */}
                <FilterSection
                  title="Species Chromosomes"
                  count={selectedChromosomes.filter(chr => !chr.startsWith('ref:')).length}
                  total={Object.values(chromosomeOptions).flat().filter(chr => !chr.value.startsWith('ref:')).length}
                  onClear={() => {
                    const refChromosomes = selectedChromosomes.filter(chr => chr.startsWith('ref:'));
                    setSelectedChromosomes(refChromosomes);
                  }}
                >
                  <div className="space-y-4 mt-1.5">
                    {Object.entries(chromosomeOptions).map(([species, chromosomes]) => {
                      if (species === 'Reference') return null;
                      if (selectedSpecies.length > 0 && !selectedSpecies.includes(species)) {
                        return null;
                      }

                      const selectedCount = selectedChromosomes.filter(chr => 
                        chr.startsWith(`${species}:`)
                      ).length;

                      return (
                        <motion.div
                          key={species}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-2 bg-zinc-50 dark:bg-background/20 hover:bg-zinc-100 dark:hover:bg-accent/10 p-3 rounded-lg border border-border/50 dark:border-border/30 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">
                                {species.replace('_', ' ')}
                              </Label>
                              <FilterBadge 
                                count={selectedCount} 
                                total={chromosomes.length} 
                              />
                            </div>
                            {selectedCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const otherChromosomes = selectedChromosomes.filter(chr => 
                                    !chr.startsWith(`${species}:`)
                                  );
                                  setSelectedChromosomes(otherChromosomes);
                                }}
                                className="h-7 px-2 text-xs"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                          <MultiSelect
                            value={selectedChromosomes.filter(chr => 
                              chr.startsWith(`${species}:`)
                            )}
                            options={chromosomes}
                            onValueChange={(values) => {
                              const otherChromosomes = selectedChromosomes.filter(chr => 
                                !chr.startsWith(`${species}:`)
                              );
                              setSelectedChromosomes([...otherChromosomes, ...values]);
                            }}
                            placeholder={`Select chromosomes...`}
                            className="mt-1.5"
                            disabled={isLoading}
                            maxCount={2}
                            modalPopover={true}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </FilterSection>
              </div>
            </div>
          </div>

          <DrawerFooter className="px-4 py-3 border-t border-border/50 dark:border-border/30 bg-white dark:bg-background/40 backdrop-blur-xl">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-background/40 dark:bg-background/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/10 hover:text-blue-500 border border-border/50 dark:border-border/30 shadow-sm backdrop-blur-md text-sm"
                onClick={() => {
                  // Reset selections to show all data
                  setSelectedSpecies([]);
                  setSelectedChromosomes([]);
                }}
                disabled={isLoading || (selectedSpecies.length === 0 && selectedChromosomes.length === 0)}
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Show all
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 shadow-sm text-sm bg-primary/90 dark:bg-primary/80 hover:bg-primary/80 dark:hover:bg-primary/70">
                  Done
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 