const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

// Connect to database
const db = require('./config/db');

// Route files
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const bookings = require('./routes/bookings');
const trainer = require('./routes/trainer');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Make io accessible
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/bookings', bookings);
app.use('/api/trainer', trainer);

const PORT = process.env.PORT || 5001;

// Socket connection
io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

// Test DB connection
db.query('SELECT 1')
    .then(() => console.log('MySQL Connected'))
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
