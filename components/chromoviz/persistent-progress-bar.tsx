"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChromosomeData, GeneAnnotation, SyntenyData } from "@/app/types";

interface PersistentProgressBarProps {
    chromosome?: ChromosomeData | null;
    hoveredBlock?: SyntenyData | null;
    position?: number | null;
    gene?: GeneAnnotation | null;
    show: boolean;
}

export function PersistentProgressBar({
    chromosome,
    hoveredBlock,
    position,
    gene,
    show,
}: PersistentProgressBarProps) {
    const formatMb = (value: number) => `${(value / 1_000_000).toFixed(2)} Mb`;

    let startPercent = 0;
    let widthPercent = 0;
    let startLabel = "";
    let endLabel = "";
    let midLabel = "";

    if (!chromosome) {
        return null;
    }

    if (hoveredBlock) {
        // In linear view, a synteny block can be between any two chromosomes.
        // We need to know which chromosome of the pair is being used as the base for the progress bar.
        // Let's assume the 'ref' part of the synteny link is the primary.
        startPercent = (hoveredBlock.ref_start / chromosome.chr_size_bp) * 100;
        widthPercent = ((hoveredBlock.ref_end - hoveredBlock.ref_start) / chromosome.chr_size_bp) * 100;
        startLabel = formatMb(hoveredBlock.ref_start);
        endLabel = formatMb(hoveredBlock.ref_end);
    } else if (gene) {
        startPercent = (gene.start / chromosome.chr_size_bp) * 100;
        widthPercent = ((gene.end - gene.start) / chromosome.chr_size_bp) * 100;
        startLabel = formatMb(gene.start);
        endLabel = formatMb(gene.end);
    } else if (position !== null && position !== undefined) {
        startPercent = (position / chromosome.chr_size_bp) * 100;
        widthPercent = 0.5; // Small marker for a single point
        startPercent -= widthPercent / 2; // Center the marker
        midLabel = formatMb(position);
    }

    widthPercent = Math.max(widthPercent, 0);
    const endPercent = startPercent + widthPercent;

    if (endPercent > 100) {
        widthPercent = 100 - startPercent;
    }
    if (startPercent < 0) {
        startPercent = 0;
    }

    const showLabels = startLabel || endLabel || midLabel;

    return (
        <AnimatePresence>
        {show && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="relative w-full h-8"
            >
            <div className="absolute top-0 w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                className="absolute h-full bg-linear-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600"
                style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                }}
                initial={{ width: "0%" }}
                animate={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent dark:from-white/5" />
            </div>
            {showLabels && (
                <div className="absolute top-3 w-full text-xs text-muted-foreground">
                {midLabel ? (
                    <motion.span
                    className="absolute"
                    style={{
                        left: `${startPercent + widthPercent / 2}%`,
                        transform: "translateX(-50%)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    >
                    {midLabel}
                    </motion.span>
                ) : (
                    <>
                    <motion.span
                        className="absolute"
                        style={{
                        left: `${startPercent}%`,
                        transform: "translateX(-50%)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {startLabel}
                    </motion.span>
                    <motion.span
                        className="absolute"
                        style={{
                        left: `${startPercent + widthPercent}%`,
                        transform: "translateX(-50%)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {endLabel}
                    </motion.span>
                    </>
                )}
                </div>
            )}
            </motion.div>
        )}
        </AnimatePresence>
    );
}
