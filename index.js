console.log("Bollar")
const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const app = express();

const COUNTER_FILE = 'counter.txt';
const VISITORS_FILE = 'visitors.json';

app.use(express.static('public'));
app.use(cookieParser());

app.get('/visitors', (req, res) => {
  // Load seen visitors
  let seen = [];
  if (fs.existsSync(VISITORS_FILE)) {
    seen = JSON.parse(fs.readFileSync(VISITORS_FILE, 'utf8'));
  }

  // Load count
  let count = 0;
  if (fs.existsSync(COUNTER_FILE)) {
    count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8')) || 0;
  }

  // Check if this visitor has a cookie
  let userId = req.cookies.userId;
  let isNew = false;

  if (!userId || !seen.includes(userId)) {
    // New visitor
    userId = uuidv4();
    isNew = true;
    seen.push(userId);
    count++;
    fs.writeFileSync(VISITORS_FILE, JSON.stringify(seen));
    fs.writeFileSync(COUNTER_FILE, count.toString());
  }

  // Set cookie for 1 year
  res.cookie('userId', userId, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.json({ count });
});

app.get('/datetime', (req, res) => {
  const now = new Date();
  res.json({ datetime: now.toLocaleString() });
});
app.get('/', (req, res) => {
  res.send('Server is working!');
});
app.listen(3000, () => console.log('Running on http://localhost:3000'));