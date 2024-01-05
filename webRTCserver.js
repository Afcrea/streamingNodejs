const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected');

    // Handle WebRTC signaling (Offer, Answer, ICE Candidate)
    socket.on('offer', (offer, remoteSocketId) => {
        socket.to(remoteSocketId).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, remoteSocketId) => {
        socket.to(remoteSocketId).emit('answer', answer, socket.id);
    });

    socket.on('ice-candidate', (candidate, remoteSocketId) => {
        socket.to(remoteSocketId).emit('ice-candidate', candidate, socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
