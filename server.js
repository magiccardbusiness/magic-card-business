const express = require('express');
const app = express();
const PORT = 3000;

// Serve files from the 'public' folder
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`🎉 Magic server running! Open this in your phone:`);
    console.log(`📱 http://localhost:${PORT}`);
    console.log(`(You'll need ngrok to show it to your phone)`);
});