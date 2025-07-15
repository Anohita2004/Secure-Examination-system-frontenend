const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

// 🔥 Add session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));
app.use((req, res, next) => {
  console.log("🔐 Session:", req.session);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/permissions', require('./routes/permissions'));

// Exams list endpoint (if needed separately)
app.use('/api/exams', require('./routes/exam'));

// User-related endpoints
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 