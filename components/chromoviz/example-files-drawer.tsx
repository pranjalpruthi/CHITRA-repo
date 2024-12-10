'use client'

import { motion } from "framer-motion";
import React, { useState, useMemo } from "react";
import { 
  ArrowRight, 
  FileText,
  Loader2,
  TableProperties,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parse } from 'csv-parse/browser/esm/sync';
import { 
  Drawer, 
  DrawerTrigger, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";

interface ExampleFile {
  name: string;
  description: string;
  downloadUrl: string;
  format: { field: string; desc: string }[];
  required: boolean;
  colorClass: string;
}

interface ExampleSet {
  id: string;
  name: string;
  description: string;
}

const EXAMPLE_SETS: ExampleSet[] = [
  {
    id: 'set1',
    name: 'Basic Synteny',
    description: 'Simple synteny visualization between two species'
  },
  {
    id: 'set2',
    name: 'Multi-Species',
    description: 'Complex synteny relationships across multiple species'
  },
  {
    id: 'set3',
    name: 'Annotated Genome',
    description: 'Detailed genome annotations with gene information'
  },
  {
    id: 'set4',
    name: 'Large Scale',
    description: 'Large-scale genome comparison with many chromosomes'
  },
  {
    id: 'set5',
    name: 'Custom Features',
    description: 'Example with custom genomic features'
  }
];

const getExampleFiles = (setId: string): ExampleFile[] => {
  const basePath = `/example/${setId}`;
  const commonFiles = [
    {
      name: "synteny_data.csv",
      description: "Contains information about syntenic blocks between genomes",
      downloadUrl: `${basePath}/synteny_data.csv`,
      format: [
        { field: "ref_chr", desc: "Reference chromosome ID" },
        { field: "ref_start", desc: "Start position in reference" },
        { field: "ref_end", desc: "End position in reference" },
        { field: "query_chr", desc: "Query chromosome ID" },
        { field: "query_start", desc: "Start position in query" },
        { field: "query_end", desc: "End position in query" },
        { field: "query_strand", desc: "Orientation (+/-)" }
      ],
      required: true,
      colorClass: 'from-blue-500/5 to-indigo-500/10'
    },
    {
      name: "species_data.csv",
      description: "Contains chromosome information for each species",
      downloadUrl: `${basePath}/species_data.csv`,
      format: [
        { field: "species_name", desc: "Name of the species" },
        { field: "chromosome_id", desc: "Chromosome identifier" },
        { field: "chromosome_size", desc: "Size of the chromosome" }
      ],
      required: true,
      colorClass: 'from-emerald-500/5 to-teal-500/10'
    },
    {
      name: "ref_chromosome_sizes.csv",
      description: "Contains chromosome sizes for the reference genome",
      downloadUrl: `${basePath}/ref_chromosome_sizes.csv`,
      format: [
        { field: "chromosome_id", desc: "Chromosome identifier" },
        { field: "size", desc: "Size of the chromosome" }
      ],
      required: true,
      colorClass: 'from-violet-500/5 to-purple-500/10'
    }
  ];

  if (['set2', 'set3', 'set4', 'set5'].includes(setId)) {
    commonFiles.push({
      name: "ref_gene_annotations.csv",
      description: setId === 'set4' ? 
        "Comprehensive gene annotations for large-scale genome analysis" :
        "Gene annotations for reference genome with detailed feature information",
      downloadUrl: `${basePath}/ref_gene_annotations.csv`,
      format: [
        { field: "gene_id", desc: "Gene identifier" },
        { field: "chromosome_id", desc: "Chromosome identifier" },
        { field: "start", desc: "Start position" },
        { field: "end", desc: "End position" },
        { field: "strand", desc: "Strand orientation" }
      ],
      required: false,
      colorClass: 'from-rose-500/5 to-pink-500/10'
    });
  }

  return commonFiles;
};

interface ExampleFilesDrawerProps {
  onLoadExample: (path: string) => void;
  children?: React.ReactNode;
}

export function ExampleFilesDrawer({ onLoadExample, children }: ExampleFilesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<ExampleSet>(EXAMPLE_SETS[0]);
  const [activeFile, setActiveFile] = useState<ExampleFile | null>(null);
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTableDrawerOpen, setIsTableDrawerOpen] = useState(false);
  const [isLoadingExample, setIsLoadingExample] = useState(false);

  const exampleFiles = useMemo(() => 
    getExampleFiles(selectedSet.id), 
    [selectedSet]
  );

  const loadCSVData = async (file: ExampleFile) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(file.downloadUrl);
      const text = await response.text();
      const parser = parse(text, { columns: false, skip_empty_lines: true });
      const rows = parser.slice(1, 101); // Get first 100 rows after header
      const headers = parser[0];
      setCsvData({ headers, rows });
    } catch (err) {
      setError('Failed to load CSV data');
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileClick = (file: ExampleFile) => {
    setActiveFile(file);
    loadCSVData(file);
  };

  const handleSetChange = async (newSet: ExampleSet) => {
    setSelectedSet(newSet);
    setActiveFile(null);
    setCsvData(null);
  };

  const handleLoadExample = async () => {
    setIsLoadingExample(true);
    try {
      await onLoadExample(`/example/${selectedSet.id}`);
      setTimeout(() => {
        setIsOpen(false);
        setIsLoadingExample(false);
      }, 500);
    } catch (error) {
      setIsLoadingExample(false);
      console.error('Failed to load example:', error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      
      <DrawerContent className="h-[85vh] max-h-[85vh] md:h-[90vh] md:max-h-[90vh] overflow-hidden">
        <DrawerHeader className="pb-2">
          <DrawerTitle>Quick Demos</DrawerTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Choose from our curated example sets to explore different visualization scenarios
          </p>
        </DrawerHeader>

        <div className="flex flex-col md:flex-row h-[calc(100%-5rem)] overflow-hidden">
          {/* Left Column - Example Sets */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 overflow-auto">
            <div className="p-4 space-y-2">
              {EXAMPLE_SETS.map((set) => (
                <motion.button
                  key={set.id}
                  onClick={() => handleSetChange(set)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedSet.id === set.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      set.id === 'set1' ? 'bg-blue-400' :
                      set.id === 'set2' ? 'bg-emerald-400' :
                      set.id === 'set3' ? 'bg-purple-400' :
                      set.id === 'set4' ? 'bg-amber-400' :
                      'bg-rose-400'
                    }`} />
                    <div>
                      <div className="font-medium">{set.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {set.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {set.id !== 'set1' && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                            Gene Annotations
                          </span>
                        )}
                        {set.id === 'set4' && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                            Large Scale
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
              <Button
                size="sm"
                className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm disabled:opacity-50"
                onClick={handleLoadExample}
                disabled={isLoadingExample}
              >
                {isLoadingExample ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                    Load {selectedSet.name}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - File Details */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Example Files
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Files included in the {selectedSet.name.toLowerCase()} example set
              </p>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-4 space-y-2">
                {exampleFiles.map((file, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleFileClick(file)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeFile?.name === file.name
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 mt-0.5" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {file.description}
                        </div>
                        {!file.required && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 mt-1.5">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* File Format Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: activeFile ? '0%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute md:relative bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 space-y-4"
            >
              {activeFile && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-2">File Format</h4>
                    <div className="space-y-2">
                      {activeFile.format.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5" />
                          <div>
                            <span className="font-mono text-gray-900 dark:text-gray-100">{f.field}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">{f.desc}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        loadCSVData(activeFile);
                        setIsTableDrawerOpen(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <TableProperties className="w-4 h-4" />
                      View Data
                    </Button>
                    <a
                      href={activeFile.downloadUrl}
                      download
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </DrawerContent>

      {/* Table View Drawer */}
      <Drawer open={isTableDrawerOpen} onOpenChange={setIsTableDrawerOpen}>
        <DrawerContent className="h-[85vh] max-h-[85vh] md:h-[90vh] md:max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <TableProperties className="w-5 h-5" />
              {activeFile?.name} - Preview
            </DrawerTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing first 100 rows of data
            </p>
          </DrawerHeader>
          <div className="p-4 h-full overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : csvData ? (
              <div className="border dark:border-gray-800 rounded-lg overflow-hidden h-full">
                <div className="overflow-auto h-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        {csvData.headers.map((header, i) => (
                          <th key={i} className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-800">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.rows.map((row, i) => (
                        <tr key={i} className="border-b dark:border-gray-800 last:border-0">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </Drawer>
  );
} 