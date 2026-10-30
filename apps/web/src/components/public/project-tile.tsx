"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Play, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import type { WorkItem } from "@/lib/actions/works";

interface ProjectTileProps {
  work: WorkItem;
  index: number;
  onClick: () => void;
}

interface VideoReplayRange {
  start: number;
  end?: number;
}

// User-specified custom preview replay intervals for the front page
const CUSTOM_REPLAY_RANGES: Record<string, VideoReplayRange> = {
  // Project 8 of 48: from 11 seconds
  "video-recording-15": { start: 11 },
  "p-8": { start: 11 },
  // Project 13 of 48: from 1 minute 10 second to 1 minute 14 second (70s to 74s)
  "video-recording-21": { start: 70, end: 74 },
  "p-13": { start: 70, end: 74 },
  // Project 14 of 48: from 5 second to 7 second
  "video-recording-22": { start: 5, end: 7 },
  "p-14": { start: 5, end: 7 },
  // Project 20 of 48: from 5 seconds
  "video-recording-30": { start: 5 },
  "p-20": { start: 5 },
  // Project 27 of 48: from 3 seconds
  "video-recording-37": { start: 3 },
  "p-27": { start: 3 },
  // Project 31 of 48: from 2 seconds
  "video-recording-20": { start: 2 },
  "p-31": { start: 2 },
  // Project 32 of 48: from 1 minute (60s) to the end
  "video-recording-25": { start: 60 },
  "p-32": { start: 60 },
  // Project 36 of 48: from 5 seconds
  "video-recording-27": { start: 5 },
  "p-36": { start: 5 },
};

export function ProjectTile({ work, index, onClick }: ProjectTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isUltraTall, setIsUltraTall] = useState(false);
  // Default first 6 items to true so top items play immediately on mount
  const [isInView, setIsInView] = useState(index < 6);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = work.type === "video";
  const projectNumber = index + 1;
  const clipRange = CUSTOM_REPLAY_RANGES[work.id] || CUSTOM_REPLAY_RANGES[`p-${projectNumber}`];

  // IntersectionObserver: smoothly autoplay when visible, pause when scrolled away
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.15, rootMargin: "100px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Synchronize video autoplay with viewport visibility and custom clip timing
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const v = videoRef.current;
    // Guaranteed muted property setting for all modern browser autoplay security policies
    v.muted = true;
    v.defaultMuted = true;

    if (isInView) {
      const clip = CUSTOM_REPLAY_RANGES[work.id] || CUSTOM_REPLAY_RANGES[`p-${index + 1}`];
      if (clip) {
        if (v.currentTime < clip.start || (clip.end && v.currentTime >= clip.end)) {
          v.currentTime = clip.start;
        }
      }
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Handled gracefully if browser power-saver prevents autoplay
        });
      }
    } else {
      v.pause();
    }
  }, [isVideo, isInView, work.id]);

  const isVeryTall =
    work.mediaUrl.includes("portfolio-main-concept") ||
    work.mediaUrl.includes("Main.png") ||
    isUltraTall;

  // Multi-slide images for Perfume, Rolex, Watch, etc.
  const slideImages = useMemo<string[]>(() => {
    if (!work.images) return [];
    try {
      const parsed = JSON.parse(work.images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      const split = work.images.split(",").map((s) => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    return [];
  }, [work.images]);

  const hasSlides = slideImages.length > 1;

  // Autoplay multi-slide image presentations by themselves every 3.5 seconds
  useEffect(() => {
    if (!hasSlides || !isInView || isHovered) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slideImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hasSlides, isInView, isHovered, slideImages.length]);

  // Active media URL (switched dynamically if has slides)
  const activeMediaUrl = hasSlides
    ? slideImages[slideIndex] || work.mediaUrl
    : work.mediaUrl;

  const safeMediaUrl = encodeURI(activeMediaUrl);
  const posterUrl = work.posterUrl ? encodeURI(work.posterUrl) : safeMediaUrl;
  const isPriority = index < 6;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % slideImages.length);
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full cursor-pointer overflow-hidden rounded-[20px] bg-[#E2E2E2] border border-[rgba(220,220,220,0.6)] shadow-xs transition-all duration-300 hover:border-[#161616]/40 hover:shadow-md"
      style={{
        aspectRatio: "1.6 / 1",
      }}
      tabIndex={0}
      role="button"
      aria-label={`View project ${work.title}${hasSlides ? ` - slide ${slideIndex + 1} of ${slideImages.length}` : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        } else if (hasSlides && e.key === "ArrowLeft") {
          e.preventDefault();
          setSlideIndex((prev) => (prev - 1 + slideImages.length) % slideImages.length);
        } else if (hasSlides && e.key === "ArrowRight") {
          e.preventDefault();
          setSlideIndex((prev) => (prev + 1) % slideImages.length);
        }
      }}
    >
      {/* Full-Bleed Media Stage: Matches elaya.design */}
      <div className="absolute inset-0 size-full overflow-hidden bg-[#E2E2E2]">
        {isVideo ? (
          <div className="relative size-full">
            {/* Dedicated high-resolution poster image fallback */}
            <img
              src={posterUrl}
              alt={work.title}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
              className="size-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]"
            />

            {/* Seamless video preview: autoplays by itself when in viewport with custom replay interval */}
            <video
              ref={videoRef}
              src={safeMediaUrl}
              poster={posterUrl}
              muted
              loop
              playsInline
              autoPlay
              preload={isPriority ? "auto" : "metadata"}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (clipRange && clipRange.start > 0) {
                  v.currentTime = clipRange.start;
                }
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (clipRange) {
                  if (clipRange.end && v.currentTime >= clipRange.end) {
                    v.currentTime = clipRange.start;
                    v.play().catch(() => {});
                  } else if (v.currentTime < clipRange.start - 0.3) {
                    v.currentTime = clipRange.start;
                  }
                }
              }}
              onEnded={(e) => {
                const v = e.currentTarget;
                v.currentTime = clipRange ? clipRange.start : 0;
                v.play().catch(() => {});
              }}
              className="absolute inset-0 size-full object-cover pointer-events-none z-10 transition-opacity duration-300 opacity-100"
            />

            {/* Video badge in top-right with live indicator */}
            <div className="pointer-events-none absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md transition-all">
              <Play className="size-2.5 fill-current text-[#FF5200] animate-pulse" />
              <span>Video</span>
            </div>
          </div>
        ) : (
          /* High-res Image / Slides: Edge-to-edge luxury card display matching video projects */
          <div className="relative size-full overflow-hidden bg-[#E2E2E2]">
            <img
              key={safeMediaUrl}
              src={safeMediaUrl}
              alt={`${work.title}${hasSlides ? ` slide ${slideIndex + 1}` : ""}`}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
              className={`size-full transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] ${
                isVeryTall ? "object-cover object-top" : "object-cover"
              }`}
            />
          </div>
        )}
      </div>

      {/* MULTI-SLIDE CONTROLS (for Perfume, Rolex, Watch) */}
      {hasSlides && (
        <>
          {/* Slide count badge (top-left) */}
          <div className="pointer-events-none absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md shadow-xs">
            <Layers className="size-3 text-[#FF5200]" />
            <span>
              {slideIndex + 1} / {slideImages.length}
            </span>
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-25 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-25 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer active:scale-95"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Slide Dots Indicator (bottom-center) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-25 flex items-center gap-1 px-2 py-1 rounded-full bg-black/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {slideImages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIndex(i);
                }}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  i === slideIndex
                    ? "w-3.5 h-1.5 bg-white"
                    : "size-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Floating pill badge at bottom-left: Exact signature of elaya.design */}
      <div
        className={`pointer-events-none absolute bottom-3.5 left-3.5 z-20 transition-all duration-300 ease-out ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[12px] font-medium text-[#161616] shadow-sm backdrop-blur-md border border-[rgba(220,220,220,0.6)]">
          <span className="font-semibold">{work.title}</span>
          <span className="text-[#9A9A9A]">·</span>
          <span className="text-[#6A6A6A]">
            {work.category}
            {hasSlides ? ` (${slideIndex + 1}/${slideImages.length})` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
