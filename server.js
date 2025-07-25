// Custom server set up

import { createServer } from 'node:http'  // Node.js built-in HTTP server
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })

// Get Next.js's request handler
// This function processes all HTTP requests for pages, API routes, static files, etc.
const handler = app.getRequestHandler()

// Wait for Next.js to prepare (compile pages, set up routing, etc.)
app.prepare().then(() => {
  // Create an HTTP server using Next.js's request handler
  // This server will handle both regular HTTP requests AND Socket.IO connections
  const httpServer = createServer(handler)

  // Create a Socket.IO server instance attached to our HTTP server
  // This enables real-time bidirectional communication between client and server
  const io = new Server(httpServer)

  // Listen for new client connections
  // Every time someone opens your website, this event fire
  io.on('connection', (socket) => {
    console.log('user connected')
    socket.on('message', (msg) => {
      io.emit('message', msg) // Broadcast to everyone, including sender
    })
  })

  // Optional: Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  // Start listening for connections on the specified port
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
