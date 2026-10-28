"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { sendMeetingBookingEmails, type BookingDetails } from "../email/service";

const BookingInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(150, "Email cannot exceed 150 characters"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time slot is required"),
  timezone: z.string().trim().min(1, "Timezone is required"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .default(""),
});

export type BookingInput = z.infer<typeof BookingInputSchema>;

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Server action to schedule a meeting, persist it, and dispatch emails to host and attendee.
 */
export async function scheduleMeetingAction(
  rawInput: BookingInput
): Promise<BookingResponse> {
  // 1. Validate input fields
  const parseResult = BookingInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    const firstErrorMessage =
      parseResult.error.issues[0]?.message || "Invalid booking details.";
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    };
  }

  const data = parseResult.data;
  const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const nowIso = new Date().toISOString();

  const details: BookingDetails = {
    id: bookingId,
    name: data.name,
    email: data.email,
    date: data.date,
    time: data.time,
    timezone: data.timezone,
    notes: data.notes,
    createdAt: nowIso,
  };

  // 2. Persist booking record in database
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Record in feedback table as a meeting_booking record
      await supabase.from("feedback").insert({
        id: bookingId,
        userId: "public_guest",
        category: "meeting_booking",
        message: JSON.stringify(details),
        status: "confirmed",
        adminNote: `Meeting scheduled with ${details.name} on ${details.date} at ${details.time} (${details.timezone})`,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      // Optional backup in storage uploads bucket
      try {
        const jsonBlob = Buffer.from(JSON.stringify(details, null, 2), "utf-8");
        await supabase.storage
          .from("uploads")
          .upload(`bookings/${bookingId}.json`, jsonBlob, {
            contentType: "application/json",
            upsert: true,
          });
      } catch (storageErr) {
        // Non-critical secondary backup error
        console.warn("[BookingAction] Storage backup non-fatal warning:", storageErr);
      }
    }
  } catch (dbErr) {
    console.error("[BookingAction] Failed to persist booking record:", dbErr);
    // Proceed to email dispatch so the host still receives the notification
  }

  // 3. Dispatch Email Notifications
  const emailResult = await sendMeetingBookingEmails(details);

  if (!emailResult.success) {
    console.error(
      `[BookingAction] Email dispatch failed for booking ${bookingId}:`,
      emailResult.error
    );

    return {
      success: false,
      bookingId,
      error:
        emailResult.error ||
        "Could not send meeting notification email. Please verify email credentials or contact directly.",
    };
  }

  return {
    success: true,
    bookingId,
    message: "Meeting confirmed! Notification sent successfully.",
  };
}
