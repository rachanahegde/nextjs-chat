'use client'
import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client' // Client side socket io library
import { Send, Users, Hash } from 'lucide-react'; // Icons

export default function Chat() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false); // Track if user joined chat
  const [onlineCount, setOnlineCount] = useState(12);
  const [isConnected, setIsConnected] = useState(false); // Track if socket is connected

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  // Store the socket connection using useRef
  // useRef persists values across re-renders without causing re-renders
  // This ensures we keep the same socket connection throughout the component's lifecycle
  const socketRef = useRef(null) 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isJoined && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isJoined]);

  const joinChat = () => {
    if (username.trim()) {
      setIsJoined(true);
      // Simulate joining message
      const joinMessage = {
        id: Date.now(),
        username: 'System',
        message: `${username} joined the chat`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      setMessages(prev => [...prev, joinMessage]);
      setOnlineCount(prev => prev + 1);
    }
  };

  const sendMessage = () => {
    // Check if message isn't empty, socket exists, and we're connected
    if (currentMessage.trim() && username && socketRef.current && isConnected) {
      const newMessage = {
        id: Date.now(),
        username: username,
        message: currentMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setMessages(prev => [...prev, newMessage]);
      // Send the message to the server using the 'message' event
      // The server will then broadcast this to all connected clients
      socketRef.current.emit('message', currentMessage)
      setCurrentMessage('');
    }
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-300';
    const colors = ['bg-lavender', 'bg-pink-light', 'bg-pink-medium', 'bg-blue-light', 'bg-blue-medium'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

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
      setIsJoined(false) // Update UI to show we're disconnected
      setIsConnected(false);
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

  const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
      if (isJoined) {
        sendMessage();
      } else {
        joinChat();
      }
    }
  };

    if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <style jsx>{`
          .bg-lavender { background-color: #CDB4DB; }
          .bg-pink-light { background-color: #FFC8DD; }
          .bg-pink-medium { background-color: #FFAFCC; }
          .bg-blue-light { background-color: #BDE0FE; }
          .bg-blue-medium { background-color: #A2D2FF; }
          .text-lavender { color: #CDB4DB; }
          .text-pink-medium { color: #FFAFCC; }
          .text-blue-medium { color: #A2D2FF; }
          .border-lavender { border-color: #CDB4DB; }
          .border-blue-medium { border-color: #A2D2FF; }
          .gradient-primary { background: linear-gradient(135deg, #CDB4DB 0%, #FFC8DD 50%, #FFAFCC 100%); }
          .gradient-secondary { background: linear-gradient(135deg, #BDE0FE 0%, #A2D2FF 100%); }
          .hover\\:bg-blue-light:hover { background-color: #BDE0FE; }
        `}</style>

        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
              <Hash className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Group Chat</h1>
            <p className="text-gray-600">Enter your name to start chatting with everyone</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name..."
                className="input input-bordered w-full focus:border-blue-medium focus:outline-none"
                maxLength={20}
                autoFocus
              />
            </div>

            <button
              onClick={joinChat}
              disabled={!username.trim()}
              className="btn w-full gradient-primary text-white border-none hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Chat
            </button>

            <div className="text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <Users size={16} />
                <span>{onlineCount} people online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      <style jsx>{`
        .bg-lavender { background-color: #CDB4DB; }
        .bg-pink-light { background-color: #FFC8DD; }
        .bg-pink-medium { background-color: #FFAFCC; }
        .bg-blue-light { background-color: #BDE0FE; }
        .bg-blue-medium { background-color: #A2D2FF; }
        .text-lavender { color: #CDB4DB; }
        .text-pink-medium { color: #FFAFCC; }
        .text-blue-medium { color: #A2D2FF; }
        .border-lavender { border-color: #CDB4DB; }
        .border-blue-medium { border-color: #A2D2FF; }
        .gradient-primary { background: linear-gradient(135deg, #CDB4DB 0%, #FFC8DD 50%, #FFAFCC 100%); }
        .gradient-secondary { background: linear-gradient(135deg, #BDE0FE 0%, #A2D2FF 100%); }
        .hover\\:bg-blue-light:hover { background-color: #BDE0FE; }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <Hash className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Public Group Chat</h1>
                <p className="text-sm text-gray-500">Everyone can join and chat</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={18} />
              <span className="font-medium">{onlineCount} online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.isSystem ? (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {msg.message}
                    </span>
                  </div>
                ) : (
                  <div className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className="avatar flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(msg.username)}`}>
                        {getInitials(msg.username)}
                      </div>
                    </div>
                    
                    <div className={`max-w-md lg:max-w-lg ${msg.isOwn ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-semibold text-gray-800">
                          {msg.isOwn ? 'You' : msg.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp}
                        </span>
                      </div>
                      
                      <div className={`inline-block p-3 rounded-2xl max-w-full break-words ${
                        msg.isOwn 
                          ? 'gradient-primary text-white rounded-br-md' 
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="flex items-end bg-gray-50 rounded-2xl border border-gray-300 focus-within:border-blue-medium transition-colors">
                  <textarea
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-4 text-gray-800 placeholder-gray-500 max-h-32 min-h-[2.5rem]"
                    rows="1"
                    style={{
                      height: 'auto',
                      minHeight: '2.5rem'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="btn gradient-primary text-white border-none hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-12 h-12 min-h-12 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Chatting as <span className="font-medium">{username}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};