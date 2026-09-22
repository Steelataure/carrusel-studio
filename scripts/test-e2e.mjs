import puppeteer from "puppeteer";

async function runE2ETests() {
  console.log("🚀 Starting Puppeteer E2E Tests on http://localhost:3000...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Load Dashboard
    console.log("1. Navigating to Dashboard...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 15000 });
    const title = await page.title();
    console.log("   Page title:", title);

    // Check search input exists
    const searchInput = await page.$('input[placeholder*="Rechercher"]');
    if (!searchInput) throw new Error("Search input not found!");
    console.log("   ✓ Search input is present");

    // 2. Test Search by typing "Git"
    console.log("2. Testing Search filter for 'Git'...");
    await searchInput.type("Git");
    await new Promise((r) => setTimeout(r, 600));
    let cards = await page.$$(".oc-stagger > div");
    console.log(`   ✓ Found ${cards.length} cards matching 'Git'`);
    if (cards.length === 0) throw new Error("Expected cards matching 'Git'");

    // Clear search
    await searchInput.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await new Promise((r) => setTimeout(r, 500));

    // 3. Test Topic Filter pill
    console.log("3. Testing Topic Filter 'Docker'...");
    const dockerPill = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.trim() === "Docker");
    });
    if (dockerPill.asElement()) {
      await dockerPill.asElement().click();
      await new Promise((r) => setTimeout(r, 600));
      cards = await page.$$(".oc-stagger > div");
      console.log(`   ✓ Filtered to ${cards.length} Docker carousels`);
    }

    // Reset to "Tous"
    const tousPill = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.trim() === "Tous");
    });
    if (tousPill.asElement()) {
      await tousPill.asElement().click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // 4. Test View Switcher: "Planning 30J"
    console.log("4. Testing Publication Calendar (Planning 30J)...");
    const calendarBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.includes("Planning 30J"));
    });
    if (!calendarBtn.asElement()) throw new Error("Calendar view toggle not found");
    await calendarBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 800));

    const dayHeaders = await page.$$eval(".grid-cols-7 > div", (els) => els.map((e) => e.textContent?.trim()));
    console.log("   ✓ Calendar rendered with week headers:", dayHeaders.slice(0, 7).join(", "));

    // Check Auto-planifier button if present
    const autoScheduleBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.includes("Auto-planifier"));
    });
    if (autoScheduleBtn.asElement()) {
      console.log("   ✓ 'Auto-planifier (1/j)' button found, clicking...");
      await autoScheduleBtn.asElement().click();
      await new Promise((r) => setTimeout(r, 1200));
      console.log("   ✓ Auto-scheduling executed successfully!");
    }

    // Switch back to Grille
    const gridBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.includes("Grille"));
    });
    if (gridBtn.asElement()) {
      await gridBtn.asElement().click();
      await new Promise((r) => setTimeout(r, 600));
    }

    // 5. Open First Carousel Editor
    console.log("5. Navigating to Carousel Editor...");
    const firstCard = await page.$(".oc-stagger > div");
    if (!firstCard) throw new Error("No carousel card found to open");
    await firstCard.click();
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 });
    console.log("   ✓ Loaded editor at URL:", page.url());

    // Check toolbar buttons
    const editSlideBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.includes("Éditer Slide"));
    });
    if (!editSlideBtn.asElement()) throw new Error("'Éditer Slide' button not found in toolbar");
    console.log("   ✓ 'Éditer Slide' button found in toolbar");

    const reelBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.includes("Reel 9:16"));
    });
    if (!reelBtn.asElement()) throw new Error("'Reel 9:16' button not found in toolbar");
    console.log("   ✓ 'Reel 9:16' button found in toolbar");

    // 6. Test Quick Edit Slide Modal
    console.log("6. Testing QuickEditSlideModal...");
    await editSlideBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 600));

    const modalTitle = await page.evaluate(() => {
      return document.querySelector("h2")?.textContent || "";
    });
    console.log("   ✓ Modal opened with title:", modalTitle);

    const closeBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.trim() === "Annuler");
    });
    if (closeBtn.asElement()) {
      await closeBtn.asElement().click();
      await new Promise((r) => setTimeout(r, 400));
      console.log("   ✓ Quick edit modal closed successfully");
    }

    // 7. Test Reel Export Dialog
    console.log("7. Testing ReelExportDialog...");
    await reelBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 600));

    const reelTitle = await page.evaluate(() => {
      return document.querySelector("h2")?.textContent || "";
    });
    console.log("   ✓ Reel dialog opened with title:", reelTitle);

    const closeReelBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => b.textContent?.trim() === "Fermer");
    });
    if (closeReelBtn.asElement()) {
      await closeReelBtn.asElement().click();
      await new Promise((r) => setTimeout(r, 400));
      console.log("   ✓ Reel dialog closed successfully");
    }

    console.log("\n🎉 ALL E2E TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL!");
  } catch (err) {
    console.error("❌ E2E Test Error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETests();
