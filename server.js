const express = require('express')
const history = require('connect-history-api-fallback')
const path = require('path')
const serveStatic = require('serve-static')

const app = express()

// Enable history mode fallback
app.use(history({
  verbose: true,
  disableDotRule: true,
  htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
}))

// Serve static files
app.use('/', serveStatic(path.join(__dirname, 'dist')))

// Always serve index.html for any route
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 