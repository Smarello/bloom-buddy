import type { NextConfig } from "next";
import { ottieniHeaderSicurezza } from "./src/lib/sicurezza/header-sicurezza";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Applica gli header di sicurezza a tutte le route dell'applicazione
        source: "/:path*",
        headers: ottieniHeaderSicurezza(),
      },
    ];
  },
};

export default nextConfig;
