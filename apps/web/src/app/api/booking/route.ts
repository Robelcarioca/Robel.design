import { NextRequest, NextResponse } from "next/server";
import { scheduleMeetingAction } from "@/lib/actions/booking";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await scheduleMeetingAction(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[API/booking] Error processing request:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while scheduling meeting.",
      },
      { status: 500 }
    );
  }
}
