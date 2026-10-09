import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { useRouter } from "next/navigation";
import UserLayout from "@/layout/UserLayout";

export default function Home() {
  const router = useRouter();


  return (
    <UserLayout>
    <div className={styles.container} >

      <div className={styles.mainContainer}>
        <div className={styles.mainContainer_left}>

       <p>Connect with Friends without exaggeration</p>
      <p>A true social media platform,with stories no blufs!!</p>

        <div onClick={()=>{
          router.push("/login")
        }} className={styles.buttonJoin}>
          <p>Join Now</p>
        </div>


        </div>

        <div className={styles.mainContainer_right}>
        <img src="/images/internet_connection.jpg" alt="Internet Connection" />
  <h1>Hello World</h1>
        </div>

        
      </div>
    </div>
     
    </UserLayout>
  );
}
