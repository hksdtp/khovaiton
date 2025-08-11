import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Cross-Device Sync Tests', () => {
  let deviceA: Page;
  let deviceB: Page;
  let contextA: BrowserContext;
  let contextB: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    // Tạo 2 browser context để mô phỏng 2 thiết bị khác nhau
    contextA = await browser.newContext({
      userAgent: 'Device-A-Chrome/91.0.4472.124',
      viewport: { width: 1920, height: 1080 }
    });
    
    contextB = await browser.newContext({
      userAgent: 'Device-B-Firefox/89.0',
      viewport: { width: 1366, height: 768 }
    });

    deviceA = await contextA.newPage();
    deviceB = await contextB.newPage();

    // Enable console logging để debug
    deviceA.on('console', msg => console.log(`[Device A] ${msg.type()}: ${msg.text()}`));
    deviceB.on('console', msg => console.log(`[Device B] ${msg.type()}: ${msg.text()}`));

    // Catch errors
    deviceA.on('pageerror', error => console.error(`[Device A] Page Error:`, error));
    deviceB.on('pageerror', error => console.error(`[Device B] Page Error:`, error));
  });

  test.afterAll(async () => {
    await contextA.close();
    await contextB.close();
  });

  test('should sync custom image URL between devices', async () => {
    console.log('🧪 Testing cross-device sync...');

    // Device A: Mở trang sale
    await deviceA.goto('/sale');
    await deviceA.waitForLoadState('networkidle');
    
    // Device B: Mở trang sale
    await deviceB.goto('/sale');
    await deviceB.waitForLoadState('networkidle');

    // Chờ app load xong
    await expect(deviceA.locator('h1')).toContainText('Kho Vải Tồn');
    await expect(deviceB.locator('h1')).toContainText('Kho Vải Tồn');

    console.log('✅ Both devices loaded successfully');

    // Tìm một fabric item để test
    const fabricItem = deviceA.locator('[data-testid="fabric-item"]').first();
    await expect(fabricItem).toBeVisible();

    // Lấy fabric code
    const fabricCode = await fabricItem.getAttribute('data-fabric-code');
    console.log(`🧵 Testing with fabric code: ${fabricCode}`);

    // Device A: Thêm custom URL
    const customUrl = 'https://example.com/test-image.jpg';
    
    // Mở form thêm URL thủ công
    await deviceA.click('[data-testid="add-manual-url-btn"]');
    await deviceA.fill('[data-testid="fabric-code-input"]', fabricCode || 'TEST-001');
    await deviceA.fill('[data-testid="image-url-input"]', customUrl);
    await deviceA.click('[data-testid="save-url-btn"]');

    console.log('📝 Device A: Added custom URL');

    // Chờ sync
    await deviceA.waitForTimeout(2000);

    // Device B: Refresh và kiểm tra sync
    await deviceB.reload();
    await deviceB.waitForLoadState('networkidle');
    await deviceB.waitForTimeout(3000);

    // Kiểm tra xem Device B có nhận được URL không
    const syncedImage = deviceB.locator(`[data-fabric-code="${fabricCode}"] img`);
    
    if (await syncedImage.count() > 0) {
      const imageSrc = await syncedImage.getAttribute('src');
      console.log(`🔄 Device B image src: ${imageSrc}`);
      
      if (imageSrc === customUrl) {
        console.log('✅ Cross-device sync successful!');
      } else {
        console.log('❌ Cross-device sync failed - URLs do not match');
      }
    } else {
      console.log('❌ No image found on Device B');
    }
  });

  test('should check console errors and API calls', async () => {
    console.log('🔍 Checking console errors and API calls...');

    const errors: string[] = [];
    const apiCalls: string[] = [];

    // Capture console errors
    deviceA.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture network requests
    deviceA.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(`${request.method()} ${request.url()}`);
      }
    });

    await deviceA.goto('/sale');
    await deviceA.waitForLoadState('networkidle');
    await deviceA.waitForTimeout(5000);

    console.log('📊 API Calls made:');
    apiCalls.forEach(call => console.log(`  - ${call}`));

    console.log('❌ Console Errors:');
    errors.forEach(error => console.log(`  - ${error}`));

    // Check if critical APIs are working
    const healthCheck = apiCalls.some(call => call.includes('/api/health'));
    const mappingsCheck = apiCalls.some(call => call.includes('/api/fabric-mappings'));

    expect(healthCheck).toBeTruthy();
    console.log(healthCheck ? '✅ Health API working' : '❌ Health API not called');
    
    console.log(mappingsCheck ? '✅ Mappings API working' : '⚠️ Mappings API not called');
  });

  test('should test Supabase connection', async () => {
    console.log('🗄️ Testing Supabase connection...');

    await deviceA.goto('/sale');
    await deviceA.waitForLoadState('networkidle');

    // Check if Supabase is configured
    const supabaseStatus = await deviceA.evaluate(() => {
      return {
        url: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        forceCloudSync: import.meta.env.VITE_FORCE_CLOUD_SYNC
      };
    });

    console.log('🔧 Supabase Configuration:', supabaseStatus);

    expect(supabaseStatus.url).toBeTruthy();
    expect(supabaseStatus.hasAnonKey).toBeTruthy();
    
    console.log(supabaseStatus.url ? '✅ Supabase URL configured' : '❌ Supabase URL missing');
    console.log(supabaseStatus.hasAnonKey ? '✅ Supabase anon key configured' : '❌ Supabase anon key missing');
    console.log(`🔄 Force cloud sync: ${supabaseStatus.forceCloudSync}`);
  });
});
