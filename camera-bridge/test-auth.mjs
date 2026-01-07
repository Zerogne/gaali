import dotenv from 'dotenv';
dotenv.config();

const username = process.env.CAMERA_AUTH?.split(':')[0] || 'admin';
const password = process.env.CAMERA_AUTH?.split(':')[1] || 'admin';
const cameraUrl = process.env.CAMERA_BASE_URL || 'http://192.168.1.100';

console.log('Testing camera authentication...');
console.log('Camera URL:', cameraUrl);
console.log('Username:', username);
console.log('Password:', '***' + password.slice(-3));

const credentials = Buffer.from(`${username}:${password}`).toString('base64');
const queryObj = JSON.stringify({ result_id: 6 });
const url = `${cameraUrl}/ivs_result.php?${encodeURIComponent(queryObj)}&_=${Date.now()}`;

try {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json'
    }
  });
  
  const text = await response.text();
  
  if (text.includes('login') || text.includes('TimeOut') || text.includes('TITLE')) {
    console.log('\n❌ Authentication FAILED');
    console.log('Response:', text.substring(0, 200));
    console.log('\n💡 The credentials "admin:admin" are incorrect.');
    console.log('   Update .env file with correct credentials:');
    console.log('   CAMERA_AUTH=your-username:your-password');
    console.log('\n   Common defaults to try:');
    console.log('   - admin:password');
    console.log('   - admin:12345');
    console.log('   - root:root');
  } else {
    console.log('\n✅ Authentication SUCCESS!');
    console.log('Response preview:', text.substring(0, 200));
  }
} catch (err) {
  console.error('Error:', err.message);
}
