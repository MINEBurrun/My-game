const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = '/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'scores.db'));

db.exec(`CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/submit-score', (req, res) => {
  const { name, score } = req.body;
  if (!name || score == null) return res.status(400).json({ error: 'missing name or score' });
  db.prepare('INSERT INTO leaderboard (player_name, score) VALUES (?, ?)').run(name, score);
  res.json({ success: true });
});

app.get('/leaderboard', (req, res) => {
  const rows = db.prepare('SELECT player_name, score FROM leaderboard ORDER BY score DESC LIMIT 10').all();
  res.json(rows);
});

app.listen(3000, () => console.log('Running on 3000'));
