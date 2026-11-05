import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const server = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173"], { stdio: "inherit" });
const base = "http://127.0.0.1:4173/daymark-clinic/";
let browser;
try {
  let healthy = false;
  for (let i = 0; i < 60; i++) {
    try { healthy = (await fetch(base)).ok; if (healthy) break; } catch { /* The built preview is starting. */ }
    await new Promise(r => setTimeout(r, 500));
  }
  assert.ok(healthy, "production preview did not become ready");
  browser = await chromium.launch();
  await mkdir("public/screenshots", { recursive: true });
  for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: name === "mobile", hasTouch: name === "mobile", acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base);
    await page.getByRole("heading", { name: /Good morning/ }).waitFor();
    assert.equal(await page.locator(".appointment").count(), 18);
    await page.getByLabel("Search appointments").fill("no such patient");
    await page.getByRole("heading", { name: "No appointments in this view." }).waitFor();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByLabel("Filter provider").selectOption("amara");
    assert.equal(await page.locator(".appointment").count(), 6);
    await page.getByLabel("Filter provider").selectOption("all");
    await page.getByLabel("Filter status").selectOption("completed");
    assert.equal(await page.locator(".appointment").count(), 3);
    await page.getByLabel("Filter status").selectOption("all");
    const add = page.getByRole("button", { name: "New appointment" }).first();
    await add.click();
    await page.getByLabel("Patient name").fill("Jordan Lee");
    await page.getByLabel("Start time").fill("09:30");
    await page.getByRole("button", { name: "Book appointment" }).click();
    await page.getByRole("alert").getByText(/already has an appointment/).waitFor();
    await page.getByLabel("Start time").fill("16:30");
    await page.getByRole("button", { name: "Book appointment" }).click();
    await page.getByRole("button", { name: /Edit Jordan Lee at/ }).waitFor();
    await page.reload();
    assert.equal(await page.locator(".appointment").count(), 19);
    await page.getByRole("button", { name: /Edit Jordan Lee at/ }).click();
    await page.getByLabel("Visit type").selectOption("Wellness");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.getByRole("button", { name: /Edit Jordan Lee at/ }).click();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.getByRole("button", { name: /Edit Jordan Lee at/ }).click();
    await page.getByRole("button", { name: "Delete appointment" }).click();
    await page.getByRole("button", { name: "Keep it" }).click();
    await page.getByRole("button", { name: "Delete appointment" }).click();
    await page.getByRole("button", { name: "Remove visit" }).click();
    assert.equal(await page.locator(".appointment").count(), 18);
    const scheduleDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export schedule" }).click();
    assert.equal((await scheduleDownload).suggestedFilename(), "daymark-appointments.csv");
    const flowNav = page.getByRole("navigation", { name: name === "mobile" ? "Mobile navigation" : "Primary navigation" }).getByRole("button", { name: /Patient flow|Flow/ });
    await flowNav.click();
    await page.getByRole("heading", { name: "Waiting room" }).waitFor();
    await page.getByRole("button", { name: /Start visit/ }).first().click();
    await page.getByRole("button", { name: /Complete visit/ }).first().click();
    await page.getByRole("button", { name: /Check in/ }).first().click();
    const capacityNav = page.getByRole("navigation", { name: name === "mobile" ? "Mobile navigation" : "Primary navigation" }).getByRole("button", { name: "Capacity" });
    await capacityNav.click();
    await page.getByRole("heading", { name: "Room to care." }).waitFor();
    const capacityDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export visit data" }).click();
    assert.equal((await capacityDownload).suggestedFilename(), "daymark-appointments.csv");
    if (name === "desktop") {
      const backup = page.waitForEvent("download");
      await page.getByRole("button", { name: /Backup schedule/ }).click();
      assert.equal((await backup).suggestedFilename(), "daymark-schedule.json");
      await page.getByRole("button", { name: /Restore original schedule/ }).click();
      await page.getByRole("button", { name: "Keep it" }).click();
      await page.getByRole("button", { name: /Restore original schedule/ }).click();
      await page.getByRole("button", { name: "Restore schedule" }).click();
    } else {
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    }
    await page.getByRole("heading", { name: /Good morning/ }).waitFor();
    await page.getByRole("status").getByRole("button", { name: "Dismiss message" }).click().catch(() => {});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "horizontal overflow");
    await page.keyboard.press("Tab");
    assert.ok(await page.evaluate(() => document.activeElement !== document.body), "keyboard focus");
    await page.screenshot({ path: "public/screenshots/" + name + ".png", fullPage: true });
    assert.deepEqual(errors, []);
    console.log("PASS " + name + ": navigation, search/filter/empty, conflict validation, create/edit/delete, persistence, flow transitions, exports, reset, dialogs, keyboard and overflow");
    await context.close();
  }
} finally { await browser?.close(); server.kill(); }
