"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { contactData } from "@/data/pricing";
import { scheduleMeetingAction } from "@/lib/actions/booking";

interface CalBookingProps {
  onClose?: () => void;
}

const TIMEZONES = [
  { value: "Africa/Addis_Ababa", label: "Africa/Addis_Ababa (GMT+3)" },
  { value: "Europe/London", label: "Europe/London (GMT+1)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
];

const RAW_SLOTS_24H = [
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function CalBooking({ onClose }: CalBookingProps) {
  // Calendar date state: default to current date
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  // Time format state
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [selectedSlot, setSelectedSlot] = useState<string>("08:00");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("Africa/Addis_Ababa");

  // Step state: "select" | "form" | "confirmed"
  const [step, setStep] = useState<"select" | "form" | "confirmed">("select");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      day: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      dateObj: Date;
    }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      days.push({
        day: d,
        isCurrentMonth: false,
        isPast: true,
        dateObj: new Date(currentYear, currentMonth - 1, d),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      // Day is past if before today (ignoring hours)
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isPast = dateObj < todayDate;
      days.push({
        day: d,
        isCurrentMonth: true,
        isPast,
        dateObj,
      });
    }

    // Fill remaining grid to complete full weeks (up to multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        isCurrentMonth: false,
        isPast: false,
        dateObj: new Date(currentYear, currentMonth + 1, d),
      });
    }

    return days;
  }, [currentYear, currentMonth, now]);

  // Selected date formatted
  const selectedDateObj = useMemo(() => {
    return new Date(currentYear, currentMonth, selectedDay);
  }, [currentYear, currentMonth, selectedDay]);

  const selectedDayName = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[selectedDateObj.getDay()];
  }, [selectedDateObj]);

  const selectedDayOrdinal = useMemo(() => {
    const d = selectedDay;
    if (d > 3 && d < 21) return `${d}th`;
    switch (d % 10) {
      case 1:
        return `${d}st`;
      case 2:
        return `${d}nd`;
      case 3:
        return `${d}rd`;
      default:
        return `${d}th`;
    }
  }, [selectedDay]);

  // Format slot for display (12h vs 24h)
  const formatSlot = (slot: string) => {
    if (timeFormat === "24h") return slot;
    const [h, m] = slot.split(":").map(Number);
    const suffix = h >= 12 ? "pm" : "am";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m < 10 ? "0" + m : m}${suffix}`;
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    setErrorMessage(null);
    setFieldErrors({});
    setStep("form");
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Client-side validation
    const errs: { name?: string; email?: string } = {};
    if (!trimmedName || trimmedName.length < 2) {
      errs.name = "Please enter your full name (at least 2 characters).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = `${selectedDayName}, ${MONTH_NAMES[currentMonth]} ${selectedDayOrdinal}, ${currentYear}`;
      const formattedTime = formatSlot(selectedSlot);

      let res: { success: boolean; error?: string; fieldErrors?: Record<string, string> };
      try {
        const response = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            date: formattedDate,
            time: formattedTime,
            timezone: selectedTimezone,
            notes: notes.trim(),
          }),
        });
        res = await response.json();
      } catch {
        // Fallback to server action
        res = await scheduleMeetingAction({
          name: trimmedName,
          email: trimmedEmail,
          date: formattedDate,
          time: formattedTime,
          timezone: selectedTimezone,
          notes: notes.trim(),
        });
      }

      if (!res.success) {
        setErrorMessage(
          res.error || "Failed to schedule meeting. Please verify your details or try again."
        );
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setStep("confirmed");
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred while processing your booking. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top action bar with back button */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-4 py-2 text-[13px] font-medium text-[#161616] hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="size-3.5 text-[#6A6A6A]" />
          <span>Back to Portfolio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-[#6A6A6A]">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cal.com Live Integration</span>
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking view"
              className="flex size-9 items-center justify-center rounded-full border border-[rgba(220,220,220,0.8)] bg-white text-[#6A6A6A] hover:text-[#161616] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Cal.com Card Container: Exact match to Picture 1 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full overflow-hidden rounded-[20px] border border-[rgba(220,220,220,0.8)] bg-white shadow-sm"
      >
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-[rgba(220,220,220,0.7)]"
            >
              {/* SUBPANEL 1: Left meeting info & metadata */}
              <div className="w-full xl:w-[280px] shrink-0 p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  {/* Cal logo */}
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#161616] text-white">
                      <span className="text-[13px] font-semibold tracking-tight">Cal</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#71717A]">Cal.com</span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="mt-5 text-[22px] font-semibold leading-tight text-[#161616]">
                    15 Min Meeting
                  </h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#6A6A6A]">
                    Introductory call with <strong>design robel</strong> to discuss your product
                    vision, timeline, and design scope.
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-6 space-y-3.5 text-[13px] text-[#4A4A4A]">
                    <div className="flex items-center gap-2.5">
                      <Clock className="size-4 text-[#71717A]" />
                      <span className="font-medium">15m</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Video className="size-4 text-[#71717A]" />
                      <span className="font-medium">Cal Video</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Globe className="size-4 text-[#71717A]" />
                      <select
                        aria-label="Select meeting timezone"
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="bg-transparent text-[12px] font-medium text-[#161616] hover:text-[#000] focus:outline-hidden cursor-pointer"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[rgba(220,220,220,0.5)]">
                  <div className="flex items-center gap-2 text-[12px] text-[#9A9A9A]">
                    <span>Hosted by</span>
                    <span className="font-semibold text-[#161616]">design robel</span>
                  </div>
                </div>
              </div>

              {/* SUBPANEL 2: Middle Month Calendar View */}
              <div className="flex-1 p-6 sm:p-7">
                {/* Month header & navigation */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-semibold text-[#161616]">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
                      className="flex size-8 items-center justify-center rounded-full border border-[rgba(220,220,220,0.8)] text-[#6A6A6A] hover:text-[#161616] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      aria-label="Next month"
                      className="flex size-8 items-center justify-center rounded-full border border-[rgba(220,220,220,0.8)] text-[#6A6A6A] hover:text-[#161616] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <div
                      key={d}
                      className="text-[11px] font-semibold tracking-wider text-[#71717A] py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarDays.map((item, idx) => {
                    const isSelected = item.isCurrentMonth && item.day === selectedDay;
                    const isToday =
                      item.isCurrentMonth &&
                      item.day === now.getDate() &&
                      currentMonth === now.getMonth() &&
                      currentYear === now.getFullYear();

                    return (
                      <div key={idx} className="relative flex flex-col items-center">
                        {/* NOV badge indicator if first of next month */}
                        {!item.isCurrentMonth && item.day === 1 && idx > 15 && (
                          <span className="absolute -top-3 text-[9px] font-bold uppercase tracking-wider text-[#71717A]">
                            {MONTH_NAMES[(currentMonth + 1) % 12].slice(0, 3)}
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={item.isPast || !item.isCurrentMonth}
                          onClick={() => {
                            if (item.isCurrentMonth && !item.isPast) {
                              setSelectedDay(item.day);
                            }
                          }}
                          className={`relative flex flex-col items-center justify-center size-9 sm:size-10 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                            isSelected
                              ? "bg-[#161616] text-white shadow-xs font-semibold"
                              : item.isPast || !item.isCurrentMonth
                              ? "text-[#C4C4C4] cursor-not-allowed bg-transparent"
                              : "bg-[#F1F3F1] text-[#161616] hover:bg-[#E4E6E4] cursor-pointer"
                          }`}
                        >
                          <span>{item.day}</span>
                          {/* Dot indicator underneath selected or current date */}
                          {isSelected && (
                            <span className="size-1 rounded-full bg-white mt-0.5" />
                          )}
                          {!isSelected && isToday && (
                            <span className="size-1 rounded-full bg-[#161616] mt-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SUBPANEL 3: Right Available Time Slots List */}
              <div className="w-full xl:w-[240px] shrink-0 p-6 sm:p-7 bg-[#FAFAFA]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[14px] font-semibold text-[#161616]">
                    {selectedDayName} {selectedDayOrdinal}
                  </h4>

                  {/* 12h / 24h Toggle Pill */}
                  <div className="flex items-center rounded-full bg-[#EDEDED] p-0.5 text-[11px] font-semibold text-[#6A6A6A]">
                    <button
                      type="button"
                      onClick={() => setTimeFormat("12h")}
                      className={`rounded-full px-2 py-0.5 transition-colors cursor-pointer ${
                        timeFormat === "12h" ? "bg-white text-[#161616] shadow-xs" : ""
                      }`}
                    >
                      12h
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFormat("24h")}
                      className={`rounded-full px-2 py-0.5 transition-colors cursor-pointer ${
                        timeFormat === "24h" ? "bg-white text-[#161616] shadow-xs" : ""
                      }`}
                    >
                      24h
                    </button>
                  </div>
                </div>

                {/* Time Slots Button Grid */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
                  {RAW_SLOTS_24H.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className={`w-full h-10 rounded-lg border text-[13px] font-medium transition-all duration-150 flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-[#161616] text-white border-[#161616] shadow-xs"
                            : "bg-white text-[#161616] border-[rgba(220,220,220,0.8)] hover:border-[#161616] hover:bg-[#F9F9F9]"
                        }`}
                      >
                        {formatSlot(slot)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Booking Details Form */}
          {step === "form" && (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-10 max-w-xl mx-auto"
            >
              <button
                type="button"
                onClick={() => setStep("select")}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#71717A] hover:text-[#161616] transition-colors mb-6 cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Change Date & Time</span>
              </button>

              <div className="rounded-xl bg-[#F6F7F6] border border-[rgba(220,220,220,0.8)] p-4 mb-6">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#71717A] uppercase tracking-wider">
                  <CalendarIcon className="size-3.5" />
                  <span>Selected Meeting Slot</span>
                </div>
                <div className="mt-1 text-[16px] font-semibold text-[#161616]">
                  {selectedDayName}, {MONTH_NAMES[currentMonth]} {selectedDayOrdinal},{" "}
                  {currentYear} at {formatSlot(selectedSlot)}
                </div>
                <div className="mt-0.5 text-[12px] text-[#6A6A6A]">
                  15 Min Video Call · {selectedTimezone}
                </div>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-xl bg-red-50/90 border border-red-200/90 p-4 text-[13px] text-red-800 flex items-start gap-3">
                    <AlertCircle className="size-4.5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-950">Could not complete booking</div>
                      <div className="mt-0.5 text-red-800 leading-relaxed">{errorMessage}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-[#161616] mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    placeholder="e.g. Sarah Jenkins"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-[#161616] placeholder:text-[#9A9A9A] focus:outline-hidden transition-colors ${
                      fieldErrors.name
                        ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                        : "border-[rgba(220,220,220,0.8)] focus:border-[#161616]"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-[12px] font-medium text-red-600">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#161616] mb-1.5">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="you@company.com"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-[#161616] placeholder:text-[#9A9A9A] focus:outline-hidden transition-colors ${
                      fieldErrors.email
                        ? "border-red-500 focus:border-red-600 ring-1 ring-red-500/20"
                        : "border-[rgba(220,220,220,0.8)] focus:border-[#161616]"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-[12px] font-medium text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#161616] mb-1.5">
                    Additional Notes / Project Goals
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe what you're building or designing..."
                    className="w-full rounded-xl border border-[rgba(220,220,220,0.8)] bg-white px-3.5 py-2.5 text-[14px] text-[#161616] placeholder:text-[#9A9A9A] focus:border-[#161616] focus:outline-hidden resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setStep("select");
                    }}
                    className="rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-5 py-2.5 text-[13px] font-medium text-[#161616] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#161616] px-6 py-2.5 text-[14px] font-medium text-white hover:bg-[#2A2A2A] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Scheduling...</span>
                    ) : (
                      <>
                        <span>Confirm 15 Min Meeting</span>
                        <Send className="size-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Confirmed State */}
          {step === "confirmed" && (
            <motion.div
              key="confirmed-step"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-12 text-center max-w-lg mx-auto"
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="size-8" />
              </div>

              <h3 className="text-[24px] font-semibold text-[#161616]">Meeting Confirmed!</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6A6A6A]">
                You're scheduled for a 15-minute intro meeting with{" "}
                <strong className="text-[#161616]">design robel</strong> on{" "}
                <span className="font-semibold text-[#161616]">
                  {selectedDayName}, {MONTH_NAMES[currentMonth]} {selectedDayOrdinal}
                </span>{" "}
                at <span className="font-semibold text-[#161616]">{formatSlot(selectedSlot)}</span>.
              </p>

              <div className="mt-3 rounded-lg bg-[#F5F5F5] p-3 text-[12px] text-[#71717A]">
                A calendar invitation with Cal Video access has been dispatched to{" "}
                <strong className="text-[#161616]">{email}</strong>.
              </div>

              {/* Direct channels */}
              <div className="mt-6 pt-6 border-t border-[rgba(220,220,220,0.7)]">
                <div className="text-[12px] font-medium text-[#71717A] mb-3">
                  Need to discuss something urgently before the call?
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={contactData.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-4 py-2 text-[13px] font-medium text-[#161616] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <MessageSquare className="size-3.5 text-emerald-600" />
                    <span>WhatsApp (+251 930 129 953)</span>
                  </a>
                  <a
                    href={contactData.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,220,220,0.8)] bg-white px-4 py-2 text-[13px] font-medium text-[#161616] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Send className="size-3.5 text-sky-500" />
                    <span>Telegram (@ReubenMarsian)</span>
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setStep("select");
                    if (onClose) onClose();
                  }}
                  className="rounded-full bg-[#161616] px-6 py-2.5 text-[13px] font-medium text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                >
                  Return to Portfolio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
