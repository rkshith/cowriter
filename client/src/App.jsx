import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

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

    // mark as typing and debounce clearing the typing state
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 900);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'update', content: newText }));
    }
  };

  return (
    <div className="App">
      <div className="project-top">
        <div className="project-title">
          <h1>Real-time Collaborative Text Editor</h1>
          <div className="project-sub">A swagy, elegant editor demo</div>
        </div>
        <div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <textarea
        className={typing ? 'typing' : ''}
        value={text}
        onChange={handleChange}
        rows={10}
      />
    </div>
  );
}

export default App;
