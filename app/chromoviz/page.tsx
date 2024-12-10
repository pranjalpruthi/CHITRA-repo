import PageWrapper from "@/components/wrapper/page-wrapper";
export default function Home() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold text-center mb-8">croSSRoad Analysis Tool</h1>
        <p className="text-center mb-12 text-gray-600 max-w-2xl">
          A tool to cross-compare SSRs across species and families. Upload your genomic data and configure parameters to analyze Simple Sequence Repeats across different species.
        </p>
      </div>
    </PageWrapper>
  );
}
