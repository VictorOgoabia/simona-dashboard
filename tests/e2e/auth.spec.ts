import { expect, test } from "@playwright/test";

// These run without any Supabase credentials.

test("unauthenticated visit to a protected route redirects to /login", async ({
  page,
}) => {
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login$/);
});

test("login screen renders the brand, picker and keypad", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Operations Dashboard")).toBeVisible();
  await expect(page.getByText("Simona (Admin)")).toBeVisible();
  await expect(page.getByText("Staff", { exact: true })).toBeVisible();
  await expect(page.getByText("Enter PIN")).toBeVisible();
  await expect(page.getByRole("button", { name: "1", exact: true })).toBeVisible();
});

test("entering a wrong PIN shows an error and clears", async ({ page }) => {
  await page.goto("/login");
  for (const d of "000000".split("")) {
    await page.getByRole("button", { name: d, exact: true }).click();
  }
  await expect(page.getByText(/Incorrect PIN/i)).toBeVisible();
});
