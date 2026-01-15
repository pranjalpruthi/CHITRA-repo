"use client";

import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { ExampleFilesDrawer } from "@/components/chromoviz/example-files-drawer";

export function ExampleDrawerTrigger() {
    return (
        <ExampleFilesDrawer onLoadExample={() => { }}>
            <Button
                variant="outline"
                className="w-full sm:w-auto my-8 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 hover:text-orange-700 border-orange-200 dark:border-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
            >
                <Database className="h-4 w-4 mr-2" />
                Explore Example Datasets
            </Button>
        </ExampleFilesDrawer>
    );
}
