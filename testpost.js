const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const makeSummary = require('./app');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function sendImages(chatId, mediaFiles) {
    console.log(mediaFiles);
    const media = mediaFiles.map((file) => ({
        type: 'photo',
        media: file,
    }));
    try {
        const result = bot.sendMediaGroup(chatId, media);
        console.log('Media sent!', result);
    } catch (err) { console.error('Error sending the media!', err); }
}
async function doStuff() {
    const currentDate = new Date().toLocaleDateString('ru-RU');
    const directoryPath = './reports';
    const chatId = process.env.CHAT_ID;
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the dir: ', err);
            return;
        }

        const filteredFiles = files.filter((file) => file.includes(currentDate));
        console.log(filteredFiles);
        const mediaFiles = filteredFiles.map((file) => path.join(directoryPath, file));
        sendImages(chatId, mediaFiles);
    });
}

(async () => {
    let result = await makeSummary();
    if (!result) {
        console.log('Error generating reports!');
    } else {
        doStuff();
    }
})();