import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Define the WebSocket URL based on environment
    const BACKEND_URL = 'wss://collabtexteditor.onrender.com';
    console.log('Attempting to connect to:', BACKEND_URL); // Debug log
    
    const newSocket = new WebSocket(BACKEND_URL);
    
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      setConnectionStatus('connected');
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'init' || message.type === 'update') {
          setDocument(message.data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    newSocket.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    setSocket(newSocket);

    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, []);

  const handleChange = (e) => {
    const newDocument = e.target.value;
    setDocument(newDocument);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: 'update', data: newDocument }));
      } catch (error) {
        console.error('Error sending update:', error);
        setConnectionStatus('error');
      }
    }
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      <div className={`status-indicator ${connectionStatus}`}>
        Connection Status: {connectionStatus}
      </div>
      <textarea
        value={document}
        onChange={handleChange}
        rows="20"
        cols="80"
        placeholder="Start typing here..."
        disabled={connectionStatus !== 'connected'}
      />
    </div>
  );
}

export default App;