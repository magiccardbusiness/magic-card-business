// create-samples.js - Create demonstration cards
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const sampleCards = [
  {
    card_id: 'WELCOME001',
    message_type: 'welcome',
    message_text: '🌟 Welcome to our community! We\'re thrilled to have you here. This is your first magic card - scan it anytime to relive this welcome moment!'
  },
  {
    card_id: 'BDAY-JOHN-2025',
    message_type: 'birthday',
    message_text: '🎂 Happy Birthday John! 🎉 Wishing you a day filled with joy, laughter, and all your favorite things. May this year bring you endless happiness and success!'
  },
  {
    card_id: 'THANKS-CUSTOMER',
    message_type: 'thankyou',
    message_text: '🙏 Thank you for being an amazing customer! Your support means the world to us. Here\'s a special thank you card you can keep forever.'
  },
  {
    card_id: 'ANNIV-25',
    message_type: 'anniversary',
    message_text: '💖 Happy 25th Anniversary! 25 years of love, laughter, and beautiful memories. Here\'s to many more years of happiness together!'
  },
  {
    card_id: 'CONGRATS-GRAD',
    message_type: 'graduation',
    message_text: '🎓 Congratulations Graduate! Your hard work and dedication have paid off. The future is bright - go conquer the world!'
  },
  {
    card_id: 'GETWELL-SOON',
    message_type: 'getwell',
    message_text: '🌸 Get Well Soon! Sending healing thoughts and positive energy your way. Take all the time you need to recover - we\'re here for you!'
  },
  {
    card_id: 'CONGRATS-PROMO',
    message_type: 'congratulations',
    message_text: '🏆 Congratulations on your promotion! Your hard work and dedication have truly paid off. This is just the beginning of amazing things to come!'
  },
  {
    card_id: 'NEWBABY-WELCOME',
    message_type: 'newbaby',
    message_text: '👶 Welcome to the world, little one! May your life be filled with love, laughter, and endless adventures. Congratulations to the happy parents!'
  }
];

async function createSamples() {
  console.log('🎨 SAMPLE CARD CREATOR');
  console.log('═'.repeat(50) + '\n');
  
  console.log(`🌐 Server: ${BASE_URL}`);
  console.log(`📦 Creating ${sampleCards.length} sample cards...\n`);
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const card of sampleCards) {
    try {
      const response = await axios.post(`${BASE_URL}/api/cards`, card);
      
      if (response.data.success) {
        created++;
        console.log(`✅ Created: ${card.card_id}`);
        console.log(`   Type: ${card.message_type}`);
        console.log(`   URL: ${response.data.viewerUrl}`);
        console.log(`   QR: ${response.data.qrCodeUrl}\n`);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        skipped++;
        console.log(`⚠️  Already exists: ${card.card_id}\n`);
      } else {
        failed++;
        console.log(`❌ Failed: ${card.card_id} - ${error.message}\n`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('📊 SUMMARY:');
  console.log(`   ✅ Created: ${created} new cards`);
  console.log(`   ⚠️  Skipped: ${skipped} existing cards`);
  console.log(`   ❌ Failed: ${failed} cards\n`);
  
  console.log('🔗 DEMO URLs:');
  sampleCards.forEach(card => {
    console.log(`   • http://localhost:3000/viewer.html?card=${card.card_id}`);
  });
  
  console.log('\n' + '═'.repeat(50));
  console.log('🎪 Sample cards ready for demonstration!');
  console.log('\n💡 Tip: Share these URLs with potential customers');
  console.log('💡 Tip: Use maker.html to create your own cards');
}

createSamples();