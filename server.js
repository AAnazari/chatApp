const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    socket.on('private message', (data) => {
        const recipientSocketId = users[data.to];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private message', data);
        } else {
            socket.emit('chat message', { user: 'System', msg: `User ${data.to} not found.` });
        }
    });

    socket.on('disconnect', () => {
        for (const username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                break;
            }
        }
        console.log('User disconnected');
    });

    socket.on('register', (username) => {
        users[username] = socket.id;
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
