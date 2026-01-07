// Test the HTTP push receiver endpoint
const testPayload = {
  PlateResult: {
    license: "TEST123",
    trigger_time: "2025-12-23 20:18:00",
    image_path: "/test/image.jpg"
  }
};

console.log('Testing HTTP push endpoint...');
console.log('Sending test payload:', JSON.stringify(testPayload, null, 2));

fetch('http://localhost:3000/plate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(res => res.json())
.then(data => {
  console.log('\n✅ Response:', data);
  if (data.ok) {
    console.log('✅ Push endpoint is working!');
  } else {
    console.log('❌ Push endpoint returned error:', data.error);
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
  console.log('\n💡 Make sure the bridge service is running: npm start');
});
