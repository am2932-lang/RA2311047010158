const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

async function capture() {
  console.log("Starting Vite dev server...");
  const server = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'campus-notifications-ui'),
    shell: true
  });

  // Wait a few seconds for the server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    const page = await browser.newPage();
    
    // Desktop View
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    // Wait an extra second to ensure fetching and rendering completes
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'desktop_view.png', fullPage: true });
    console.log("Captured desktop_view.png");

    // Mobile View
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    // Reload to trigger any potential responsive effects
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'mobile_view.png', fullPage: true });
    console.log("Captured mobile_view.png");

  } catch (error) {
    console.error("Screenshot capture failed:", error);
  } finally {
    await browser.close();
    server.kill();
    console.log("Closed browser and killed server.");
    process.exit(0);
  }
}

capture();
