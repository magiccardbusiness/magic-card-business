// test-fix.js
const axios = require('axios');

async function testFix() {
  console.log('🔧 Testing the shareUrl fix...\n');
  
  try {
    const response = await axios.post('http://localhost:3000/api/cards', {
      card_id: 'DEMO-TEST-001',
      message_type: 'demo',
      message_text: 'Testing the fixed shareUrl'
    });
    
    console.log('✅ SUCCESS! Server responded:');
    console.log('   Message:', response.data.message);
    console.log('   Card ID:', response.data.card?.card_id);
    console.log('   Share URL:', response.data.shareUrl);
    console.log('   Viewer URL:', response.data.viewerUrl);
    console.log('   QR Code URL:', response.data.qrCodeUrl);
    
    console.log('\n📱 Test the card:');
    console.log('   Open in browser:', response.data.viewerUrl);
    
    console.log('\n🔄 Testing retrieval...');
    
    // Test retrieving the same card
    const getResponse = await axios.get(`http://localhost:3000/api/cards/DEMO-TEST-001`);
    
    if (getResponse.data.success) {
      console.log('✅ Card retrieval works!');
      console.log('   Retrieved message:', getResponse.data.card?.message_text?.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.response?.status || error.code);
    
    if (error.response) {
      console.log('   Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error message:', error.message);
    }
  }
}

testFix();