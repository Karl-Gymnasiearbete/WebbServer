const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(express.json());
const db = mysql.createPool({
  connectionLimit: 100,
  host: '127.0.0.1',
  user: 'newuser',
  password: 'password1#',
  database: 'userDB',
  port: '3306'
});
db.getConnection((err, connection) => {
  if (err) {
    console.error('DB connection failed:', err.message);
    return;
  }
  console.log('DB connected: ' + connection.threadId);
  connection.release();
});
app.post('/createUser', async (req, res) => {
  const user = req.body.name;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  db.getConnection(async (err, connection) => {
    if (err) return res.sendStatus(500);
    const search = mysql.format('SELECT * FROM userTable WHERE user = ?', [user]);
    connection.query(search, async (err, result) => {
      if (result.length !== 0) { connection.release(); return res.sendStatus(409); }
      const insert = mysql.format('INSERT INTO userTable VALUES (0,?,?)', [user, hashedPassword]);
      connection.query(insert, (err, result) => {
        connection.release();
        if (err) return res.sendStatus(500);
        res.sendStatus(201);
      });
    });
  });
});
app.post('/login', (req, res) => {
  const { name, password } = req.body;
  db.getConnection(async (err, connection) => {
    if (err) return res.sendStatus(500);
    const search = mysql.format('SELECT * FROM userTable WHERE user = ?', [name]);
    connection.query(search, async (err, result) => {
      connection.release();
      if (result.length === 0) return res.sendStatus(404);
      const match = await bcrypt.compare(password, result[0].password);
      match ? res.json({ success: true, user: name }) : res.sendStatus(401);
    });
  });
});
app.get('/visitors', (req, res) => {
  let seen = [];
  if (fs.existsSync('visitors.json')) seen = JSON.parse(fs.readFileSync('visitors.json', 'utf8'));
  let count = 0;
  if (fs.existsSync('counter.txt')) count = parseInt(fs.readFileSync('counter.txt', 'utf8')) || 0;
  let userId = req.cookies.userId;
  if (!userId || !seen.includes(userId)) {
    userId = uuidv4();
    seen.push(userId);
    count++;
    fs.writeFileSync('visitors.json', JSON.stringify(seen));
    fs.writeFileSync('counter.txt', count.toString());
  }
  res.cookie('userId', userId, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.json({ count });
});
app.get('/datetime', (req, res) => {
  res.json({ datetime: new Date().toLocaleString() });
});
app.listen(3000, () => console.log('Running on http://localhost:3000'));