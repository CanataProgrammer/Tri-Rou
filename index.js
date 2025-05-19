import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const SECRET_KEY = 'your_secret_key'; // 簡易用途向け
const USERS_FILE = './users.json';
const DATA_DIR = './data';
const app = express();

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static(__dirname));

// JSONボディをパース
app.use(express.json());

// ルートへのアクセスで index.html を返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 今後：ユーザー認証やデータ保存のルートをここに追加する

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// 他のAPI（ユーザー登録・保存など）はここに追加

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');

// 🔐 ユーザー登録
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const validName = /^[a-zA-Z0-9\-.,]+$/.test(username);
  if (!validName) return res.status(400).json({ message: 'Invalid username' });

  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  if (users[username]) return res.status(409).json({ message: 'User exists' });

  const hash = bcrypt.hashSync(password, 10);
  users[username] = hash;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  fs.writeFileSync(`${DATA_DIR}/${username}.json`, JSON.stringify({ data: [] }));

  res.json({ message: 'Registered successfully' });
});

// 🔑 ログイン
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const hash = users[username];
  if (!hash || !bcrypt.compareSync(password, hash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '7d' });
  res.json({ token });
});

// 🔐 ミドルウェア：認証
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded.username;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// 📤 データ保存
app.post('/api/data', auth, (req, res) => {
  const file = `${DATA_DIR}/${req.user}.json`;
  fs.writeFileSync(file, JSON.stringify(req.body));
  res.json({ message: 'Saved' });
});

// 📥 データ読み込み
app.get('/api/data', auth, (req, res) => {
  const file = `${DATA_DIR}/${req.user}.json`;
  if (!fs.existsSync(file)) return res.json({ data: [] });
  const data = JSON.parse(fs.readFileSync(file));
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
