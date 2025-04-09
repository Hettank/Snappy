import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/auth.js"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        const findUser = await User.findOne({ email });

        if (findUser) {
            return res.status(400).json({
                message: "User already registered"
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            profilePic: req.body.profilePic || null
        });

        await newUser.save();
        generateToken(newUser._id, res);

        return res.status(201).json({
            data: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            },
            message: "User Registered Successfully"
        });

    } catch (error) {
        console.log("Error in signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            data: user,
            message: "Logged in successfully"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
        });

        return res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id
    
        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" })
        }
    
        const uploadResp = await cloudinary.uploader.upload(profilePic)
    
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResp.secure_url
        }, { new: true })
    
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth", error)
        res.status(500).json({ message: "Internal server error" })
    }
}