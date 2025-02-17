# CHITRA: Interactive Visualization of Chromosomal Rearrangements

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/pranjalpruthi/CHITRA?style=social)](https://github.com/pranjalpruthi/CHITRA)
[![Website](https://img.shields.io/website-up-down-green-red/https/chitra.bioinformaticsonline.com.svg?label=Website)](https://chitra.bioinformaticsonline.com/)

CHITRA is a web-based interactive tool designed to visualize synteny blocks, chromosomal rearrangements, and breakpoints. It provides an intuitive graphical interface, customizable visualization options, and high-resolution export capabilities for publication-ready figures.

## Abstract

**Motivation:** The increasing availability of chromosome-scale genome assemblies has fueled a renewed interest in studying chromosomal evolution and rearrangements. Synteny visualization plays a critical role in understanding genome organization, structural variations, and evolutionary relationships. However, existing tools often have steep learning curves, produce static plots, or are limited in their ability to analyze multiple species simultaneously. There is a growing need for an intuitive and interactive visualization tool that can effectively explore syntenic relationships and chromosomal rearrangements.

**Results:** Here, we present CHITRA, a web-based interactive tool designed to visualize synteny blocks, chromosomal rearrangements, and breakpoints in both linear and circular styles. CHITRA enables real-time exploration of genome structural variations with an intuitive graphical interface, customizable visualization options, and high-resolution export capabilities for publication-ready figures. The tool supports chromosome- and scaffold-level assemblies and allows users to filter, highlight, and interactively examine syntenic relationships.

**Availability and Implementation:** CHITRA is freely available at [https://chitra.bioinformaticsonline.com/](https://chitra.bioinformaticsonline.com/), with comprehensive documentation at [https://chitra.bioinformaticsonline.com/docs](https://chitra.bioinformaticsonline.com/docs). The source code is open-source and accessible on GitHub at [https://github.com/pranjalpruthi/CHITRA](https://github.com/pranjalpruthi/CHITRA).

## Introduction

Chromosomal rearrangement plays a crucial role in genome evolution, in understanding evolutionary histories, and adaptation mechanisms of organisms of specific species or lineages (Crombach & Hogeweg 2007). In recent years, chromosomal evolution studies have seen a resurgence in interest, owing to advances in sequencing technologies, facilitating the release of high-quality chromosome-scale whole-genome assemblies by large sequencing projects (Rhie et al. 2021), thus unlocking the potential for studying chromosome rearrangement events.

Synteny plays an important role in genome organisation and the visualisation of synteny blocks is important to identify structural variations, evolutionary relationships, and the visualisation of synteny blocks is important for identifying structural variations, evolutionary relationships, and gene conservation across taxa (Ghiurcuta & Moret 2014). Though various ways exist to visualise synteny blocks, circular visualisation through Circos (Krzywinski et al. 2009) plots being are the most prevalent. However, the major limitations of circos plots are their complexity of use, difficulty in identifying small synteny blocks or chromosomal rearrangements, and comparative analyses being limited to two genomes. On the other hand, linear plots assist in identifying and visualising microsynteny blocks or small structural variations (e.g. inversions, translocations) and are more intuitive in nature. Various tools exist for linear genome visualisation, such as GenomicRanges (Lawrence et al. 2013), karyoploteR (Gel & Serra 2017), plotgardener (Kramer et al. 2022), though they are not specifically designed to visualise synteny blocks. Recently, a few synteny visualisation packages have been developed and have gained popularity, such as syntenyPlotteR (Quigley et al. 2023), ShinySyn (Xiao & Lam 2022), and NGenomeSyn (He et al. 2023). Though each of these packages have theirEach of these packages have their own features and limitations, with a common one being that all of them produce static plots, thus lacking the functionality that graphically interactive plots provide.

To overcome this problem, we created the Chromosome Interactive Tool for Rearrangement Analysis (CHITRA) to provide detailed and interactive genomic data visualisation, allowing for visualisation of synteny blocks, chromosomal rearrangements and breakpoints in both linear and circular visualisation styles. CHITRA provides an intuitive and user-friendly graphical user interface (GUI), along with the ability to produce publication-ready plots with a plethora of interactive visualisation options, and can be used with both chromosome-scale and scaffold-scale genome assemblies. CHITRA is released under the MIT license, and is available for use at [https://chitra.bioinformaticsonline.com/](https://chitra.bioinformaticsonline.com/), with comprehensive documentation hosted at [https://chitra.bioinformaticsonline.com/docs](https://chitra.bioinformaticsonline.com/docs). The source code can be accessed on GitHub at [https://github.com/pranjalpruthi/CHITRA](https://github.com/pranjalpruthi/CHITRA).

## Implementation

The CHITRA architecture is developed using Next.js ([https://github.com/vercel/next.js](https://github.com/vercel/next.js)), a React-based framework supporting server-side rendering and static site generation to handle complex genomic data efficiently. The interface employs ShadCN UI ([https://github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui)), Tailwind CSS ([https://github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)), and Framer Motion ([https://motion.dev/](https://motion.dev/)).

Data visualisation relies on D3.js ([https://github.com/d3/d3/](https://github.com/d3/d3/)), rendering synteny plots, chord diagrams, and ribbon-based representations of genomic conservation. High-resolution export options are provided via jsSVG ([https://github.com/coldpour/jssvg](https://github.com/coldpour/jssvg)), enabling publication-ready outputs in vector (SVG) or raster formats (PNG, JPG).

## Features

CHITRA requires three input files (Figure 1), all in CSV format: (i) synteny data containing pairwise synteny blocks between species, (ii) species data for genome information, and (iii) reference chromosome size data. Additionally, two optional input files can also be added to enhance the visualization: gene annotations and breakpoint data. The data can be visualised in mainly two ways: (i) a linear synthetic view and (ii) a circular chord map. Using example datasets (Simion et al. 2021), we demonstrate chromosomal rearrangements between multiple species (Figure 2).

<p align="center">
  <img src="path/to/figure1.png" alt="CHITRA Workflow" width="800">
  <br>
  <em>Figure 1. Workflow of CHITRA showcasing input data processing, feature table conversion, and interactive visualization of synteny blocks, chromosomal breakpoints and data export options.</em>
</p>

### 3.1. Interactive synteny visualization

We use a linear visualization interface, allowing for visualization of to visualise inter- and intra-chromosomal rearrangement events. Synteny blocks between genomes are represented as connected interactive ribbons (Figure 2A). Users can customise the ribbon colours to represent the different types of rearrangement mechanisms, as demonstrated in Figure 2B. Additionally, users can select specific reference chromosomes, choose specific species to include in the visualization, filter connected query chromosomes, and select individual chromosomes from each species. CHITRA also supports scaffold or contig-level assemblies.

Finally, users can also filter the visualization to display forward strand synteny blocks, reverse strand synteny blocks, or both, which is enabled by default, providing flexibility in analysing genomic orientations.

<p align="center">
  <img src="path/to/figure2.png" alt="CHITRA Visualization Styles" width="800">
  <br>
  <em>Figure 2. An overview of various visualization styles in CHITRA. (A) Linear synteny visualization plot displaying various chromosomal rearrangements, depicted using interactive ribbons (B) Optional colour-tag feature that allows users to customize the ribbon colours to denote distinct mutation types (e.g., inversions, translocations, duplications, etc). (C) Detailed chord map displaying synteny blocks between a query and reference genome. (D) Linear synteny plot enhanced with breakpoint mapping, with the red arrows indicating chromosomal breakpoints across chr5 of Adineta vaga.</em>
</p>

### 3.2. Chord Map Visualisation

The chord map offers a detailed circular visualization of synteny blocks between species (Figure 2C). When users select a specific synteny block, the chord map displays comprehensive information, including the reference chromosome, the corresponding chromosomes in query species, their block sizes, locations, and orientations. This visualization style is particularly effective for analysing complex genomic relationships and identifying structural variations between species. Additionally, the chord map includes interactive features allowing users to filter, highlight, and examine specific syntenic relationships in detail.

### 3.3. Annotations and Breakpoint Mapping

The capabilities of CHITRA can be further enhanced with the induction of gene annotation and chromosomal breakpoint data. Gene annotations can be visualised within the detailed chord diagram bands, enabling gene-level identification of synteny blocks (Figure 2B). Additionally, the breakpoint mapping functionality provides a specialized visualization for chromosomal breakpoints, highlighting them by red arrows in the linear synteny plot and as red lines on the reference genome chord in the chord map. This integration of gene annotations with chromosomal breakpoint data allows for additional insights in structural analysis of genomic rearrangement events and genome organization.

## Conclusions

We developed CHITRA, a web-server designed to interactively visualize syntenic relationships, chromosomal rearrangements and breakpoints in both linear and circular visualisation styles. CHITRA is highly customizable, and allows for various types of labelling and viewing. Additionally, CHITRA can visualize chromosome-level as well as scaffold-level assemblies, making it a versatile visualization software. CHITRA is available at [https://chitra.bioinformaticsonline.com/chitra](https://chitra.bioinformaticsonline.com/chitra), andwith a comprehensive manual is available present at [https://chitra.bioinformaticsonline.com/docs](https://chitra.bioinformaticsonline.com/docs).

## Funding

This research was funded by The Rockefeller Foundation through Grant Number 2021 HTH 018, awarded to the CSIR-Institute of Genomics and Integrative Biology (CSIR-IGIB). Additionally, support from the CSIR and AIIMS collaborative research grants contributed to the successful execution and completion of this study.

## Acknowledgement

We thank our team colleagues for their valuable feedback and comments.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/pranjalpruthi/CHITRA.git
    cd CHITRA
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the application:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    This will start the development server. Open your browser and go to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
