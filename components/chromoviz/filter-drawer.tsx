'use client'

import React from 'react'
import { Database, X, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/ui/multi-select'
import { Label } from '@/components/ui/label'
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
  description?: string
  icon?: React.ReactNode
}

const FilterSection = ({
  title,
  count,
  total,
  onClear,
  children,
  description,
  icon
}: FilterSectionProps) => {
  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  }, [onClear]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border/50 dark:border-border/30 bg-card dark:bg-card/50 p-4 space-y-4"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <Label className="text-base font-medium">{title}</Label>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <FilterBadge count={count} total={total} />
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        {children}
      </div>
    </motion.div>
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

  const totalSelectedFilters = selectedSpecies.length + selectedChromosomes.length;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div>
          {children}
          {totalSelectedFilters > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center"
            >
              {totalSelectedFilters}
            </Badge>
          )}
        </div>
      </DrawerTrigger>
      
      <DrawerContent className="h-[85vh] max-h-[85vh] md:h-[90vh] md:max-h-[90vh] overflow-hidden">
        <DrawerHeader className="border-b border-border/50 dark:border-border/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DrawerTitle className="text-xl flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Data Filters
                {totalSelectedFilters > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalSelectedFilters} active
                  </Badge>
                )}
              </DrawerTitle>
              <DrawerDescription>
                Configure visualization parameters and data selection
              </DrawerDescription>
            </div>
            <DrawerClose className="rounded-full p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-5 w-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <div className="py-6">
              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Left Column - Species and Reference Selection */}
                <div className="space-y-6">
                  {/* Species Filter Section */}
                  <FilterSection
                    title="Species Selection"
                    description="Choose which species to include in the visualization"
                    count={selectedSpecies.length}
                    total={speciesOptions.length}
                    icon={<Database className="h-4 w-4 text-blue-500" />}
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
                      disabled={isLoading}
                      maxCount={2}
                      modalPopover={true}
                    />
                  </FilterSection>

                  {/* Reference Chromosomes Section */}
                  {referenceGenomeData?.chromosomeSizes && (
                    <FilterSection
                      title="Reference Chromosomes"
                      description="Select chromosomes from the reference genome"
                      count={selectedChromosomes.filter(chr => chr.startsWith('ref:')).length}
                      total={referenceGenomeData.chromosomeSizes.length}
                      icon={<ChevronRight className="h-4 w-4 text-emerald-500" />}
                      onClear={() => setSelectedChromosomes([])}
                    >
                      <MultiSelect
                        value={selectedChromosomes.filter(chr => chr.startsWith('ref:'))}
                        options={referenceGenomeData.chromosomeSizes.map(chr => ({
                          label: chr.chromosome,
                          value: `ref:${chr.chromosome}`
                        }))}
                        onValueChange={(values) => {
                          const currentQueryChrs = selectedChromosomes.filter(chr => !chr.startsWith('ref:'));
                          setSelectedChromosomes([...values, ...currentQueryChrs]);
                        }}
                        placeholder="Select reference chromosomes..."
                        disabled={isLoading}
                        maxCount={10}
                        modalPopover={true}
                      />
                    </FilterSection>
                  )}
                </div>

                {/* Middle Column - Connected Chromosomes */}
                <div className="space-y-6">
                  {/* Connected Query Chromosomes Section */}
                  {connectedQueryChromosomes.length > 0 && (
                    <FilterSection
                      title="Connected Query Chromosomes"
                      description="Chromosomes connected to selected reference chromosomes"
                      count={connectedQueryChromosomes.length}
                      total={connectedQueryChromosomes.length}
                      icon={<ChevronRight className="h-4 w-4 text-violet-500" />}
                      onClear={() => {}}
                    >
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {connectedQueryChromosomes.map((chr) => (
                          <motion.div
                            key={chr.value}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border/50 hover:bg-muted/80 transition-colors"
                          >
                            <Badge variant="outline" className="text-xs flex-1">
                              {chr.label}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </FilterSection>
                  )}
                </div>

                {/* Right Column - Species Chromosomes */}
                <div className="lg:col-span-2 xl:col-span-1">
                  <FilterSection
                    title="Species Chromosomes"
                    description="Select chromosomes from each species"
                    count={selectedChromosomes.filter(chr => !chr.startsWith('ref:')).length}
                    total={Object.values(chromosomeOptions).flat().filter(chr => !chr.value.startsWith('ref:')).length}
                    icon={<ChevronRight className="h-4 w-4 text-rose-500" />}
                    onClear={() => {
                      const refChromosomes = selectedChromosomes.filter(chr => chr.startsWith('ref:'));
                      setSelectedChromosomes(refChromosomes);
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                      {Object.entries(chromosomeOptions).map(([species, chromosomes]) => {
                        if (species === 'Reference') return null;
                        if (selectedSpecies.length > 0 && !selectedSpecies.includes(species)) return null;

                        const selectedCount = selectedChromosomes.filter(chr => 
                          chr.startsWith(`${species}:`)
                        ).length;

                        return (
                          <motion.div
                            key={species}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-md border border-border/50 p-3 space-y-3 bg-muted/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">
                                  {species.replace('_', ' ')}
                                </Label>
                                <FilterBadge count={selectedCount} total={chromosomes.length} />
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
          </ScrollArea>
        </div>

        <DrawerFooter className="border-t border-border/50 dark:border-border/30">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 hover:bg-blue-500/10 hover:text-blue-500 border-border/50"
              onClick={() => {
                setSelectedSpecies([]);
                setSelectedChromosomes([]);
              }}
              disabled={isLoading || (selectedSpecies.length === 0 && selectedChromosomes.length === 0)}
            >
              <Database className="h-4 w-4 mr-2" />
              Show all
            </Button>
            <DrawerClose asChild>
              <Button className="flex-1">
                Apply Filters
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
} 