import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const EyeballApp = lazy(() => import("../eyeball/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenEyeSim — AI Cataract Surgery Simulator" },
      {
        name: "description",
        content:
          "Real-time 3D cataract surgery training with AI coaching, biomechanics, and procedure curriculum.",
      },
      { property: "og:title", content: "OpenEyeSim — AI Surgery Simulator" },
      {
        property: "og:description",
        content:
          "Practice cataract surgery in a polished 3D simulator with AI scoring, fluidics, and curriculum guidance.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <div className="absolute inset-2 rounded-full bg-primary shadow-[0_0_40px_hsl(199_89%_58%/0.6)]" />
          </div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Initializing OpenEyeSim
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground">
          Loading simulator…
        </div>
      }
    >
      <EyeballApp />
    </Suspense>
  );
}
