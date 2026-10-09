import React, { useDebugValue } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashboardLayout'
import { getAllUsers } from '@/config/redux/action/authAction'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
// import authState from '@/config/redux/reducer/authReducer'
import { BASE_URL } from '@/config'
import styles from "./index.module.css";
import { useRouter } from 'next/router'


export default function Discoverpage() {
  // console.log("discover page");

const authState=useSelector((state)=>state.auth);
  const dispatch=useDispatch();

  
  useEffect(() => {
    console.log("discover mounted")
    if(!authState.all_profiles_fetched){
      dispatch(getAllUsers());
    }
  },[]);


  const router=useRouter();

  return (
   <UserLayout>
     <DashboardLayout>
       <div>
         <h1>Discover</h1>

             <div className={styles.allUserProfile}>
               {authState.all_profiles_fetched && authState.all_users.profiles.map((user) => {


                    console.log("BASE_URL =", BASE_URL);
console.log("PROFILE PICTURE =", user?.userId?.profilePicture);
console.log(
  "IMAGE URL =",
  `${BASE_URL}/${user?.userId?.profilePicture.replace(/\\/g, "/")}`
);
  console.log("FULL USER =", user);
  console.log("USERNAME =", user?.userId?.username);
                 return(
                   <div onClick={()=>{
                    alert(user?.userId?.username);
                    console.log(user);
                    router.push(`/view_profile/${user?.userId?.username}`);
                   }}
                    key={user._id} className={styles.userCard}>
                     <img className={styles.userCard_image}
               src={
    user?.userId?.profilePicture === "default.jpg"
      ? `${BASE_URL}/uploads/default.jpg`
      : `${BASE_URL}/${user?.userId?.profilePicture.replace(/\\/g, "/")}`
  }
              alt="Profile Pic" />
           
                     <div>
                     <h1>{user?.userId?.name}</h1>
                     <p>{user?.userId?.username}</p>
                     </div>
                   </div>
                 )
                 
               })}


             </div>


       </div>
     </DashboardLayout>
   
    </UserLayout>
  )
}
