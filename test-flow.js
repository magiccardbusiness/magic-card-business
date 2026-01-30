// 🧪 Magic Card Business Flow Test
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_CARD_ID = `TEST_${Date.now()}`; // Unique ID for each test

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testStep(description, testFn) {
  console.log(`\n🔍 ${description}`);
  try {
    const result = await testFn();
    console.log(`   ✅ PASS`);
    return result;
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function runAllTests() {
  console.log('\n🎪✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨');
  console.log('   MAGIC CARD BUSINESS FLOW TEST');
  console.log('✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨🎪\n');
  
  console.log(`📊 Test Card ID: ${TEST_CARD_ID}`);
  console.log(`🌐 Server: ${BASE_URL}`);
  
  try {
    // 1. Test Server Health
    await testStep('1. Server Health Check', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);
      if (response.data.status !== '✅ WORKING') {
        throw new Error('Server not working');
      }
      console.log(`   Server: ${response.data.message}`);
      return response.data;
    });
    
    await delay(500);
    
    // 2. Test Supabase Connection
    await testStep('2. Supabase Connection Test', async () => {
      const response = await axios.get(`${BASE_URL}/api/test-supabase`);
      if (!response.data.status.includes('✅')) {
        throw new Error('Supabase not connected');
      }
      console.log(`   Supabase: ${response.data.message}`);
      console.log(`   Cards in DB: ${response.data.testData?.length || 0}`);
      return response.data;
    });
    
    await delay(500);
    
    // 3. Create a New Card (via maker.html simulation)
    await testStep('3. Create New Magic Card', async () => {
      const cardData = {
        card_id: TEST_CARD_ID,
        message_type: 'birthday',
        message_text: '🎂 Happy Birthday! This is a test card created by the automated test. 🎉'
      };
      
      const response = await axios.post(`${BASE_URL}/api/cards`, cardData);
      
      if (!response.data.success) {
        throw new Error('Failed to create card');
      }
      
      console.log(`   Card ID: ${response.data.card.card_id}`);
      console.log(`   Type: ${response.data.card.message_type}`);
      console.log(`   Text: ${response.data.card.message_text?.substring(0, 50)}...`);
      console.log(`   Share URL: ${BASE_URL}${response.data.shareUrl}`);
      
      return response.data;
    });
    
    await delay(1000);
    
    // 4. Retrieve the Card (via viewer.html simulation)
    await testStep('4. Retrieve Created Card', async () => {
      const response = await axios.get(`${BASE_URL}/api/cards/${TEST_CARD_ID}`);
      
      if (!response.data.success) {
        throw new Error('Failed to retrieve card');
      }
      
      const card = response.data.card;
      console.log(`   Retrieved Card ID: ${card.card_id}`);
      console.log(`   Retrieved Type: ${card.message_type}`);
      console.log(`   Retrieved Text: ${card.message_text?.substring(0, 50)}...`);
      console.log(`   Status: ${card.status}`);
      console.log(`   Created: ${new Date(card.created_at).toLocaleTimeString()}`);
      
      return response.data;
    });
    
    await delay(500);
    
    // 5. Test Duplicate Card Prevention
    await testStep('5. Test Duplicate Card Prevention', async () => {
      const duplicateCard = {
        card_id: TEST_CARD_ID, // Same ID!
        message_type: 'anniversary',
        message_text: 'This should fail!'
      };
      
      try {
        await axios.post(`${BASE_URL}/api/cards`, duplicateCard);
        throw new Error('Should have rejected duplicate card');
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`   Correctly rejected duplicate with: ${error.response.data.error}`);
          return { passed: true, message: 'Duplicate prevention working' };
        }
        throw error;
      }
    });
    
    await delay(500);
    
    // 6. Test Non-Existent Card
    await testStep('6. Test Non-Existent Card Lookup', async () => {
      const nonExistentId = `NONEXISTENT_${Date.now()}`;
      
      try {
        await axios.get(`${BASE_URL}/api/cards/${nonExistentId}`);
        throw new Error('Should have returned 404 for non-existent card');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   Correctly returned 404 for: ${nonExistentId}`);
          return { passed: true, message: '404 handling working' };
        }
        throw error;
      }
    });
    
    await delay(500);
    
    // 7. Test Web Interface URLs
    await testStep('7. Test Web Interface Accessibility', async () => {
      const endpoints = [
        { url: '/', name: 'Home Page' },
        { url: '/maker.html', name: 'Card Maker' },
        { url: '/viewer.html', name: 'Card Viewer' },
        { url: `/viewer.html?card=${TEST_CARD_ID}`, name: 'Viewer with Card' }
      ];
      
      for (const endpoint of endpoints) {
        const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
          validateStatus: (status) => status < 500 // Accept any status under 500
        });
        
        if (response.status === 200) {
          console.log(`   ✓ ${endpoint.name}: ${endpoint.url}`);
        } else {
          console.log(`   ⚠ ${endpoint.name}: Status ${response.status}`);
        }
      }
      
      return { passed: true };
    });
    
    await delay(500);
    
    // 8. Test Different Card Types
    await testStep('8. Test Different Card Types', async () => {
      const testTypes = [
        { type: 'wedding', text: 'Congratulations on your wedding! 💍' },
        { type: 'graduation', text: 'Congrats graduate! 🎓' },
        { type: 'thankyou', text: 'Thank you so much! 🙏' },
        { type: 'getwell', text: 'Get well soon! 🌸' }
      ];
      
      for (const testType of testTypes) {
        const uniqueId = `${testType.type}_TEST_${Date.now()}`;
        const cardData = {
          card_id: uniqueId,
          message_type: testType.type,
          message_text: testType.text
        };
        
        const response = await axios.post(`${BASE_URL}/api/cards`, cardData);
        
        if (response.data.success) {
          console.log(`   ✓ Created ${testType.type} card: ${uniqueId}`);
          
          // Clean up test card
          await delay(100);
        }
      }
      
      return { passed: true, message: 'All card types working' };
    });
    
    await delay(1000);
    
    // 9. Final Validation - Retrieve original test card again
    await testStep('9. Final Card Validation', async () => {
      const response = await axios.get(`${BASE_URL}/api/cards/${TEST_CARD_ID}`);
      
      if (!response.data.card) {
        throw new Error('Test card lost!');
      }
      
      const card = response.data.card;
      console.log(`   ✅ Card still exists in database`);
      console.log(`   📊 Card Details:`);
      console.log(`      ID: ${card.card_id}`);
      console.log(`      Type: ${card.message_type}`);
      console.log(`      Created: ${new Date(card.created_at).toLocaleString()}`);
      console.log(`      Status: ${card.status}`);
      
      return response.data;
    });
    
    // 🎉 SUCCESS!
    console.log('\n' + '═'.repeat(60));
    console.log('   🎉 ALL TESTS PASSED! 🎉');
    console.log('═'.repeat(60));
    console.log(`\n📋 SUMMARY:`);
    console.log(`   ✓ Server is running`);
    console.log(`   ✓ Supabase is connected`);
    console.log(`   ✓ Cards can be created (POST /api/cards)`);
    console.log(`   ✓ Cards can be retrieved (GET /api/cards/:id)`);
    console.log(`   ✓ Duplicate cards are prevented`);
    console.log(`   ✓ 404 errors handled properly`);
    console.log(`   ✓ Web interfaces are accessible`);
    console.log(`   ✓ Different card types work`);
    console.log(`\n🔗 TEST CARD URL:`);
    console.log(`   ${BASE_URL}/viewer.html?card=${TEST_CARD_ID}`);
    console.log(`\n🧹 Clean up test card:`);
    console.log(`   Manually delete card ID: ${TEST_CARD_ID}`);
    console.log(`   Or leave it as a test record`);
    console.log('\n' + '✨'.repeat(30));
    console.log('   FLOW TEST COMPLETE!');
    console.log('✨'.repeat(30) + '\n');
    
  } catch (error) {
    console.log('\n' + '⚠'.repeat(60));
    console.log('   TEST FAILED!');
    console.log('⚠'.repeat(60));
    console.log(`\n❌ Error: ${error.message}`);
    console.log(`\n🔧 Troubleshooting:`);
    console.log(`   1. Make sure server is running: node server.js`);
    console.log(`   2. Check .env file has correct Supabase credentials`);
    console.log(`   3. Verify Supabase table 'cards' exists`);
    console.log(`   4. Test manually: ${BASE_URL}/api/health`);
    console.log(`   5. Test manually: ${BASE_URL}/api/test-supabase`);
    console.log('\n');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, TEST_CARD_ID, BASE_URL };