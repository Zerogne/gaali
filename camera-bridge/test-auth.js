const dotenv = require('dotenv');
dotenv.config();

const username = process.env.CAMERA_AUTH?.split(':')[0] || 'admin';
const password = process.env.CAMERA_AUTH?.split(':')[1] || 'admin';
const cameraUrl = process.env.CAMERA_BASE_URL || 'http://192.168.1.100';

console.log('Testing camera authentication...');
console.log('Camera URL:', cameraUrl);
console.log('Username:', username);
console.log('Password:', '***' + password.slice(-3));

const credentials = Buffer.from(`${username}:${password}`).toString('base64');
const url = `${cameraUrl}/ivs_result.php?${encodeURIComponent(JSON.stringify({result_id: 6}))}&_=${Date.now()}`;

fetch(url, {
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Accept': 'application/json'
  }
})
.then(res => res.text())
.then(text => {
  if (text.includes('login') || text.includes('TimeOut')) {
    console.log('\n❌ Authentication FAILED');
    console.log('Response:', text.substring(0, 200));
    console.log('\n💡 Try different credentials in .env file:');
    console.log('   CAMERA_AUTH=admin:password');
    console.log('   CAMERA_AUTH=admin:12345');
    console.log('   CAMERA_AUTH=root:root');
  } else {
    console.log('\n✅ Authentication SUCCESS!');
    console.log('Response preview:', text.substring(0, 200));
  }
})
.catch(err => {
  console.error('Error:', err.message);
});
