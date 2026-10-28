"use client";

import { motion } from "motion/react";

interface MobileNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenBooking?: () => void;
}

const NAV_ITEMS = [
  { id: "works", label: "Works" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

export function MobileNav({ activeSection, onNavigate, onOpenBooking }: MobileNavProps) {
  return (
    <header className="sticky top-0 z-40 flex md:hidden h-[52px] w-full items-center justify-between border-b border-[rgba(220,220,220,0.7)] bg-white/95 px-4 backdrop-blur-md">
      <span className="text-[14px] font-semibold tracking-tight text-[#161616]">
        design robel
      </span>

      <nav className="flex items-center gap-4 text-[13px] font-medium" aria-label="Mobile navigation">
        {onOpenBooking && (
          <button
            type="button"
            onClick={onOpenBooking}
            className="rounded-full bg-[#161616] px-3 py-1 text-[11px] font-medium text-white hover:bg-[#2A2A2A] transition-all cursor-pointer"
          >
            Book
          </button>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`relative py-1 transition-colors cursor-pointer ${
                isActive ? "text-[#161616]" : "text-[#7A7A7A]"
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#161616]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
