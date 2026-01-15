import HeroSection from "@/components/homepage/hero-section";
import OpenSource from "@/components/homepage/open-source";
import SideBySide from "@/components/homepage/side-by-side";
import PageWrapper from "@/components/wrapper/page-wrapper";

export default function Home() {
  return (
    <PageWrapper>
      <div className="flex flex-col justify-center items-center w-full mt-4 p-3">
        <HeroSection />
      </div>
      <div className="flex my-32 w-full justify-center items-center">
        <SideBySide />
      </div>

      <div className="w-full flex justify-center items-center">
        <OpenSource />
      </div>


    </PageWrapper>
  );
}
