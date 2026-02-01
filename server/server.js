const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const passport = require('passport');
require('./config/passport')(passport);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const logMsg = `[${new Date().toISOString()}] ERROR: ${err.message}\nSTACK: ${err.stack}\n`;
    fs.appendFileSync(path.join(__dirname, 'server_error.log'), logMsg);
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
