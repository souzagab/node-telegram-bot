const express = require('express')
const { json } = require('body-parser')

const app = express()

app.use(json())
app.listen(process.env.PORT)


module.exports = bot => {
  app.post('/' + bot.token, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
  })
}