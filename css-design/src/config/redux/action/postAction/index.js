import {clientServer} from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts=createAsyncThunk(
    "posts/getAllPosts",
    async(_,thunkAPI)=>{
        try{
            const response=await clientServer.get("/api/posts/all");
            return response.data;
        }catch(error){
            return thunkAPI.rejectWithValue({
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Network Error"
            });
        }
    }
)

export const createPost= createAsyncThunk(
    "posts/createPost",
    async(userData,thunkAPI)=>{
         console.log("CREATE POST THUNK CALLED");

        const{file,body}=userData;
        try{

      const formData=new FormData();
      formData.append("token",localStorage.getItem("token"));
      formData.append("body",body);
      formData.append("media",file);
            
      



      const response=await clientServer.post("/api/posts/post",formData,{
        headers:{
            "Content-Type":"multipart/form-data"
        },
      
      });
        console.log("Post response",response);
          
      if(response.status===200){
        return thunkAPI.fulfillWithValue("Post Uploaded");
      }else{
        return thunkAPI.rejectWithValue("Post not uploaded");
      }

        }catch(error){
         
            return thunkAPI.rejectWithValue({
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Network Error"
            });
        }
    }
)


export const deletePost= createAsyncThunk(
    "posts/deletePost",
    async(post_id,thunkAPI)=>{
        try{
            const response=await clientServer.delete("/api/posts/deletepost",{
                data:{
                    token:localStorage.getItem("token"),
                    post_id:post_id.post_id
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(error){
            return thunkAPI.rejectWithValue({
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Network Error"
            });
        }
    }
)

export const  incrementPostLike=createAsyncThunk(
    "posts/incrementPostLike",
    async(post,thunkAPI)=>{
        try{
            const response=await clientServer.post("/api/posts/increment_post_like",{
              
                post_id:post.post_id
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(error){
            return thunkAPI.rejectWithValue({
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Network Error"
            });
        }
    }
)

export const getAllComments=createAsyncThunk(
    "posts/getAllComments",
    async(postData,thunkAPI)=>{
        try{
            const response=await clientServer.post("/api/posts/get_comments",{
                post_id:postData.post_id
            });
            return thunkAPI.fulfillWithValue({
                comments:response.data,
                post_id:postData.post_id});
        }catch(error){
            return thunkAPI.rejectWithValue({
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Network Error"
            });
        }
    }
)

export const postComment=createAsyncThunk(
    "posts/postComment",
    async(commentData,thunkAPI)=>{
        try{
            console.log({
                post_id:commentData.post_id,
                body:commentData.body
            })
            const response=await clientServer.post("/api/posts/comment",{
                token:localStorage.getItem("token"),
                post_id:commentData.post_id,
               body:commentData.body
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(error){
            return thunkAPI.rejectWithValue({
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Network Error"
            });
        }
    })