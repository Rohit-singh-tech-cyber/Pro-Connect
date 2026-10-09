import DashboardLayout from '@/layout/DashboardLayout'
import React from 'react'
import UserLayout from '@/layout/UserLayout'
import { getAboutUser } from '@/config/redux/action/authAction'
import styles from "./index.module.css"
import { BASE_URL, clientServer } from '@/config'
import { useSelector ,useDispatch} from 'react-redux'
import { useEffect } from 'react'
import { useState } from 'react'
import { getAllPosts } from '@/config/redux/action/postAction';
// import { resetPostId } from '@/config/redux/reducer/postReducer'


export default function ProfilePage() {
      


const dispatch=useDispatch();


const [isModalOpen,setIsModalOpen]=useState(false);

const [inputData, setInputData] = useState({
  company:'',
  position:'',
  years:'',
})


const [educationModalOpen, setEducationModalOpen] = useState(false);

const [educationInput, setEducationInput] = useState({
  school: '',
  degree: '',
  years: ''
});

const handleEducationInputChange = (e) => {
  const { name, value } = e.target;

  setEducationInput({
    ...educationInput,
    [name]: value
  });
};


const handleWorkInputChange=(e)=>{
  
  const {name,value}=e.target;
  setInputData({...inputData,[name]:value});
}
  const authState=useSelector((state)=>state.auth);
  const postReducer=useSelector((state)=>state.postReducer);
  const [userProfile,setUserProfile]=useState({});
  const [password,setPassword]=useState("");
   const [userPosts,setUserPosts]=useState([]);

    useEffect(() => {
        dispatch(getAboutUser({token:localStorage.getItem("token")}));
        dispatch(getAllPosts());
    },[dispatch]);




// console.log(userPosts);
// console.log(typeof userPosts);


useEffect(()=>{

  if(authState.user!=undefined){
  setUserProfile(authState.user);
 let post =postReducer.posts.filter((post)=>{
  return post.userId.username===authState.user?.userId?.username
})

console.log(post,authState?.user?.userId?.username);
setUserPosts(post);
  }
},[authState.user,postReducer.posts])


const updateProfilePicture = async (file) => {
  try {

    const formData = new FormData();

    formData.append("profile_picture", file);

    // Keep token in FormData because the current backend controller
    // still reads it from req.body
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    console.log("PROFILE PICTURE UPLOAD =", response.data);

    dispatch(
      getAboutUser({
        token: localStorage.getItem("token")
      })
    );

  } catch (error) {

    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("ERROR:", error);

  }
};

const updateProfileData = async () => {
  const token = localStorage.getItem("token");

  const request = await clientServer.post(
    "/user_update",
    {
      name: userProfile?.userId?.name,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const response = await clientServer.post(
    "/update_profile_data",
    {
      bio: userProfile?.bio,
      currentPost: userProfile?.currentPost,
      pastWork: userProfile?.pastWork,
      education: userProfile?.education
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  dispatch(getAboutUser({ token }));
};


  return (


  <UserLayout>
    <DashboardLayout>
{authState?.user && userProfile?.userId &&
<div className={styles.container}>
      <div className={styles.backDropContainer}>

       <div className={styles.backDrop}>
        <label  htmlFor='profilePictureUpload' className={styles.backDrop_overlay}>
       <p>
        Edit
       </p>
       </label>

        <input   onChange={(e)=>updateProfilePicture(e.target.files[0])} 
        hidden type="file" id ="profilePictureUpload" />
       <img
  src={
    userProfile?.userId?.profilePicture
      ? `${BASE_URL}/${userProfile.userId.profilePicture.replace(/\\/g, "/")}`
      : `${BASE_URL}/uploads/default.jpg`
  }
  alt="Profile"
/>
        </div>
      </div>
   <div className={styles.profileContainer_details}>

  <div style={{ display: "flex", gap: "0.7rem" }}>

    <div style={{ flex: "0.8" }}>

      {/* Name + Username */}
      <div
        style={{
          display: "flex",
          width: "fit-content",
          alignItems: "center",
          gap: "1.2rem"
        }}
      >
        <input
          className={styles.nameEdit}
          type="text"
          value={userProfile?.userId?.name || ""}
          onChange={(e) =>
            setUserProfile({
              ...userProfile,
              userId: {
                ...userProfile?.userId,
                name: e.target.value
              }
            })
          }
        />

        <p style={{ color: "grey", margin: 0 }}>
          @{userProfile?.userId?.username}
        </p>
      </div>

      {/* Email */}
      <p style={{ color: "grey", margin: "5px 0 10px" }}>
        {userProfile?.userId?.email}
      </p>

      {/* Bio */}
      <div>
        <textarea
          value={userProfile?.bio || ""}
          onChange={(e) => {
            setUserProfile({
              ...userProfile,
              bio: e.target.value
            });
          }}
          rows={Math.max(
            1,
            Math.ceil((userProfile?.bio?.length || 0) / 80)
          )}
        />
      </div>

    </div>

<div style={{ flex: "0.3", minWidth: "280px" }}>

  <h3>Recent Activity</h3>

  {userPosts.map((post) => {

    return (
      <div
        key={post._id}
        className={styles.postCard}
      >

        <div className={styles.card_profileContainer}>

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
    <div className="workHistory">
      <h4>Work History</h4>


      <div className={styles.workHistoryContainer}>
  {
    userProfile?.pastWork?.map((work,index)=>{
      return(
        <div key={index} className={styles.workHistoryCard}>
          <p style={{fontWeight:"bold",display:"flex",gap:"0.8rem",alignItems:"center"}}>{work.company}-{work.position}</p>
          <p>{work.years}</p>
        </div>
      )
    })
  }

<button className={styles.addWorkButton} onClick={()=>{
  setIsModalOpen(true);
}

}>
  Add Work
  </button>
      

      </div>
    </div>


    <div className="workHistory">
  <h4>Education</h4>

  <div className={styles.workHistoryContainer}>

    {
      userProfile?.education?.map((education, index) => {
        return (
          <div key={index} className={styles.workHistoryCard}>

            <p
              style={{
                fontWeight: "bold",
                display: "flex",
                gap: "0.8rem",
                alignItems: "center"
              }}
            >
              {education.school} - {education.degree}
            </p>

            <p>{education.years}</p>

          </div>
        )
      })
    }

    <button
      className={styles.addWorkButton}
      onClick={() => {
        setEducationModalOpen(true);
      }}
    >
      Add Education
    </button>

  </div>
</div>

      {userProfile !=authState?.user && 
         < div onClick={()=>{
           updateProfileData();
         }}
       className={styles.connectionButton}>
        Update Profile
      </div>
      }


    </div>

}








{ isModalOpen && (
<div onClick={() => {
  setIsModalOpen(false);
}}
  className={styles.commentsContainer}>
  

  <div   onClick={(e)=>{e.stopPropagation()}} 
  className={styles.allCommentsContainer}>

<input onChange={handleWorkInputChange} name='company' className={styles.inputField} type="text" placeholder="Enter Company" />

<input onChange={handleWorkInputChange} name='position' className={styles.inputField} type="text" placeholder="Enter Position" />

<input onChange={handleWorkInputChange} name='years' className={styles.inputField} type="number" placeholder="Enter Years" />


<div onClick={()=>{
  setUserProfile({...userProfile,pastWork:[...userProfile.pastWork,inputData
  ]})
  setIsModalOpen(false)
}}

className={styles.connectionButton}>Add Work</div>
  </div>
</div>


)}


{educationModalOpen && (
  <div
    onClick={() => {
      setEducationModalOpen(false);
    }}
    className={styles.commentsContainer}
  >

    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={styles.allCommentsContainer}
    >

      <input
        onChange={handleEducationInputChange}
        name="school"
        className={styles.inputField}
        type="text"
        placeholder="Enter School / College"
      />

      <input
        onChange={handleEducationInputChange}
        name="degree"
        className={styles.inputField}
        type="text"
        placeholder="Enter Degree"
      />

      <input
        onChange={handleEducationInputChange}
        name="years"
        className={styles.inputField}
        type="text"
        placeholder="Enter Years"
      />

      <div
        onClick={() => {
          setUserProfile({
            ...userProfile,
            education: [
              ...(userProfile.education || []),
              educationInput
            ]
          });

          setEducationInput({
            school: "",
            degree: "",
            years: ""
          });

          setEducationModalOpen(false);
        }}
        className={styles.connectionButton}
      >
        Add Education
      </div>

    </div>

  </div>
)}
    </DashboardLayout>

  </UserLayout>

  )
}
