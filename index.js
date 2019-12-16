require('dotenv').config()

let bot = require('./src/bot')
require('./src/web')(bot)