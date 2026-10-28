"use client";

import { useEffect, useState, useCallback } from "react";
import { InfoCard } from "./info-card";
import { MobileNav } from "./mobile-nav";
import { WorksGallery } from "./works-gallery";
import { PricingSection } from "./pricing-section";
import { ContactSection } from "./contact-section";
import { CalBooking } from "./cal-booking";
import type { WorkItem } from "@/lib/actions/works";

interface PortfolioViewProps {
  works: WorkItem[];
}

export function PortfolioView({ works }: PortfolioViewProps) {
  const [activeSection, setActiveSection] = useState<string>("works");
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Check hash for #book or #booking (on mount and on hash change)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkHash = () => {
        const hash = window.location.hash.toLowerCase();
        if (hash === "#book" || hash === "#booking" || hash === "#call") {
          setIsBookingOpen(true);
        }
      };
      checkHash();
      window.addEventListener("hashchange", checkHash);
      return () => window.removeEventListener("hashchange", checkHash);
    }
  }, []);

  // Scroll spy to update active section (only when viewing main sections)
  useEffect(() => {
    if (isBookingOpen) return;

    const sectionIds = ["works", "pricing", "contact"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection("works");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBookingOpen]);

  const handleNavigate = useCallback((sectionId: string) => {
    setIsBookingOpen(false);
    setActiveSection(sectionId);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 60);
  }, []);

  const handleOpenBooking = useCallback(() => {
    setIsBookingOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCloseBooking = useCallback(() => {
    setIsBookingOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#EBEBEB] text-[#161616]">
      {/* Sticky Mobile Nav for <768px */}
      <MobileNav
        activeSection={isBookingOpen ? "book" : activeSection}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
      />

      {/* Main Container */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-start">
        {/* DESKTOP (>=1024px) Sticky Info Card */}
        <div className="hidden lg:block shrink-0 sticky top-[14px] h-[calc(100vh-28px)] ml-[14px] w-[360px] xl:w-[420px] z-30">
          <InfoCard
            activeSection={isBookingOpen ? "" : activeSection}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            className="h-full shadow-xs border border-[rgba(220,220,220,0.7)]"
          />
        </div>

        {/* TABLET & MOBILE (<1024px) Non-sticky Card at the Top */}
        <div className="block lg:hidden w-full px-3 pt-3 md:px-4 md:pt-4">
          <InfoCard
            activeSection={isBookingOpen ? "" : activeSection}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            className="w-full border border-[rgba(220,220,220,0.7)] shadow-xs"
            isMobileTop
          />
        </div>

        {/* RIGHT: Main Content Container (Gallery OR Cal.com Booking Scheduler) */}
        <main className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-6 pt-[14px] pb-16">
          <div className="mx-auto w-full max-w-[1160px]">
            {isBookingOpen ? (
              /* Picture 1: Cal.com 15-Minute Meeting Scheduler */
              <div className="pt-1">
                <CalBooking onClose={handleCloseBooking} />
              </div>
            ) : (
              /* Standard Portfolio Experience: Works, Pricing & Contact */
              <>
                {/* Works Section (#works) */}
                <WorksGallery initialWorks={works} />

                {/* Pricing Section (#pricing) */}
                <PricingSection onOpenBooking={handleOpenBooking} />

                {/* Contact Section (#contact) */}
                <ContactSection onOpenBooking={handleOpenBooking} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
