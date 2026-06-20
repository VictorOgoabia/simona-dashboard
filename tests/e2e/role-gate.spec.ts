import { expect, type Page, test } from "@playwright/test";

// These require real Supabase test accounts. Set the env vars to enable:
//   E2E_ADMIN_PIN  – 6-digit PIN for admin@simona.local (role 'admin')
//   E2E_STAFF_PIN  – 6-digit PIN for user1@simona.local (role 'user')
const ADMIN_PIN = process.env.E2E_ADMIN_PIN;
const STAFF_PIN = process.env.E2E_STAFF_PIN;

async function loginAs(page: Page, account: string, pin: string) {
  await page.goto("/login");
  await page.getByText(account, { exact: true }).click();
  for (const d of pin.split("")) {
    await page.getByRole("button", { name: d, exact: true }).click();
  }
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("role-based access", () => {
  test.skip(
    !ADMIN_PIN || !STAFF_PIN,
    "Set E2E_ADMIN_PIN and E2E_STAFF_PIN to run role-gating tests"
  );

  test("admin sees the Amount column on /orders", async ({ page }) => {
    await loginAs(page, "Simona (Admin)", ADMIN_PIN!);
    await page.goto("/orders");
    await expect(
      page.getByRole("columnheader", { name: "Amount" })
    ).toBeVisible();
  });

  test("staff does NOT see the Amount column on /orders", async ({ page }) => {
    await loginAs(page, "Staff", STAFF_PIN!);
    await page.goto("/orders");
    await expect(
      page.getByRole("columnheader", { name: "Amount" })
    ).toHaveCount(0);
  });

  test("staff is bounced from /overview to /clients", async ({ page }) => {
    await loginAs(page, "Staff", STAFF_PIN!);
    await page.goto("/overview");
    await expect(page).toHaveURL(/\/clients$/);
  });
});
