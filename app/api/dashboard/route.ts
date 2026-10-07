import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        words: true,
      },
    });

    const usageEvents = await prisma.usageEvent.findMany();

    const totalActivities = activities.length;

    const emptyActivities = activities.filter(
      (activity) => activity.words.length === 0
    ).length;

    const totalWords = activities.reduce(
      (total, activity) => total + activity.words.length,
      0
    );

    const wordleCount = activities.filter(
      (activity) => activity.activityType === "WORDLE"
    ).length;

    const wordSearchCount = activities.filter(
      (activity) => activity.activityType === "WORD_SEARCH"
    ).length;

    const successfulGenerations = usageEvents.filter(
      (event) => event.eventType === "GENERATION_SUCCESS"
    ).length;

    const failedGenerations = usageEvents.filter(
      (event) => event.eventType === "GENERATION_FAILED"
    ).length;

    const pageVisits = usageEvents.filter(
      (event) =>
        event.eventType === "PAGE_VISIT" &&
        event.duration !== null
    );

    const totalDuration = pageVisits.reduce(
      (total, event) => total + (event.duration ?? 0),
      0
    );

    const averageTimeOnPage =
      pageVisits.length > 0
        ? Math.round(totalDuration / pageVisits.length)
        : 0;
    
    const wordleVisits = usageEvents.filter(
      (event) =>
        event.activityType === "WORDLE" &&
        event.eventType === "PAGE_VISIT"
    ).length;

    const wordSearchVisits = usageEvents.filter(
      (event) =>
        event.activityType === "WORD_SEARCH" &&
        event.eventType === "PAGE_VISIT"
    ).length;

    const mostUsedActivity =
      wordleVisits > wordSearchVisits
        ? "Wordle"
        : wordSearchVisits > wordleVisits
        ? "Word Search"
        : wordleVisits === 0
        ? "None"
        : "Equal";

    return NextResponse.json({
      emptyActivities,
      totalActivities,
      totalWords,
      wordleCount,
      wordSearchCount,
      successfulGenerations,
      failedGenerations,
      averageTimeOnPage,
      wordleVisits,
      wordSearchVisits,
      mostUsedActivity,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to retrieve dashboard statistics.",
      },
      { status: 500 }
    );
  }
}