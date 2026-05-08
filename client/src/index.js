import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

let guestCounter = 1;

app.post('/threads', (req, res) => {
  const user = req.session.user || `guest${guestCounter++}`;
  const thread = {
    id: uuidv4(),
    title: req.body.title,
    user: user,
    replies: [],
    likes: []
  };
  threads.unshift(thread);
  res.json(thread);
});

app.post('/threads/:id/replies', (req, res) => {
  const user = req.session.user || `guest${guestCounter++}`;
  const thread = threads.find(t => t.id === req.params.id);
  if (!thread) return res.sendStatus(404);
  thread.replies.push({
    user: user,
    text: req.body.text
  });
  res.json(thread);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();