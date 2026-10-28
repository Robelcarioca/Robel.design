"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { contactData } from "@/data/pricing";

interface InfoCardProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenBooking?: () => void;
  className?: string;
  isMobileTop?: boolean;
}

const NAV_ITEMS = [
  { id: "works", label: "Works" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

export function InfoCard({
  activeSection,
  onNavigate,
  onOpenBooking,
  className = "",
  isMobileTop = false,
}: InfoCardProps) {
  return (
    <aside
      className={`relative flex flex-col justify-between overflow-hidden bg-white text-[#161616] ${className}`}
      style={{
        borderRadius: "20px",
        padding: isMobileTop ? "24px 20px" : "32px 28px",
      }}
    >
      {/* Background Graph-Paper Grid pattern at the bottom */}
      <div
        className="graph-paper-grid pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[38%]"
        aria-hidden="true"
      />

      {/* TOP SECTION */}
      <div className="relative z-10 flex flex-col">
        {/* 1. Nav row with profile avatar on right */}
        <div className="flex items-center justify-between">
          <nav aria-label="Portfolio sections" className="flex items-center gap-6 text-[14px] font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative pb-1.5 transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-[#161616] font-semibold" : "text-[#7A7A7A] hover:text-[#161616]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[#161616]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Photo Avatar */}
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-[rgba(220,220,220,0.8)] bg-[#EBEBEB] shadow-xs">
            <Image
              src="/brand/robel.jpg"
              alt="design robel portrait"
              fill
              sizes="32px"
              priority
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* 2. Status: Orange asterisk + Available for new project (exact elaya spacing) */}
        <div className="mt-10 flex items-center gap-2 text-[13px] text-[#6A6A6A]">
          <span className="text-[#FF5200] font-bold text-base leading-none">✳</span>
          <span className="font-normal">Available for new project</span>
        </div>

        {/* 3. Headline: Typography from Elaya */}
        <h1 className="headline-tracking mt-4 text-[30px] sm:text-[34px] font-medium leading-[1.14] text-[#161616]">
          Helping clients turn ideas into great designs
        </h1>

        {/* 4. Subcopy */}
        <p className="mt-3.5 text-[14px] leading-relaxed text-[#6A6A6A]">
          I work with founders and product teams to shape complex ideas into simple, conversion-driven interfaces designed to grow with your product.
        </p>

        {/* 5. Buttons: Book a call pill (styled like elaya) + WhatsApp */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenBooking}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[#525252] hover:bg-[#3D3D3D] px-5 text-[14px] font-medium text-white transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>Book a call</span>
            <ArrowRight className="size-4 shrink-0" />
          </button>
          <a
            href={contactData.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-4 text-[13px] font-medium text-[#161616] hover:bg-[#F5F5F5] transition-all duration-200 cursor-pointer"
          >
            <span>WhatsApp</span>
            <ArrowUpRight className="size-3.5 text-[#6A6A6A]" />
          </a>
        </div>

        {/* 6. Dashed horizontal hairline divider: Exact match to elaya.design */}
        <div className="my-7 w-full border-t border-dashed border-[#DFDFDF]" />

        {/* 7. Metadata Section: EMAIL */}
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#9A9A9A]">
            Email
          </div>
          <a
            href={`mailto:${contactData.email}`}
            className="mt-1 block text-[13px] font-medium text-[#161616] hover:text-[#FF5200] transition-colors break-all"
          >
            {contactData.email}
          </a>
        </div>

        {/* 8. Links Section */}
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#9A9A9A]">
            Links
          </div>
          <div className="mt-2 flex flex-col gap-1.5 text-[13px] font-medium text-[#161616]">
            <a
              href={contactData.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#FF5200] transition-colors"
            >
              <span>X (Twitter)</span>
              <ArrowUpRight className="size-3 text-[#9A9A9A]" />
            </a>
            <a
              href={contactData.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#FF5200] transition-colors"
            >
              <span>Instagram</span>
              <ArrowUpRight className="size-3 text-[#9A9A9A]" />
            </a>
            <a
              href={contactData.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#FF5200] transition-colors"
            >
              <span>Telegram</span>
              <ArrowUpRight className="size-3 text-[#9A9A9A]" />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER: Studio Signature */}
      <div className="relative z-10 pt-8 mt-auto">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#9A9A9A] uppercase">
          DESIGN ROBEL · STUDIO
        </div>
      </div>
    </aside>
  );
}
