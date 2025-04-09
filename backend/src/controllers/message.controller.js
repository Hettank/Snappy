import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUsers)
        
    } catch (error) {
        console.log("Error in getUserforsidebar", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id } = req.params
        const senderId = req.user._id
        
        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: id },
                { senderId: id, receiverId: senderId},
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId} = req.params
        const senderId = req.user._id

        let imageurl

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageurl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageurl
        })

        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId)

        if (receiverId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        } 

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in send message controller: ", error)
    }
}