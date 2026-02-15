import { 
  Client, 
  GatewayIntentBits, 
  Events, 
  REST, 
  Routes 
} from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { createTicket } from './ticketManager';
import { handlePaymentButton } from './paymentHandler';

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  'BOT_TOKEN',
  'GUILD_ID',
  'OWNER_ROLE_ID',
  'TICKET_CATEGORY_ID',
  'BOT_API_SECRET',
  'BOT_API_PORT'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

// Create Express server for API
const app = express();
app.use(express.json());

// Middleware to verify API secret
const verifyApiSecret = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== process.env.BOT_API_SECRET) {
    return res.status(403).json({ error: 'Invalid API secret' });
  }
  
  next();
};

// API endpoint to create ticket
app.post('/create-ticket', verifyApiSecret, async (req, res) => {
  try {
    const { orderId, ticketNumber, userId, username, items, totalPrice } = req.body;
    
    if (!orderId || !ticketNumber || !userId || !items || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticketData = await createTicket(client, {
      orderId,
      ticketNumber,
      userId,
      username,
      items,
      totalPrice,
    });

    res.json({
      success: true,
      ticketId: ticketData.ticketId,
      channelId: ticketData.channelId,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    botReady: client.isReady(),
    uptime: process.uptime()
  });
});

// Discord bot events
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Discord bot ready! Logged in as ${c.user.tag}`);
  console.log(`🌐 API server running on port ${process.env.BOT_API_PORT}`);
});

// Handle button interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  if (customId.startsWith('payment_')) {
    await handlePaymentButton(interaction);
  }
});

// Handle errors
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Start bot and API server
async function start() {
  try {
    await client.login(process.env.BOT_TOKEN);
    
    const port = parseInt(process.env.BOT_API_PORT || '3001');
    app.listen(port, () => {
      console.log(`🚀 Bot API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

start();

export { client };