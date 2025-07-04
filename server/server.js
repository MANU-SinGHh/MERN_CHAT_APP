import express from 'express'
import "dotenv/config"
import cors from "cors"
import http from "http"
import connectDB from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from "socket.io"


const app=express();
const server=http.createServer(app) // socket.io supports this

/// initialize socket.io server
    export const io=new Server(server,{
        cors:{origin:"*"}
    })
// store online users
export const userSocketMap={}; // {userId:socketId}

// socket.io connection handler
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
    console.log("User Connected",userId);
    if(userId) userSocketMap[userId]=socket.id;
    // emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnect", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
        
    })
    
})

// Middleware setup
app.use(express.json({limit:"4mb"})) // upload images of max 4mb
app.use(cors({
  origin: "http://localhost:5173", // ✅ allow Vite frontend
  credentials: true, // ✅ if using cookies (safe to include)
}));
// Routes Setup
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

// mongodb
await connectDB();

app.use("/api/status",(req,res)=>res.send("live server"))
const PORT=process.env.PORT || 5000
server.listen(PORT,()=>console.log('server is running on PORT:'+PORT)
)