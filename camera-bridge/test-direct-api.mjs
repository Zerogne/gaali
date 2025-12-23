import dotenv from 'dotenv';
dotenv.config();

const cameraUrl = 'http://192.168.1.100';

console.log('Testing API endpoint directly...\n');

// Test 1: No authentication
console.log('Test 1: No authentication');
try {
  const queryObj = JSON.stringify({ result_id: 6 });
  const url = `${cameraUrl}/ivs_result.php?${encodeURIComponent(queryObj)}&_=${Date.now()}`;
  const response = await fetch(url);
  const text = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response (first 300 chars): ${text.substring(0, 300)}`);
  if (!text.includes('login') && !text.includes('TimeOut') && !text.includes('<HTML>')) {
    console.log('✅ SUCCESS - API works without auth!');
  }
} catch (err) {
  console.error('Error:', err.message);
}

console.log('\n---\n');

// Test 2: Try different endpoint paths
console.log('Test 2: Different endpoint paths');
const endpoints = [
  '/ivs_result.php',
  '/api/ivs_result.php',
  '/cgi-bin/ivs_result.php',
  '/result/ivs_result.php',
];

for (const endpoint of endpoints) {
  try {
    const queryObj = JSON.stringify({ result_id: 6 });
    const url = `${cameraUrl}${endpoint}?${encodeURIComponent(queryObj)}&_=${Date.now()}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const text = await response.text();
    if (!text.includes('login') && !text.includes('TimeOut') && !text.includes('<HTML>')) {
      console.log(`✅ ${endpoint} - SUCCESS!`);
      console.log(`Response: ${text.substring(0, 200)}`);
      break;
    } else {
      console.log(`❌ ${endpoint} - Failed (login page)`);
    }
  } catch (err) {
    console.log(`❌ ${endpoint} - Error: ${err.message}`);
  }
}
