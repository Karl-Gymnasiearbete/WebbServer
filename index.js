const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const COUNTER_FILE = 'counter.txt';   // Fil som lagrar besökarantalet
const VISITORS_FILE = 'visitors.json'; // Fil som lagrar unika besökar-ID:n

app.use(express.static('public')); // Serverar statiska filer från mappen "public"
app.use(cookieParser());           // Låter servern läsa cookies från förfrågningar

// Endpoint som hanterar besökarräkning
app.get('/visitors', (req, res) => {
  // Läs in listan med redan sedda besökare från fil
  let seen = [];
  if (fs.existsSync(VISITORS_FILE)) {
    seen = JSON.parse(fs.readFileSync(VISITORS_FILE, 'utf8'));
  }

  // Läs in nuvarande besökarantal från fil
  let count = 0;
  if (fs.existsSync(COUNTER_FILE)) {
    count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8')) || 0;
  }

  // Kontrollera om besökaren redan har en cookie med ett ID
  let userId = req.cookies.userId;
  let isNew = false;

  if (!userId || !seen.includes(userId)) {
    // Ny besökare – skapa ett unikt ID och uppdatera räknaren
    userId = uuidv4();
    isNew = true;
    seen.push(userId);
    count++;
    fs.writeFileSync(VISITORS_FILE, JSON.stringify(seen)); // Spara uppdaterad besökarlista
    fs.writeFileSync(COUNTER_FILE, count.toString());      // Spara nytt antal
  }

  // Sätt en cookie som gäller i 1 år så att besökaren känns igen nästa gång
  res.cookie('userId', userId, { maxAge: 365 * 24 * 60 * 60 * 1000 });

  // Skicka tillbaka det aktuella besökarantalet som JSON
  res.json({ count });
});

// Endpoint som returnerar aktuellt datum och tid
app.get('/datetime', (req, res) => {
  const now = new Date();
  res.json({ datetime: now.toLocaleString() });
});

// Starta servern på port 3000
app.listen(3000, () => console.log('Running on http://localhost:3000'));