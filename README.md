# CHITRA: Interactive Chromosomal Rearrangement Visualization

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/website-up-down-green-red/https/chitra.bioinformaticsonline.com.svg?label=Website)](https://chitra.bioinformaticsonline.com/)

CHITRA is a web-based tool for interactive visualization of synteny blocks, chromosomal rearrangements, and breakpoints.

Ready to dive in?

<div align="center">
  <a href="https://chitra.bioinformaticsonline.com/" style="font-size: 2.5em; text-decoration: none;">✨ Try it out</a>  •
  <a href="https://chitra.bioinformaticsonline.com/docs" style="font-size: 2.5em; text-decoration: none;">📖 Learn more</a>  •
</div>

## Features

*   Interactive linear and circular (chord map) visualizations.
*   Customizable ribbon colors for rearrangement types.
*   Breakpoint mapping.
*   Gene annotation integration.


Example data files, which can serve as a useful starting point or template for your own datasets, are located in the `/public/example` directory of this repository.

You can browse all example sets directly on GitHub:
**[➡️ Browse All Example Sets on GitHub](https://github.com/BioinformaticsOnLine/CHITRA/tree/main/public/example)**

Here are direct links to the curated example sets, as featured in the "Quick Demos" section of the application:

*   **Set 1: Basic Synteny** - Simple synteny visualization between species.
    *   [View Set 1 Files on GitHub](https://github.com/BioinformaticsOnLine/CHITRA/tree/main/public/example/set1)
*   **Set 2: Multi-Species** - Complex synteny relationships across multiple species.
    *   [View Set 2 Files on GitHub](https://github.com/BioinformaticsOnLine/CHITRA/tree/main/public/example/set2)
*   **Set 3: Annotated Genome** - Detailed genome annotations with gene information and breakpoints.
    *   [View Set 3 Files on GitHub](https://github.com/BioinformaticsOnLine/CHITRA/tree/main/public/example/set3)


## Data Format

CHITRA requires three CSV files as input:

### 1. Synteny Data (`synteny_data.csv`)
This file contains the pairwise synteny blocks between the query and reference species.

| Column | Description |
| --- | --- |
| `query_name` | Query species name |
| `query_chr` | Query chromosome ID |
| `query_start` | Start position in query |
| `query_end` | End position in query |
| `query_strand`| Orientation (+/-) |
| `ref_chr` | Reference chromosome ID |
| `ref_start` | Start position in reference |
| `ref_end` | End position in reference |
| `ref_species` | Reference species name |
| `qry_lvl` | Query level |

### 2. Species Data (`species_data.csv`)
This file contains information about the chromosomes of each species.

| Column | Description |
| --- | --- |
| `species_name` | Name of the species |
| `chr_id` | Chromosome identifier |
| `chr_type` | Type of chromosome |
| `chr_size_bp` | Chromosome size in base pairs |
| `centromere_start`| Centromere start position (optional) |
| `centromere_end` | Centromere end position (optional) |

### 3. Reference Chromosome Sizes (`ref_chromosome_sizes.csv`)
This file contains the sizes of the reference chromosomes.

| Column | Description |
| --- | --- |
| `chromosome` | Chromosome identifier |
| `size` | Chromosome size in base pairs |
| `centromere_start`| Centromere start position (optional) |
| `centromere_end` | Centromere end position (optional) |

### Optional Input Files

#### 4. Gene Annotations (`ref_gene_annotations.csv`) (Optional)
This file contains information about gene annotations.

| Column | Description |
| --- | --- |
| `chromosome` | Chromosome ID |
| `genomic_accession` | Genomic accession number |
| `start` | Start position |
| `end` | End position |
| `strand` | Strand (+/-) |
| `class` | Gene class |
| `locus_tag` | Locus tag (optional) |
| `symbol` | Gene symbol (optional) |
| `name` | Gene name (optional) |
| `GeneID` | Gene ID |

#### 5. Breakpoints Data (`breakpoints.csv`) (Optional)
This file contains information about chromosome breakpoints.

| Column | Description |
| --- | --- |
| `ref_chr` | Reference chromosome ID |
| `ref_start` | Start position |
| `ref_end` | End position |
| `breakpoint` | Breakpoint identifier |


&lt;p align="center">
  &lt;img src="public/assets/workflow.png" alt="CHITRA Workflow" width="600">
  &lt;br>
  &lt;em>Figure 1. CHITRA workflow.&lt;/em>
&lt;/p>


## Implementation

Built with ❤️, React, ShadCN UI, Tailwind CSS, Motion, D3.js, and jsSVG.

## Availability

*   Web: [https://chitra.bioinformaticsonline.com/](https://chitra.bioinformaticsonline.com/)
*   Docs: [https://chitra.bioinformaticsonline.com/docs](https://chitra.bioinformaticsonline.com/docs)
*   Source: [https://github.com/pranjalpruthi/CHITRA](https://github.com/pranjalpruthi/CHITRA)

## Get Started! (Locally) 🚀

Follow these steps to set up and run CHITRA on your local machine.

### 1. Prerequisites

*   **Node.js**: CHITRA is built with Next.js, which requires Node.js. We recommend using the latest LTS (Long Term Support) version.
    *   Download and install Node.js from [nodejs.org](https://nodejs.org/).
*   **Bun**: This project uses Bun as the package manager and runtime.
    *   Install Bun by following the instructions on [bun.sh](https://bun.sh/).

### 2. Clone the Repository

Open your terminal and run the following command to clone the CHITRA repository:
```bash
git clone https://github.com/pranjalpruthi/CHITRA.git
```

### 3. Navigate to the Project Directory

Change into the newly cloned directory:
```bash
cd CHITRA
```

### 4. Install Dependencies

Install the project dependencies using Bun:
```bash
bun install
```

### 5. Run the Development Server

Start the Next.js development server:
```bash
bun dev
```
This will typically start the application on `http://localhost:3000`. Open this URL in your web browser to see CHITRA running.

### Running in Production

CHITRA is a Next.js application. For production deployments, consider the following:

*   **Self-hosting (Node.js server)**: You can build the application using `bun run build` and then start the production server using `bun run start`. This requires a Node.js environment on your server.
*   **Docker**: You can containerize the Next.js application using Docker for deployment on various platforms. You'll need to create a `Dockerfile` tailored for Next.js.
*   **Static Export**: If your CHITRA instance doesn't require server-side features after the initial data load (which is likely the case for the core visualization part if data is client-side), you might explore `next export` to generate static HTML/CSS/JS files. However, this might limit some Next.js features.
*   **Vercel**: The easiest way to deploy Next.js applications is by using [Vercel](https://vercel.com/), the creators of Next.js. It offers seamless integration, automatic builds, and global CDN.

For detailed deployment guides, refer to the [official Next.js deployment documentation](https://nextjs.org/docs/deployment).



## Funding

Funded by The Rockefeller Foundation and CSIR-IGIB.

## License

MIT License.


[](https://api.visitorbadge.io/api/VisitorHit?user=pranjalpruthi&repo=github-visitors-badge&countColor=%237B1E7A)
