import {Router} from "express";
import { register, whatAreMyConnections,sendOTP,completeNewUserProfile } from "../controllers/user.controller.js";
const router=Router();
import { login } from "../controllers/user.controller.js";
import multer from "multer";
import { uploadProfilePicture } from "../controllers/user.controller.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import { getUserAndProfile } from "../controllers/user.controller.js";
import { updateProfileData } from "../controllers/user.controller.js";
import { getAllUserProfile } from "../controllers/user.controller.js";
import { downloadProfile } from "../controllers/user.controller.js";
import { sendConnectionRequest } from "../controllers/user.controller.js";
import { getMyConnectionsRequests } from "../controllers/user.controller.js";
import { acceptConnectionRequest } from "../controllers/user.controller.js";
import { getUserProfileAndUserBasedOnUsername } from "../controllers/user.controller.js";
import {verifyOTP} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";


const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads/');
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});
const upload=multer({storage:storage})

router.route('/update_profile_picture')
.post(
  authenticateUser,
  upload.single('profile_picture'),
  uploadProfilePicture
);


router.route('/register').post(register);
router.route('/login').post(login);
router.route('/send-otp').post(sendOTP);
router.route("/verify-otp").post(verifyOTP);
router.route("/user_update").post(authenticateUser,updateUserProfile);
router.post(
  "/complete-profile",
  completeNewUserProfile
);
router.route("/get_user_and_profile").post(authenticateUser,getUserAndProfile);
router.route("/update_profile_data").post(authenticateUser, updateProfileData);
router.route("/user/get_all_users").get(authenticateUser,getAllUserProfile);
router.route("/user/download_resume").get(authenticateUser,downloadProfile);
router.route("/user/send_connection_request").post(authenticateUser,sendConnectionRequest);
router.route("/user/getConnectionRequests").get(authenticateUser, getMyConnectionsRequests);
router.route("/user/user_connection_request").get(authenticateUser, whatAreMyConnections);
router.route("/user/accept_connection_request").post(authenticateUser, acceptConnectionRequest);
router.route("/user/get_profile_based_on_username/:username").get( getUserProfileAndUserBasedOnUsername);
export default router;