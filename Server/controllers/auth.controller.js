import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) =>{

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    try{
        await newUser.save()
        res.status(201).json({ message: "User created successfully" });

    } catch(error){

        next(error);
    }
};


export const signin = async (req, res, next) =>{
    const { email, password } = req.body;
    try{
        const validUser = await User.findOne({ email: email });
        if (!validUser) return next(errorHandler(404, 'User not found!'));
        const validPassword = await bcrypt.compare(password, validUser.password);
        if(!validPassword) return next(errorHandler(401, 'Wrong credentails!'));
        const token = jwt.sign({ userId: validUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validUser._doc;
        res.cookie('access_token', token,{httpOnly: true, })
        .status(200)
        .json(rest);
    } catch (error) {
        next(error);
    }
};

export const google = async (req, res, next) =>{
    try{
        const  user = await User.findOne({ email: req.body.email })
        if(user){
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res.cookie('access_token', token,{httpOnly: true, })
            .status(200)
            .json(rest);

        } else{
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatePassword, 10);
            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase + Math.random().toString(36).slice(-4) , email: req.body.email, password: hashedPassword, avatar: req.body.photo });
            await newUser.save();
            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            res.cookie('access_token', token,{httpOnly: true, }).status(200).json(rest);
        }
    }
    catch(error){
        next(error);
    }

}