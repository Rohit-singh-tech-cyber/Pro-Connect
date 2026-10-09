 import NavbarComponent from '@/Components/Navbar'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTokenIsThere, setTokenIsNotThere } from '@/config/redux/reducer/authReducer'
import { useRouter } from 'next/router'

export default function UserLayout({children}) {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setTokenIsThere());
    } else {
      dispatch(setTokenIsNotThere());
      router.push("/login");
    }
  }, []);

  return (
   <div>
    <NavbarComponent/>
    {children}
   </div>
  )
}