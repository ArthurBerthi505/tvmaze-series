const { chromium } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");

async function capture() {
  const destination = path.join(__dirname, "..", "screenshots");
  await fs.mkdir(destination, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    await page.goto("http://localhost:8081");
    const firstShow = page
      .getByRole("button", { name: /^Ver episódios de / })
      .first();
    await firstShow.waitFor({ timeout: 30000 });
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images).map((img) => img.decode().catch(() => {})),
      );
    });
    await page.screenshot({
      path: path.join(destination, "01-inicio-expo-web.png"),
    });
    const request = page.waitForResponse((response) =>
      /\/shows\/\d+\/episodes$/.test(response.url()),
    );
    await firstShow.click();
    const response = await request;
    if (!response.ok())
      throw new Error(
        `A API de episódios respondeu HTTP ${response.status()}.`,
      );
    await page.getByText("GUIA DE EPISÓDIOS", { exact: true }).waitFor();
    await page
      .getByText(/^Temporada \d+ · Episódio /)
      .first()
      .waitFor();
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images).map((img) => img.decode().catch(() => {})),
      );
    });
    await page.screenshot({
      path: path.join(destination, "02-detalhe-expo-web.png"),
    });
    console.log(
      "Duas capturas Expo Web salvas em screenshots/ com dados reais da TVmaze.",
    );
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
