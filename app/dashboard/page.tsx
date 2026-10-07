"use client";

import { useEffect, useState } from "react";

type DashboardStats = {
  emptyActivities: number;
  totalActivities: number;
  totalWords: number;
  wordleCount: number;
  wordSearchCount: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageTimeOnPage: number;
  wordleVisits: number;
  wordSearchVisits: number;
  mostUsedActivity: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard statistics.");
      }

      const data: DashboardStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = stats
    ? [
        { title: "Total Activities", value: stats.totalActivities },
        { title: "Total Words", value: stats.totalWords },
        { title: "Wordle Activities", value: stats.wordleCount },
        { title: "Word Search Activities", value: stats.wordSearchCount },
        { title: "Wordle Page Visits", value: stats.wordleVisits },
        { title: "Word Search Page Visits", value: stats.wordSearchVisits },
        {
          title: "Successful Generations",
          value: stats.successfulGenerations,
        },
        {
          title: "Failed Generations",
          value: stats.failedGenerations,
        },
        {
          title: "Average Time on Page",
          value: `${stats.averageTimeOnPage} seconds`,
        },
        {
          title: "Most Common Activity",
          value: stats.mostUsedActivity,
        },
      ]
    : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Dashboard</h1>

        <p className="mt-3 text-gray-500">
          View database statistics and monitor activity usage.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Refresh Data
        </button>
      </div>

      {loading && (
        <p role="status">Loading dashboard statistics...</p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-400 p-4 text-red-600"
        >
          {error}
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-300 p-6 shadow-sm"
              >
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <p className="mt-3 text-2xl font-bold">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-10 rounded-xl border border-gray-300 p-6">
            <h2 className="text-xl font-semibold">
              Activity Distribution
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Number of saved activities by type.
            </p>

            <div className="mt-6 space-y-5">
              {[
                { name: "Wordle", count: stats.wordleCount },
                { name: "Word Search", count: stats.wordSearchCount },
              ].map((activity) => {
                const percentage =
                  stats.totalActivities > 0
                    ? (activity.count / stats.totalActivities) * 100
                    : 0;

                return (
                  <div key={activity.name}>
                    <div className="mb-2 flex justify-between">
                      <span>{activity.name}</span>
                      <span>{activity.count}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        
          <section className="mt-8 rounded-xl border border-gray-300 p-6">
            <h2 className="text-xl font-semibold">
                Generation Report
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Summary of recorded activity generations.
            </p>

            <div className="mt-6 space-y-4">
                <p>
                    Total Generations:{" "}
                    <strong>
                        {stats.successfulGenerations + stats.failedGenerations}
                    </strong>
                </p>

                <p>
                    Generation Success Rate:{" "}
                    <strong>
                        {stats.successfulGenerations + stats.failedGenerations > 0
                            ? Math.round(
                                (stats.successfulGenerations /
                                    (stats.successfulGenerations +
                                        stats.failedGenerations)) *
                                    100
                            )   
                          : 0}
                        %
                    </strong>
                </p>

                <p>
                    Total Recorded Page Visits:{" "}
                    <strong>
                        {stats.wordleVisits + stats.wordSearchVisits}
                    </strong>
                </p>
            </div>

            {stats.failedGenerations > 0 ? (
                <p role="alert" className="mt-5 text-red-600">
                    Warning: Some activity generations have failed.
                </p>
            ) : (
                <p className="mt-5 text-green-600">
                    No generation failures have been recorded.
                </p>
            )}
        </section>

          <section className="mt-8 rounded-xl border border-gray-300 p-6">
            <h2 className="text-xl font-semibold">
              System Status
            </h2>

            <p className="mt-3">
              Dashboard API: Connected
            </p>

            {stats.totalActivities === 0 ? (
              <p role="alert" className="mt-3 text-amber-600">
                Warning: No activities have been created.
              </p>
            ) : (
              <p className="mt-3 text-green-600">
                Activity records are available.
              </p>
            )}

            {stats.emptyActivities > 0 && (
                <p role="alert" className="mt-3 text-amber-500">
                    Warning: {stats.emptyActivities} saved
                    {stats.emptyActivities === 1 ? " activity has" : " activities have"}
                    {" "}no words assigned.
                </p>
            )}

            {stats.failedGenerations > 0 && (
              <p role="alert" className="mt-3 text-red-600">
                Warning: {stats.failedGenerations} failed generations recorded.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}