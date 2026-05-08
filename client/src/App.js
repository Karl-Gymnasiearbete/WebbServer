import React, { useState, useEffect } from "react";

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
    .then(res => {
      console.log("Status:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("Response:", data);
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
      <nav style={{ background: "#333", padding: "1rem", color: "white" }}>
        <h2>Threadify</h2>
      </nav>

      {error && <p style={{ color: "red", padding: "1rem" }}>{error}</p>}

      {!selectedThread ? (
        <main style={{ padding: "2rem" }}>
          <h2>Skapa en tråd</h2>
          <form onSubmit={createThread}>
            <input
              type="text"
              placeholder="Skriv din tråd..."
              value={newThread}
              onChange={(e) => setNewThread(e.target.value)}
              required
            />
            <button type="submit">Skapa</button>
          </form>
          <h2>Alla trådar</h2>
          {threads.map(thread => (
            <div key={thread.id} style={{ border: "1px solid #ccc", margin: "1rem 0", padding: "1rem" }}>
              <p>{thread.title}</p>
              <p style={{ opacity: "0.5" }}>av {thread.user}</p>
              <button onClick={() => openThread(thread)}>
                Svar ({thread.replyCount})
              </button>
            </div>
          ))}
        </main>
      ) : (
        <main style={{ padding: "2rem" }}>
          <button onClick={() => setSelectedThread(null)}>← Tillbaka</button>
          <h2>{selectedThread.title}</h2>
          <p style={{ opacity: "0.5" }}>av {selectedThread.user}</p>
          <form onSubmit={sendReply}>
            <textarea
              rows={4}
              placeholder="Skriv ett svar..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              required
            />
            <button type="submit">Skicka</button>
          </form>
          <h3>Svar:</h3>
          {selectedThread.replies.map((r, index) => (
            <div key={index} style={{ border: "1px solid #ccc", margin: "1rem 0", padding: "1rem" }}>
              <p>{r.text}</p>
              <p style={{ opacity: "0.5" }}>av {r.user}</p>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}

export default App;