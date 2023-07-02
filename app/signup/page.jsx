"use client"

import React from 'react'
import { AiOutlineArrowLeft } from "react-icons/ai"
import Link from "next/link";
import { useState, useEffect } from 'react';
import axios from "axios"
import { toast } from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoogleButton from 'react-google-button'

export default function Signup() {
    const [data, setData] = useState({ name: "", email: "", password: "" })
    const [confirmPassword, setConfirmePassword] = useState("")
    const [error, setError] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const router = useRouter()
    const session = useSession()

    useEffect(() => {
        if (session?.status === "authenticated") {
            console.log("Authenticated")
            router.push('/dashboard')
        }
    })

    const signUpUser = async (e) => {
        e.preventDefault()
        if (data.password !== confirmPassword) {
            toast.error("Passwords do not match", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            })
        }

        if (!data.email || !data.name || !data.password || !confirmPassword) {
            toast.error("Missing Fields", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            })
        }

        else {
            axios.post("api/signup", data)
                .then(() =>
                    toast.success("User succesfully signed up", {
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        }
                    },
                        signIn("credentials", { email: data.email, password: data.password, redirect: false })))
                        .catch((e) => console.log(e.message))
        }
    }

    const signInWithGoogle = async () => {

        await signIn("google")
    }
    return (
        <div className='h-screen flex justify-center items-center flex-col '>
            <div className='p-10 absolute z-10 top-0 left-0'>
                <Link href={"/"}><AiOutlineArrowLeft size={24} /></Link>
            </div>
            <div className='h-fit flex justify-center items-center flex-col relative border-indigo-600 border-2 p-5 rounded-md mb-3'>
                <h1 className='mb-5 text-xl'>Sign Up</h1>
                <GoogleButton onClick={() => signInWithGoogle()} className='max-w-xs' style={{ width: "70vw" }} label='Sign up with Google' />
                <input type="email" placeholder="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="input input-bordered input-primary max-w-xs mb-5 mt-5" style={{ width: "70vw" }} />
                <input type="text" placeholder="Username" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="input input-bordered input-primary max-w-xs mb-5" style={{ width: "70vw" }} />
                <input type="password" placeholder="Password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} className="input input-bordered input-primary max-w-xs mb-5" style={{ width: "70vw" }} />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmePassword(e.target.value)} className="input input-bordered input-primary max-w-xs mb-5" style={{ width: "70vw" }} />
                <button className="btn btn-active btn-secondary ml-auto max-w-xs" style={{ width: "70vw" }} onClick={signUpUser}>Sign Up</button>
            </div>
            <p>Already have an account? <Link href={"/login"} className='text-cyan-500 hover:text-cyan-700'>Login</Link></p>
        </div>
    )
}