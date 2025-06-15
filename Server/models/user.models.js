import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
     email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type : String ,
        required : true ,
    },
    avatar:{
        type:String ,
        default : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fvectors%2Fblank-profile-picture-mystery-man-973460%2F&psig=AOvVaw1tyG-RqvKOEH2SlC5yq_Dh&ust=1750059515945000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIi5-PD18o0DFQAAAAAdAAAAABAE"
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
