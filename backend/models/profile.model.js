import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    school: {
        type: String
    },
    degree: {
        type: String
    },
    fieldOfStudy: {
        type: String
    }
});

const workSchema = new mongoose.Schema({
    company: {
        type: String
    },
    position: {
        type: String
    },
    years: {
        type: Number
    }
});

const profileSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    bio: {
        type: String,
        default:''
    },

    currentPost: {
        type: String,
         default:''
    },

    pastWork: {
        type: [workSchema]
    },

    education: {
        type: [educationSchema]
    }

}, 
{ timestamps: true });

export default mongoose.model("Profile", profileSchema);