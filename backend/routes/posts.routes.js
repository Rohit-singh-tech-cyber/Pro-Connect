import {Router} from "express";
import multer from "multer";
import { runningCheck} from "../controllers/posts.controller.js";
import {createPost} from "../controllers/posts.controller.js";
import {getAllPosts} from "../controllers/posts.controller.js";
import {deletePost, delete_comment_of_user, increment_likes, get_comments_by_post} from "../controllers/posts.controller.js";
import {commentPost} from "../controllers/user.controller.js"
const router=Router();

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads");
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});

const upload=multer({storage:storage})
router.route('/').get(runningCheck)
router.route("/post").post(upload.single('media'),createPost);

router.route("/all").get(getAllPosts);
router.route("/deletepost").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").post(get_comments_by_post);
router.route("/delete_comment").post(delete_comment_of_user);
router.route("/increment_post_like").post(increment_likes);


export default router;