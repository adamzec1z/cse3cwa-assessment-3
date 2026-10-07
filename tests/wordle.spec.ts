import { test, expect } from "@playwright/test";

test("Wordle user workflow", async ({ page }) => {
  // Open the Wordle page
  await page.goto("http://localhost:3000/wordle");

  // Check that Wordle is displayed
await expect(
  page.getByRole("heading", {
    name: "Phoneme Wordle",
    level: 1,
  })
).toBeVisible();

  // Check that the Generate HTML button is available
  const generateButton = page.getByRole("button", {
    name: "Generate HTML",
  });

  await expect(generateButton).toBeEnabled();

  // Generate and download the Wordle activity
  const downloadPromise = page.waitForEvent("download");

  await generateButton.click();

  const download = await downloadPromise;

  // Check that the correct file was generated
  expect(download.suggestedFilename()).toBe(
    "phoneme-wordle.html"
  );
});