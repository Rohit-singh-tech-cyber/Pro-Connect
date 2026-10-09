import React from 'react'
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { clientServer } from "@/config";
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import styles from "./index.module.css"
import { BASE_URL } from '@/config';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionRequests } from '@/config/redux/action/authAction';
// import {isCurrentUserInConnection} from "@/config/redux/reducer/authReducer";
import { sendConnectionRequest } from '@/config/redux/action/authAction';
import { getMyConnectionRequests } from '@/config/redux/action/authAction';

export default function ViewProfilePage({userProfile}) {

 const router=useRouter();
 const postReducer=useSelector((state)=>state.postReducer);
 const dispatch=useDispatch();
 const authState=useSelector((state)=>state.auth);
 const[userPosts,setUserPosts]=useState([]);
 const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
const [isConnectionNull,setIsConnectionNull]=useState(true);

const getUsersPosts = async () => {

   const token = localStorage.getItem("token");

   await dispatch(getAllPosts());

   await dispatch(
      getMyConnectionRequests({ token })
   );
};

useEffect(() => {

    const targetUserId = userProfile?.userId?._id;

    if (!targetUserId) return;

    console.log("TARGET USER =", targetUserId);
    console.log("CONNECTION REQUESTS =", authState.connectionRequests);

    const sentRequest = authState.connectionRequests?.find(
        (request) =>
            request.connectionId?._id === targetUserId ||
            request.connectionId === targetUserId
    );

    if (sentRequest) {

        setIsCurrentUserInConnection(true);

        if (sentRequest.status_accepted === true) {
            setIsConnectionNull(false);
        } else {
            setIsConnectionNull(true);
        }

    } else {

        setIsCurrentUserInConnection(false);
        setIsConnectionNull(true);

    }

}, [
    authState.connectionRequests,
    userProfile
]);


useEffect(()=>{
  getUsersPosts();
},[]);




  console.log("userProfile =", userProfile);


    const searchParamers=useSearchParams();

    useEffect(()=>{
        console.log(" From View:View Profile")
    })
   return (
  <UserLayout>

    <DashboardLayout>

      <div className={styles.container}>

        <div className={styles.backDropContainer}>

          <img
            className={styles.backDrop}
            src={
              userProfile?.userId?.profilePicture
                ? userProfile.userId.profilePicture
                    .replace(/\\/g, "/")
                    .startsWith("uploads/")
                  ? `${BASE_URL}/${userProfile.userId.profilePicture.replace(/\\/g, "/")}`
                  : `${BASE_URL}/uploads/${userProfile.userId.profilePicture}`
                : `${BASE_URL}/uploads/default.jpg`
            }
            alt=""
          />

        </div>


        <div className={styles.profileContainer_details}>

          <div
            style={{
              display: "flex",
              gap: "0.7rem"
            }}
          >

            {/* LEFT SIDE */}

            <div style={{ flex: "0.8" }}>

              <div
                style={{
                  display: "flex",
                  width: "fit-content",
                  alignItems: "center",
                  gap: "1.2rem"
                }}
              >

                <h2>{userProfile.userId.name}</h2>

                <p style={{ color: "grey" }}>
                  @{userProfile.userId.username}
                </p>

              </div>


              {/* CONNECT + DOWNLOAD */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem"
                }}
              >

                {isCurrentUserInConnection ? (

                  <button
                    type="button"
                    className={styles.connectedButton}
                  >
                    {isConnectionNull ? "Pending" : "Connected"}
                  </button>

                ) : (

                  <button
                    type="button"
                   onClick={async () => {

  const token = localStorage.getItem("token");

  const result = await dispatch(
    sendConnectionRequest({
      token: token,
      connectionId: userProfile?.userId?._id
    })
  );

  if (result.meta.requestStatus === "fulfilled") {
    setIsCurrentUserInConnection(true);
    setIsConnectionNull(true);
  }

}}
                    className={styles.connectButton}
                  >
                    Connect
                  </button>

                )}


                {/* DOWNLOAD RESUME */}

                <div
                  onClick={async () => {

                   const response = await clientServer.get(
  `/user/download_resume?id=${userProfile.userId._id}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);

                    window.open(
  `${BASE_URL}/uploads/${response.data.message}`,
  "_blank"
);

                  }}
                  style={{ cursor: "pointer" }}
                >

                  <svg
                    style={{ width: "20px" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />

                  </svg>

                </div>

              </div>


              {/* BIO */}

              <div>

                <p>{userProfile.bio}</p>

              </div>

            </div>


            {/* RECENT ACTIVITY */}

            <div style={{ flex: "0.2" }}>

              <h3>Recent Activity</h3>

              {userPosts.map((post) => {

                return (

                  <div
                    key={post._id}
                    className={styles.postCard}
                  >

                    <div
                      className={styles.card_profileContainer}
                    >

                      {post.media !== "" ? (

                        <img
                          src={`${BASE_URL}/uploads/${post.media}`}
                          alt="post"
                        />

                      ) : (

                        <div
                          style={{
                            width: "3.4rem",
                            height: "3.4rem"
                          }}
                        ></div>

                      )}

                    </div>

                    <p>{post.body}</p>

                  </div>

                );

              })}

            </div>

          </div>

        </div>


        {/* WORK HISTORY */}

        <div className="workHistory">

          <h4>Work History</h4>

          <div className={styles.workHistoryContainer}>

            {userProfile.pastWork.map((work, index) => {

              return (

                <div
                  key={index}
                  className={styles.workHistoryCard}
                >

                  <p
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      gap: "0.8rem",
                      alignItems: "center"
                    }}
                  >
                    {work.company} - {work.position}
                  </p>

                  <p>{work.years}</p>

                </div>

              );

            })}

          </div>

        </div>

      </div>

    </DashboardLayout>

  </UserLayout>
);
}

export async function getServerSideProps(context){
  try{


  const username=context.params.username
 
  console.log("From View")
  console.log(context.query.username)

  const request =await clientServer.get(`/user/get_profile_based_on_username/${username}`
  
);
const response=await request.data;
 console.log(response);
  
return {props:{userProfile:request.data.profile}}
}
catch(error){
  console.log("ERROR =", error.response?.data?.message || error.message || "Network Error");
  return {
      notFound: true,
    };

}}
