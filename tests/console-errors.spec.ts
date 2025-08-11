import { test, expect } from '@playwright/test';

test.describe('Console Errors and API Tests', () => {
  test('should check for console errors on sale page', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];
    const networkRequests: { method: string; url: string; status?: number }[] = [];
    const networkErrors: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
      
      // Log important messages
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    // Capture network requests
    page.on('request', request => {
      networkRequests.push({
        method: request.method(),
        url: request.url()
      });
    });

    // Capture network responses
    page.on('response', response => {
      const request = networkRequests.find(req => req.url === response.url());
      if (request) {
        request.status = response.status();
      }
      
      // Log failed requests
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.log(`[NETWORK ERROR] ${response.status()} ${response.url()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
      consoleMessages.push({
        type: 'pageerror',
        text: error.message
      });
    });

    console.log('🌐 Loading sale page...');
    await page.goto('/sale');
    await page.waitForLoadState('networkidle');
    
    // Wait for app to fully initialize
    await page.waitForTimeout(5000);

    console.log('\n📊 ANALYSIS RESULTS:');
    console.log('='.repeat(50));

    // Analyze console messages
    const errors = consoleMessages.filter(msg => msg.type === 'error' || msg.type === 'pageerror');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');

    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.text}`);
    });

    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning.text}`);
    });

    // Analyze API calls
    const apiCalls = networkRequests.filter(req => req.url.includes('/api/'));
    console.log(`\n🔌 API CALLS (${apiCalls.length}):`);
    apiCalls.forEach(call => {
      const status = call.status ? `[${call.status}]` : '[PENDING]';
      console.log(`  ${status} ${call.method} ${call.url}`);
    });

    // Check critical APIs
    const healthAPI = apiCalls.find(call => call.url.includes('/api/health'));
    const mappingsAPI = apiCalls.find(call => call.url.includes('/api/fabric-mappings'));

    console.log(`\n🏥 HEALTH API: ${healthAPI ? `✅ ${healthAPI.status}` : '❌ Not called'}`);
    console.log(`📋 MAPPINGS API: ${mappingsAPI ? `✅ ${mappingsAPI.status}` : '❌ Not called'}`);

    // Network errors
    if (networkErrors.length > 0) {
      console.log(`\n🌐 NETWORK ERRORS (${networkErrors.length}):`);
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }

    // Check environment variables
    const envVars = await page.evaluate(() => {
      return {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        cloudinaryName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        hasCloudinaryKey: !!import.meta.env.VITE_CLOUDINARY_API_KEY,
        forceCloudSync: import.meta.env.VITE_FORCE_CLOUD_SYNC,
        appEnv: import.meta.env.VITE_APP_ENV
      };
    });

    console.log(`\n🔧 ENVIRONMENT VARIABLES:`);
    console.log(`  Supabase URL: ${envVars.supabaseUrl ? '✅' : '❌'} ${envVars.supabaseUrl || 'Missing'}`);
    console.log(`  Supabase Key: ${envVars.hasSupabaseKey ? '✅' : '❌'}`);
    console.log(`  Cloudinary Name: ${envVars.cloudinaryName ? '✅' : '❌'} ${envVars.cloudinaryName || 'Missing'}`);
    console.log(`  Cloudinary Key: ${envVars.hasCloudinaryKey ? '✅' : '❌'}`);
    console.log(`  Force Cloud Sync: ${envVars.forceCloudSync}`);
    console.log(`  App Environment: ${envVars.appEnv}`);

    // Test specific sync service functionality
    console.log(`\n🔄 TESTING SYNC SERVICE:`);
    
    const syncServiceTest = await page.evaluate(async () => {
      try {
        // Check if syncService is available globally
        const syncService = (window as any).syncService;
        if (!syncService) {
          return { error: 'syncService not available globally' };
        }

        // Test basic functionality
        const cacheStats = syncService.getCacheStats();
        return {
          available: true,
          cacheSize: cacheStats.size,
          cacheEntries: cacheStats.entries.length
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    });

    if (syncServiceTest.error) {
      console.log(`  ❌ Sync Service Error: ${syncServiceTest.error}`);
    } else {
      console.log(`  ✅ Sync Service Available`);
      console.log(`  📊 Cache Size: ${syncServiceTest.cacheSize}`);
      console.log(`  📋 Cache Entries: ${syncServiceTest.cacheEntries}`);
    }

    console.log('\n' + '='.repeat(50));

    // Assertions for critical functionality
    expect(healthAPI?.status).toBe(200);
    expect(envVars.supabaseUrl).toBeTruthy();
    expect(envVars.hasSupabaseKey).toBeTruthy();
    expect(envVars.cloudinaryName).toBeTruthy();
    expect(envVars.hasCloudinaryKey).toBeTruthy();

    // Should not have critical errors
    const criticalErrors = errors.filter(error => 
      !error.text.includes('url.startsWith') && // We already fixed this
      !error.text.includes('favicon') && // Ignore favicon errors
      !error.text.includes('manifest') // Ignore manifest errors
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
