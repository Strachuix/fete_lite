/**
 * Test Script - API Integration
 * Uruchom w konsoli przeglądarki (F12)
 */

console.log('🧪 Starting API Integration Tests...\n');

// Test 1: Check if API Client is loaded
console.log('Test 1: API Client initialization');
if (typeof window.apiClient !== 'undefined') {
  console.log('✅ API Client loaded');
  console.log('   Base URL:', window.apiClient.baseURL);
} else {
  console.error('❌ API Client NOT loaded');
}

// Test 2: Check if Data Adapter is loaded
console.log('\nTest 2: Data Adapter initialization');
if (typeof window.DataAdapter !== 'undefined') {
  console.log('✅ Data Adapter loaded');
} else {
  console.error('❌ Data Adapter NOT loaded');
}

// Test 3: Check if Storage Manager is loaded
console.log('\nTest 3: Storage Manager initialization');
if (typeof window.storageManager !== 'undefined') {
  console.log('✅ Storage Manager loaded');
  console.log('   Offline queue:', window.storageManager.getOfflineQueueStatus());
} else {
  console.error('❌ Storage Manager NOT loaded');
}

// Test 4: Check backend health
console.log('\nTest 4: Backend Health Check');
(async () => {
  try {
    const isHealthy = await window.apiClient.healthCheck();
    if (isHealthy) {
      console.log('✅ Backend is running and healthy');
    } else {
      console.warn('⚠️ Backend responded but not healthy');
    }
  } catch (error) {
    console.error('❌ Backend is NOT running:', error.message);
    console.log('   Make sure backend is running: cd backend && php -S localhost:8000 -t .');
  }
})();

// Test 5: Data conversion
console.log('\nTest 5: Data Adapter conversion');
try {
  const testEvent = {
    title: 'Test Event',
    startDate: '2025-10-21T18:00',
    location: 'Test Location',
    maxParticipants: 50,
    isPaid: true,
    price: 25.50
  };
  
  const apiFormat = window.DataAdapter.eventToApi(testEvent);
  console.log('✅ Event to API conversion works');
  console.log('   Frontend:', testEvent);
  console.log('   API:', apiFormat);
  
  const backToFrontend = window.DataAdapter.eventFromApi({
    ...apiFormat,
    id: 1,
    organizer_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  console.log('   Back to Frontend:', backToFrontend);
} catch (error) {
  console.error('❌ Data conversion failed:', error);
}

// Test 6: Token management
console.log('\nTest 6: Token Management');
const hasToken = window.apiClient.hasValidToken();
if (hasToken) {
  console.log('✅ User has valid access token');
  console.log('   Token:', window.apiClient.getToken().substring(0, 20) + '...');
} else {
  console.log('ℹ️ No access token (user not logged in)');
}

// Test 7: Cache status
console.log('\nTest 7: Cache Status');
try {
  const cachedEvents = window.storageManager.getEventsFromCache();
  console.log('✅ Cache accessible');
  console.log('   Cached events:', cachedEvents.length);
} catch (error) {
  console.error('❌ Cache error:', error);
}

// Test 8: Network status
console.log('\nTest 8: Network Status');
console.log(navigator.onLine ? '✅ Online' : '⚠️ Offline');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 Integration Test Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Manual Tests:');
console.log('1. Registration: Go to /auth.html and create account');
console.log('2. Login: Login with your credentials');
console.log('3. Create Event: Click "+ Nowe Wydarzenie"');
console.log('4. Offline Test: DevTools → Application → Service Workers → Offline');
console.log('5. Sync Test: Go back online and check console\n');

console.log('Console Commands:');
console.log('- await apiClient.healthCheck()');
console.log('- storageManager.getOfflineQueueStatus()');
console.log('- await storageManager.syncOfflineQueue()');
console.log('- await apiClient.getEvents()');
console.log('- storageManager.getEventsFromCache()');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
