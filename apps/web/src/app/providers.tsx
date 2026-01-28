"use client";

import LoaderOverlay from "@/components/motion/LoaderOverlay";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoaderOverlay />
      {children}
    </>
  );
}
