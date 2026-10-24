import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to generate dynamic 2FA Authenticator Secret Key
function generate2FAKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Muse.ai Backend Server Running' });
});

// Account Creation & 2FA Extraction Endpoint
app.post('/api/accounts/create', async (req, res) => {
  try {
    const { email, username, orgCode } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const generatedUsername = username || email.split('@')[0] + Math.floor(100 + Math.random() * 900);
    const generatedOrgCode = orgCode || 'ORG_' + Math.floor(10000 + Math.random() * 90000);
    const twoFactorKey = generate2FAKey();

    // Simulated automated account & Meta profile 2FA setup response
    const accountData = {
      success: true,
      message: 'Account created and 2FA configured successfully',
      data: {
        email: email,
        username: generatedUsername,
        orgCode: generatedOrgCode,
        age_verified: true,
        birth_date: '2000-05-15',
        twoFactorKey: twoFactorKey,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    };

    return res.status(200).json(accountData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
