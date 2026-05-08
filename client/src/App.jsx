import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'document') {
          setText(message.content ?? '');
        } else if (message.type === 'update') {
          setText(message.data ?? '');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const handleChange = (event) => {
    const newText = event.target.value;
    setText(newText);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'update', content: newText }));
    }
  };

  return (
    <div className="App">
      <h1>Real-time Collaborative Text Editor</h1>
      <textarea value={text} onChange={handleChange} rows={10} cols={80} />
    </div>
  );
}

export default App;
