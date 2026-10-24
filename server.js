const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON payloads
app.use(express.json());

// API Endpoint for Account Creation
app.post('/api/accounts/create', (req, res) => {
    const { email, username, orgCode } = req.body;

    // Receive orgCode from request or generate fallback
    const finalOrgCode = orgCode || req.body.org_code || req.body.code || "12345";

    // Send full JSON response including orgCode
    return res.status(200).json({
        success: true,
        message: "Account successfully processed with US routing.",
        data: {
            email: email || "testuser@gmail.com",
            username: username || "abir123",
            orgCode: finalOrgCode
        }
    });
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send("Muse.ai API Backend is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
