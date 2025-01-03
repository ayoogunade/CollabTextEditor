import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const BACKEND_URL = process.env.NODE_ENV === 'development'
      ? 'ws://localhost:5001/ws'
      : 'wss://collabtexteditor.onrender.com/ws';

    console.log('Connecting to WebSocket:', BACKEND_URL);

    const newSocket = new WebSocket(BACKEND_URL);
    setSocket(newSocket);

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
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, []);

  const handleChange = (e) => {
    const newDocument = e.target.value;
    setDocument(newDocument);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'update', data: newDocument }));
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
        disabled={connectionStatus !== 'connected'}
      />
    </div>
  );
}

export default App;
