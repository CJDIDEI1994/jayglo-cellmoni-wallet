const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// In-memory "database"
const users = [];

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve homepage on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration route
app.post('/register', (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.send('Please fill all fields.');
  }
  if (users.find(u => u.phone === phone)) {
    return res.send('Phone number already registered.');
  }
  users.push({ name, phone, password });
  res.send('Registration successful! You can now <a href="/index.html">login</a>.');
});

// User login route
app.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) {
    return res.send('Invalid phone number or password.');
  }
  res.redirect('/dashboard.html');
});

// Deposit route (upload proof)
app.post('/deposit', upload.single('depositProof'), (req, res) => {
  const { cellmoniNumber } = req.body;
  const depositProof = req.file;
  if (!cellmoniNumber || !depositProof) {
    return res.send('Please provide your CellMoni number and upload proof.');
  }
  // TODO: Save deposit info
  res.send(`Deposit proof received for CellMoni Number ${cellmoniNumber}. We will verify manually. <a href="/dashboard.html">Back to dashboard</a>`);
});

// Withdraw route (upload proof)
app.post('/withdraw', upload.single('withdrawProof'), (req, res) => {
  const { amount, bankAccount } = req.body;
  const withdrawProof = req.file;
  if (!amount || !bankAccount || !withdrawProof) {
    return res.send('Please fill all withdrawal details and upload proof.');
  }
  // TODO: Save withdrawal info
  res.send(`Withdrawal request for K${amount} received. Agent ID: 19070. We will process manually. <a href="/dashboard.html">Back to dashboard</a>`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
