'use strict'

const express = require('express')
const connectRedis = require('connect-redis')
const session = require('express-session')

const RedisStore = connectRedis(session)

const PORT = 8090
const app = express()

app.use(session({
  secret: 'a_secret',
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: 5000
  },
  store: new RedisStore({
    host: '127.0.0.1',
    prefix: 'session_bug',
    logErrors: true
  })
}))

app.use((req, res, next) => {
  const path = req.path

  const sessionExpireOld = req.session.cookie.expires
  res.on('finish', () => {
    const resCookie = res.get('set-cookie')
    console.log({ path, sessionExpireOld, resCookie })
  })
  next()
})

app.get('/', (req, res) => {
  const now = new Date()
  console.log(now)
  req.session.date = { time: now.valueOf() }
  req.session.save((err) => {
    if (err) {
      console.error(err)
      res.status(500).send(err)
    } else {
      res.send('OK')
    }
  })
})


app.listen(PORT, () => {
  console.log('server started')
})
