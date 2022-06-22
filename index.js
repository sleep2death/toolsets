import express from "express"

const app = express()
const port = 3000

// use pug.js as template engine
app.set('view engine', 'pug')
app.set("views", "./views");

// handlers
app.get('/', (_, res) => {
  res.render('index', { title: 'Hey', message: 'Hello, there' })
})

app.listen(port, () => {
  console.log(`template app listening on port ${port}`)
})
