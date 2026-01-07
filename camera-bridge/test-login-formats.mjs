import dotenv from 'dotenv';
dotenv.config();

const username = 'admin';
const password = 'admin';
const cameraUrl = 'http://192.168.1.100';

console.log('Testing different login form formats...\n');

// Try different form field names
const formats = [
  { name: 'username/password', body: `username=${username}&password=${password}` },
  { name: 'user/pass', body: `user=${username}&pass=${password}` },
  { name: 'usr/pwd', body: `usr=${username}&pwd=${password}` },
  { name: 'login/passwd', body: `login=${username}&passwd=${password}` },
  { name: 'account/password', body: `account=${username}&password=${password}` },
];

for (const format of formats) {
  console.log(`Trying: ${format.name}`);
  try {
    const response = await fetch(`${cameraUrl}/login.htm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: format.body,
      redirect: 'manual'
    });
    const text = await response.text();
    const cookie = response.headers.get('set-cookie');
    console.log(`  Status: ${response.status}, Response: ${text.substring(0, 50)}, Cookie: ${cookie ? cookie.substring(0, 50) : 'none'}`);
    if (text !== 'FAILED' && cookie && !cookie.includes('sessionID=0')) {
      console.log(`  ✅ SUCCESS with ${format.name}!`);
      break;
    }
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }
  console.log('');
}
