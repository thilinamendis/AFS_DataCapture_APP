import User from "../model/useModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const registerUser = asyncHandler(async (req, res) => {
    const {firstname,lastname,email,password,phone,address,userType} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if(existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt  = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user

})