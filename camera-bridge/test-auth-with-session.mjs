import dotenv from 'dotenv';
dotenv.config();

const username = process.env.CAMERA_AUTH?.split(':')[0] || 'admin';
const password = process.env.CAMERA_AUTH?.split(':')[1] || 'admin';
const cameraUrl = process.env.CAMERA_BASE_URL || 'http://192.168.1.100';

console.log('Testing camera authentication with session...');
console.log('Camera URL:', cameraUrl);
console.log('Username:', username);

// Step 1: Try to login and get session cookie
console.log('\nStep 1: Attempting login to get session...');
try {
  const loginResponse = await fetch(`${cameraUrl}/login.htm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    redirect: 'manual'
  });
  
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('Login response status:', loginResponse.status);
  console.log('Cookies received:', cookies ? 'Yes' : 'No');
  
  // Step 2: Try API call with Basic Auth
  console.log('\nStep 2: Testing API with Basic Auth...');
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const queryObj = JSON.stringify({ result_id: 6 });
  const apiUrl = `${cameraUrl}/ivs_result.php?${encodeURIComponent(queryObj)}&_=${Date.now()}`;
  
  const apiResponse = await fetch(apiUrl, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {})
    }
  });
  
  const text = await apiResponse.text();
  
  if (text.includes('login') || text.includes('TimeOut') || text.includes('TITLE')) {
    console.log('\n❌ Authentication FAILED');
    console.log('Response:', text.substring(0, 300));
  } else {
    console.log('\n✅ Authentication SUCCESS!');
    console.log('Response preview:', text.substring(0, 300));
  }
} catch (err) {
  console.error('Error:', err.message);
}
