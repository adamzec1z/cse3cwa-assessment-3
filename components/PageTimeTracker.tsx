"use client";

import { useEffect } from "react";

type PageTimeTrackerProps = {
  activityType: "WORDLE" | "WORD_SEARCH";
};

export default function PageTimeTracker({
  activityType,
}: PageTimeTrackerProps) {
  useEffect(() => {
    const startTime = Date.now();
    let recorded = false;

    function recordTime() {
      if (recorded) {
        return;
      }

      const duration = Math.round(
        (Date.now() - startTime) / 1000
      );

      if (duration < 2) {
        return;
      }

      recorded = true;

      const data = JSON.stringify({
        activityType,
        eventType: "PAGE_VISIT",
        duration,
      });

      const blob = new Blob([data], {
        type: "application/json",
      });

      navigator.sendBeacon("/api/usage", blob);
    }

    window.addEventListener("pagehide", recordTime);

    return () => {
      recordTime();
      window.removeEventListener("pagehide", recordTime);
    };
  }, [activityType]);

  return null;
}