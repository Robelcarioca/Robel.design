"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Layers, Play } from "lucide-react";
import type { WorkItem } from "@/lib/actions/works";

interface LightboxProps {
  works: WorkItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  works,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < works.length;
  const currentWork = isOpen ? works[currentIndex] : null;

  const [slideIndex, setSlideIndex] = useState(0);

  // Parse multi-slide images
  let slideImages: string[] = [];
  if (currentWork?.images) {
    try {
      slideImages = JSON.parse(currentWork.images);
    } catch {
      slideImages = currentWork.images.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const hasMultipleSlides = slideImages.length > 1;

  // Reset slide index when opening a new work
  useEffect(() => {
    setSlideIndex(0);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    if (!isOpen) return;
    if (hasMultipleSlides && slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
    } else {
      const prevIndex = (currentIndex - 1 + works.length) % works.length;
      onNavigate(prevIndex);
    }
  }, [isOpen, hasMultipleSlides, slideIndex, currentIndex, works.length, onNavigate]);

  const goToNext = useCallback(() => {
    if (!isOpen) return;
    if (hasMultipleSlides && slideIndex < slideImages.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      const nextIndex = (currentIndex + 1) % works.length;
      onNavigate(nextIndex);
    }
  }, [isOpen, hasMultipleSlides, slideIndex, slideImages.length, currentIndex, works.length, onNavigate]);

  // Keyboard navigation: Esc, Left, Right
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !currentWork) return null;

  const currentMediaSrc = hasMultipleSlides
    ? slideImages[slideIndex] || currentWork.mediaUrl
    : currentWork.mediaUrl;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={currentWork.title}
      >
        {/* Backdrop: rgba(0,0,0,0.6) + blur 8px */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window: max 1100px wide, scale 0.96 -> 1, 250ms */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="relative z-10 flex flex-col w-full max-w-[1100px] max-h-[92vh] overflow-hidden rounded-[22px] bg-white text-[#161616] shadow-2xl border border-[#E6E6E6]"
        >
          {/* Top Bar inside modal */}
          <div className="flex items-center justify-between border-b border-[#E6E6E6] px-5 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#161616] px-3 py-1 text-[12px] font-medium text-white">
                {currentWork.category}
              </span>
              <h2 className="text-[16px] sm:text-[18px] font-medium text-[#161616] truncate max-w-[280px] sm:max-w-md">
                {currentWork.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {hasMultipleSlides && (
                <div className="flex items-center gap-1.5 rounded-full bg-[#F2F3F2] px-3 py-1 text-[12px] font-medium text-[#6A6A6A]">
                  <Layers className="size-3.5 text-[#EE5A2C]" />
                  <span>
                    Slide {slideIndex + 1} of {slideImages.length}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close lightbox"
                className="size-8 rounded-full bg-[#F2F3F2] text-[#161616] hover:bg-[#E8EAE8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Media Stage */}
          <div className="relative flex-1 bg-[#141414] flex items-center justify-center min-h-[300px] sm:min-h-[460px] max-h-[68vh] overflow-hidden">
            {currentWork.type === "video" ? (
              <video
                key={currentWork.id}
                src={currentWork.mediaUrl}
                poster={currentWork.posterUrl || undefined}
                controls
                autoPlay
                loop
                playsInline
                preload="auto"
                onEnded={(e) => {
                  const v = e.currentTarget;
                  v.currentTime = 0;
                  v.play().catch(() => {});
                }}
                className="max-h-[68vh] w-full object-contain relative z-10"
              />
            ) : (
              <div className="relative size-full min-h-[320px] sm:min-h-[480px] flex items-center justify-center">
                {/* Ambient blurred backdrop so light and dark slides blend seamlessly with no harsh black letterboxing */}
                <img
                  src={currentMediaSrc}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 size-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
                />
                <Image
                  key={currentMediaSrc}
                  src={currentMediaSrc}
                  alt={`${currentWork.title} - Slide ${slideIndex + 1}`}
                  fill
                  sizes="1100px"
                  priority
                  className="object-contain relative z-10"
                />
              </div>
            )}

            {/* Left/Right Navigation Arrows */}
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous item"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 text-[#161616] shadow-lg backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next item"
              className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 text-[#161616] shadow-lg backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Multi-slide thumbnails/dots strip */}
          {hasMultipleSlides && (
            <div className="flex items-center justify-center gap-1.5 bg-[#F8F9F8] border-t border-[#E6E6E6] px-4 py-2 overflow-x-auto">
              {slideImages.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  className={`size-2.5 rounded-full transition-all cursor-pointer ${
                    slideIndex === idx
                      ? "bg-[#EE5A2C] scale-125 w-6"
                      : "bg-[#D0D2D0] hover:bg-[#9A9A9A]"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom Description Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E6E6E6] bg-white px-5 py-4 sm:px-6">
            <p className="text-[14px] leading-relaxed text-[#6A6A6A]">
              {currentWork.description}
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[12px] text-[#9A9A9A]">
                {currentIndex + 1} of {works.length} projects
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
