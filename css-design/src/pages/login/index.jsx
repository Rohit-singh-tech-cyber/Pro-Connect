import UserLayout from '@/layout/UserLayout'
// import React,{useEffect} from 'react'
import styles from "./styles.module.css"
import { useSelector,useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { registerUser,loginWithOTP,completeNewUserProfile } from '@/config/redux/action/authAction'
import { emptyMessage } from '@/config/redux/reducer/authReducer'
import React, { useEffect, useRef } from 'react'




export default function LoginComponent(){

 const authState=useSelector((state)=>state.auth);
 const router=useRouter();

 const dispatch=useDispatch();


const [userLoginMethod,setUserLoginMethod]=useState(true);
const [email,setEmailAddress]=useState("");
const [password,setPassword]=useState("");
const [username,setUsername]=useState("");
const[name,setName]=useState("");


const [otp, setOtp] = useState("");
const [otpSent, setOtpSent] = useState(false);
const [otpLoading, setOtpLoading] = useState(false);
const [otpMessage, setOtpMessage] = useState("");

const [resendTimer, setResendTimer] = useState(0);


const [isNewUser, setIsNewUser] = useState(false);
const [profileName, setProfileName] = useState("");
const [profileUsername, setProfileUsername] = useState("");
const [profileLoading, setProfileLoading] = useState(false);
const [profileMessage, setProfileMessage] = useState("");

 useEffect(() => {
  if(authState.isLoggedIn){
    router.push("/dashboard");
  }
},[authState.isLoggedIn]);


const isMounted = useRef(false);

useEffect(() => {
    if(isMounted.current){
        dispatch(emptyMessage());
    }else{
        isMounted.current = true;
    }
}, [userLoginMethod]);

useEffect(() => {

  if (resendTimer <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setResendTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);

}, [resendTimer]);

 const handleRegister=()=>{
  console.log("registering..");
  dispatch(registerUser({username,password,email,name}));
 }

 const handleSendOTP = async () => {
  if (!email.trim()) {
    setOtpMessage("Please enter your email");
    return;
  }

  try {
    setOtpLoading(true);
    setOtpMessage("");

    const response = await fetch("http://localhost:9090/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setOtpMessage(data.message || "Failed to send OTP");
      return;
    }

    setOtpSent(true);
setOtp("");
setResendTimer(60);

setOtpMessage(
  "OTP sent successfully. Please check your email."
);

  } catch (error) {
    console.log("SEND OTP ERROR =", error);
    setOtpMessage("Something went wrong while sending OTP");
  } finally {
    setOtpLoading(false);
  }
};



const handleResendOTP = async () => {

  if (resendTimer > 0) {
    return;
  }

  if (!email.trim()) {
    setOtpMessage("Please enter your email");
    return;
  }

  try {

    setOtpLoading(true);
    setOtpMessage("");

    const response = await fetch(
      "http://localhost:9090/send-otp",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      setOtpMessage(
        data.message || "Failed to resend OTP"
      );

      return;
    }

    // New OTP sent
    setOtp("");
    setResendTimer(60);

    setOtpMessage(
      "New OTP sent successfully. Please check your email."
    );

  } catch (error) {

    console.log(
      "RESEND OTP ERROR =",
      error
    );

    setOtpMessage(
      "Something went wrong while resending OTP"
    );

  } finally {

    setOtpLoading(false);

  }
};

const handleVerifyOTP = async () => {

  if (!otp.trim()) {
    setOtpMessage("Please enter the OTP");
    return;
  }

  if (otp.length !== 6) {
    setOtpMessage("Please enter the 6 digit OTP");
    return;
  }

  try {

    setOtpLoading(true);
    setOtpMessage("");

    console.log("VERIFY OTP START");
    console.log("EMAIL =", email);
    console.log("OTP =", otp);

    const result = await dispatch(
      loginWithOTP({
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      })
    );

    console.log("VERIFY OTP REDUX RESULT =", result);

    if (loginWithOTP.fulfilled.match(result)) {

  console.log("OTP LOGIN SUCCESS =", result.payload);

  if (result.payload.isNewUser) {

    setIsNewUser(true);
    setOtpMessage("");

  } else {

    setOtpMessage("Login successful!");
    router.push("/dashboard");

  }

}
    else {

      console.log("OTP LOGIN FAILED =", result);

      setOtpMessage(
        result.payload?.message ||
        result.error?.message ||
        "OTP verification failed"
      );
    }

  } catch (error) {

    console.log("VERIFY OTP CATCH ERROR =", error);

    setOtpMessage(
      error.message ||
      "Something went wrong while verifying OTP"
    );

  } finally {

    setOtpLoading(false);

  }
};

const handleCompleteProfile = async () => {

  if (!profileName.trim()) {
    setProfileMessage("Please enter your name");
    return;
  }

  if (!profileUsername.trim()) {
    setProfileMessage("Please enter a username");
    return;
  }

  try {

    setProfileLoading(true);
    setProfileMessage("");

    const token = localStorage.getItem("token");

    const result = await dispatch(
      completeNewUserProfile({
        token,
        name: profileName.trim(),
        username: profileUsername.trim()
      })
    );

    if (completeNewUserProfile.fulfilled.match(result)) {

      setProfileMessage(
        "Profile completed successfully!"
      );

      router.push("/dashboard");

    } else {

      setProfileMessage(
        result.payload?.message ||
        "Unable to complete profile"
      );

    }

  } catch (error) {

    console.log(
      "COMPLETE PROFILE ERROR =",
      error
    );

    setProfileMessage(
      "Something went wrong"
    );

  } finally {

    setProfileLoading(false);

  }
};


  return (
  <UserLayout>

    <div className={styles.container}>

    <div className={styles.cardContainer} >

<div className={styles.cardContainer_left}>

<p className={styles.cardleft_heading}> {userLoginMethod ? "SignUp" : "Login"}</p>

{authState.message && <p style={{color:authState.isError? "red":"green"}}>{authState.message}</p>
}
<div className={styles.inputContainer}>
 
  
  { userLoginMethod && <div className={styles.inputRow}>

  <input onChange={(e)=>setUsername(e.target.value)} className={styles.inputField} type="text" placeholder="Username" />
  <input onChange={(e)=>setName(e.target.value)} className={styles.inputField} type="text" placeholder="Name" />
  
</div>}

<input
  onChange={(e) => setEmailAddress(e.target.value)}
  className={styles.inputField}
  type="email"
  placeholder="Email"
/>

{userLoginMethod && (
  <input
    onChange={(e) => setPassword(e.target.value)}
    className={styles.inputField}
    type="password"
    placeholder="Password"
  />
)}

{userLoginMethod ? (

  <div
    onClick={handleRegister}
    className={styles.buttonWithoutline}
  >
    <p>SignUp</p>
  </div>

) : (

 <>
  {!isNewUser ? (

    <>
      {!otpSent ? (

        <div
          onClick={handleSendOTP}
          className={styles.buttonWithoutline}
        >
          <p>
            {otpLoading ? "Sending OTP..." : "Send OTP"}
          </p>
        </div>

      ) : (

        <>
          <input
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setOtp(value);
            }}
            value={otp}
            className={styles.inputField}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
          />

          <div
            onClick={handleVerifyOTP}
            className={styles.buttonWithoutline}
          >
            <p>
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </p>
          </div>

          <div
  onClick={
    resendTimer === 0 && !otpLoading
      ? handleResendOTP
      : undefined
  }
  style={{
    textAlign: "center",
    marginTop: "10px",
    cursor: resendTimer === 0 ? "pointer" : "default",
    opacity: resendTimer === 0 ? 1 : 0.5,
  }}
>
  <p>
    {resendTimer > 0
      ? `Resend OTP in ${resendTimer}s`
      : "Resend OTP"}
  </p>
</div>
        </>

      )}

      {otpMessage && (
        <p
          style={{
            color: otpMessage
              .toLowerCase()
              .includes("success")
              ? "green"
              : "red"
          }}
        >
          {otpMessage}
        </p>
      )}
    </>

  ) : (

    <>
      <p style={{ textAlign: "center" }}>
        Complete your profile
      </p>

      <input
        onChange={(e) => setProfileName(e.target.value)}
        value={profileName}
        className={styles.inputField}
        type="text"
        placeholder="Full Name"
      />

      <input
        onChange={(e) => setProfileUsername(e.target.value)}
        value={profileUsername}
        className={styles.inputField}
        type="text"
        placeholder="Username"
      />

      <div
        onClick={handleCompleteProfile}
        className={styles.buttonWithoutline}
      >
        <p>
          {profileLoading ? "Saving..." : "Complete Profile"}
        </p>
      </div>

      {profileMessage && (
        <p
          style={{
            color: profileMessage
              .toLowerCase()
              .includes("success")
              ? "green"
              : "red"
          }}
        >
          {profileMessage}
        </p>
      )}
    </>

  )}
</>
)}


</div>
</div>

<div className={styles.cardContainer_right}>


  <div>
{userLoginMethod?<p>Already have an account?</p>:<p>Don't have an account</p>}
<div onClick={()=>{
  setUserLoginMethod(!userLoginMethod);

} }style={{color:"black",textAlign :"center"}} className={styles.buttonWithoutline}>
  <p>{userLoginMethod ? "Login" : "SignUp"}</p>


</div>

  </div>
</div>

    
    </div>
     </div>
  </UserLayout>
 
  )
}
