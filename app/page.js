"use client"

import Link from "next/link";
import User from "./components/user";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

function Home() {

  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push('/dashboard')
    }
  })

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <h1 className="m-5 text-2xl text-center">Welcome to the Chat App</h1>
      <div className="w-screen flex items-center justify-center">
        <Link href={"/signup"}><button className="btn btn-active btn-primary mr-5 max-w-1/4">Sign Up</button></Link>
        <Link href={"/login"}><button className="btn btn-outline btn-primary max-w-1/4">Login</button></Link>
      </div>
    </div>
  )
}

export default Home