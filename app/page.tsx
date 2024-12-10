"use client";

import { OpenSource } from "@/components/homepage/open-source";
import BlogSample from "@/components/homepage/blog-samples";
import HeroSection from "@/components/homepage/hero-section";
import MarketingCards from "@/components/homepage/marketing-cards";
import Pricing from "@/components/homepage/pricing";
import SideBySide from "@/components/homepage/side-by-side";
import { AuroraBackground } from "@/components/ui/aurora-background";
import PageWrapper from "@/components/wrapper/page-wrapper";
import { motion } from "framer-motion";
import config from "@/config";

export default function Home() {
  return (
    <PageWrapper>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative w-full min-h-screen flex flex-col"
        >
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <HeroSection />
                </div>
              </div>
          </div>


        </motion.div>
      </AuroraBackground>
    </PageWrapper>
  );
}
