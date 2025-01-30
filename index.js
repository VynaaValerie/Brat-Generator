const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const cfonts = require('cfonts');
const config = require('./settings/vynaa.js');
const fs = require('fs');

// Function to format the date and time
function formatDate(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Function to load plugins recursively
const loadPlugins = (bot, dir) => {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // If it's a folder, load recursively
        loadPlugins(bot, fullPath);
      } else if (file.endsWith('.js')) {
        const plugin = require(fullPath);
        if (typeof plugin === 'function') {
          plugin(bot, config);  // Load plugin function
        }
      }
    });
  } catch (err) {
    console.error('Gagal membaca folder plugins:', err);
  }
};

// Main function
(async () => {
  const chalk = (await import('chalk')).default;

  const app = express();
  const bot = new TelegramBot(config.token, { polling: true });

  // Display bot startup info
  cfonts.say('Vynaa\nAI', {
    font: 'block',
    align: 'center',
    colors: ['white']
  });
  cfonts.say('Simple Bot By @VynaChan', { 
    font: 'console',
    align: 'center',
    colors: ['green']
  });

  // Load all plugins (including subfolders)
  loadPlugins(bot, path.join(__dirname, 'plugins'));

  // Handle incoming messages
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    const date = new Date();

    console.log(chalk.blue.bold('----> Chat ID:'));
    console.log(chalk.green(`        ${chatId}`));
    console.log(chalk.blue.bold('----> Message:'));
    console.log(chalk.green(`        ${message}`));
    console.log(chalk.blue.bold('----> Date:'));
    console.log(chalk.green(`        ${formatDate(date)}`));
  });

  // Send message to owner when bot is active
  bot.sendMessage(config.ownerID, 'Bot telah aktif!');

  // Serve zayn.html as the main preview
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/zayn.html'));
  });

  // Start express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Handle polling errors
  bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
  });
})();