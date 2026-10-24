import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const US_PROXY_URL = process.env.US_PROXY_URL || ''; 
const proxyAgent = US_PROXY_URL ? new HttpsProxyAgent(US_PROXY_URL) : null;

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date(), 
        proxyStatus: proxyAgent ? 'US Proxy Active' : 'Direct Connection' 
    });
});

app.post('/api/accounts/create', async (req, res) => {
    try {
        const { email, username, payload } = req.body;

        if (!email || !username) {
            return res.status(400).json({ error: 'Email and username are required' });
        }

        console.log(`[New Start] Processing account for ${email} via US Proxy...`);

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': process.env.N8N_API_KEY || ''
            },
            body: JSON.stringify({ email, username, payload, region: 'US' })
        };

        if (proxyAgent) {
            fetchOptions.agent = proxyAgent;
        }

        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            const n8nResponse = await fetch(n8nWebhookUrl, fetchOptions);
            if (!n8nResponse.ok) {
                throw new Error(`n8n webhook failed with status ${n8nResponse.status}`);
            }
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (botToken && chatId) {
            const message = `🚀 <b>New Account Processing (Fresh Start)</b>\n👤 Username: ${username}\n📧 Email: ${email}\n📍 US Proxy: Enabled`;
            
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Account successfully processed with US routing.',
            data: { email, username }
        });

    } catch (error) {
        console.error('Error in account creation:', error);
        
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const errorChatId = process.env.TELEGRAM_ERROR_ALERT_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
        if (botToken && errorChatId) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: errorChatId,
                    text: `❌ <b>Deployment/Execution Error</b>\n${error.message}`,
                    parse_mode: 'HTML'
                })
            }).catch(err => console.error('Telegram alert failed:', err));
        }

        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Fresh Server is running smoothly on port ${PORT}`);
});