import { test, expect } from "@playwright/test";

test("Word CRUD operations", async ({ request }) => {
  // Create a temporary activity for testing
  const activityResponse = await request.post(
    "http://localhost:3000/api/activities",
    {
      data: {
        name: "Playwright Test Activity",
        activityType: "WORDLE",
        difficulty: "STANDARD",
        showHints: true,
      },
    }
  );

  expect(activityResponse.status()).toBe(201);

  const activity = await activityResponse.json();

  try {
    // CREATE
    const createResponse = await request.post(
      "http://localhost:3000/api/words",
      {
        data: {
          english: "CAT",
          phonemes: "/k/ /æ/ /t/",
          activityId: activity.id,
        },
      }
    );

    expect(createResponse.status()).toBe(201);

    const word = await createResponse.json();

    // READ
    const readResponse = await request.get(
      "http://localhost:3000/api/words"
    );

    expect(readResponse.ok()).toBeTruthy();

    const words = await readResponse.json();

    expect(
      words.some((item: { id: number }) => item.id === word.id)
    ).toBeTruthy();

    // UPDATE
    const updateResponse = await request.put(
      `http://localhost:3000/api/words/${word.id}`,
      {
        data: {
          english: "DOG",
          phonemes: "/d/ /ɒ/ /g/",
        },
      }
    );

    expect(updateResponse.ok()).toBeTruthy();

    const updatedWord = await updateResponse.json();

    expect(updatedWord.english).toBe("DOG");

    // DELETE
    const deleteResponse = await request.delete(
      `http://localhost:3000/api/words/${word.id}`
    );

    expect(deleteResponse.ok()).toBeTruthy();

  } finally {
    // Remove the temporary test activity
    await request.delete(
      `http://localhost:3000/api/activities/${activity.id}`
    );
  }
});