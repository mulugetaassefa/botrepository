require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.BOT_TOKEN;
const baseUrl = process.env.BASE_URL;

if (!botToken || !baseUrl) {
  throw new Error('BOT_TOKEN or BASE_URL is missing in .env');
}

const bot = new TelegramBot(botToken);
bot.setWebHook(`${baseUrl}/bot${botToken}`);

app.use(express.json());

// Webhook route
app.post(`/bot${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot Commands
bot.setMyCommands([
  { command: 'start', description: 'Start the bot and see menu' },
  { command: 'getid', description: 'Download your National ID file' },
  { command: 'help', description: 'How to use this bot' },
  { command: 'about', description: 'About this bot' },
]);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! Please choose an option:', {
    reply_markup: {
      keyboard: [
        ['📥 Get National ID'],
        ['📄 Help', 'ℹ️ About'],
      ],
      resize_keyboard: true,
    },
  });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hi! This is the help center of the bot.');
});

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'This is a multi-purpose Telegram bot.', {
    reply_markup: {
      keyboard: [
        ['📥 Get National ID'],
        ['📄 Help', 'ℹ️ About'],
      ],
      resize_keyboard: true,
    },
  });
});

bot.onText(/\/getid/, async (msg) => {
  const chatId = msg.chat.id;
  const fileUrl = 'https://pdfobject.com/pdf/sample.pdf'; // Replace with real API
  const filePath = path.resolve(__dirname, 'sample.pdf');

  bot.sendMessage(chatId, 'Downloading file...');

  try {
    const response = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      bot.sendDocument(chatId, filePath).then(() => {
        fs.unlinkSync(filePath);
      });
    });

    writer.on('error', () => {
      bot.sendMessage(chatId, 'Failed to write file.');
    });
  } catch (error) {
    console.error(error.message);
    bot.sendMessage(chatId, 'Failed to download file.');
  }
});

bot.onText(/\/userinfo/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users/2');
    const user = response.data;

    const message = `
Name: ${user.name}
Email: ${user.email}
Address: ${user.address.city}, ${user.address.street}
Phone: ${user.phone}
`;
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(error.message);
    bot.sendMessage(chatId, 'Failed to fetch user data.');
  }
});

bot.onText(/\/offlineuserinfo/, async (msg) => {
  const chatId = msg.chat.id;
  const user = {
    name: 'John',
    email: 'user@example.com',
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-555-1234',
  };

  const message = `
👤 *Name:* ${user.name}
*Email:* ${user.email}
*Address:* ${user.address}
*Phone:* ${user.phone}
`;

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Start Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
