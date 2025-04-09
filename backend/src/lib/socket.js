import { Server } from "socket.io";
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// used to store online users
const userSocketMap = {} // { userId: socket.id }

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}


io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId

    if (userId) userSocketMap[userId] = socket.id

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))

    })
})

export { io, app, server } 