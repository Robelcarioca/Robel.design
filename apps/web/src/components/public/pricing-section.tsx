"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { contactData } from "@/data/pricing";

interface PricingSectionProps {
  onOpenBooking?: () => void;
}

export function PricingSection({ onOpenBooking }: PricingSectionProps = {}) {
  const [includeDev, setIncludeDev] = useState(true);

  return (
    <section id="pricing" className="mt-20 scroll-mt-6 w-full">
      {/* Header matching elaya.design */}
      <div className="mb-6">
        <h2 className="text-[28px] sm:text-[32px] font-medium leading-tight text-[#161616]">
          Pricing
        </h2>
        <p className="mt-1.5 text-[14px] text-[#6A6A6A]">
          Simple, transparent packages crafted to launch fast and convert.
        </p>
      </div>

      {/* 2-Card Grid matching elaya.design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* CARD 1: Landing page design with interactive Development toggle */}
        <div className="relative flex flex-col justify-between rounded-[20px] bg-white p-7 sm:p-8 border border-[rgba(220,220,220,0.7)] shadow-xs transition-all duration-300 hover:border-[#161616]/30">
          <div>
            <div>
              <h3 className="text-[20px] font-medium text-[#161616]">
                Landing page design
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6A6A6A]">
                A high-converting landing page, designed and built to launch. Ideal for founders validating an idea or relaunching a product.
              </p>
            </div>

            {/* Price display with dynamic switch calculation */}
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-[38px] sm:text-[44px] font-medium tracking-tight text-[#161616]">
                {includeDev ? "$990" : "$500"}
              </span>
              <span className="text-[13px] text-[#9A9A9A]">
                / One time
              </span>
            </div>

            {/* Development Toggle Row - exact signature of elaya.design */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F5F6F5] p-3 border border-[rgba(220,220,220,0.5)]">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[#161616]">
                  Development included
                </span>
                <span className="text-[11px] text-[#6A6A6A]">
                  Clean Next.js / Tailwind production code
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeDev(!includeDev)}
                role="switch"
                aria-checked={includeDev}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  includeDev ? "bg-[#161616]" : "bg-[#D0D2D0]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    includeDev ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Hairline Divider */}
            <div className="my-6 border-t border-[rgba(220,220,220,0.6)]" />

            {/* Features Checklist */}
            <ul className="space-y-3 text-[13px] sm:text-[14px] text-[#161616]">
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Custom landing page & UI/UX design</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Responsive for desktop, tablet & mobile</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Fluid interactions & micro-animations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>2 rounds of comprehensive revisions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Delivered in 7–10 business days</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Direct Telegram / WhatsApp communication</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="mt-8 pt-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex w-full h-[42px] items-center justify-center gap-2 rounded-full bg-[#161616] px-5 text-[14px] font-medium text-white hover:bg-[#2A2A2A] transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>Book a call</span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* CARD 2: Product Design Partnership */}
        <div className="relative flex flex-col justify-between rounded-[20px] bg-white p-7 sm:p-8 border border-[rgba(220,220,220,0.7)] shadow-xs transition-all duration-300 hover:border-[#161616]/30">
          <div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-medium text-[#161616]">
                  Product Design Partnership
                </h3>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6A6A6A]">
                An embedded design partner for your product. Ongoing UX/UI, shipped weekly, without the cost of a full-time hire.
              </p>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-[38px] sm:text-[44px] font-medium tracking-tight text-[#161616]">
                $1,450
              </span>
              <span className="text-[13px] text-[#9A9A9A]">
                / Per Month
              </span>
            </div>

            {/* Sprint updates badge */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F5F6F5] p-3 border border-[rgba(220,220,220,0.5)]">
              <span className="text-[13px] font-medium text-[#161616]">
                2–3 updates per week
              </span>
              <span className="text-[11px] font-medium text-[#FF5200]">
                Active sprint
              </span>
            </div>

            {/* Hairline Divider */}
            <div className="my-6 border-t border-[rgba(220,220,220,0.6)]" />

            {/* Features Checklist */}
            <ul className="space-y-3 text-[13px] sm:text-[14px] text-[#161616]">
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Dedicated Telegram & WhatsApp channel</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Product Design (Web, Mobile & SaaS)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Landing pages & marketing sites</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Design system & component architecture</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Dev-ready handoff or front-end build</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[#161616]" />
                <span>Pause or cancel anytime</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="mt-8 pt-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex w-full h-[42px] items-center justify-center gap-2 rounded-full bg-[#161616] px-5 text-[14px] font-medium text-white hover:bg-[#2A2A2A] transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>Book a call</span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
