import dotenv from 'dotenv';
dotenv.config();

const username = 'admin';
const password = 'admin';
const cameraUrl = 'http://192.168.1.100';

console.log('Testing different login methods...\n');

// Method 1: Try /login.htm POST
console.log('Method 1: POST to /login.htm');
try {
  const response = await fetch(`${cameraUrl}/login.htm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    redirect: 'manual'
  });
  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  const text = await response.text();
  console.log('Response preview:', text.substring(0, 200));
} catch (err) {
  console.error('Error:', err.message);
}

console.log('\n---\n');

// Method 2: Try Basic Auth directly on API
console.log('Method 2: Basic Auth on API endpoint');
try {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const queryObj = JSON.stringify({ result_id: 6 });
  const url = `${cameraUrl}/ivs_result.php?${encodeURIComponent(queryObj)}&_=${Date.now()}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json'
    }
  });
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response preview:', text.substring(0, 200));
} catch (err) {
  console.error('Error:', err.message);
}
