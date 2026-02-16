const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

// Connect to database
const db = require('./config/db');

// Route files
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
        origin: '*', // Allow all origins for development, restrict in production
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Make io accessible to our routers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/bookings', bookings);
app.use('/api/trainer', trainer);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5001;

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

server.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
db.query('SELECT 1')
    .then(() => {
        console.log('MySQL Connected');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
