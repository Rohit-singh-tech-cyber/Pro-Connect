import User from "../models/user.model.js";
 import bcrypt from 'bcrypt';
 
 import Profile from "../models/profile.model.js";
//import UserSchema from "../models/user.model.js";
import crypto from 'crypto';
import { profile } from "console";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";
import ConnectionRequest from "../models/connections.model.js";
import nodemailer from "nodemailer";
import OTP from "../models/otp.model.js";



const convertUserDataTOPDF=(userData)=>{
   const doc=new PDFDocument();

   const outputPath=crypto.randomBytes(32)
   .toString('hex')+".pdf";
   const stream=fs.createWriteStream("uploads/"+outputPath);

   doc.pipe(stream);
   doc.image(`uploads/${userData.userId.profilePicture}`,
         {width:100,height:100,align:'center'});
         doc.fontSize(14).text(`Name: ${userData.userId.name}`);
         doc.fontSize(14).text(`Username: ${userData.userId.username}`);
         doc.fontSize(14).text(`Email: ${userData.userId.email}`);
         doc.fontSize(14).text(`Bio: ${userData.userId.bio}`);
         doc.fontSize(14).text(`Current Position: ${userData.userId.currentPosition}`);

      doc.fontSize(14).text("Past Work:")
      userData.pastWork.forEach((work,index)=>{
         doc.fontSize(14).text(`${index+1}. ${work.company} - ${work.position} (${work.startDate} - ${work.endDate})`);
         
      })


         doc.end();
         return outputPath;
}


export const sendOTP = async (req, res) => {
   try {
      const { email } = req.body;

      if (!email) {
         return res.status(400).json({
            message: "Email is required"
         });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
         return res.status(400).json({
            message: "Please enter a valid email address"
         });
      }

      // We intentionally DO NOT check User here.
      // Any valid email can receive an OTP.

      // Check if OTP was already requested within the last 60 seconds
const recentOTP = await OTP.findOne({
   email: normalizedEmail,
   createdAt: {
      $gt: new Date(Date.now() - 60 * 1000)
   }
});

if (recentOTP) {
   return res.status(429).json({
      message: "Please wait 60 seconds before requesting another OTP"
   });
}


      const otp = Math.floor(
         100000 + Math.random() * 900000
      ).toString();

      console.log("OTP GENERATED FOR:", normalizedEmail);

      const otpHash = await bcrypt.hash(otp, 10);

      // Delete previous OTP for this email
      await OTP.deleteMany({
         email: normalizedEmail
      });

      // Save new OTP
      const otpRecord = new OTP({
         email: normalizedEmail,
         otpHash: otpHash,
         expiresAt: new Date(Date.now() + 5 * 60 * 1000),
         attempts: 0
      });

      await otpRecord.save();

      const transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
         }
      });

      await transporter.sendMail({
   from: `"Pro Connect" <${process.env.EMAIL_USER}>`,
   to: normalizedEmail,
   subject: "Your Pro Connect Login OTP",

         text: `Your OTP is ${otp}. This OTP will expire in 5 minutes.`,

         html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
               
               <h2>Login Verification</h2>

               <p>Your OTP for login is:</p>

               <h1 style="letter-spacing: 8px;">
                  ${otp}
               </h1>

               <p>
                  This OTP will expire in 5 minutes.
               </p>

               <p>
                  If you did not request this OTP, please ignore this email.
               </p>

            </div>
         `
      });

      return res.status(200).json({
         message: "OTP sent successfully"
      });

   } catch (error) {

      console.log("SEND OTP ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};



export const verifyOTP = async (req, res) => {
   try {

      const { email, otp } = req.body;

      if (!email || !otp) {
         return res.status(400).json({
            message: "Email and OTP are required"
         });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Find OTP
      const otpRecord = await OTP.findOne({
         email: normalizedEmail
      });

      if (!otpRecord) {
         return res.status(400).json({
            message: "OTP not found or already used"
         });
      }

      // Check expiry
      if (new Date() > otpRecord.expiresAt) {

         await OTP.deleteOne({
            _id: otpRecord._id
         });

         return res.status(400).json({
            message: "OTP has expired"
         });
      }

      // Maximum 5 attempts
      if (otpRecord.attempts >= 5) {

         await OTP.deleteOne({
            _id: otpRecord._id
         });

         return res.status(429).json({
            message: "Too many incorrect attempts"
         });
      }

      // Compare OTP
      const isValidOTP = await bcrypt.compare(
         otp.toString(),
         otpRecord.otpHash
      );

      if (!isValidOTP) {

         otpRecord.attempts += 1;

         await otpRecord.save();

         return res.status(400).json({
            message: "Invalid OTP"
         });
      }

      // --------------------------------
      // FIND EXISTING USER
      // OR CREATE NEW USER
      // --------------------------------

      let user = await User.findOne({
         email: normalizedEmail
      });

      let isNewUser = false;

      if (!user) {

         isNewUser = true;

         // Generate username from email
         const baseUsername =
            normalizedEmail
               .split("@")[0]
               .replace(/[^a-zA-Z0-9]/g, "")
               .toLowerCase() || "user";

         let username = baseUsername;
         let counter = 1;

         // Make username unique
         while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
         }

         // User model requires password,
         // so generate a random internal password.
         const randomPassword = await bcrypt.hash(
            crypto.randomBytes(32).toString("hex"),
            10
         );

         user = new User({
            name: baseUsername,
            username: username,
            email: normalizedEmail,
            password: randomPassword,
            active: true
         });

         await user.save();

         // Create profile only once
         const profile = new Profile({
            userId: user._id
         });

         await profile.save();
      }

      // --------------------------------
      // GENERATE LOGIN TOKEN
      // --------------------------------

      const token = crypto.randomBytes(32).toString("hex");

      user.token = token;

      await user.save();

      // OTP can only be used once
      await OTP.deleteOne({
         _id: otpRecord._id
      });

      return res.status(200).json({

         message: isNewUser
            ? "Account created and login successful"
            : "OTP verified successfully",

         token: token,

         isNewUser: isNewUser,

         user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
         }

      });

   } catch (error) {

      console.log("VERIFY OTP ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};



export const register = async (req, res) => {
   try {
      console.log("REQ BODY =", req.body);

      const { name, email, password, username } = req.body;

      if (!name || !email || !password || !username) {
         return res.status(400).json({
            message: "All fields are required"
         });
      }

      const user = await User.findOne({
         email
      });

      if (user) {
         return res.status(400).json({
            message: "User already exists"
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
         name,
         email,
         password: hashedPassword,
         username
      });

      await newUser.save();

      const profile = new Profile({
         userId: newUser._id
      });

      await profile.save();

      return res.json({
         message: "User registered"
      });

   } catch (error) {

      console.log("ERROR =", error.message);

      if (error.code === 11000) {
         return res.status(400).json({
            message: "User already exists"
         });
      }

      return res.status(500).json({
         message: error.message
      });
   }
};


export const login= async(req,res)=>{
   try{
      const{email,password}=req.body; 
      if(!email || !password)return res.status(400).json({message:"All fields are required"});

 const user=await User.findOne({email});
      if(!user) return res.status(404).json({message:"User does not exist"});
      
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch) return res.status(400).json({message:"Invalid credentials"});
   

      const token=crypto.randomBytes(32).toString('hex');

      await User.updateOne({_id:user._id},{$set:{token}});
      return res.status(200).json({message:"Login successful",token});


   }catch(error){
   return res.status(500).json({
      message:error.message
   });
   

}};

export const uploadProfilePicture = async (req, res) => {
   try {

      const user = req.user;

      if (!user) {
         return res.status(401).json({
            message: "Unauthorized"
         });
      }

      user.profilePicture = req.file.path;

      await user.save();

      return res.status(200).json({
         message: "Profile picture uploaded"
      });

   } catch (error) {

      console.log("UPLOAD PROFILE PICTURE ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newuserData = req.body;

    const { username, email } = newuserData;

    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    Object.assign(user, newuserData);

    await user.save();

    return res.status(200).json({
      message: "Profile updated"
    });

  } catch (error) {
    console.log("UPDATE PROFILE ERROR =", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

export const getUserAndProfile = async (req, res) => {
   try {

      const user = req.user;

      const userProfile = await Profile.findOne({
         userId: user._id
      }).populate(
         "userId",
         "username name email profilePicture"
      );

      if (!userProfile) {
         return res.status(404).json({
            message: "Profile not found"
         });
      }

      return res.status(200).json(userProfile);

   } catch (error) {

      console.log("GET USER PROFILE ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};

export const updateProfileData = async (req, res) => {
   try {

      const user = req.user;

      if (!user) {
         return res.status(401).json({
            message: "Unauthorized"
         });
      }

      const newProfileData = req.body;

      const profile_to_update = await Profile.findOne({
         userId: user._id
      });

      if (!profile_to_update) {
         return res.status(404).json({
            message: "Profile not found"
         });
      }

      Object.assign(profile_to_update, newProfileData);

      await profile_to_update.save();

      return res.status(200).json({
         message: "Profile updated"
      });

   } catch (error) {

      console.log("UPDATE PROFILE DATA ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};

export const getAllUserProfile=async(req,res)=>{
   try{
      const profiles=await Profile.find().populate("userId","username name email profilePicture");
      return res.json({profiles});
   }
   catch(error){
      return res.status(500).json({message:error.message});
   }
}

export const downloadProfile=async(req,res)=>{
   const user_id=req.query.id;
   const userProfile=await Profile.findOne({userId:user_id})
   .populate("userId","username name email profilePicture");

   let outputPath=await convertUserDataTOPDF(userProfile);
   return res.json({"message":outputPath});
}


export const sendConnectionRequest = async (req, res) => {

   const { connectionId } = req.body;

   try {

      const user = req.user;

      if (!user) {
         return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("SENDER =", user);

      const connectionUser = await User.findOne({
         _id: connectionId
      });

      if (!connectionUser) {
         return res.status(404).json({
            message: "User not found"
         });
      }

      console.log("RECEIVER =", connectionUser);

      const existingRequest = await ConnectionRequest.findOne({
         userId: user._id,
         connectionId: connectionUser._id
      });

      if (existingRequest) {
         return res.status(400).json({
            message: "Connection request already sent"
         });
      }

      const request = new ConnectionRequest({
         userId: user._id,
         connectionId: connectionUser._id
      });

      await request.save();

      console.log("SAVED =", request);

      return res.status(200).json({
         message: "Connection request sent"
      });

   } catch (error) {

      console.log("SEND CONNECTION ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};

export const getMyConnectionsRequests = async (req, res) => {
   try {

      const user = req.user;

      if (!user) {
         return res.status(401).json({
            message: "Unauthorized"
         });
      }

      const requests = await ConnectionRequest.find({
         userId: user._id
      }).populate(
         "connectionId",
         "username name email profilePicture"
      );

      return res.json({ requests });

   } catch (error) {
      return res.status(500).json({
         message: error.message
      });
   }
};

export const whatAreMyConnections = async (req, res) => {

   try {

      const user = req.user;

      if (!user) {
         return res.status(401).json({
            message: "Unauthorized"
         });
      }

      const connections = await ConnectionRequest.find({
         connectionId: user._id
      }).populate(
         "userId",
         "username name email profilePicture"
      );

      return res.json({ connections });

   } catch (error) {
      return res.status(500).json({
         message: error.message
      });
   }
};


export const acceptConnectionRequest = async (req, res) => {
   try {

      const { connectionId, action_type } = req.body;

      const user = req.user;

      if (!user) {
         return res.status(401).json({
            message: "Unauthorized"
         });
      }

      const connection = await ConnectionRequest.findOne({
         _id: connectionId
      });

      if (!connection) {
         return res.status(404).json({
            message: "Request not found"
         });
      }

      if (action_type === "accept") {

         connection.status_accepted = true;

         await connection.save();

         return res.status(200).json({
            message: "Connection request accepted"
         });

      } else {

         connection.status_accepted = false;

         await connection.save();

         return res.json({
            message: "request updated"
         });
      }

   } catch (error) {

      console.log("ACCEPT CONNECTION ERROR =", error);

      return res.status(500).json({
         message: error.message
      });
   }
};

export const commentPost=async(req,res)=>{
   const{token,post_id,body}=req.body;

   try{


      const user=await User.findOne({token:token}).select("_id");
      if(!user){ return res.status(401).json({message:"User not found"})}
           const post=await Post.findOne({_id:post_id});
           if(!post) return res.status(404).json({message:"Post not found"});

           const comment=new Comment({
              userId:user._id,
              postId:post._id,
              body:body
           });

           await comment.save();

console.log("COMMENT SAVED =", comment);
           return res.status(200).json({message:"Comment added"});

   }catch(error){
      console.log(error);
      return res.status(500).json({message:error.message});
   }
}



export const getUserProfileAndUserBasedOnUsername=async(req,res)=>{
 console.log("params =", req.params);
   const {username}=req.params;

   console.log("username =", username);
   try{
     
      const user=await User.findOne({username});

      console.log("user =", user);
      if(!user) return res.status(401).json({message:"User not found"});
      
      const userProfile=await Profile.findOne({userId:user._id}).populate("userId","username name email profilePicture");
      return res.json({"profile":userProfile});
   }catch(error){
      return res.status(500).json({message:error.message});
   }
}

export const completeNewUserProfile = async (req, res) => {
  try {

    const { token, name, username } = req.body;

    if (!token || !name || !username) {
      return res.status(400).json({
        message: "Name, username and token are required"
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName || !normalizedUsername) {
      return res.status(400).json({
        message: "Name and username cannot be empty"
      });
    }

    // Find user using OTP-generated token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    // Check username already exists
    const existingUsername = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: user._id }
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    user.name = normalizedName;
    user.username = normalizedUsername;

    await user.save();

    return res.status(200).json({
      message: "Profile completed successfully",

      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {

    console.log(
      "COMPLETE PROFILE ERROR =",
      error
    );

    return res.status(500).json({
      message: error.message
    });

  }
};