import { chromium } from "playwright";

const URL = "http://localhost:3000";

const viewports = [
  { width: 1366, height: 768, label: "1366x768 (user's screen)" },
  { width: 1366, height: 768, zoom: 1.25, label: "1366x768 @125%" },
  { width: 1092, height: 614, label: "1092x614 (125% scaled)" },
  { width: 1920, height: 1080, label: "1920x108 (full HD)" },
  { width: 768, height: 1024, label: "768x1024 (portrait)" },
];

async function measure(browser, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.zoom || 1,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const data = await page.evaluate(() => {
    const header = document.querySelector("header");
    const titleWrap = header?.querySelector(".flex.flex-row"); // rotated container
    const h1 = header?.querySelector("h1");
    const p = header?.querySelector("p.uppercase");
    const button = header?.querySelector("button");

    if (!header || !h1 || !button) return { error: "elements not found" };

    const hr = header.getBoundingClientRect();
    const h1r = h1.getBoundingClientRect();
    const pr = p ? p.getBoundingClientRect() : null;
    const br = button.getBoundingClientRect();

    // Get the rotated container's visual bounding box (after transform)
    // We measure it via getBoundingClientRect which gives the POST-TRANSFORM box
    const wrapRect = titleWrap ? titleWrap.getBoundingClientRect() : null;

    return {
      header: { top: hr.top, bottom: hr.bottom, height: hr.height, width: hr.width },
      wrap: wrapRect ? { top: wrapRect.top, bottom: wrapRect.bottom, left: wrapRect.left, right: wrapRect.right, width: wrapRect.width, height: wrapRect.height } : null,
      h1: { top: h1r.top, bottom: h1r.bottom, left: h1r.left, right: h1r.right, width: h1r.width, height: h1r.height },
      p: pr ? { top: pr.top, bottom: pr.bottom, left: pr.left, right: pr.right, width: pr.width, height: pr.height } : null,
      button: { top: br.top, bottom: br.bottom, left: br.left, right: br.right, width: br.width, height: br.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  });

  console.log(`\n=== ${vp.label} (actual: ${data.viewport?.width}x${data.viewport?.height}) ===`);
  if (data.error) { console.log("ERROR:", data.error); await ctx.close(); return; }

  console.log(`Header:  top=${data.header.top.toFixed(0)} bottom=${data.header.bottom.toFixed(0)} h=${data.header.height.toFixed(0)} w=${data.header.width.toFixed(0)}`);
  console.log(`Wrap:    top=${data.wrap?.top.toFixed(0)} bottom=${data.wrap?.bottom.toFixed(0)} w=${data.wrap?.width.toFixed(0)} h=${data.wrap?.height.toFixed(0)}`);
  console.log(`h1:      top=${data.h1.top.toFixed(0)} bottom=${data.h1.bottom.toFixed(0)} w=${data.h1.width.toFixed(0)} h=${data.h1.height.toFixed(0)}`);
  console.log(`p:       top=${data.p?.top.toFixed(0)} bottom=${data.p?.bottom.toFixed(0)} w=${data.p?.width.toFixed(0)} h=${data.p?.height.toFixed(0)}`);
  console.log(`Button:  top=${data.button.top.toFixed(0)} bottom=${data.button.bottom.toFixed(0)} w=${data.button.width.toFixed(0)} h=${data.button.height.toFixed(0)}`);

  const overlap = data.wrap && data.wrap.bottom > data.button.top;
  const topCut = data.wrap && data.wrap.top < 0;
  console.log(`Overlap with buttons: ${overlap ? "YES (" + (data.wrap.bottom - data.button.top).toFixed(0) + "px)" : "NO"}`);
  console.log(`Title clipped at top: ${topCut ? "YES (" + data.wrap.top.toFixed(0) + "px)" : "NO"}`);

  await ctx.close();
}

async function main() {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    await measure(browser, vp);
  }
  await browser.close();
}

main().catch(console.error);
