import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/accounts/create', (req, res) => {
    try {
        const body = req.body || {};
        const email = body.email || "testuser@gmail.com";
        const username = body.username || "abir123";
        const orgCode = body.orgCode || body.org_code || body.code || "12345";

        return res.status(200).json({
            success: true,
            message: "Account successfully processed with US routing.",
            data: {
                email: email,
                username: username,
                orgCode: orgCode
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send("Server is Live!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
