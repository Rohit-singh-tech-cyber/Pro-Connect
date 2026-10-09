import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";
// import { otpLoginSuccess } from "../reducer/authReducer";

export const loginUser=createAsyncThunk(
    "user/login",
    async(user,thunkAPI)=>{
        try{
            const response=await clientServer.post(`/login`,{
                email:user.email,
                password:user.password,
            });
        if(response.data.token){
            localStorage.setItem("token",response.data.token);
        }else{
            return thunkAPI.rejectWithValue({
                message:"token not provided"
            });
        }
            
            return  thunkAPI.fulfillWithValue(response.data.token);

        }catch(error){
    console.log(error);

    return thunkAPI.rejectWithValue({
        message:
            error.response?.data?.message ||
            error.message ||
            "Network Error"
    });
}
    }
)

export const registerUser= createAsyncThunk(
    "user/register",
    async(user,thunkAPI)=>{
        try{
            const request =await clientServer.post("/register",{
                name:user.name,
                email:user.email,
                password:user.password,
                username:user.username
            });
            return request.data;
        }catch(error){
    console.log("ERROR =", error);
    console.log("MESSAGE =", error.message);
    console.log("RESPONSE =", error.response);
    console.log("REQUEST =", error.request);

    return thunkAPI.rejectWithValue({
        message: error.message
    });
}
    });

    export const getAboutUser=createAsyncThunk(
        "user/getAboutUser",
        async(user,thunkAPI)=>{
            try{
                const response=await clientServer.post("/get_user_and_profile",
                    {},
                {

                    
                         headers: {
         Authorization: `Bearer ${user.token}`
      }}
              );
                return thunkAPI.fulfillWithValue(response.data);
            }catch(error){
                return thunkAPI.rejectWithValue(error.response.data);
            }
        }
    )
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/user/get_all_users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      return thunkAPI.fulfillWithValue(response.data);

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async (user, thunkAPI) => {
        console.log("USER =", user);

        try {
            const response = await clientServer.post(
                "/user/send_connection_request",
                {
                    connectionId: user.connectionId
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            console.log("SUCCESS =", response.data);

            thunkAPI.dispatch(
                getConnectionRequests({ token: user.token })
            );

            return thunkAPI.fulfillWithValue(response.data);

        } catch(error){
    console.log("STATUS =", error.response?.status);
    console.log("ERROR DATA =", error.response?.data);
    console.log("ERROR MESSAGE =", error.response?.data?.message);
    console.log("FULL ERROR =", error);
    
    return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
    );
}
    }
);

export const getConnectionRequests = createAsyncThunk(
    "user/getConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get(
                "/user/getConnectionRequests",
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            return thunkAPI.fulfillWithValue(
                response.data.requests
            );

        } catch (error) {
            console.log(
                "GET CONNECTION ERROR =",
                error.response?.data || error.message
            );

            return thunkAPI.rejectWithValue(
                error.response?.data || {
                    message: error.message
                }
            );
        }
    }
);

export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/user/user_connection_request",
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      return thunkAPI.fulfillWithValue(response.data.connections);

    } catch (error) {
      console.log(
        "GET MY CONNECTION REQUESTS ERROR =",
        error.response?.data || error.message
      );

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);
export const AcceptConnection = createAsyncThunk(
    "user/AcceptConnection",
    async (data, thunkAPI) => {
        try {

            const response = await clientServer.post(
                "/user/accept_connection_request",
                {
                    connectionId: data.connectionId,
                    action_type: data.action_type
                },
                {
                    headers: {
                        Authorization: `Bearer ${data.token}`
                    }
                }
            );

            thunkAPI.dispatch(
                getConnectionRequests({ token: data.token })
            );

            thunkAPI.dispatch(
                getMyConnectionRequests({ token: data.token })
            );

            return thunkAPI.fulfillWithValue(response.data);

        } catch (error) {

            console.log(
                "ACCEPT CONNECTION ERROR =",
                error.response?.data || error.message
            );

            return thunkAPI.rejectWithValue(
                error.response?.data || {
                    message: error.message
                }
            );
        }
    }
);


export const loginWithOTP = createAsyncThunk(
    "user/loginWithOTP",

    async ({ email, otp }, thunkAPI) => {

        try {

            const response = await clientServer.post(
                "/verify-otp",
                {
                    email,
                    otp
                }
            );

            console.log(
                "VERIFY OTP BACKEND RESPONSE =",
                response.data
            );

            if (!response.data.token) {

                return thunkAPI.rejectWithValue({
                    message: "Token not provided"
                });

            }

            localStorage.setItem(
                "token",
                response.data.token
            );

            return response.data;

        } catch (error) {

            console.log(
                "LOGIN WITH OTP ERROR =",
                error
            );

            return thunkAPI.rejectWithValue({

                message:
                    error.response?.data?.message ||
                    error.message ||
                    "OTP verification failed"

            });

        }

    }
);

export const completeNewUserProfile = createAsyncThunk(
  "user/completeNewUserProfile",

  async ({ token, name, username }, thunkAPI) => {

    try {

      const response = await clientServer.post(
        "/complete-profile",
        {
          token,
          name,
          username
        }
      );

      return response.data;

    } catch (error) {

      return thunkAPI.rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Profile completion failed"
      });

    }

  }
);