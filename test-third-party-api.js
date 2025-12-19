/**
 * Test script for third-party file-based API
 * Run with: node test-third-party-api.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Sample test data matching the format
const testData = [
  {
    CAR: "Цайны зам",
    CON: "2024/01-1234",
    DRN: "Б.ЭНХБАТ ЕТ74102419 96650888",
    LPC: "ПАТРИКЕЙН ХХК",
    PRM: "PRM000123",
    SLN: "ZW00341369-ZW00341381",
    TRL: "1330СЧ",
    UPC: "Erlian",
    AKT: "311001202401180001",
    NET: 15000,
    WGT: 20000,
    VNO: "3826ДГН",
    CT1: "CTN0001000",
    CT2: "CTN0002000",
    CT3: "CTN0003000",
    CT4: "CTN0004000",
    TID: "TID0005000000",
    CMN: "CMN0006000",
  }
];

async function testSaveEndpoint() {
  console.log('\n🧪 Testing SAVE endpoint...');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/third-party/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uniqueCode: 'TEST12345678',
        data: testData,
      }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('✅ Save successful!');
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error testing save endpoint:', error.message);
    return null;
  }
}

async function testRetrieveEndpoint(code) {
  console.log('\n🧪 Testing RETRIEVE endpoint...');
  console.log('='.repeat(60));
  
  try {
    const url = `${BASE_URL}/api/third-party/data/${code}`;
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Retrieve successful!');
    console.log('Retrieved data:', JSON.stringify(data, null, 2));
    
    // Verify data matches
    if (JSON.stringify(data) === JSON.stringify(testData)) {
      console.log('✅ Data matches original test data!');
    } else {
      console.warn('⚠️ Data does not match exactly');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing retrieve endpoint:', error.message);
    return null;
  }
}

async function testFullFlow() {
  console.log('🚀 Testing Third-Party File-Based API');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Test Data:', JSON.stringify(testData, null, 2));

  // Test 1: Save data
  const saveResult = await testSaveEndpoint();
  
  if (!saveResult) {
    console.error('\n❌ Save test failed. Cannot continue with retrieve test.');
    return;
  }

  const code = saveResult.code;
  const fileUrl = saveResult.url;
  
  console.log(`\n📁 File URL: ${fileUrl}`);
  console.log(`🔑 Unique Code: ${code}`);

  // Test 2: Retrieve data
  await testRetrieveEndpoint(code);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
  console.log('\n💡 The 3rd party app would:');
  console.log(`   1. Receive this URL via WebSocket: ${fileUrl}`);
  console.log(`   2. Fetch data from: ${fileUrl}`);
  console.log(`   3. Get the JSON data we saved`);
}

// Run tests
testFullFlow().catch(console.error);

