import React from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashboardLayout'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AcceptConnection, getConnectionRequests } from '@/config/redux/action/authAction'
import styles from "./index.module.css"
import { BASE_URL } from '@/config'
import { useRouter } from 'next/router'

export default function MyConnections() {


const dispatch=useDispatch();
const authState=useSelector((state)=>state.auth);

const router=useRouter();


useEffect(()=>{
  dispatch(getConnectionRequests({token:localStorage.getItem("token")}));
},[])

useEffect(()=>{
 if(authState.connectionRequests?.length!=0){
   console.log("CONNECTION REQUESTS =", authState.connectionRequests);
 }
},[authState.connectionRequests])


  return (
   <UserLayout>
     <DashboardLayout>
       <div className={styles.myConnectionsContainer}>


  <h4>My connections</h4>

          {!authState.isloading && authState.connectionRequests?.length===0 && <h1>No connection requests,pending</h1>}

{authState.connectionRequests?.filter((connection)=>connection.status_accepted===null)?.map((user,index)=>{
  return(
    <div
      onClick={()=>{router.push(`/view_profile/${user.userId.username}`)}}
      className={styles.userCard}
      key={index}
    >

      <div style={{
        display:"flex",
        alignItems:"baseline",
        gap:"1.2rem",
        justifyContent:"space-between"
      }}>

        <div className={styles.profilePicture}>
          <img
            src={
              user.userId?.profilePicture
                ? (
                    user.userId.profilePicture
                      .replace(/\\/g,"/")
                      .startsWith("uploads/")
                      ? `${BASE_URL}/${user.userId.profilePicture.replace(/\\/g,"/")}`
                      : `${BASE_URL}/uploads/${user.userId.profilePicture}`
                  )
                : `${BASE_URL}/uploads/default.jpg`
            }
            alt="Profile Picture"
          />
        </div>

        <div className={styles.userInfo}>
          <h3>{user.userId.name}</h3>
          <p>{user.userId.username}</p>
        </div>

        <button
          onClick={(e)=>{
            e.stopPropagation();

            dispatch(
              AcceptConnection({
                connectionId:user._id,
                token:localStorage.getItem("token"),
                action_type:"accept"
              })
            );
          }}
          className={styles.acceptButton}
        >
          Accept
        </button>

      </div>

    </div>
  )
})}

<h4>My Network</h4>
  {authState.connectionRequests?.map((user)=>  (
  <p key={user.id}>
      {user.id}
   </p>))}
     {authState.connectionRequests?.filter((connection)=>connection.status_accepted===true)?.map((user,index)=>{

     
     return(
      
     <div onClick={()=>
               {router.push(`/view_profile/${user.connectionId.username}`)}}
                className={styles.userCard} key={index}>

                <div style={{display:"flex",
                  alignItems:"baseline",
                  gap:"1.2rem",
                  justifyContent:"space-between"}}>
                
                <div className={styles.profilePicture}>
                  <img
  src={
    user.connectionId?.profilePicture
      ? (
          user.connectionId.profilePicture
            .replace(/\\/g, "/")
            .startsWith("uploads/")
            ? `${BASE_URL}/${user.connectionId.profilePicture.replace(/\\/g, "/")}`
            : `${BASE_URL}/uploads/${user.connectionId.profilePicture}`
        )
      : `${BASE_URL}/uploads/default.jpg`
  }
  alt="Profile Picture"
/>
                </div>
                <div className={styles.userInfo}>
                  <h3>{user?.connectionId?.name}</h3>
                  <p>{user?.connectionId?.username}</p>

                  </div>
                  </div>
                  </div>
  
       )  }
)}

       </div>


     </DashboardLayout>
   
    </UserLayout>
  )
}
