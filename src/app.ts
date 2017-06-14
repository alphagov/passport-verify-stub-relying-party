import * as express from 'express'

const app: express.Application = express()

app.get('/hello-world', function (req, res) {
  res.send('Hello World!')
})

export default app
