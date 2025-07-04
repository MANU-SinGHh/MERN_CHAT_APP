import cloudinary from "../lib/cloudinary.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import {io,userSocketMap} from "../server.js"

// Get all users except the logged-in user for the sidebar
export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id
        // Fetch all user details that do not have the current user's ID
        // The '-password' flag removes the password field from the returned data
        const users = await User.find({ _id: { $ne: userId } }).select("-password");

        // Count the number of unseen messages for each filtered user
        const unseenMessages = {}
        const promises = users.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receieverId: userId, seen: false });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);

        // Send the fetched users (now named 'users' for frontend consistency) and unseen messages count
        res.json({ success: true, users, unseenMessages }); // Renamed 'filteredUsers' to 'users'

    } catch (error) {
        console.error("Error in getUserForSidebar:", error.message); // Use console.error for errors
        res.status(500).json({ success: false, message: error.message }); // Send appropriate status code
    }
}

// Get all messages for a selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params; // Extract selected user ID from parameters
        const myId = req.user._id; // Get current user's ID from authenticated request

        // Find messages where the current user is sender and selected user is receiver,
        // OR where selected user is sender and current user is receiver
        const messages = await Message.find({
            $or: [
                { senderId: myId, receieverId: selectedUserId },
                { senderId: selectedUserId, receieverId: myId },
            ]
        });
        // Mark all messages from the selected user to the current user as seen
        await Message.updateMany({ senderId: selectedUserId, receieverId: myId }, { seen: true });

        res.json({ success: true, messages });

    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to mark a specific message as seen using its ID
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params; // Get message ID from parameters
        await Message.findByIdAndUpdate(id, { seen: true }); // Update message to seen
        res.json({ success: true });

    } catch (error) {
        console.error("Error in markMessageAsSeen:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Send a message to the selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body; // Message text and optional image
        // Corrected: Use req.params.id to get the receiverId
        const receieverId = req.params.id;
        const senderId = req.user._id; // Current authenticated user is the sender

        let imageUrl;
        // Upload image to Cloudinary if provided
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Create a new message document
        const newMessage = await Message.create({
            senderId,
            receieverId,
            text,
            image: imageUrl
        });

        // Emit new message to receiver's socket if they are online
        const receiverSocketId = userSocketMap[receieverId];
        if (receiverSocketId) {
            // Emit a "newMessage" event, not just "message", for better clarity and client-side handling
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, newMessage }); // 201 Created status for new resource

    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
