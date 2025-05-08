require('dotenv').config()
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const app = express();


const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });


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
          ['📄 Help', 'ℹ️ About']
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  });
  

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'hi Welcome help center of this telegram bot');
  });

  bot.onText(/\/about/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Wellcome this is multi purpose a telegrambot ', { reply_markup: {
        keyboard: [
          ['📥 Get National ID'], 
          ['📄 Help', 'ℹ️ About']
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  });





// Command to trigger file download
bot.onText(/\/getid/, async (msg) => {
  const chatId = msg.chat.id;

  const fileUrl = 'https://pdfobject.com/pdf/sample.pdf'; // Replace with your API
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
        fs.unlinkSync(filePath); // Clean up after sending
      });
    });

    writer.on('error', () => {
      bot.sendMessage(chatId, 'Failed to write file.');
    });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Failed to download file .');
  }
});



// Command to fetch user info
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
      bot.sendMessage(chatId, ' Failed to fetch user data.');
    }
  });

  bot.onText(/\/offlineuserinfo/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const user = {
            name: 'John',
            email: 'usser@example.com',
            address: 'Addis Ababa, Ethiopia',
            phone: '+1251-555-1234'
          };

    const message = `
👤 *Name:* ${user.name}
    *Email:* ${user.email}
    *Address:* ${user.address}
    *Phone:* ${user.phone}
    `;

   bot.sendMessage(chatId, message);
    } catch (error) {
      console.error(error.message);
      bot.sendMessage(chatId, ' Failed to fetch user data.');
    }
  });


 const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server listening on port ${PORT}`);
});