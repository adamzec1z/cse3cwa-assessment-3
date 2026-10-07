import WordleBuilder from "../../components/WordleBuilder";
import PageTimeTracker from "@/components/PageTimeTracker";

export default function WordlePage() {
  return (
    <main className="bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl">

        <p className="font-semibold text-blue-700">
          CSE3CWA Assessment 1
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Phoneme Wordle
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Configure and preview a Wordle-style classroom activity using
          phoneme sounds rather than standard spelling.
        </p>

        <PageTimeTracker activityType="WORDLE" />
        <WordleBuilder />

      </div>
    </main>
  );
}