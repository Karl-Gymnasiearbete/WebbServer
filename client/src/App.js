import React, { useState, useEffect } from "react";

function App() {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);
  const [reply, setReply] = useState("");

  // Hämta alla trådar när sidan laddas
  useEffect(() => {
    fetch("http://localhost:3000/threads")
      .then(res => res.json())
      .then(data => setThreads(data))
      .catch(err => console.error(err));
  }, []);

  // Skapa en ny tråd
  const createThread = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newThread })
    })
      .then(res => res.json())
      .then(data => {
        setThreads([data, ...threads]);
        setNewThread("");
      })
      .catch(err => console.error(err));
  };

  // Skicka ett svar
  const sendReply = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/threads/${selectedThread.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      {/* Navigation */}
      <nav style={{ background: "#333", padding: "1rem", color: "white" }}>
        <h2>Threadify</h2>
      </nav>

      {/* Om ingen tråd är vald - visa alla trådar */}
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
              <button onClick={() => setSelectedThread(thread)}>
                Svar ({thread.replies.length})
              </button>
            </div>
          ))}
        </main>
      ) : (
        /* Om en tråd är vald - visa svar */
        <main style={{ padding: "2rem" }}>
          <button onClick={() => setSelectedThread(null)}>← Tillbaka</button>
          <h2>{selectedThread.title}</h2>

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