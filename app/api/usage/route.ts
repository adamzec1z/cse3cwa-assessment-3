import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { activityType, eventType, duration, errorMessage } = body;

    const validActivities = ["WORDLE", "WORD_SEARCH"];

    const validEvents = [
      "GENERATION_SUCCESS",
      "GENERATION_FAILED",
      "PAGE_VISIT",
    ];

    if (
      !validActivities.includes(activityType) ||
      !validEvents.includes(eventType)
    ) {
      return NextResponse.json(
        { error: "Invalid activity or event type." },
        { status: 400 }
      );
    }

    if (
      duration !== undefined &&
      duration !== null &&
      (typeof duration !== "number" ||
        !Number.isFinite(duration) ||
        duration < 0)
    ) {
      return NextResponse.json(
        { error: "Duration must be a positive number or zero." },
        { status: 400 }
      );
    }

    if (
      eventType === "PAGE_VISIT" &&
      (typeof duration !== "number" || !Number.isFinite(duration))
    ) {
      return NextResponse.json(
        { error: "Page visits require a duration." },
        { status: 400 }
      );
    }

    if (
      errorMessage !== undefined &&
      errorMessage !== null &&
      typeof errorMessage !== "string"
    ) {
      return NextResponse.json(
        { error: "Error message must be text." },
        { status: 400 }
      );
    }

    const usageEvent = await prisma.usageEvent.create({
      data: {
        activityType,
        eventType,
        duration: duration ?? null,
        errorMessage: errorMessage ?? null,
      },
    });

    return NextResponse.json(usageEvent, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to record usage event." },
      { status: 500 }
    );
  }
}