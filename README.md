<div align="center">
  
  <h1>CHITRA: Interactive Chromosomal Rearrangement Visualization</h1>
  <img src="https://raw.githubusercontent.com/alo7lika/PyVerse/refs/heads/main/Images/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="900">

  <p>
    <strong>A web-based tool for interactive visualization of synteny blocks, chromosomal rearrangements, and breakpoints</strong>
  </p>

  <p>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License">
    </a>
    <a href="https://chitra.bioinformaticsonline.com/">
      <img src="https://img.shields.io/website-up-down-green-red/https/chitra.bioinformaticsonline.com.svg?label=Website" alt="Website Status">
    </a>
  </p>

  <h3>
    <a href="https://chitra.bioinformaticsonline.com">✨ Try CHITRA</a>
    &nbsp;•&nbsp;
    <a href="https://chitra.bioinformaticsonline.com/docs">📖 Documentation</a>
  </h3>

  <img src="public/assets/Chitra-meta.png" alt="CHITRA - Interactive Chromosomal Rearrangement Visualization Platform" width="650">


</div>

---
  

## Features

*   Interactive linear and circular (chord map) visualizations.
*   Customizable ribbon colors for rearrangement types.
*   Breakpoint mapping.
*   Gene annotation integration.

---

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



## Implementation

Built with ❤️, React, ShadCN UI, Tailwind CSS, Motion, D3.js, and jsSVG.

## Availability

*   Web: [https://chitra.bioinformaticsonline.com/](https://chitra.bioinformaticsonline.com/)
*   Docs: [https://chitra.bioinformaticsonline.com/docs](https://chitra.bioinformaticsonline.com/docs)
*   Source: [https://github.com/pranjalpruthi/CHITRA](https://github.com/pranjalpruthi/CHITRA)

## Quick Deploy 🚀

### One-Click Deployment

Deploy CHITRA instantly with these platforms:


[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/pranjalpruthi/CHITRA)
[![Deploy on Netlify](https://img.shields.io/badge/Deploy%20on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https://github.com/pranjalpruthi/CHITRA)
[![Deploy on Render](https://img.shields.io/badge/Deploy%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy?repo=https://github.com/pranjalpruthi/CHITRA)



**Self-Hosted Options:**
- **Coolify**: Import repository URL in your Coolify dashboard
- **Dokploy**: Use the `coolify.json` configuration file
- **Docker**: Use the provided `docker-compose.yml` file

## Get Started! (Locally) 🚀

Follow these steps to set up and run CHITRA on your local machine.

### 1. Prerequisites

*   **Node.js**: CHITRA is built with Next.js, which requires Node.js. We recommend using the latest LTS (Long Term Support) version.
    *   Download and install Node.js from [nodejs.org](https://nodejs.org/).
*   **pnpm**: This project uses pnpm as the package manager for faster and more efficient dependency management.
    *   Install pnpm by running `npm install -g pnpm` or follow the instructions on [pnpm.io](https://pnpm.io/).

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

Install the project dependencies using pnpm:
```bash
pnpm install
```

### 5. Run the Development Server

Start the Next.js development server:
```bash
pnpm dev
```
This will typically start the application on `http://localhost:3000`. Open this URL in your web browser to see CHITRA running.

### Docker Deployment 🐳

The fastest way to deploy CHITRA is using Docker:

```bash
# Clone and navigate to the repository
git clone https://github.com/pranjalpruthi/CHITRA.git
cd CHITRA

# Start with Docker Compose (recommended)
pnpm docker:compose

# Or build and run manually
pnpm docker:build
pnpm docker:run
```

CHITRA will be available at `http://localhost:3000`

**Docker Compose Features:**
- ✅ Production-ready setup
- ✅ Automatic restarts
- ✅ Health checks
- ✅ Optional nginx reverse proxy
- ✅ Volume mounting for example data

**Stop the application:**
```bash
pnpm docker:down
```

### Other Production Options

*   **Self-hosting (Node.js server)**: Build using `pnpm build` and start with `pnpm start`
*   **Static Export**: Use `next export` for static HTML/CSS/JS files
*   **Vercel**: Deploy directly to [Vercel](https://vercel.com/) for automatic scaling

For detailed deployment guides, refer to the [official Next.js deployment documentation](https://nextjs.org/docs/deployment).



## Funding

Funded by The Rockefeller Foundation and CSIR-IGIB.

## License

MIT License.


[](https://api.visitorbadge.io/api/VisitorHit?user=pranjalpruthi&repo=github-visitors-badge&countColor=%237B1E7A)
