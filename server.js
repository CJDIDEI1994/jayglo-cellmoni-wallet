const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Connect public folder correctly
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection string
const uri = 'mongodb://localhost:27017';
let db;

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    db = client.db('JaygloWalletDB');
  })
  .catch(err => console.error(err));

// Multer setup for uploads
const depositStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/deposits'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadDeposit = multer({ storage: depositStorage });

const withdrawStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/withdrawals'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadWithdraw = multer({ storage: withdrawStorage });

// Registration route
app.post('/register', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).send('Phone and password required');

  try {
    const user = await db.collection('users').findOne({ phone });
    if (user) return res.status(400).send('User already exists');

    await db.collection('users').insertOne({ phone, password });
    res.send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).send('Phone and password required');

  try {
    const user = await db.collection('users').findOne({ phone, password });
    if (!user) return res.status(400).send('Invalid phone or password');

    res.send('Login successful');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Upload deposit proof
app.post('/upload-proof', uploadDeposit.single('proof'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send('Deposit proof uploaded successfully');
});

// Upload withdrawal receipt
app.post('/withdraw-request', uploadWithdraw.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send('Withdrawal receipt uploaded successfully');
});

// Admin: get all users
app.get('/admin/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
