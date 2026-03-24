import { HeroSection } from "@/components/hero-section";
import { UploadZone } from "@/components/upload-zone";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturesGrid } from "@/components/features-grid";
import { CtaSection } from "@/components/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <UploadZone />
      <HowItWorks />
      <FeaturesGrid />
      <CtaSection />
    </>
  );
}
