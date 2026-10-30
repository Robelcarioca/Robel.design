"use client";

import { useState, useMemo } from "react";
import { ProjectTile } from "./project-tile";
import { Lightbox } from "./lightbox";
import type { WorkItem } from "@/lib/actions/works";

interface WorksGalleryProps {
  initialWorks: WorkItem[];
}

type FilterTab = "all" | "videos" | "photos";

export function WorksGallery({ initialWorks }: WorksGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const videoCount = useMemo(
    () => initialWorks.filter((w) => w.type === "video").length,
    [initialWorks]
  );
  const photoCount = useMemo(
    () => initialWorks.filter((w) => w.type !== "video").length,
    [initialWorks]
  );

  const filteredWorks = useMemo(() => {
    if (activeFilter === "videos") {
      return initialWorks.filter((w) => w.type === "video");
    }
    if (activeFilter === "photos") {
      return initialWorks.filter((w) => w.type !== "video");
    }
    return initialWorks;
  }, [initialWorks, activeFilter]);

  return (
    <section id="works" className="scroll-mt-6 w-full">
      {/* Category Filter Pills: All, Videos, Photos */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-[rgba(220,220,220,0.8)] shadow-xs">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#161616] text-white shadow-xs"
                : "text-[#6A6A6A] hover:text-[#161616] hover:bg-[#F5F5F5]"
            }`}
          >
            All <span className="opacity-70 text-[11px] ml-0.5">({initialWorks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("videos")}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all cursor-pointer ${
              activeFilter === "videos"
                ? "bg-[#161616] text-white shadow-xs"
                : "text-[#6A6A6A] hover:text-[#161616] hover:bg-[#F5F5F5]"
            }`}
          >
            Videos <span className="opacity-70 text-[11px] ml-0.5">({videoCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("photos")}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all cursor-pointer ${
              activeFilter === "photos"
                ? "bg-[#161616] text-white shadow-xs"
                : "text-[#6A6A6A] hover:text-[#161616] hover:bg-[#F5F5F5]"
            }`}
          >
            Photos <span className="opacity-70 text-[11px] ml-0.5">({photoCount})</span>
          </button>
        </div>

        {activeFilter === "photos" && (
          <div className="text-[12px] font-medium text-[#7A7A7A] px-2">
            Showing UI/UX & design photo projects
          </div>
        )}
      </div>

      {/* Works 2-Column Grid exactly matching elaya.design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredWorks.map((work, idx) => (
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
        works={filteredWorks}
        currentIndex={activeLightboxIndex}
        onClose={() => setActiveLightboxIndex(null)}
        onNavigate={(newIndex) => setActiveLightboxIndex(newIndex)}
      />
    </section>
  );
}
