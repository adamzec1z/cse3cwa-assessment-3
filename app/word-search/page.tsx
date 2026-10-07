import WordSearchBuilder from "../../components/WordSearchBuilder";
import PageTimeTracker from "@/components/PageTimeTracker";

export default function WordSearchPage() {
  return (
    <main className="bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl">

        <p className="font-semibold text-green-700">
          CSE3CWA Assessment 1
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Phoneme Word Search
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Create and preview a phoneme-based word search activity to support
          phoneme recognition and classroom literacy practice.
        </p>

        <PageTimeTracker activityType="WORD_SEARCH" />
        <WordSearchBuilder />

      </div>
    </main>
  );
}