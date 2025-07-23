'use client'
import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    // Create socket connection once and store it in ref
    socketRef.current = io()
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socketRef.current.on('message', (msg) => {
      console.log('Received message:', msg)
      setMessages((prev) => [...prev, msg])
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const handleSendMessage = () => {
    if (messageInput.trim() && socketRef.current && isConnected) {
      console.log('Sending message:', messageInput)
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