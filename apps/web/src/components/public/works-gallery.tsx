"use client";

import { useState } from "react";
import { ProjectTile } from "./project-tile";
import { Lightbox } from "./lightbox";
import type { WorkItem } from "@/lib/actions/works";

interface WorksGalleryProps {
  initialWorks: WorkItem[];
}

export function WorksGallery({ initialWorks }: WorksGalleryProps) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  return (
    <section id="works" className="scroll-mt-6 w-full">
      {/* Works 2-Column Grid exactly matching elaya.design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {initialWorks.map((work, idx) => (
          <ProjectTile
            key={work.id}
            work={work}
            index={idx}
            onClick={() => setActiveLightboxIndex(idx)}
          />
        ))}
      </div>

      {/* High-Resolution Lightbox Modal */}
      <Lightbox
        works={initialWorks}
        currentIndex={activeLightboxIndex}
        onClose={() => setActiveLightboxIndex(null)}
        onNavigate={(newIndex) => setActiveLightboxIndex(newIndex)}
      />
    </section>
  );
}
