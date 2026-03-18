const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/shade/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome'
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  
  console.log('=== Test Scenario 2: Config Persistence ===');
  
  // Step 1: Set up Supertonic with specific settings
  console.log('\n--- Step 1: Configure Supertonic ---');
  await page.goto('http://localhost:3000/settings');
  await page.waitForLoadState('networkidle');
  
  // Remove overlay
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  // Click Supertonic
  const supertonicBtn = await page.$('button:has-text("Supertonic")');
  await supertonicBtn.click();
  await page.waitForTimeout(500);
  console.log('✓ Selected Supertonic');
  
  // Remove overlay again
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  // Wait for model to be ready (it should be cached from previous test)
  try {
    await page.waitForSelector('button:has-text("Model Downloaded")', { timeout: 120000 });
    console.log('✓ Model already downloaded (cached)');
  } catch (e) {
    // Try clicking download
    const downloadBtn = await page.$('button:has-text("Download Model")');
    if (downloadBtn) {
      await downloadBtn.click();
      await page.waitForSelector('button:has-text("Model Downloaded")', { timeout: 180000 });
    }
  }
  
  // Select voice F2
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  const voiceSelect = await page.$('#voice-select');
  await voiceSelect.click({ force: true });
  await page.waitForTimeout(500);
  const f2Option = await page.$('li[data-value="F2"]');
  if (f2Option) {
    await f2Option.click();
    console.log('✓ Selected voice F2');
  }
  
  // Adjust speed to 1.5
  const speedSlider = await page.$('[aria-labelledby="speed-slider"]');
  if (speedSlider) {
    const box = await speedSlider.boundingBox();
    const targetX = box.x + (box.width * 0.67);
    await page.mouse.click(targetX, box.y + box.height / 2);
    await page.waitForTimeout(300);
    console.log('✓ Adjusted speed');
  }
  
  // Get current localStorage
  const localStorageBefore = await page.evaluate(() => {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      result[key] = localStorage.getItem(key);
    }
    return result;
  });
  console.log('\nLocalStorage before reload:', JSON.stringify(localStorageBefore, null, 2));
  
  // Step 2: Reload page
  console.log('\n--- Step 2: Reload Page ---');
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Remove overlay
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  // Check if Supertonic is still selected
  const selectedProvider = await page.$eval('button[aria-pressed="true"]', el => el.textContent.trim());
  console.log('Selected provider after reload:', selectedProvider);
  
  if (selectedProvider === 'Supertonic') {
    console.log('✓ Supertonic still selected after reload');
  } else {
    console.log('✗ Provider changed after reload');
  }
  
  // Check voice value
  try {
    const voiceValue = await page.$eval('#voice-select', el => el.textContent);
    console.log('Voice after reload:', voiceValue);
    if (voiceValue.includes('F2')) {
      console.log('✓ Voice F2 persisted');
    } else {
      console.log('✗ Voice did not persist');
    }
  } catch (e) {
    console.log('Could not check voice:', e.message);
  }
  
  // Check speed value
  try {
    const speedText = await page.textContent('[id="speed-slider"]');
    console.log('Speed after reload:', speedText);
  } catch (e) {
    console.log('Could not check speed:', e.message);
  }
  
  // Get localStorage after reload
  const localStorageAfter = await page.evaluate(() => {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      result[key] = localStorage.getItem(key);
    }
    return result;
  });
  console.log('\nLocalStorage after reload:', JSON.stringify(localStorageAfter, null, 2));
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/settings-after-reload.png', fullPage: true });
  console.log('Screenshot saved: /tmp/settings-after-reload.png');
  
  // Check for console errors
  const criticalErrors = consoleMessages.filter(m => 
    m.type === 'error' && 
    !m.text.includes('404') && 
    !m.text.includes('favicon')
  );
  if (criticalErrors.length > 0) {
    console.log('\n✗ Critical console errors:', criticalErrors);
  } else {
    console.log('\n✓ No critical console errors');
  }
  
  await browser.close();
  console.log('\n=== Test Scenario 2 Complete ===');
})();
