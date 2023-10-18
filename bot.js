const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const makeSummary = require('./app');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });


// Function to send images
function sendImages() {
  const directoryPath = `./reports`;
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach(function (file) {
      bot.sendPhoto(process.env.CHAT_ID, path.join(directoryPath, file));
    });
  });
}

// Schedule the task
cron.schedule('0 9 * * 1-5',async () => {
  await makeSummary();
  sendImages();
});
