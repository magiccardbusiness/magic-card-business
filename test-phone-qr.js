// test-phone-qr.js
const axios = require('axios');

async function testPhoneQR() {
  console.log('📱 TESTING PHONE QR CODE SCANNING');
  console.log('═'.repeat(50) + '\n');
  
  const testCardId = 'CARD004';
  const testMessage = 'This is a phone test card! Scan the QR code with your phone camera.';
  
  console.log(`📊 Test Details:`);
  console.log(`   Card ID: ${testCardId}`);
  console.log(`   Your Ngrok: https://sharyl-nontheosophical-religiously.ngrok-free.dev`);
  console.log(`   Local Server: http://localhost:3000\n`);
  
  try {
    console.log('🔄 Step 1: Creating test card...');
    
    const createResponse = await axios.post('http://localhost:3000/api/cards', {
      card_id: testCardId,
      message_type: 'phone-test',
      message_text: testMessage
    });
    
    console.log('✅ Card created successfully!\n');
    
    console.log('🔗 Generated URLs:');
    console.log(`   • Viewer (Local): ${createResponse.data.urls.viewerLocal}`);
    console.log(`   • Viewer (Phone): ${createResponse.data.urls.viewer}`);
    console.log(`   • QR Code: ${createResponse.data.urls.qrCode}\n`);
    
    console.log('📱 Step 2: Testing retrieval...');
    
    const getResponse = await axios.get(`http://localhost:3000/api/cards/${testCardId}`);
    
    if (getResponse.data.success) {
      console.log('✅ Card retrieval works!');
      console.log(`   Message: ${getResponse.data.card.message_text}\n`);
    }
    
    console.log('🎯 Step 3: Phone Testing Instructions:\n');
    console.log('   1. Open this QR code on your computer:');
    console.log(`      ${createResponse.data.urls.qrCode}`);
    console.log('\n   2. Scan the QR code with your PHONE camera');
    console.log('\n   3. Your phone should open:');
    console.log(`      ${createResponse.data.urls.viewer}`);
    console.log('\n   4. You should see the message:');
    console.log(`      "${testMessage}"\n`);
    
    console.log('💡 Alternative: Open directly on phone:');
    console.log(`   https://sharyl-nontheosophical-religiously.ngrok-free.dev/viewer.html?card=${testCardId}\n`);
    
    console.log('⚠️  Note: If CARD004 already exists, delete it first or use a different ID.\n');
    
    console.log('═'.repeat(50));
    console.log('📱 PHONE TEST READY!');
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️  Card CARD004 already exists!');
      console.log('\n💡 Solutions:');
      console.log('   1. Delete CARD004 first using cleanup.js');
      console.log('   2. Use a different test ID');
      console.log('   3. Test existing card:\n');
      console.log(`      Open: https://sharyl-nontheosophical-religiously.ngrok-free.dev/viewer.html?card=CARD004`);
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

// Run the test
testPhoneQR();