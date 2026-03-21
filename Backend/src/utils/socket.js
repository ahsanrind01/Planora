import { Server } from 'socket.io';
import eventBus from './eventBus.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on('connection', (socket) => {

        socket.on('joinRoom', (conversationId) => {
            socket.join(conversationId);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Device disconnected: ${socket.id}`);
        });
    });

    eventBus.on('newMessage', ({ message }) => {
        io.to(message.conversationId.toString()).emit('receiveMessage', message);
    });

    eventBus.on('messagesRead', ({ conversationId, readerId }) => {
        io.to(conversationId.toString()).emit('messagesRead', { readerId });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};