import { createSlice } from "@reduxjs/toolkit";
import { getConnectionRequests, getMyConnectionRequests, loginUser, registerUser ,AcceptConnection} from "../../action/authAction";
import { getAboutUser } from "../../action/authAction";
import { getAllUsers } from "../../action/authAction";

const initialState={
    user:undefined,
    isError:false,
    isSuccess:false,
    isLoading:false,
    isLoggedIn:false,
    message:"",
    isTokenThere:false,
    profileFetched:false,
    connections:[],
    connectionRequests:[],
    all_users:[],
    all_profiles:[],
    all_profiles_fetched:false
}


const authSlice=createSlice({
    name:"auth",
    initialState,
   
    reducers:{
   reset:()=>initialState,

   handleLoginUser:(state)=>{
      state.message="hello";
   },

   emptyMessage:(state)=>{
      state.message=""
   },

   setTokenIsThere:(state)=>{
      state.isTokenThere=true;
   },

   setTokenIsNotThere:(state)=>{
      state.isTokenThere=false;
   },

   // NEW
   otpLoginSuccess:(state)=>{
      state.isLoggedIn=true;
      state.isTokenThere=true;
      state.isError=false;
      state.isSuccess=true;
      state.message="Login successful";
   },

   // NEW
   logoutUser:(state)=>{
      state.user=undefined;
      state.isLoggedIn=false;
      state.isTokenThere=false;
      state.profileFetched=false;
      state.message="";
   }
},
    extraReducers:(builder)=>{

       builder
       .addCase(loginUser.pending,(state)=>{
         state.isLoading=true;   

        })

  .addCase(loginUser.fulfilled,(state,action)=>{
           
           state.isLoading=false;
           state.isError=false;
           state.isSuccess=true;
           state.isLoggedIn=true,
           state.isTokenThere=true;
            state.message="Login successful";
        })
        
 .addCase(loginUser.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true
            state.message=action.payload?.message||action.error?.message||"Login failed,please try again";
        })
     .addCase(registerUser.pending,(state)=>{
            state.isLoading=true;   
        //    state.message="knocking the door...";
           })
         .addCase(registerUser.fulfilled,(state,action)=>{
              
              state.isLoading=false;
              state.isError=false;
              state.isSuccess=true;
              state.isLoggedIn=false;
               state.message="registration is successful,please login to continue";
          
       })
           
     .addCase(registerUser.rejected,(state,action)=>{
               state.isLoading=false;
               state.isError=true;
               state.isSuccess=false;
               state.message=action.payload?.message|| action.error?.message ||"Registrration failed,please try again";
           })
          .addCase(getAboutUser.pending, (state) => {
    state.isLoading = true;
})
           .addCase(getAboutUser.fulfilled,(state,action)=>{
            console.log(action.payload);
               state.isLoading=false;
               state.isError=false;
               state.profileFetched=true;
               state.user=action.payload;
               state.connections=action.payload.connections;
               state.connectionRequests=action.payload.connectionRequests;
           })


  .addCase(getAboutUser.rejected, (state, action) => {
    state.isLoading = false;
    state.isError = true;
    state.user = undefined; // reset karo
})
           .addCase(getAllUsers.fulfilled,(state,action)=>{
            
               state.isLoading=false;
               state.isError=false;
              state.all_profiles_fetched=true;
               state.all_users=action.payload;
                state.all_profiles = action.payload.profiles;
               state.connections=action.payload.connections;
               state.connectionRequests=action.payload.connectionRequests;
           })

           .addCase(getConnectionRequests.fulfilled,(state,action)=>{
            //  console.log("GET CONNECTION REQUESTS PAYLOAD =", action.payload);
               state.connectionRequests=action.payload
           })
        .addCase(getConnectionRequests.rejected,(state,action)=>{
           
            state.message=action.payload
        })

        .addCase(getMyConnectionRequests.fulfilled,(state,action)=>{
            console.log("GET MY CONNECTION REQUESTS PAYLOAD =", action.payload);
            state.connectionRequests=action.payload || [];
            // console.log(`   FROM REDUCER STATE CONNECTIONS `state.connectionRequest)
        })
        .addCase(getMyConnectionRequests.rejected,(state,action)=>{
            state.message=action.payload
        })
        
        .addCase(getMyConnectionRequests.pending,(state,action)=>{
            state.isLoading=true;
        })

       
 }
 })
    export const{
   reset,
   emptyMessage,
   setTokenIsThere,
   setTokenIsNotThere,
   otpLoginSuccess,
   logoutUser
}=authSlice.actions;
export default authSlice.reducer;

