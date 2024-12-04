"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";

interface GuideStep {
    title: string;
    description: string;
    image?: string;
}

const guideSteps: GuideStep[] = [
    {
        title: "Upload Your Data",
        description: "Start by uploading your chromosome data files. CHITRA supports various file formats including CSV and TSV.",
    },
    {
        title: "Visualize",
        description: "Once uploaded, your data will be automatically processed and visualized in an interactive format.",
    },
    {
        title: "Analyze",
        description: "Use our powerful analysis tools to explore chromosomal rearrangements and patterns.",
    },
    {
        title: "Export Results",
        description: "Export your visualizations and analysis results in multiple formats for further use or publication.",
    },
];

export function GuideSheet({ children }: { children?: React.ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="ghost" className="hover:bg-accent/50 h-9">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Guide
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="space-y-4">
                    <SheetTitle className="text-2xl">Getting Started with CHITRA</SheetTitle>
                    <SheetDescription>
                        Follow this guide to learn how to use CHITRA effectively for your chromosome analysis.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                    {/* Quick Start */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Quick Start Guide</h3>
                        <div className="space-y-4">
                            {guideSteps.map((step, index) => (
                                <div key={step.title} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <h4 className="text-sm font-semibold">{step.title}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">{step.description}</p>
                                    {step.image && (
                                        <img 
                                            src={step.image} 
                                            alt={step.title} 
                                            className="rounded-lg border mt-2 pl-8"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Tips & Tricks */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Tips & Tricks</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                            <li>Use the zoom controls to explore detailed regions</li>
                            <li>Save your visualization settings for future use</li>
                            <li>Export high-resolution images for publications</li>
                            <li>Use keyboard shortcuts for faster navigation</li>
                        </ul>
                    </div>

                    <Separator />

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Additional Resources</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                For more detailed information, check out our:
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-4">
                                <li>Documentation</li>
                                <li>Video Tutorials</li>
                                <li>Example Datasets</li>
                                <li>API Reference</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
