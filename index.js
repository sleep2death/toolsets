import express from "express"

const app = express()
const port = 3000

// use pug.js as template engine
app.set('view engine', 'pug')

// handlers
app.get('/', (_, res) => {
  res.render('index', { title: 'key', message: 'Hello there!' })
})

app.listen(port, () => {
  console.log(`template app listening on port ${port}`)
})
