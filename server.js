// vulnerable-website/server.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(cookieParser()); // Needs to be early to parse cookies for all routes

// VULNERABLE CORS MIDDLEWARE
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// SPECIFIC ROUTE FOR THE MAIN PAGE: Sets cookie and sends index.html
// This should come BEFORE the general static middleware if you want it to handle '/'
app.get('/', (req, res) => {
    console.log("GET / route hit: Setting cookie and serving index.html"); // For debugging
    // Set a dummy session cookie for demonstration
    res.cookie('session_id', 'dummy_user_session_12345', {
        httpOnly: true,
        secure: false, // In production, use true if HTTPS
        sameSite: 'Lax'
    });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// STATIC MIDDLEWARE: Serves other assets like CSS, client-side JS
// Now it won't intercept GET / because the route above already handled it.
app.use(express.static(path.join(__dirname, 'public')));


// API endpoint that returns "sensitive" data
app.get('/api/secret-data', (req, res) => {
    console.log(`Request to /api/secret-data from Origin: ${req.headers.origin}`);
    console.log('Cookies received by API:', req.cookies); // For debugging

    if (req.cookies && req.cookies.session_id === 'dummy_user_session_12345') {
        res.json({
            message: "This is highly sensitive data!",
            user: "VulnerableUser",
            email: "user@vulnerable-site.com",
            secretKey: "S3CR3T_K3Y_F0R_USER_FROM_API_XYZ"
        });
    } else {
        res.status(401).json({ error: "Unauthorized: No valid session cookie." });
    }
});

app.listen(port, () => {
    console.log(`Vulnerable website server running at http://localhost:${port}`);
    console.log("CORS POLICY IS VULNERABLE: Access-Control-Allow-Origin reflects the request's Origin header and Access-Control-Allow-Credentials is true.");
});