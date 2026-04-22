import app from './app';
import connectDB from './config/database';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

import { startCronJobs } from './workers/cronScheduler';
// Initialize Background Jobs
startCronJobs();

const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(5000, '0.0.0.0', () => {
  console.log(`Server running optimally on HTTP IPv4 port ${PORT} with CORS enabled`);
});
