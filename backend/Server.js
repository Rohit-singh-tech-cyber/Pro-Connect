// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// // import dotenv from "dotenv";
// import mongoose from "mongoose";
// import postRoutes from "./routes/posts.routes.js";
// import userRoutes from "./routes/user.routes.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, "../.env")
});
console.log("ENV FILE TEST =", process.env.EMAIL_USER);
console.log(
    "ENV PASSWORD TEST =",
    process.env.EMAIL_PASS ? "LOADED" : "NOT LOADED"
);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

// dotenv.config();
const app=express();


app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/api/posts", postRoutes);
app.use(userRoutes);
app.use("/uploads",express.static("uploads"));
// src=`${BASE_URL}/${user.userId.profilePicture.replace(/\\/g, "/")}`

const start=async()=>{
    const connectDB=await mongoose.connect("mongodb+srv://srishtishukla0906_db_user:pvarVgVWf0eAsME4@linkedinclone.pejj31e.mongodb.net/?appName=LinkedinClone");


    app.listen(9090,()=>{
      console.log("Server is running on port 9090");
    });
}
start();


