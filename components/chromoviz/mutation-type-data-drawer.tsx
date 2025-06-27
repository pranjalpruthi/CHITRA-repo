"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SyntenyData } from "@/app/types";
import { MutationType, mutationFullNames, MUTATION_COLORS } from "@/components/chromoviz/synteny-ribbon";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MutationTypeDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSynteny: SyntenyData[];
  selectedMutationTypes: Map<string, MutationType>;
}

interface TaggedSyntenyData extends SyntenyData {
  mutationType?: MutationType;
}

export const MutationTypeDataDrawer = ({
  isOpen,
  onClose,
  selectedSynteny,
  selectedMutationTypes,
}: MutationTypeDataDrawerProps) => {

  const getTaggedData = (): TaggedSyntenyData[] => {
    return selectedSynteny.map(link => {
      const syntenyId = `${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}`;
      const mutationType = selectedMutationTypes.get(syntenyId);
      return { ...link, mutationType };
    }).filter(item => item.mutationType) as TaggedSyntenyData[];
  };

  const taggedData = React.useMemo(() => getTaggedData(), [selectedSynteny, selectedMutationTypes]);

  const columns: ColumnDef<TaggedSyntenyData>[] = [
    {
      accessorKey: "ref_chr",
      header: "Ref Chr",
    },
    {
      accessorKey: "ref_start",
      header: "Ref Start",
    },
    {
      accessorKey: "ref_end",
      header: "Ref End",
    },
    {
      accessorKey: "query_chr",
      header: "Query Chr",
    },
    {
      accessorKey: "query_start",
      header: "Query Start",
    },
    {
      accessorKey: "query_end",
      header: "Query End",
    },
    {
      accessorKey: "query_strand",
      header: "Strand",
    },
    {
      accessorKey: "query_name",
      header: "Query Name",
    },
    {
      accessorKey: "mutationType",
      header: "Mutation",
      cell: ({ row }) => {
        const mutationType = row.original.mutationType;
        if (!mutationType) return null;
        const color = MUTATION_COLORS[mutationType];
        const fullName = mutationFullNames[mutationType];
        return (
          <Badge style={{ backgroundColor: color, color: 'white' }} className="px-2 py-1 rounded-full">
            {fullName}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: taggedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const exportToCSV = () => {
    const headers = [
      "Reference Chromosome", "Reference Start", "Reference End",
      "Query Chromosome", "Query Start", "Query End", "Query Strand",
      "Query Name", "Mutation Type"
    ];
    const rows = taggedData.map(item => [
      item.ref_chr, item.ref_start, item.ref_end,
      item.query_chr, item.query_start, item.query_end, item.query_strand,
      item.query_name,
      item.mutationType ? mutationFullNames[item.mutationType] : "N/A"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.map(h => `"${h}"`).join(",") + "\n"
      + rows.map(row => row.map(field => `"${field}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mutation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="left">
      <DrawerContent className="w-full max-w-5xl mx-auto h-[100vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Tagged Mutation Data</DrawerTitle>
          <DrawerDescription>
            A list of all synteny blocks tagged with a mutation type.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t">
          <Button onClick={exportToCSV} disabled={taggedData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};