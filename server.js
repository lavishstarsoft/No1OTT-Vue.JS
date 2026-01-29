const express = require('express')
const history = require('connect-history-api-fallback')
const path = require('path')
const serveStatic = require('serve-static')
const fs = require('fs')
const axios = require('axios')

const app = express()

// API base URL
const API_BASE_URL = 'https://ott.no1news.in'

// Serve .well-known files for Deep Links (Android App Links & iOS Universal Links)
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  // Android App Links configuration - serve directly
  const assetlinks = [{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.sagiam.vagmi.no1ott",
      "sha256_cert_fingerprints": [
        "A8:3A:A6:63:49:FE:A1:D6:E0:21:95:4C:2A:CC:4D:19:14:51:6A:24:F9:2C:06:6E:8A:DC:CD:DD:5C:E6:9D:1A",
        "90:D2:D6:54:5F:10:E8:AE:44:21:3F:AA:49:EC:59:2B:57:40:5C:F8:DA:43:72:5A:C4:01:9E:ED:F6:8E:FD:C3",
        "F3:26:02:62:64:0E:2D:F1:EA:6D:12:C5:5B:B0:B6:7C:E1:98:24:E7:9F:95:F9:77:28:37:51:EE:21:CD:45:FA",
        "8F:D5:D2:79:FC:C3:27:71:FC:D5:F3:11:E0:AD:C7:C4:F0:5C:5E:73:2C:FC:B8:97:11:9C:EF:A8:C1:78:90:6E"
      ]
    }
  }]

  res.json(assetlinks)
})

app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  // iOS Universal Links configuration - serve directly
  const appleAppSiteAssociation = {
    "applinks": {
      "apps": [],
      "details": [
        {
          "appID": "TEAM_ID.com.sagiam.vagmi.no1ott", // TODO: Replace TEAM_ID with your actual Apple Team ID (e.g., 85T73...)
          "paths": ["/ott/*", "/*"]
        }
      ]
    },
    "webcredentials": {
      "apps": ["TEAM_ID.com.sagiam.vagmi.no1ott"] // TODO: Replace TEAM_ID here as well
    }
  }

  res.json(appleAppSiteAssociation)
})

// Debug route to test server
app.get('/debug', (req, res) => {
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent']
  })
})

// Debug route to show raw HTML content
app.get('/debug-html', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/index.html')
    const html = fs.readFileSync(indexPath, 'utf8')
    res.send(`
      <h1>Raw HTML Content</h1>
      <pre>${html}</pre>
    `)
  } catch (error) {
    res.json({ error: error.message })
  }
})

// Debug route to show movie data
app.get('/debug-movie/:id', async (req, res) => {
  try {
    const movieId = req.params.id
    const movie = await fetchMovieData(movieId)
    res.json({
      movieId,
      movie,
      escapedTitle: movie ? escapeHtml(movie.title) : null,
      escapedDescription: movie ? escapeHtml(movie.description) : null,
      imageUrl: movie ? (movie.thumbnail_url || movie.portrait_thumbnail_url || movie.poster_url) : null
    })
  } catch (error) {
    res.json({ error: error.message })
  }
})

// Function to fetch movie data
async function fetchMovieData(movieId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/videos/${movieId}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return null
  }
}

// Function to escape HTML content
function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Function to convert relative URLs to absolute URLs
function makeAbsoluteUrl(url, req) {
  if (!url) return ''

  // If URL is already absolute (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Get protocol from request (default to http)
  const protocol = req.protocol || 'http'

  // Get host from request headers
  const host = req.get('host')

  // If URL starts with /, it's an absolute path on the server
  if (url.startsWith('/')) {
    return `${protocol}://${host}${url}`
  }

  // For relative URLs, prepend with protocol and host
  return `${protocol}://${host}/${url}`
}

// Function to generate meta tags HTML
function generateMetaTags(movie) {
  const imageUrl = movie.thumbnail_url || movie.portrait_thumbnail_url || movie.poster_url
  const title = escapeHtml(movie.title || 'Movie on No1 OTT')
  const description = escapeHtml(movie.description || 'Watch this movie on No1 OTT')

  return `
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="">
    <meta property="og:type" content="video.movie">
    <meta property="og:site_name" content="No1 OTT">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:url" content="">
    
    <title>${title} - No1 OTT</title>
  `
}

// Test route to simulate social media crawler
app.get('/test-movie/:id', async (req, res) => {
  const movieId = req.params.id

  try {
    const movie = await fetchMovieData(movieId)
    if (movie) {
      const indexPath = path.join(__dirname, 'dist/index.html')
      let html = fs.readFileSync(indexPath, 'utf8')

      const escapedTitle = escapeHtml(movie.title)
      const escapedDescription = escapeHtml(movie.description)
      const imageUrl = movie.thumbnail_url || movie.portrait_thumbnail_url || movie.poster_url

      console.log('Original HTML length:', html.length)
      console.log('Movie data:', { title: escapedTitle, description: escapedDescription, imageUrl })

      // Debug: Check if the patterns exist in the HTML
      console.log('Title pattern found:', html.includes('<title>No1 OTT</title>'))
      console.log('OG title pattern found:', html.includes('<meta property="og:title" content="No1 OTT - Watch Movies Online">'))
      console.log('OG description pattern found:', html.includes('<meta property="og:description" content="Watch the latest movies and TV shows on No1 OTT">'))
      console.log('OG image pattern found:', html.includes('<meta property="og:image" content="/ott.jpg">'))

      // Replace title
      let newHtml = html.replace(/<title>No1 OTT<\/title>/, `<title>${escapedTitle} - No1 OTT</title>`)

      // Replace OG tags
      newHtml = newHtml.replace(/<meta property="og:title" content="No1 OTT - Watch Movies Online">/, `<meta property="og:title" content="${escapedTitle}">`)
      newHtml = newHtml.replace(/<meta property="og:description" content="Watch the latest movies and TV shows on No1 OTT">/, `<meta property="og:description" content="${escapedDescription}">`)
      newHtml = newHtml.replace(/<meta property="og:image" content="\/ott\.jpg">/, `<meta property="og:image" content="${imageUrl}">`)

      // Replace Twitter tags
      newHtml = newHtml.replace(/<meta name="twitter:title" content="No1 OTT - Watch Movies Online">/, `<meta name="twitter:title" content="${escapedTitle}">`)
      newHtml = newHtml.replace(/<meta name="twitter:description" content="Watch the latest movies and TV shows on No1 OTT">/, `<meta name="twitter:description" content="${escapedDescription}">`)
      newHtml = newHtml.replace(/<meta name="twitter:image" content="\/ott\.jpg">/, `<meta name="twitter:image" content="${imageUrl}">`)

      console.log('Modified HTML length:', newHtml.length)
      console.log('Title replaced:', newHtml.includes(`${escapedTitle} - No1 OTT`))
      console.log('OG title replaced:', newHtml.includes(`<meta property="og:title" content="${escapedTitle}">`))

      // Add a comment to verify the HTML was modified
      newHtml = newHtml.replace('</head>', `<!-- Meta tags replaced for movie: ${escapedTitle} -->\n  </head>`)

      html = newHtml

      res.send(html)
    } else {
      res.sendFile(path.join(__dirname, 'dist/index.html'))
    }
  } catch (error) {
    console.error('Error in test route:', error)
    res.sendFile(path.join(__dirname, 'dist/index.html'))
  }
})

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    routes: {
      debug: '/debug',
      debugHtml: '/debug-html',
      debugMovie: '/debug-movie/:id',
      movie: '/ott/:id'
    }
  })
})

// Handle movie routes for social media crawlers
app.get('/ott/:id', async (req, res) => {
  const movieId = req.params.id
  const userAgent = req.headers['user-agent'] || ''

  // Check if it's a social media crawler
  const isSocialCrawler = userAgent.includes('facebookexternalhit') ||
    userAgent.includes('Twitterbot') ||
    userAgent.includes('WhatsApp') ||
    userAgent.includes('TelegramBot') ||
    userAgent.includes('LinkedInBot') ||
    userAgent.includes('Slackbot') ||
    userAgent.includes('whatsapp') ||
    userAgent.includes('facebook') ||
    userAgent.includes('twitter')

  console.log('User Agent:', userAgent)
  console.log('Is Social Crawler:', isSocialCrawler)

  // For testing, treat ALL requests as social crawler requests
  // This will be removed in production
  const forceCrawler = false // Set to false for production to let normal users use the Vue app

  if (isSocialCrawler || forceCrawler) {
    console.log('Processing as social crawler request')
    try {
      // Fetch movie data
      const movie = await fetchMovieData(movieId)
      console.log('Movie data fetched:', movie ? 'Success' : 'Failed')

      if (movie) {
        // Read the index.html file
        const indexPath = path.join(__dirname, 'dist/index.html')
        console.log('Reading HTML file from:', indexPath)
        let html = fs.readFileSync(indexPath, 'utf8')
        console.log('HTML file read successfully, length:', html.length)

        // Generate meta tags
        const metaTags = generateMetaTags(movie)

        // Replace the default meta tags with movie-specific ones
        const escapedTitle = escapeHtml(movie.title)
        const escapedDescription = escapeHtml(movie.description)
        const imageUrl = movie.thumbnail_url || movie.portrait_thumbnail_url || movie.poster_url

        console.log('=== META TAG REPLACEMENT DEBUG ===')
        console.log('Title pattern found:', html.includes('<title>No1 OTT</title>'))
        console.log('OG title pattern found:', html.includes('<meta property="og:title" content="No1 OTT - Watch Movies Online">'))
        console.log('OG image pattern found:', html.includes('<meta property="og:image" content="/ott.jpg">'))
        console.log('Twitter title pattern found:', html.includes('<meta name="twitter:title" content="No1 OTT - Watch Movies Online">'))
        console.log('Twitter image pattern found:', html.includes('<meta name="twitter:image" content="/ott.jpg">'))

        html = html.replace(
          /<title>No1 OTT<\/title>/,
          `<title>${escapedTitle} - No1 OTT</title>`
        )

        // Convert image URL to absolute URL for social media platforms
        const absoluteImageUrl = makeAbsoluteUrl(imageUrl, req)
        const absoluteShareUrl = `${req.protocol}://${req.get('host')}/ott/${movieId}`

        console.log('Original image URL:', imageUrl)
        console.log('Absolute image URL:', absoluteImageUrl)
        console.log('Absolute share URL:', absoluteShareUrl)

        // Replace default OG tags
        html = html.replace(
          /<meta property="og:title" content="No1 OTT - Watch Movies Online">/,
          `<meta property="og:title" content="${escapedTitle}">`
        )

        html = html.replace(
          /<meta property="og:description" content="Watch the latest movies and TV shows on No1 OTT">/,
          `<meta property="og:description" content="${escapedDescription}">`
        )

        html = html.replace(
          /<meta property="og:image" content="\/ott\.jpg">/,
          `<meta property="og:image" content="${absoluteImageUrl}">`
        )

        html = html.replace(
          /<meta property="og:url" content="">/,
          `<meta property="og:url" content="${absoluteShareUrl}">`
        )

        // Replace Twitter tags
        html = html.replace(
          /<meta name="twitter:title" content="No1 OTT - Watch Movies Online">/,
          `<meta name="twitter:title" content="${escapedTitle}">`
        )

        html = html.replace(
          /<meta name="twitter:description" content="Watch the latest movies and TV shows on No1 OTT">/,
          `<meta name="twitter:description" content="${escapedDescription}">`
        )

        html = html.replace(
          /<meta name="twitter:image" content="\/ott\.jpg">/,
          `<meta name="twitter:image" content="${absoluteImageUrl}">`
        )

        html = html.replace(
          /<meta name="twitter:url" content="">/,
          `<meta name="twitter:url" content="${absoluteShareUrl}">`
        )

        // Add a comment to verify the HTML was modified
        html = html.replace('</head>', `<!-- Meta tags replaced for movie: ${escapedTitle} -->\n  </head>`)

        console.log('=== REPLACEMENT VERIFICATION ===')
        console.log('Title replaced:', html.includes(`${escapedTitle} - No1 OTT`))
        console.log('OG title replaced:', html.includes(`<meta property="og:title" content="${escapedTitle}">`))
        console.log('OG image replaced:', html.includes(`<meta property="og:image" content="${imageUrl}">`))
        console.log('Twitter title replaced:', html.includes(`<meta name="twitter:title" content="${escapedTitle}">`))
        console.log('Twitter image replaced:', html.includes(`<meta name="twitter:image" content="${imageUrl}">`))
        console.log('Comment added:', html.includes(`<!-- Meta tags replaced for movie: ${escapedTitle} -->`))

        console.log('Sending modified HTML with movie meta tags')
        res.send(html)
      } else {
        // Fallback to default index.html
        res.sendFile(path.join(__dirname, 'dist/index.html'))
      }
    } catch (error) {
      console.error('Error handling movie route:', error)
      res.sendFile(path.join(__dirname, 'dist/index.html'))
    }
  } else {
    // For regular users, serve the normal index.html
    res.sendFile(path.join(__dirname, 'dist/index.html'))
  }
})

// Enable history mode fallback for other routes
app.use(history({
  verbose: true,
  disableDotRule: true,
  htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
}))

// Serve static files
app.use('/', serveStatic(path.join(__dirname, 'dist')))

// Always serve index.html for any other route
app.get(/(.*)/, function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 