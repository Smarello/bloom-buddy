import { HeroSection } from "@/components/hero-section";
import { UploadZone } from "@/components/upload-zone";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturesGrid } from "@/components/features-grid";
import { CtaSection } from "@/components/cta-section";
import { ottieniSessioneServer } from "@/lib/auth/sessione";

export default async function Home() {
  const sessione = await ottieniSessioneServer();

  return (
    <>
      <HeroSection autenticato={!!sessione.utenteId} />
      <UploadZone />
      <HowItWorks />
      <FeaturesGrid />
      <CtaSection />
    </>
  );
}
