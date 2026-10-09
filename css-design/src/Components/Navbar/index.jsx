import React from 'react';
import styles from "./styles.module.css";
import {useRouter} from "next/router";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { reset } from '@/config/redux/reducer/authReducer';

export default function NavbarComponent() {

  const router=useRouter();
    


  const dispatch=useDispatch();
  const authState=useSelector((state)=>state.auth);
  console.log(authState);
 
  return (

    <div className={styles.conatiner}>
     

      <nav className={styles.navbar}>
        <h1 onClick={()=>{
          router.push("/")
        }}>Pro Connect</h1>



        <div className={styles.navBarOptionContainer}>
        
        {authState.profileFetched && 
          <div >
            <div style={{display:"flex",gap:"1.2rem"}}>
            {/* <p>Hey,{authState.user?.userId?.name}</p> */}
          <p  onClick={() => {router.push("/profile")}} 
          style={{fontWeight:"bold",cursor:"pointer"}}>Profile</p>

           <p
  onClick={() => {

    // Clear authentication token
    localStorage.removeItem("token");

    // Clear Redux authentication state
    dispatch(reset());

    // Go to login page
    router.replace("/login");

  }}
  style={{
    fontWeight: "bold",
    cursor: "pointer"
  }}
>
  LogOut
</p>


        </div>
      </div>}


          {!authState.profileFetched && 
          <div onClick={()=>{
            router.push("/login")
          }} className={styles.buttonJoin}>
            <p>Be a Part</p>
        </div>}
        </div>
      </nav>
    </div>
  )
}
