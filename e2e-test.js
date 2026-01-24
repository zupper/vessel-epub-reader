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
  
  // Track network requests
  const networkRequests = [];
  page.on('request', req => {
    if (req.url().includes('huggingface') || req.url().includes('onnx')) {
      networkRequests.push({ url: req.url(), method: req.method() });
    }
  });
  
  console.log('=== Test Scenario 1: Model Download and Voice Selection ===');
  await page.goto('http://localhost:3000/settings');
  await page.waitForLoadState('networkidle');
  
  // Remove webpack dev server overlay if present
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  // Click Supertonic
  const supertonicBtn = await page.$('button:has-text("Supertonic")');
  await supertonicBtn.click();
  await page.waitForTimeout(500);
  console.log('✓ Selected Supertonic TTS provider');
  
  // Remove overlay again after navigation
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.remove();
  });
  
  // Click Download Model
  console.log('\nStarting model download (this may take 30-60 seconds)...');
  const downloadBtn = await page.$('button:has-text("Download Model")');
  await downloadBtn.click();
  
  // Wait for download to complete (check for button text change)
  try {
    await page.waitForSelector('button:has-text("Model Downloaded")', { timeout: 120000 });
    console.log('✓ Model download completed');
  } catch (e) {
    console.log('✗ Model download timed out or failed');
    // Check for any error messages
    const bodyText = await page.textContent('body');
    console.log('Page state:', bodyText.substring(0, 500));
    
    // Check console for errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    console.log('Console errors:', errors.slice(-5));
  }
  
  // Take screenshot after download
  await page.screenshot({ path: '/tmp/settings-after-download.png', fullPage: true });
  console.log('Screenshot saved: /tmp/settings-after-download.png');
  
  // Check if voice select is now enabled
  try {
    const voiceSelectEnabledAfter = await page.$eval('#voice-select', el => !el.closest('.MuiFormControl-root').classList.contains('Mui-disabled'));
    console.log('Voice select enabled after download:', voiceSelectEnabledAfter);
  } catch (e) {
    console.log('Could not check voice select state');
  }
  
  // Try to change voice to F2
  console.log('\n=== Testing Voice Selection ===');
  try {
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.remove();
    });
    
    const voiceSelect = await page.$('#voice-select');
    if (voiceSelect) {
      await voiceSelect.click();
      await page.waitForTimeout(300);
      
      // Select F2
      const f2Option = await page.$('li[data-value="F2"]');
      if (f2Option) {
        await f2Option.click();
        console.log('✓ Selected voice F2');
      } else {
        console.log('✗ Could not find F2 option');
      }
    }
  } catch (e) {
    console.log('Voice selection error:', e.message);
  }
  
  // Adjust speed to 1.5
  console.log('\n=== Testing Speed Control ===');
  try {
    const speedSlider = await page.$('[aria-labelledby="speed-slider"]');
    if (speedSlider) {
      // Get slider bounding box
      const box = await speedSlider.boundingBox();
      // Click at 67% position (1.5x is at 67% between 0.5 and 2.0)
      const targetX = box.x + (box.width * 0.67);
      await page.mouse.click(targetX, box.y + box.height / 2);
      await page.waitForTimeout(300);
      
      // Check the displayed speed
      const speedText = await page.textContent('[id="speed-slider"]');
      console.log('Speed after adjustment:', speedText);
    }
  } catch (e) {
    console.log('Speed control error:', e.message);
  }
  
  // Take final screenshot
  await page.screenshot({ path: '/tmp/settings-final.png', fullPage: true });
  console.log('Final screenshot saved: /tmp/settings-final.png');
  
  // Print network requests
  console.log('\n=== Network Requests (HuggingFace/ONNX) ===');
  console.log('Total requests:', networkRequests.length);
  if (networkRequests.length > 0) {
    console.log('Sample requests:', networkRequests.slice(0, 5));
  }
  
  // Check for console errors (excluding 404s for static assets)
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
  console.log('\n=== Test Scenario 1 Complete ===');
})();
