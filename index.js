const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
const express = require('express');
const fs = require('fs');
const app = express();

const COUNTER_FILE = 'counter.txt';

app.use(express.static('public'));

app.get('/visitors', (req, res) => {
  let count = 0;

  if (fs.existsSync(COUNTER_FILE)) {
    count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8')) || 0;
  }

  count++;
  fs.writeFileSync(COUNTER_FILE, count.toString());
  res.json({ count });
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));