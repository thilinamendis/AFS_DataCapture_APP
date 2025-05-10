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
    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        phone: phone || '',
        address: address || '',
        userType,
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            firstname:user.firstname,
            lastname:user.lastname,
            email:user.email,
            phone:user.phone,
            address:user.address,
            userType:user.userType,
            isAdmin:user.isAdmin,
            token: generateToken(user._id),
        });
    }else{
        res.status(400).json({ message: "Invalid user data" });
    }
});

export const login = asyncHandler(async (req, res) => {
    const {email,password} = req.body;

    const user = await user.findOne({email});
    if(user && (await bcrypt.compare(password,user.password))){
        res.json({
            _id:user._id,
            firstname:user.firstname,
            lastname:user.lastname,
            email:user.email,
            phone:user.phone,
            address:user.address,
            userType:user.userType,
            isAdmin:user.isAdmin,
            token: generateToken(user._id),
        });
    }else{
        res.status(401).json({ message: "Invalid email or password" });
    }
});

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if(user){
        res.json({
            _id:user._id,
            firstname:user.lastName,
            lastname:user.lastname,
            email:user.email,
            phone:user.phone,
            address:user.address,
            userType:user.userType,
            isAdmin:user.isAdmin,
        });
    }else{
        res.status(404).json({ message: "User not found" });
    }
});

export const updateUser = asyncHandler(async (req, res) => {
    const {firstname,lastname,email,password,phone,address,userType} = req.body;

    const user = await User.findById(req.user._id);

    if(user){
        user.firstname = req.body.firstname || user.firstname;
        user.lastname = req.body.lastname || user.lastname;
        user.email = req.body.email || user.email;
        user.password = req.body.password ? await bcrypt.hash(password, 10) : user.password;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.userType = req.body.userType || user.userType;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            userType: updatedUser.userType,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    }else{
        res.status(404).json({ message: "User not found" });
    }
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if(user){
        await user.deleteOne();
        res.json({ message: "User removed" });
    }   else{
        res.status(404).json({ message: "User not found" });
    }
}
);

export const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else{
        res.status(404).json({ message: "User not found" });
    }
});

export const updateUserByAdmin = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(user){
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.userType = req.body.userType || user.userType;
        user.isAdmin = req.body.isAdmin != undefined ? req.body.isAdmin : user.isAdmin;

        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password,salt); 
        }

        const updatedUser = await user.save();

        res.json({
            _id:updateUser._id,
            firstName : updateUser.lastName,
            lastName: updateUser.lastName,
            email: updateUser.email,
            phone: updateUser.phone,
            address: updateUser.address,
            userType: updateUser.userType,
            isAdmin:updateUser.isAdmin
        });
    } else{
        res.status(404).json({ message: "User not found" });
        }
});

 export const deleteUserByAdmin = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(user){
        await user.deleteOne();
        res.json({message:'User removed'});
    }else{
        res.status(404).json({message:"User not found"});
    }
 });

 
 export const createUserByAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phone, address, userType, isAdmin } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400).json({message:'email already exists'})
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || '',
        address: address || '',
        userType,
        isAdmin: isAdmin || false
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            userType: user.userType,
            isAdmin: user.isAdmin
        });
    } else {
        res.status(400).json({message:'Invalid User data'})
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};