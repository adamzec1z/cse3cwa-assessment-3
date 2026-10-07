"use client";

import { useEffect, useState } from "react";

type Difficulty = "Easy" | "Standard" | "Hard";

type Phoneme = {
  symbol: string;
  hint: string;
};

type SavedWord = {
  id: number;
  english: string;
  phonemes: string;
};

type SavedActivity = {
  id: number;
  name: string;
  activityType: string;
  difficulty: string;
  showHints: boolean;
  words: SavedWord[];
};

export default function WordleBuilder() {
  const [targetWord, setTargetWord] = useState<string[]>([]);
  const [targetEnglish, setTargetEnglish] = useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Standard");

  const [showHints, setShowHints] =
    useState(true);

  const [guess, setGuess] =
    useState<string[]>([]);

  const [message, setMessage] =
    useState("");

  const [correct, setCorrect] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const allPhonemes: Phoneme[] = [
    {
      symbol: "/θ/",
      hint: "TH (as in thin)",
    },
    {
      symbol: "/ɪ/",
      hint: "I (as in sit)",
    },
    {
      symbol: "/n/",
      hint: "N (as in thin)",
    },
    {
      symbol: "/æ/",
      hint: "A (as in cat)",
    },
    {
      symbol: "/p/",
      hint: "P (as in pen)",
    },
    {
      symbol: "/ʃ/",
      hint: "SH (as in ship)",
    },
    {
      symbol: "/k/",
      hint: "K (as in cat)",
    },
    {
      symbol: "/s/",
      hint: "S (as in sun)",
    },
    {
      symbol: "/f/",
      hint: "F (as in fish)",
    },
    {
      symbol: "/d/",
      hint: "D (as in dog)",
    },
    {
      symbol: "/ɒ/",
      hint: "O (as in dog)",
    },
    {
      symbol: "/g/",
      hint: "G (as in dog)",
    },
  ];

  // Load the saved Wordle activity from the database.
  useEffect(() => {
    async function loadWordleActivity() {
      try {
        const response =
          await fetch("/api/activities");

        if (!response.ok) {
          throw new Error(
            "Could not load activities"
          );
        }

        const activities: SavedActivity[] =
          await response.json();

        const wordleActivity =
          activities.find(
            (activity) =>
              activity.activityType ===
                "WORDLE" &&
              activity.words.length > 0
          );

        if (!wordleActivity) {
          setLoadError(
            "No saved Wordle activity was found."
          );
          return;
        }

        const word =
          wordleActivity.words[0];

        setTargetEnglish(
          word.english
        );

        setTargetWord(
          word.phonemes
            .split(" ")
            .filter(Boolean)
        );

        // Convert database values such as
        // STANDARD into the values used by the dropdown.
        const savedDifficulty =
          wordleActivity.difficulty.toUpperCase();

        if (
          savedDifficulty === "EASY"
        ) {
          setDifficulty("Easy");
        } else if (
          savedDifficulty === "HARD"
        ) {
          setDifficulty("Hard");
        } else {
          setDifficulty("Standard");
        }

        setShowHints(
          wordleActivity.showHints
        );
      } catch (error) {
        console.error(
          "Error loading Wordle activity:",
          error
        );

        setLoadError(
          "There was a problem loading the saved Wordle activity."
        );
      }
    }

    loadWordleActivity();
  }, []);

  function getPhonemeCount() {
    if (difficulty === "Easy") {
      return 4;
    }

    if (difficulty === "Hard") {
      return 9;
    }

    return 6;
  }

  function getDifficultyDescription() {
    if (difficulty === "Easy") {
      return "4 phoneme choices with fewer distractors.";
    }

    if (difficulty === "Hard") {
      return "9 phoneme choices with more distractors.";
    }

    return "6 phoneme choices with a standard number of distractors.";
  }

  // Make sure the target phonemes are always available.
  const targetPhonemes: Phoneme[] =
    targetWord.map((symbol) => {
      const found =
        allPhonemes.find(
          (phoneme) =>
            phoneme.symbol === symbol
        );

      return (
        found || {
          symbol,
          hint: "Target phoneme",
        }
      );
    });

  const distractors =
    allPhonemes.filter(
      (phoneme) =>
        !targetWord.includes(
          phoneme.symbol
        )
    );

  const phonemeChoices = [
    ...targetPhonemes,
    ...distractors,
  ];

  const uniquePhonemes =
    phonemeChoices.filter(
      (phoneme, index, array) =>
        array.findIndex(
          (item) =>
            item.symbol ===
            phoneme.symbol
        ) === index
    );

  const availablePhonemes =
    uniquePhonemes.slice(
      0,
      Math.max(
        getPhonemeCount(),
        targetWord.length
      )
    );

  function changeDifficulty(
    newDifficulty: Difficulty
  ) {
    setDifficulty(newDifficulty);
    setGuess([]);
    setMessage("");
    setCorrect(false);
  }

  function addPhoneme(
    symbol: string
  ) {
    if (
      guess.length <
        targetWord.length &&
      !correct
    ) {
      setGuess([
        ...guess,
        symbol,
      ]);

      setMessage("");
    }
  }

  function removeLast() {
    if (!correct) {
      setGuess(
        guess.slice(0, -1)
      );

      setMessage("");
    }
  }

  function submitGuess() {
    if (
      targetWord.length === 0
    ) {
      setMessage(
        "No Wordle activity has been loaded."
      );

      return;
    }

    if (
      guess.length !==
      targetWord.length
    ) {
      setMessage(
        `Choose ${targetWord.length} phonemes before submitting.`
      );

      return;
    }

    const isCorrect =
      guess.every(
        (phoneme, index) =>
          phoneme ===
          targetWord[index]
      );

    if (isCorrect) {
      setCorrect(true);

      setMessage(
        `Correct! The English word is ${targetEnglish}.`
      );
    } else {
      setMessage(
        "Not quite. Try another combination."
      );

      setGuess([]);
    }
  }

  function resetGame() {
    setGuess([]);
    setMessage("");
    setCorrect(false);
  }

  async function recordGeneration(
  eventType: "GENERATION_SUCCESS" | "GENERATION_FAILED",
  errorMessage?: string
) {
  try {
    const response = await fetch("/api/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityType: "WORDLE",
        eventType,
        errorMessage,
      }),
    });

    if (!response.ok) {
      console.error("Failed to record Wordle generation.");
    }
  } catch (error) {
    console.error("Usage tracking error:", error);
  }
}

async function handleGenerateHtml() {
  try {
    if (targetWord.length === 0) {
      setMessage("There is no saved word to generate.");

      await recordGeneration(
        "GENERATION_FAILED",
        "No saved Wordle word available."
      );

      return;
    }

    generateHtml();

    await recordGeneration("GENERATION_SUCCESS");
  } catch (error) {
    console.error("Wordle generation error:", error);

    setMessage("Failed to generate Wordle HTML.");

    await recordGeneration(
      "GENERATION_FAILED",
      "Wordle HTML generation failed."
    );
  }
}

  function generateHtml() {
    if (
      targetWord.length === 0
    ) {
      setMessage(
        "There is no saved word to generate."
      );

      return;
    }

    const difficultyDescription =
      getDifficultyDescription();

    const generatedButtons =
      availablePhonemes
        .map((phoneme) => {
          const hintAttributes =
            showHints
              ? `title="${phoneme.hint}" aria-label="${phoneme.symbol} - ${phoneme.hint}"`
              : `aria-label="${phoneme.symbol}"`;

          return `
            <button
              ${hintAttributes}
              onclick="addPhoneme('${phoneme.symbol}')"
            >
              ${phoneme.symbol}
            </button>
          `;
        })
        .join("");

    const generatedBoxes =
      targetWord
        .map(
          (_, index) => `
            <div
              class="box"
              id="box${index}"
            >
              ?
            </div>
          `
        )
        .join("");

    // These values come from the database.
    const generatedTargetWord =
      JSON.stringify(targetWord);

    const generatedEnglish =
      JSON.stringify(
        targetEnglish
      );

    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Phoneme Wordle</title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      background: #f8fafc;
      color: #0f172a;
    }

    .container {
      width: 90%;
      max-width: 700px;
      margin: 50px auto;

      background: white;

      border:
        1px solid #e2e8f0;

      border-radius: 16px;

      padding: 32px;

      box-shadow:
        0 2px 8px
        rgba(15, 23, 42, 0.08);
    }

    h1 {
      margin-top: 0;
    }

    .intro {
      color: #475569;
      line-height: 1.6;
    }

    .difficulty {
      display: inline-block;

      margin-top: 15px;

      padding: 8px 14px;

      border-radius: 20px;

      background: #eff6ff;

      color: #1d4ed8;

      font-weight: bold;
    }

    .difficulty-description {
      margin-top: 10px;

      color: #64748b;

      font-size: 14px;
    }

    .boxes {
      display: flex;
      flex-wrap: wrap;

      gap: 12px;

      margin-top: 30px;
    }

    .box {
      width: 90px;
      height: 90px;

      border:
        2px solid #cbd5e1;

      border-radius: 10px;

      display: flex;

      align-items: center;
      justify-content: center;

      background: #f8fafc;

      font-size: 22px;

      font-weight: bold;
    }

    .correct {
      background: #dcfce7;

      border-color: #22c55e;

      color: #166534;
    }

    .phonemes {
      display: flex;
      flex-wrap: wrap;

      gap: 10px;

      margin-top: 15px;
    }

    button {
      padding: 12px 18px;

      border-radius: 8px;

      border:
        1px solid #cbd5e1;

      background: white;

      color: #0f172a;

      font-size: 18px;

      font-weight: bold;

      cursor: pointer;
    }

    button:hover {
      background: #eff6ff;

      border-color: #2563eb;
    }

    button:focus {
      outline:
        3px solid #2563eb;

      outline-offset: 2px;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;

      gap: 10px;

      margin-top: 25px;
    }

    .submit {
      background: #1d4ed8;

      color: white;

      border: none;
    }

    .submit:hover {
      background: #1e40af;
    }

    .message {
      margin-top: 25px;

      padding: 15px;

      border-radius: 8px;

      background: #fef3c7;

      color: #92400e;

      font-weight: bold;
    }

    .success {
      background: #dcfce7;

      color: #166534;
    }

    .answer {
      margin-top: 20px;

      padding: 20px;

      border-radius: 10px;

      background: #f0fdf4;

      text-align: center;
    }

    .answer-label {
      color: #64748b;

      font-size: 14px;
    }

    .answer-word {
      margin-top: 5px;

      color: #15803d;

      font-size: 32px;

      font-weight: bold;
    }

    @media (
      max-width: 500px
    ) {

      .container {
        width: 95%;
        padding: 20px;
      }

      .box {
        width: 70px;
        height: 70px;
      }

      button {
        padding: 11px 14px;

        font-size: 16px;
      }
    }

  </style>

</head>

<body>

  <main class="container">

    <h1>
      Phoneme Wordle
    </h1>

    <p class="intro">
      Select the phonemes in the
      correct order to identify
      the target word.
    </p>

    <div class="difficulty">
      Difficulty:
      ${difficulty}
    </div>

    <p class="difficulty-description">
      ${difficultyDescription}
    </p>

    <div class="boxes">
      ${generatedBoxes}
    </div>

    <h2>
      Available phonemes
    </h2>

    <div class="phonemes">
      ${generatedButtons}
    </div>

    <div class="controls">

      <button
        onclick="removeLast()"
      >
        Delete
      </button>

      <button
        class="submit"
        onclick="submitGuess()"
      >
        Submit Guess
      </button>

      <button
        onclick="resetGame()"
      >
        Reset
      </button>

    </div>

    <div
      id="message"
      aria-live="polite"
    ></div>

    <div
      id="answer"
    ></div>

  </main>

  <script>

    const targetWord =
      ${generatedTargetWord};

    const targetEnglish =
      ${generatedEnglish};

    let guess = [];

    let completed = false;

    function addPhoneme(
      symbol
    ) {

      if (
        guess.length <
          targetWord.length &&
        !completed
      ) {

        guess.push(symbol);

        updateBoxes();

        clearMessage();
      }
    }

    function removeLast() {

      if (!completed) {

        guess.pop();

        updateBoxes();

        clearMessage();
      }
    }

    function updateBoxes() {

      for (
        let i = 0;
        i < targetWord.length;
        i++
      ) {

        document
          .getElementById(
            "box" + i
          )
          .textContent =
            guess[i] || "?";
      }
    }

    function clearMessage() {

      const message =
        document.getElementById(
          "message"
        );

      message.textContent = "";

      message.className = "";
    }

    function submitGuess() {

      const message =
        document.getElementById(
          "message"
        );

      const answer =
        document.getElementById(
          "answer"
        );

      if (
        guess.length !==
        targetWord.length
      ) {

        message.className =
          "message";

        message.textContent =
          "Choose " +
          targetWord.length +
          " phonemes before submitting.";

        return;
      }

      const correct =
        guess.every(
          function (
            phoneme,
            index
          ) {
            return (
              phoneme ===
              targetWord[index]
            );
          }
        );

      if (correct) {

        completed = true;

        message.className =
          "message success";

        message.textContent =
          "Correct! The English word is " +
          targetEnglish +
          ".";

        answer.className =
          "answer";

        answer.innerHTML =
          '<div class="answer-label">' +
          'English equivalent' +
          '</div>' +
          '<div class="answer-word">' +
          targetEnglish +
          '</div>';

        for (
          let i = 0;
          i < targetWord.length;
          i++
        ) {

          document
            .getElementById(
              "box" + i
            )
            .classList
            .add(
              "correct"
            );
        }

      } else {

        message.className =
          "message";

        message.textContent =
          "Not quite. Try another combination.";

        guess = [];

        updateBoxes();
      }
    }

    function resetGame() {

      guess = [];

      completed = false;

      updateBoxes();

      clearMessage();

      const answer =
        document.getElementById(
          "answer"
        );

      answer.innerHTML = "";

      answer.className = "";

      for (
        let i = 0;
        i < targetWord.length;
        i++
      ) {

        document
          .getElementById(
            "box" + i
          )
          .classList
          .remove(
            "correct"
          );
      }
    }

  </script>

</body>

</html>
`;

    const blob =
      new Blob(
        [html],
        {
          type: "text/html",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "phoneme-wordle.html";

    document.body
      .appendChild(link);

    link.click();

    document.body
      .removeChild(link);

    URL.revokeObjectURL(
      url
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2">

      {/* SETTINGS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold">
          Activity Settings
        </h2>

        <p className="mt-2 text-slate-600">
          Configure the Wordle activity and preview the result.
        </p>

        {loadError && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
            {loadError}
          </div>
        )}

        {/* Target word */}
        <div className="mt-8">

          <p className="font-semibold">
            Target phoneme word
          </p>

          <div className="mt-3 flex flex-wrap gap-3">

            {targetWord.map(
              (
                phoneme,
                index
              ) => (
                <div
                  key={`${phoneme}-${index}`}
                  className="flex h-14 min-w-16 items-center justify-center rounded-lg border-2 border-blue-200 bg-blue-50 px-3 text-xl font-bold text-blue-800"
                >
                  {phoneme}
                </div>
              )
            )}

          </div>

        </div>

        {/* Difficulty */}
        <div className="mt-8">

          <label
            htmlFor="difficulty"
            className="block font-semibold"
          >
            Difficulty
          </label>

          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) =>
              changeDifficulty(
                event.target
                  .value as Difficulty
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
          >

            <option value="Easy">
              Easy
            </option>

            <option value="Standard">
              Standard
            </option>

            <option value="Hard">
              Hard
            </option>

          </select>

          <p className="mt-3 text-sm text-slate-500">
            {getDifficultyDescription()}
          </p>

        </div>

        {/* Hints */}
        <div className="mt-8">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={showHints}
              onChange={(event) =>
                setShowHints(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />

            <span className="font-semibold">
              Show phoneme hints
            </span>

          </label>

          <p className="ml-8 mt-2 text-sm text-slate-500">
            Hover over phoneme buttons to see an English sound example.
          </p>

        </div>

      </section>

      {/* PREVIEW */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Preview
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Phoneme Wordle
            </h2>

          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {difficulty}
          </span>

        </div>

        <p className="mt-5 text-slate-600">
          Select the phonemes in the correct order to identify the target word.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {availablePhonemes.length} phoneme choices available.
        </p>

        {/* Guess boxes */}
        <div className="mt-8 flex max-w-md flex-wrap gap-3">

          {targetWord.map(
            (_, index) => (
              <div
                key={index}
                className={`flex h-24 w-24 items-center justify-center rounded-lg border-2 text-xl font-bold ${
                  correct
                    ? "border-green-500 bg-green-100 text-green-800"
                    : "border-slate-300 bg-slate-50"
                }`}
              >
                {guess[index] || "?"}
              </div>
            )
          )}

        </div>

        {/* Phonemes */}
        <div className="mt-8">

          <p className="mb-3 font-semibold">
            Available phonemes
          </p>

          <div className="flex flex-wrap gap-3">

            {availablePhonemes.map(
              (phoneme) => (
                <button
                  key={phoneme.symbol}
                  type="button"
                  onClick={() =>
                    addPhoneme(
                      phoneme.symbol
                    )
                  }
                  title={
                    showHints
                      ? phoneme.hint
                      : undefined
                  }
                  aria-label={
                    showHints
                      ? `${phoneme.symbol} - ${phoneme.hint}`
                      : phoneme.symbol
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg font-semibold hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  {phoneme.symbol}
                </button>
              )
            )}

          </div>

        </div>

        {/* Controls */}
        <div className="mt-7 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={removeLast}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={submitGuess}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Submit Guess
          </button>

          <button
            type="button"
            onClick={resetGame}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Reset
          </button>

        </div>

        {/* Feedback */}
        {message && (
          <div
            aria-live="polite"
            className={`mt-6 rounded-lg p-4 font-semibold ${
              correct
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Correct answer */}
        {correct && (
          <div className="mt-5 rounded-lg bg-green-50 p-5 text-center">

            <p className="text-sm text-slate-500">
              English equivalent
            </p>

            <p className="mt-1 text-3xl font-bold text-green-700">
              {targetEnglish}
            </p>

          </div>
        )}

        {/* Generate HTML */}
        <div className="mt-8 border-t border-slate-200 pt-6">

          <button
            type="button"
            onClick={handleGenerateHtml}
            disabled={
              targetWord.length === 0
            }
            className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
          >
            Generate HTML
          </button>

          <p className="mt-2 text-sm text-slate-500">
            Downloads the current database word and settings as a standalone playable HTML file.
          </p>

        </div>

      </section>

    </div>
  );
}