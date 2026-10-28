"use client";

import { ArrowUpRight, MessageCircle, Send, Instagram, Calendar } from "lucide-react";
import { contactData } from "@/data/pricing";

interface ContactSectionProps {
  onOpenBooking?: () => void;
}

export function ContactSection({ onOpenBooking }: ContactSectionProps = {}) {
  return (
    <section id="contact" className="mt-20 scroll-mt-6 w-full">
      <div className="rounded-[20px] bg-white p-7 sm:p-10 border border-[rgba(220,220,220,0.7)] shadow-xs">
        <h2 className="text-[28px] sm:text-[34px] font-medium leading-tight text-[#161616]">
          Let's work together
        </h2>
        <p className="mt-2 text-[14px] text-[#6A6A6A] max-w-xl">
          Have an idea, product, or design in mind? Reach out directly and let's craft something exceptional.
        </p>

        {/* Email as large link matching elaya.design */}
        <div className="mt-8">
          <a
            href={`mailto:${contactData.email}`}
            className="headline-tracking inline-block text-[24px] sm:text-[36px] font-medium text-[#161616] hover:text-[#FF5200] transition-colors duration-200"
          >
            {contactData.email}
          </a>
        </div>

        {/* Buttons: Cal.com 15-min Call, Telegram, WhatsApp, Instagram, X (Twitter) */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {onOpenBooking && (
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[#161616] px-5 text-[14px] font-medium text-white hover:bg-[#2A2A2A] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Calendar className="size-4 shrink-0" />
              <span>Book a 15-min call</span>
              <ArrowUpRight className="size-3.5 opacity-80" />
            </button>
          )}

          <a
            href={contactData.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-5 text-[14px] font-medium text-[#161616] hover:border-[#161616] hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Send className="size-4 shrink-0" />
            <span>Telegram {contactData.telegramHandle}</span>
            <ArrowUpRight className="size-3.5 opacity-80" />
          </a>

          <a
            href={contactData.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-5 text-[14px] font-medium text-[#161616] hover:border-[#161616] hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <MessageCircle className="size-4 shrink-0 text-[#25D366]" />
            <span>WhatsApp {contactData.whatsappDisplay}</span>
            <ArrowUpRight className="size-3.5 text-[#6A6A6A]" />
          </a>

          <a
            href={contactData.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-5 text-[14px] font-medium text-[#161616] hover:border-[#161616] hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Instagram className="size-4 shrink-0 text-[#E1306C]" />
            <span>Instagram {contactData.instagramHandle}</span>
            <ArrowUpRight className="size-3.5 text-[#6A6A6A]" />
          </a>

          <a
            href={contactData.x}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-5 text-[14px] font-medium text-[#161616] hover:border-[#161616] hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X {contactData.xHandle}</span>
            <ArrowUpRight className="size-3.5 text-[#6A6A6A]" />
          </a>
        </div>

        {/* Hairline Divider & Footer line: "© 2026 design robel" */}
        <div className="mt-12 pt-6 border-t border-[rgba(220,220,220,0.6)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-[#9A9A9A]">
          <span>© 2026 {contactData.name}</span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#9A9A9A]">
            All rights reserved
          </span>
        </div>
      </div>
    </section>
  );
}
