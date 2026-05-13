import React, { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchThreads = () => {
      fetch("http://localhost:3000/threads", {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setThreads(data))
        .catch(err => console.error(err));
    };
    fetchThreads();
    const interval = setInterval(fetchThreads, 2000);
    return () => clearInterval(interval);
  }, []);

  const createThread = (e) => {
    e.preventDefault();
    setError("");
    fetch("http://localhost:3000/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: newThread })
    })
      .then(res => res.json())
      .then(data => {
        setThreads([data, ...threads]);
        setNewThread("");
      })
      .catch(err => console.error("Error:", err));
  };

  const openThread = (thread) => {
    fetch(`http://localhost:3000/threads/${thread.id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setSelectedThread(data))
      .catch(err => console.error(err));
  };

  const sendReply = (e) => {
    e.preventDefault();
    setError("");
    fetch(`http://localhost:3000/threads/${selectedThread.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: reply })
    })
      .then(res => res.json())
      .then(data => {
        setSelectedThread(data);
        setReply("");
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <nav className="navbar">
        <a href="http://localhost:3000">
          <img src="http://localhost:3000/V_Beats_Logga.png" alt="VBeats" />
        </a>
        <div className="navbar-links">
          <a href="http://localhost:3000/musik.html" className="nav-link">Musik</a>
          <a href="http://localhost:3000/omOss.html" className="nav-link">Om oss</a>
          <a href="http://localhost:3001" className="nav-link">Forum</a>
        </div>
        <div className="nav-spacer"></div>
        <a href="http://localhost:3000/login.html" className="nav-login">Logga in</a>
      </nav>

      <div className="fill"></div>

      {error && <p className="error">{error}</p>}

      {!selectedThread ? (
        <main className="main">
          <div className="create-box">
            <h2>Skapa en tråd</h2>
            <form className="create-form" onSubmit={createThread}>
              <input
                className="create-input"
                type="text"
                placeholder="Skriv din tråd..."
                value={newThread}
                onChange={(e) => setNewThread(e.target.value)}
                required
              />
              <button className="create-btn" type="submit">Skapa</button>
            </form>
          </div>

          <h2 className="threads-title">Alla trådar</h2>
          {threads.map(thread => (
            <div key={thread.id} className="thread-card">
              <p className="thread-title">{thread.title}</p>
              <p className="thread-user">av {thread.user}</p>
              <button className="reply-btn" onClick={() => openThread(thread)}>
                Svar ({thread.replyCount})
              </button>
            </div>
          ))}
        </main>
      ) : (
        <main className="main">
          <button className="back-btn" onClick={() => setSelectedThread(null)}>← Tillbaka</button>
          <div className="create-box">
            <h2>{selectedThread.title}</h2>
            <p className="thread-user">av {selectedThread.user}</p>
            <form className="reply-form" onSubmit={sendReply}>
              <textarea
                className="reply-input"
                rows={4}
                placeholder="Skriv ett svar..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                required
              />
              <button className="create-btn" type="submit">Skicka</button>
            </form>
          </div>

          <h3 className="threads-title">Svar:</h3>
          {selectedThread.replies.map((r, index) => (
            <div key={index} className="thread-card">
              <p className="thread-title">{r.text}</p>
              <p className="thread-user">av {r.user}</p>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}

export default App;