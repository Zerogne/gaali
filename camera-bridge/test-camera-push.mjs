// Test if camera can reach the bridge
const bridgeUrl = 'http://192.168.1.176:3000/plate';

console.log('Testing camera push endpoint...');
console.log('Bridge URL:', bridgeUrl);
console.log('');

// Simulate what the camera would send
const testPayload = {
  PlateResult: {
    license: "TEST123",
    trigger_time: "2025-12-23 20:50:00",
    image_path: "/test/image.jpg"
  }
};

fetch(bridgeUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Bridge received request!');
  console.log('Response:', data);
  if (data.ok === false && data.error) {
    console.log('⚠️  Error:', data.error);
    if (data.error.includes('cloud')) {
      console.log('💡 This means Vercel needs LPR_INGEST_SECRET configured');
    }
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
  console.log('💡 Make sure bridge service is running on port 3000');
});
