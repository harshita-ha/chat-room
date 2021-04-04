const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

const io = socketio(server);

io.on('connection', (socket) => {
    console.log('Connection request received from client');

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage({ message: 'Welcome!', username: 'Admin' }));

        socket.broadcast.to(user.room).emit('message', generateMessage({ message: `${user.username} has joined the chatroom!`, username: 'Admin' }));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage({ message, username: user.username }));
        callback();
    });

    socket.on('disconnect', () => {

        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage({ message: `${user.username} has left the chat`, username: 'Admin' }));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage({ url: `https://google.com/maps?q=${latitude},${longitude}`, username: user.username }));
        callback();
    });
});

server.listen(PORT, () => {
    console.log("Server is set up on port ", PORT);;
});