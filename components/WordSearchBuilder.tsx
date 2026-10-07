"use client";

import { useEffect, useState } from "react";

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

type WordSearchWord = {
  id: number;
  english: string;
  phonemes: string[];
};

export default function WordSearchBuilder() {
  const [words, setWords] = useState<WordSearchWord[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  const phonemeHints: Record<string, string> = {
    "/θ/": "TH (as in thin)",
    "/ɪ/": "I (as in sit)",
    "/n/": "N (as in thin)",
    "/p/": "P (as in pen)",
    "/g/": "G (as in go)",
    "/æ/": "A (as in cat)",
    "/k/": "K (as in cat)",
    "/t/": "T (as in top)",
    "/ʃ/": "SH (as in ship)",
    "/ɒ/": "O (as in dog)",
    "/d/": "D (as in dog)",
    "/f/": "F (as in fish)",
    "/s/": "S (as in sun)",
  };

  useEffect(() => {
    async function loadWordSearchActivity() {
      try {
        const response = await fetch("/api/activities");

        if (!response.ok) {
          throw new Error("Could not load activities");
        }

        const activities: SavedActivity[] =
          await response.json();

        const wordSearchActivity = activities.find(
          (activity) =>
            activity.activityType === "WORD_SEARCH" &&
            activity.words.length > 0
        );

        if (!wordSearchActivity) {
          setLoadError(
            "No saved Word Search activity was found."
          );
          return;
        }

        const savedWords = wordSearchActivity.words.map(
          (word) => ({
            id: word.id,
            english: word.english,
            phonemes: word.phonemes
              .split(" ")
              .filter(Boolean),
          })
        );

        setWords(savedWords);
      } catch (error) {
        console.error(
          "Error loading Word Search activity:",
          error
        );

        setLoadError(
          "There was a problem loading the saved Word Search activity."
        );
      }
    }

    loadWordSearchActivity();
  }, []);

  const fillerPhonemes = [
    "/θ/",
    "/ɪ/",
    "/n/",
    "/p/",
    "/g/",
    "/æ/",
    "/k/",
    "/t/",
    "/ʃ/",
    "/ɒ/",
    "/d/",
    "/f/",
  ];

  const wordPhonemes = words.flatMap(
    (word) => word.phonemes
  );

  const gridSource = [
    ...wordPhonemes,
    ...fillerPhonemes,
  ];

  const grid = Array.from(
    { length: 36 },
    (_, index) =>
      gridSource[index % gridSource.length] || "/θ/"
  );

  function selectPhoneme(symbol: string) {
    if (selected.length < 3) {
      setSelected([
        ...selected,
        symbol,
      ]);

      setMessage("");
    }
  }

  function checkWord() {
    if (selected.length !== 3) {
      setMessage(
        "Select three phonemes first."
      );

      return;
    }

    const selectedWord =
      selected.join("");

    const match = words.find(
      (word) =>
        word.phonemes.join("") ===
        selectedWord
    );

    if (match) {
      if (
        !foundWords.includes(
          match.english
        )
      ) {
        setFoundWords([
          ...foundWords,
          match.english,
        ]);

        setMessage(
          `Correct! You found ${match.english}.`
        );
      } else {
        setMessage(
          `${match.english} has already been found.`
        );
      }
    } else {
      setMessage(
        "That sequence is not one of the target words."
      );
    }

    setSelected([]);
  }

  function removeLast() {
    setSelected(
      selected.slice(0, -1)
    );

    setMessage("");
  }

  function resetGame() {
    setSelected([]);
    setFoundWords([]);
    setMessage("");
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
        activityType: "WORD_SEARCH",
        eventType,
        errorMessage,
      }),
    });

    if (!response.ok) {
      console.error("Failed to record Word Search generation.");
    }
  } catch (error) {
    console.error("Usage tracking error:", error);
  }
}

  async function handleGenerateHtml() {
    try {
      if (words.length === 0) {
        setMessage("There are no saved words to generate.");

        await recordGeneration(
          "GENERATION_FAILED",
          "No saved Word Search words available."
        );

        return;
      }

      generateHtml();

      await recordGeneration("GENERATION_SUCCESS");
    } catch (error) {
      console.error("Word Search generation error:", error);

      setMessage("Failed to generate Word Search HTML.");

      await recordGeneration(
        "GENERATION_FAILED",
        "Word Search HTML generation failed."
      );
    }
  }

  function generateHtml() {
    if (words.length === 0) {
      setMessage(
        "There are no saved words to generate."
      );

      return;
    }

    const generatedGridButtons = grid
      .map((symbol) => {
        const hint =
          phonemeHints[symbol] ||
          "Phoneme";

        return `
          <button
            title="${hint}"
            aria-label="${symbol} - ${hint}"
            onclick="selectPhoneme('${symbol}')"
          >
            ${symbol}
          </button>
        `;
      })
      .join("");

    const generatedWordList = words
      .map(
        (word, index) => `
          <div class="word">
            <div>

              <strong>
                ${word.english}
              </strong>

              <div class="phonemes">
                ${word.phonemes.join(" ")}
              </div>

            </div>

            <span
              id="word-status-${index}"
            ></span>

          </div>
        `
      )
      .join("");

    const generatedWords =
      JSON.stringify(words);

    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Phoneme Word Search
  </title>

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

      max-width: 900px;

      margin: 40px auto;

      background: white;

      border: 1px solid #e2e8f0;

      border-radius: 16px;

      padding: 32px;
    }

    h1 {
      margin-top: 0;
    }

    .intro {
      color: #475569;

      line-height: 1.6;
    }

    .layout {
      display: grid;

      grid-template-columns:
        1fr 1.4fr;

      gap: 35px;

      margin-top: 30px;
    }

    .word {
      display: flex;

      justify-content:
        space-between;

      align-items: center;

      gap: 15px;

      border:
        1px solid #e2e8f0;

      border-radius: 8px;

      padding: 14px;

      margin-bottom: 10px;
    }

    .phonemes {
      color: #475569;

      margin-top: 5px;
    }

    .found {
      background: #dcfce7;

      color: #166534;

      padding: 6px 10px;

      border-radius: 20px;

      font-size: 14px;

      font-weight: bold;
    }

    .progress {
      margin-top: 20px;

      background: #f8fafc;

      border-radius: 8px;

      padding: 15px;
    }

    .grid {
      display: grid;

      grid-template-columns:
        repeat(6, 1fr);

      gap: 7px;

      margin-top: 20px;
    }

    .grid button {
      aspect-ratio: 1;

      min-width: 0;

      border:
        1px solid #cbd5e1;

      border-radius: 8px;

      background: white;

      font-size: 15px;

      font-weight: bold;

      cursor: pointer;
    }

    .grid button:hover {
      background: #f0fdf4;

      border-color: #16a34a;
    }

    button:focus {
      outline:
        3px solid #16a34a;

      outline-offset: 2px;
    }

    .selection {
      display: flex;

      gap: 10px;

      margin-top: 15px;
    }

    .selection-box {
      width: 65px;

      height: 55px;

      border:
        2px solid #cbd5e1;

      border-radius: 8px;

      background: #f8fafc;

      display: flex;

      align-items: center;

      justify-content: center;

      font-weight: bold;
    }

    .controls {
      display: flex;

      flex-wrap: wrap;

      gap: 10px;

      margin-top: 20px;
    }

    .controls button {
      padding: 11px 16px;

      border-radius: 8px;

      border:
        1px solid #cbd5e1;

      background: white;

      cursor: pointer;

      font-weight: bold;
    }

    .controls button:hover {
      background: #f1f5f9;
    }

    .controls .check {
      background: #15803d;

      color: white;

      border: none;
    }

    .controls .check:hover {
      background: #166534;
    }

    .message {
      margin-top: 20px;

      padding: 14px;

      border-radius: 8px;

      background: #f0fdf4;

      color: #166534;

      font-weight: bold;
    }

    .complete {
      margin-top: 20px;

      padding: 16px;

      border-radius: 8px;

      background: #dcfce7;

      color: #166534;

      font-weight: bold;

      text-align: center;
    }

    @media (
      max-width: 700px
    ) {

      .container {
        width: 95%;

        padding: 20px;
      }

      .layout {
        grid-template-columns:
          1fr;
      }

      .grid button {
        font-size: 12px;
      }
    }

  </style>

</head>

<body>

  <main class="container">

    <h1>
      Phoneme Word Search
    </h1>

    <p class="intro">
      Select three phonemes in order
      and check whether they form one
      of the target words.
    </p>

    <div class="layout">

      <section>

        <h2>
          Word List
        </h2>

        ${generatedWordList}

        <div class="progress">

          Found words:

          <strong id="progress">
            0 / ${words.length}
          </strong>

        </div>

      </section>

      <section>

        <h2>
          Activity
        </h2>

        <div class="grid">

          ${generatedGridButtons}

        </div>

        <div class="selection">

          <div
            class="selection-box"
            id="selection0"
          >
            ?
          </div>

          <div
            class="selection-box"
            id="selection1"
          >
            ?
          </div>

          <div
            class="selection-box"
            id="selection2"
          >
            ?
          </div>

        </div>

        <div class="controls">

          <button
            onclick="removeLast()"
          >
            Delete
          </button>

          <button
            class="check"
            onclick="checkWord()"
          >
            Check Word
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
          id="complete-message"
        ></div>

      </section>

    </div>

  </main>

  <script>

    const words =
      ${generatedWords};

    let selected = [];

    let foundWords = [];

    function selectPhoneme(
      symbol
    ) {

      if (
        selected.length < 3
      ) {

        selected.push(symbol);

        updateSelection();

        clearMessage();
      }
    }

    function updateSelection() {

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        document
          .getElementById(
            "selection" + i
          )
          .textContent =
            selected[i] || "?";
      }
    }

    function removeLast() {

      selected.pop();

      updateSelection();

      clearMessage();
    }

    function checkWord() {

      const message =
        document.getElementById(
          "message"
        );

      if (
        selected.length !== 3
      ) {

        message.className =
          "message";

        message.textContent =
          "Select three phonemes first.";

        return;
      }

      const selectedWord =
        selected.join("");

      const matchIndex =
        words.findIndex(
          function(word) {

            return (
              word.phonemes.join("") ===
              selectedWord
            );
          }
        );

      if (
        matchIndex !== -1
      ) {

        const match =
          words[matchIndex];

        if (
          !foundWords.includes(
            match.english
          )
        ) {

          foundWords.push(
            match.english
          );

          message.className =
            "message";

          message.textContent =
            "Correct! You found " +
            match.english +
            ".";

          const status =
            document.getElementById(
              "word-status-" +
              matchIndex
            );

          status.textContent =
            "Found";

          status.className =
            "found";

          document
            .getElementById(
              "progress"
            )
            .textContent =
              foundWords.length +
              " / " +
              words.length;

          if (
            foundWords.length ===
            words.length
          ) {

            const completeMessage =
              document.getElementById(
                "complete-message"
              );

            completeMessage.className =
              "complete";

            completeMessage.textContent =
              "Great work! You found all " +
              words.length +
              " words.";
          }
        } else {

          message.className =
            "message";

          message.textContent =
            match.english +
            " has already been found.";
        }

      } else {

        message.className =
          "message";

        message.textContent =
          "That sequence is not one of the target words.";
      }

      selected = [];

      updateSelection();
    }

    function clearMessage() {

      const message =
        document.getElementById(
          "message"
        );

      message.textContent = "";

      message.className = "";
    }

    function resetGame() {

      selected = [];

      foundWords = [];

      updateSelection();

      clearMessage();

      document
        .getElementById(
          "progress"
        )
        .textContent =
          "0 / " +
          words.length;

      const completeMessage =
        document.getElementById(
          "complete-message"
        );

      completeMessage.textContent = "";

      completeMessage.className = "";

      words.forEach(
        function(word, index) {

          const status =
            document.getElementById(
              "word-status-" +
              index
            );

          status.textContent = "";

          status.className = "";
        }
      );
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
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "phoneme-word-search.html";

    document.body
      .appendChild(link);

    link.click();

    document.body
      .removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2">

      {/* WORD LIST */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold">
          Word List
        </h2>

        <p className="mt-2 text-slate-600">
          Find each phoneme-based word in the activity.
        </p>

        {loadError && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
            {loadError}
          </div>
        )}

        <div className="mt-6 space-y-3">

          {words.map((word) => (
            <div
              key={word.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
            >

              <div>

                <p className="font-bold">
                  {word.english}
                </p>

                <p className="mt-1 text-slate-600">
                  {word.phonemes.join(" ")}
                </p>

              </div>

              {foundWords.includes(
                word.english
              ) && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  Found
                </span>
              )}

            </div>
          ))}

        </div>

        <div className="mt-8 rounded-lg bg-slate-50 p-4">

          <p className="font-semibold">
            Found words
          </p>

          <p className="mt-1 text-slate-600">
            {foundWords.length} / {words.length}
          </p>

        </div>

      </section>

      {/* PREVIEW */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Preview
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          Phoneme Word Search
        </h2>

        <p className="mt-3 text-slate-600">
          Click three phonemes in order, then check your selection.
        </p>

        {/* GRID */}
        <div className="mt-8 grid grid-cols-6 gap-2">

          {grid.map(
            (symbol, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  selectPhoneme(
                    symbol
                  )
                }
                title={
                  phonemeHints[symbol] ||
                  "Phoneme"
                }
                aria-label={`${symbol} - ${
                  phonemeHints[symbol] ||
                  "Phoneme"
                }`}
                className="flex aspect-square items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold hover:border-green-500 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {symbol}
              </button>
            )
          )}

        </div>

        {/* CURRENT SELECTION */}
        <div className="mt-7">

          <p className="font-semibold">
            Current selection
          </p>

          <div className="mt-3 flex min-h-14 gap-3">

            {[0, 1, 2].map(
              (index) => (
                <div
                  key={index}
                  className="flex h-14 min-w-16 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 px-3 font-bold"
                >
                  {selected[index] || "?"}
                </div>
              )
            )}

          </div>

        </div>

        {/* CONTROLS */}
        <div className="mt-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={removeLast}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-100"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={checkWord}
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Check Word
          </button>

          <button
            type="button"
            onClick={resetGame}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-100"
          >
            Reset
          </button>

        </div>

        {/* MESSAGE */}
        {message && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-6 rounded-lg bg-green-50 p-4 font-semibold text-green-800"
          >
            {message}
          </div>
        )}

        {/* COMPLETION MESSAGE */}
        {words.length > 0 &&
          foundWords.length === words.length && (
            <div className="mt-6 rounded-lg bg-green-100 p-4 text-center font-semibold text-green-800">
              Great work! You found all {words.length} words.
            </div>
          )}

        {/* GENERATE HTML */}
        <div className="mt-8 border-t border-slate-200 pt-6">

          <button
            type="button"
            onClick={handleGenerateHtml}
            disabled={words.length === 0}
            className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
          >
            Generate HTML
          </button>

          <p className="mt-2 text-sm text-slate-500">
            Downloads the database Word Search as a standalone HTML file.
          </p>

        </div>

      </section>

    </div>
  );
}