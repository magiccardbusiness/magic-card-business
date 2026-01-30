// 🎪 Magic Card Business Server - NGrok READY
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔧 YOUR NGrok Configuration
const YOUR_NGROK_URL = 'https://papir.ca';

// Function to get correct base URL
function getBaseUrl(req) {
  const host = req.get('host') || '';
  const protocol = req.protocol;
  
  // Check if request is from your ngrok URL
  if (host.includes('sharyl-nontheosophical-religiously.ngrok-free.dev')) {
    return YOUR_NGROK_URL; // Always use your ngrok URL
  }
  
  // Check if request is from any ngrok
  if (host.includes('ngrok-free.dev') || host.includes('ngrok-free.app') || host.includes('ngrok-free.com')) {
    return `${protocol}s://${host}`; // ngrok always uses https
  }
  
  // Local development
  return `${protocol}://${host}`;
}

// 🔒 CSP - Allow your specific ngrok domain
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "'unsafe-inline'",
        "'unsafe-eval'"
      ],
      styleSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "'unsafe-inline'"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://api.qrserver.com"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:3000",
        "https://sharyl-nontheosophical-religiously.ngrok-free.dev", // YOUR ngrok
        "https://*.ngrok-free.app",
        "https://*.ngrok-free.dev",
        "https://*.ngrok-free.com",
        "https://elmhkhvryjzljxskbfps.supabase.co",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://api.qrserver.com"
      ],
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "data:"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// 🌐 CORS - Allow everything for testing
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🛡️ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// 📁 Serve static files
app.use(express.static('public'));

// 🏠 Welcome page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 🩺 Enhanced Health Check
app.get('/api/health', (req, res) => {
  const baseUrl = getBaseUrl(req);
  
  res.json({
    status: '✅ FULLY OPERATIONAL',
    message: 'Magic Card Business Server',
    time: new Date().toISOString(),
    version: '2.1.0',
    server: {
      url: baseUrl,
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      ngrok: baseUrl.includes('ngrok') ? '✅ Connected' : '❌ Local only'
    },
    yourNgrok: YOUR_NGROK_URL,
    features: {
      supabase: supabaseAdmin ? '✅ Connected' : '❌ Disconnected',
      qrCodes: '✅ Enabled',
      phoneScanning: baseUrl.includes('ngrok') ? '✅ Ready' : '❌ Need ngrok'
    },
    endpoints: {
      maker: `${baseUrl}/maker.html`,
      viewer: `${baseUrl}/viewer.html`,
      ngrokInfo: `${baseUrl}/api/ngrok-info`
    }
  });
});

// 🎪 Supabase Connection
let supabaseAdmin;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
  } else {
    supabaseAdmin = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log('✅ Connected to Supabase!');
  }
} catch (error) {
  console.error('❌ Supabase connection error:', error.message);
}

// 🎨 Save a Magic Card - Uses YOUR ngrok URL
app.post('/api/cards', async (req, res) => {
  try {
    const { card_id, message_type, message_text } = req.body;
    
    console.log(`📨 Saving card: ${card_id}, Type: ${message_type}`);
    
    // Validation
    if (!card_id || !message_type) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['card_id', 'message_type']
      });
    }
    
    if (!supabaseAdmin) {
      return res.status(503).json({ 
        success: false,
        error: 'Database service temporarily unavailable'
      });
    }
    
    // Save to database
    const { data, error } = await supabaseAdmin
      .from('cards')
      .insert([{
        card_id: card_id.trim(),
        message_type: message_type.trim(),
        message_text: message_text ? message_text.trim() : null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database error:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({ 
          success: false,
          error: 'Duplicate card ID',
          message: `Card "${card_id}" already exists. Please use a different ID.`
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Database operation failed',
        details: error.message
      });
    }
    
    console.log(`✅ Card saved: ${card_id}`);
    
    // 🚀 ALWAYS use your ngrok URL for QR codes (phone scanning)
    const baseUrl = getBaseUrl(req);
    const viewerUrl = `${YOUR_NGROK_URL}/viewer.html?card=${card_id}`; // ALWAYS use your ngrok URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(viewerUrl)}&format=png&margin=10`;
    
    res.status(201).json({ 
      success: true, 
      message: 'Card saved successfully!',
      card: data,
      urls: {
        share: `/viewer.html?card=${card_id}`,
        viewer: viewerUrl, // Your ngrok URL
        viewerLocal: `http://localhost:3000/viewer.html?card=${card_id}`, // For local testing
        qrCode: qrCodeUrl,
        maker: `${YOUR_NGROK_URL}/maker.html`
      },
      instructions: {
        phone: 'Scan QR code with phone camera - will work anywhere!',
        local: 'Use viewerLocal URL for testing on this computer',
        share: 'Share the viewer URL with anyone'
      },
      note: 'QR codes always use your ngrok URL for phone scanning'
    });
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Please try again later'
    });
  }
});

// 📖 Get Card by ID
app.get('/api/cards/:card_id', async (req, res) => {
  try {
    const { card_id } = req.params;
    
    console.log(`🔍 Retrieving card: ${card_id}`);
    
    if (!supabaseAdmin) {
      return res.status(503).json({ 
        success: false,
        error: 'Database service temporarily unavailable'
      });
    }
    
    const { data, error } = await supabaseAdmin
      .from('cards')
      .select('*')
      .eq('card_id', card_id)
      .eq('status', 'active')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'Card not found',
          message: `No card found with ID: ${card_id}`
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Database query failed',
        details: error.message
      });
    }
    
    if (!data) {
      return res.status(404).json({ 
        success: false,
        error: 'Card not found'
      });
    }
    
    res.json({ 
      success: true, 
      card: data,
      // Always include your ngrok URL for client-side use
      ngrokUrl: `${YOUR_NGROK_URL}/viewer.html?card=${card_id}`
    });
    
  } catch (error) {
    console.error('💥 Error retrieving card:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
});

// 📊 Supabase Test
app.get('/api/test-supabase', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.json({
        status: '❌ DISCONNECTED',
        message: 'Supabase not connected'
      });
    }
    
    const { data, error, count } = await supabaseAdmin
      .from('cards')
      .select('card_id, message_type', { count: 'exact' });
    
    if (error) throw error;
    
    res.json({
      status: '✅ CONNECTED',
      message: 'Supabase is working!',
      stats: {
        totalCards: count || 0
      },
      sampleCards: data.slice(0, 5)
    });
    
  } catch (error) {
    res.status(500).json({
      status: '❌ ERROR',
      message: 'Supabase test failed',
      error: error.message
    });
  }
});

// 🛠️ NGrok Info Endpoint
app.get('/api/ngrok-info', (req, res) => {
  const baseUrl = getBaseUrl(req);
  
  res.json({
    yourNgrokUrl: YOUR_NGROK_URL,
    currentRequestUrl: baseUrl,
    isUsingYourNgrok: baseUrl === YOUR_NGROK_URL,
    phoneReady: true,
    qrCodeExample: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${YOUR_NGROK_URL}/viewer.html?card=SAMPLE123`)}`,
    testLinks: {
      maker: `${YOUR_NGROK_URL}/maker.html`,
      viewer: `${YOUR_NGROK_URL}/viewer.html?card=DEMO123`,
      health: `${YOUR_NGROK_URL}/api/health`
    }
  });
});

// 🚫 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    yourNgrokUrl: YOUR_NGROK_URL
  });
});

// 🚀 Launch Server
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(70));
  console.log('   🎪✨ MAGIC CARD BUSINESS - YOUR NGrok READY ✨🎪');
  console.log('═'.repeat(70) + '\n');
  
  console.log('📍 YOUR NGrok URL:');
  console.log(`   ${YOUR_NGROK_URL}\n`);
  
  console.log('📊 SERVER INFO:');
  console.log(`   Port: ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  
  console.log('🔗 PHONE TESTING URLs:');
  console.log(`   Maker: ${YOUR_NGROK_URL}/maker.html`);
  console.log(`   Viewer: ${YOUR_NGROK_URL}/viewer.html`);
  console.log(`   Health: ${YOUR_NGROK_URL}/api/health\n`);
  
  console.log('📱 PHONE TESTING STEPS:');
  console.log('   1. Open on phone: ' + YOUR_NGROK_URL + '/maker.html');
  console.log('   2. Create a card');
  console.log('   3. Scan the QR code with phone camera');
  console.log('   4. It will open: ' + YOUR_NGROK_URL + '/viewer.html?card=YOUR_CARD_ID\n');
  
  console.log('🎯 KEY FEATURES:');
  console.log('   ✓ QR codes ALWAYS use your ngrok URL: ' + YOUR_NGROK_URL);
  console.log('   ✓ Phone scanning works anywhere');
  console.log('   ✓ Cards saved to Supabase database');
  console.log('   ✓ Automatic QR code generation\n');
  
  console.log('─'.repeat(70));
  console.log('   📱 PHONE SCANNING READY! 🚀');
  console.log('─'.repeat(70) + '\n');
});