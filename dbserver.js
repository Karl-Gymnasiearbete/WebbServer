const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
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

app.listen(4000, () => console.log('DB server running on http://localhost:4000'));