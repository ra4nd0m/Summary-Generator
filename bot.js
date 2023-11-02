const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const makeSummary = require('./app');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });


// Function to send images
async function sendImages(chatId, mediaFiles) {
  const media = mediaFiles.map((file) => ({
    type: 'photo',
    media: file,
  }));
  try {
    const result = bot.sendMediaGroup(chatId, media);
    console.log('Media sent!', result);
  } catch (err) { console.error('Error sending the media!', err); }
}

async function getMedia() {
  const currentDate = new Date().toLocaleDateString('ru-RU');
  const directoryPath = './reports';
  const chatId = process.env.CHAT_ID;
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading the dir: ', err);
      return;
    }

    const filteredFiles = files.filter((file) => file.includes(currentDate));
    const mediaFiles = filteredFiles.map((file) => path.join(directoryPath, file));
    sendImages(chatId, mediaFiles);
  });
}

// Schedule the task
cron.schedule('0 9 * * 1-5', async () => {
  let result = await makeSummary();
  if (!result) {
    console.log('Error generating reports!');
  } else {
    await getMedia();
  }
});
