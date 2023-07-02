"use client"

import React, { useState, useEffect } from 'react'
import { AiOutlineArrowLeft } from "react-icons/ai"
import Link from "next/link";
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import GoogleButton from 'react-google-button'
import { useRouter } from 'next/navigation';


export default function Login() {
    const [data, setData] = useState({ email: "", password: "" })
    const session = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.status === "authenticated") {
            console.log("Authenticated")
            router.push('/dashboard')
        }
    })

    const loginUser = (e) => {
        e.preventDefault()
        signIn("credentials", { ...data, redirect: false })
            .then((callback) => {
                if (callback?.error) {
                    toast.error(callback.error, {
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        }
                    })
                }
                else {
                    toast.success("You have succesfully logged in", {
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        }
                    })
                }
            })
        setData({ ...data, password: "", email: "" })
    }

    const signInWithGoogle = async () => {

        await signIn("google")
    }
    return (
        <div className='h-screen flex justify-center items-center flex-col '>
            <div className='p-10 absolute z-10 top-0 left-0'>
                <Link href={"/"}><AiOutlineArrowLeft size={24} /></Link>
            </div>
            <form>
                <div className='h-fit flex justify-center items-center flex-col relative border-indigo-600 border-2 p-5 rounded-md mb-3'>
                    <h1 className='mb-5 text-xl'>Login</h1>
                    <GoogleButton onClick={() => signInWithGoogle()} className='max-w-xs' style={{ width: "70vw" }} />
                    <input type="email" placeholder="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="input input-bordered input-primary max-w-xs mb-5 mt-5" style={{ width: "70vw" }} required />
                    <input type="password" placeholder="Password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} className="input input-bordered input-primary max-w-xs mb-5" style={{ width: "70vw" }} required autoComplete="on" />
                    <button className="btn btn-active btn-secondary ml-auto max-w-xs" style={{ width: "70vw" }} onClick={loginUser}>Login</button>
                </div>
            </form>
            <p>Don't have an account? <Link href={"/signup"} className='text-cyan-500 hover:text-cyan-700'>Sign up</Link></p>
        </div>
    )
}