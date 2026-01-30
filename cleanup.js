// cleanup.js - Clean test cards from database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function cleanupTestCards() {
  console.log('🧹 CLEANUP SCRIPT');
  console.log('═'.repeat(50) + '\n');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  console.log('🔍 Finding test cards...');
  
  // Find all cards with TEST in the ID
  const { data: testCards, error: findError } = await supabase
    .from('cards')
    .select('card_id, message_type, created_at')
    .like('card_id', '%TEST%');
  
  if (findError) {
    console.log('❌ Error finding cards:', findError.message);
    return;
  }
  
  if (!testCards || testCards.length === 0) {
    console.log('✅ No test cards found to delete');
  } else {
    console.log(`📊 Found ${testCards.length} test cards:`);
    testCards.forEach(card => {
      console.log(`   • ${card.card_id} - ${card.message_type}`);
    });
    
    console.log('\n🗑️  Deleting test cards...');
    
    // Delete all test cards
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .like('card_id', '%TEST%');
    
    if (deleteError) {
      console.log('❌ Error deleting cards:', deleteError.message);
    } else {
      console.log(`✅ Successfully deleted ${testCards.length} test cards`);
    }
  }
  
  console.log('\n📋 Current database status:');
  
  // Show remaining cards
  const { data: remainingCards } = await supabase
    .from('cards')
    .select('card_id, message_type, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (remainingCards && remainingCards.length > 0) {
    console.log(`📊 Total cards in database: ${remainingCards.length}`);
    console.log('\nRecent cards:');
    remainingCards.forEach(card => {
      const date = new Date(card.created_at).toLocaleDateString();
      console.log(`   • ${card.card_id} - ${card.message_type} (${date})`);
    });
  } else {
    console.log('📭 Database is empty');
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('🧹 Cleanup complete!');
}

cleanupTestCards();