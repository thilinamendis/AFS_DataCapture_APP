import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
},{
    timestamps: true,
});

const User = mongoose.model("User", userSchema);
export default User;