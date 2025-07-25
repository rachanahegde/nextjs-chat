'use client'
import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client' // Client side socket io library
import { Send, Users, Hash } from 'lucide-react'; // Icons

export default function Chat() {
  const [messages, setMessages] = useState([]) // Store chat messages in array
  const [messageInput, setMessageInput] = useState('') // Message user is currently typing
  const [isConnected, setIsConnected] = useState(false) // Track if connected to server

  // Store the socket connection using useRef
  // useRef persists values across re-renders without causing re-renders
  // This ensures we keep the same socket connection throughout the component's lifecycle
  const socketRef = useRef(null) 

  useEffect(() => {
    // Create s newocket connection to our server once and store it in ref 
    // io() connects to the same origin by default (localhost:3000)
    socketRef.current = io()
    
    // Listen for successful connection to server
    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true) // Update UI to show we're connected
    })

    // Listen for disconnection from server
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false) // Update UI to show we're disconnected
    })

    // Listen for incoming messages from server
    // When ANY user sends a message, the server broadcasts it and we receive it here
    socketRef.current.on('message', (msg) => {
      console.log('Received message:', msg)
      
      // Add the new message to our messages array
      setMessages((prev) => [...prev, msg])
    })

    // Cleanup on unmount - disconnection prevents memory leaks
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const handleSendMessage = () => {
    // Check if message isn't empty, socket exists, and we're connected
    if (messageInput.trim() && socketRef.current && isConnected) {
      console.log('Sending message:', messageInput)

      // Send the message to the server using the 'message' event
      // The server will then broadcast this to all connected clients
      socketRef.current.emit('message', messageInput)
      setMessageInput('')
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl max-w-md mx-auto my-10">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title text-2xl">Real-Time Chat</h2>
          <div className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto mb-4 min-h-48 bg-gray-50 p-4 rounded-lg">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="chat chat-start mb-2">
                <div className="chat-bubble chat-bubble-primary">{msg}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="input input-bordered w-full"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isConnected}
          />
          <button 
            onClick={handleSendMessage} 
            className="btn btn-primary"
            disabled={!isConnected || !messageInput.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}