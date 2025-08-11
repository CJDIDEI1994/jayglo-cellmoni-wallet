const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies (for form POST)
app.use(express.urlencoded({ extended: true }));

// Temporary in-memory "database"
const users = [];

// Route to serve homepage at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle user registration
app.post('/register', (req, res) => {
  const { name, phone, password } = req.body;

  // Simple validation
  if (!name || !phone || !password) {
    return res.send('Please fill all fields.');
  }

  // Check if phone already registered
  if (users.find(u => u.phone === phone)) {
    return res.send('Phone number already registered.');
  }

  // Save user (in-memory)
  users.push({ name, phone, password });
  res.send('Registration successful! You can now <a href="/index.html">login</a>.');
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { phone, password } = req.body;

  const user = users.find(u => u.phone === phone && u.password === password);

  if (!user) {
    return res.send('Invalid phone number or password.');
  }

  res.redirect('/dashboard.html');
});

// Configure storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name with original extension
  }
});

const upload = multer({ storage: storage });

// Handle deposit form POST
app.post('/deposit', upload.single('depositProof'), (req, res) => {
  const { cellmoniNumber } = req.body;
  const depositProof = req.file;

  if (!cellmoniNumber || !depositProof) {
    return res.send('Please provide your CellMoni number and upload proof.');
  }

  // TODO: Save deposit info somewhere (database or in-memory)

  res.send(`Deposit proof received for CellMoni Number ${cellmoniNumber}. We will verify manually. <a href="/dashboard.html">Back to dashboard</a>`);
});

// Handle withdrawal form POST
app.post('/withdraw', upload.single('withdrawProof'), (req, res) => {
  const { amount, bankAccount } = req.body;
  const withdrawProof = req.file;

  if (!amount || !bankAccount || !withdrawProof) {
    return res.send('Please fill all withdrawal details and upload proof.');
  }

  // TODO: Save withdrawal request info somewhere (database or in-memory)

  res.send(`Withdrawal request for K${amount} received. Agent ID: 19070. We will process manually. <a href="/dashboard.html">Back to dashboard</a>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
