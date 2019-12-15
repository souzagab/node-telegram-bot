const ax = require('axios')
const TelegramBot = require('node-telegram-bot-api')
const parser = require('./src/parser.js')
const express = require('express')
const bodyParser = require('body-parser');

require('dotenv').config()

const token = process.env.TELEGRAM_TOKEN
let bot

if (process.env.NODE_ENV === 'production') {
  bot = new TelegramBot(token)
  bot.setWebHook(process.env.HEROKU_URL + bot.token)
} else {
  bot = new TelegramBot(token, { polling: true })
}

bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const word = match[1]
  ax.get(`${process.env.OXFORD_API_URL}/entries/en-us/${word}`, {
    params: {
      fields: 'definitions',
      strictMatch: 'false'
    },
    headers: {
      app_id: process.env.OXFORD_APP_ID,
      app_key: process.env.OXFORD_APP_KEY
    }
  })
    .then(response => {
      const parsedHtml = parser(response.data)
      bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' })
    })
    .catch(error => {
      const errorText = error.response.status === 404 ? `No definition found for: <b>${word}</b>` : `<b>Error occured, please try again later</b>`
      bot.sendMessage(chatId, errorText, { parse_mode: 'HTML' })
    })
})

const app = express()

app.use(bodyParser.json())
app.listen(process.env.PORT)
app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})