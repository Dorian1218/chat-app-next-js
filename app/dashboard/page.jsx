"use client"

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BsFillChatDotsFill } from "react-icons/bs"
import { MdAccountCircle } from "react-icons/md"
import { AiOutlineUserAdd } from 'react-icons/ai';
import {FaUserFriends} from "react-icons/fa"
import Chat from '../components/Chat';
import Account from '../components/Account';
import axios, { AxiosError } from 'axios';
import { addFriendValidator } from '../components/addFriendValidator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from 'react-hot-toast';
import FriendRequest from '../components/FriendRequest';

export default function Dashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [logOutText, setLogOutText] = useState("Log Out")
    const [tabSelected, setTabSelected] = useState("")
    const [addUser, setAddUser] = useState("")
    const [incomingFriends, setIncomingFriends] = useState([])
    const [showSuccess, setShowSuccess] = useState(false)
    const signOutUser = async () => {
        await signOut()
        setLogOutText("Logging Out...")
        window.location.href = "/"
        console.log("User logged out")
    }

    useEffect(() => {
        if (session?.user == undefined) {
            window.history.back()
        }
        const getFriends = async () => {
            await axios.post("/api/user/getfriendrequest", { email: session?.user?.email }).then((response) => {
                console.log(response.data)
                setIncomingFriends(response.data)
            })
        }
        getFriends()
    }, [])

    const { setError, formState: { errors } } = useForm({
        resolver: zodResolver(addFriendValidator)
    })


    const addFriend = async (email) => {
        try {
            const validateEmail = addFriendValidator.parse({ email })
            console.log(validateEmail)
            await axios.post("/api/user/addfriend", { email: validateEmail.email }).then((response) => console.log(response.data))
            setShowSuccess(true)
            toast.success("Friend Request Sent", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            })
            setAddUser()
        } catch (e) {
            if (e instanceof z.ZodError) {
                setError("email", { message: e.message })
                toast.error("Invalid email", {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    }
                })
                return
            }

            if (e instanceof AxiosError) {
                setError("email", { message: e?.response?.data })
                toast.error(errors?.email?.message, {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    }
                })
                return
            }

            setError("email", { message: "Something went wrong" })
            toast.error("Something went wrong", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            })
            setAddUser()
        }
    }

    const onSubmit = () => {
        addFriend(addUser)
    }
    return (
        <div className='w-screen h-screen flex'>
            {/* Dashboard
            <p>Welcome: {session?.user?.email}</p>
            <div className="avatar">
                <div className="w-24 rounded-full">
                    {session?.user?.image ? <img src={session?.user?.image}/> : <img src="profilepic.png"></img>}
                </div>
    </div> */}
            <div className='w-1/5 h-screen flex flex-col items-center justify-between py-5 bg-slate-800'>
                <div className='flex flex-col justify-center items-center'>
                    <p className='text-xl mb-2'>Chat App</p>
                    <p>Signed in as: {session?.user?.name}</p>
                </div>
                <div className='flex flex-col items-start w-full '>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none items-center tab-container' onClick={() => setTabSelected("Chat")}>
                        <BsFillChatDotsFill size={24} />
                        <p className='ml-5 tab-text'>Chat</p>
                    </div>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none items-center tab-container' onClick={() => setTabSelected("Account")}>
                        <MdAccountCircle size={24} />
                        <p className='ml-5 tab-text'>Account</p>
                    </div>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none items-center tab-container' onClick={() => {
                        window.my_modal_2.showModal()
                        setTabSelected("")
                    }}>
                        <AiOutlineUserAdd size={24} />
                        <p className='ml-5 tab-text'>Add Friends</p>
                    </div>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none items-center tab-container' onClick={() => setTabSelected("Friend Request")}>
                        <FaUserFriends size={24} />
                        <p className='ml-5 tab-text'>Friend Request</p>
                        {incomingFriends.length > 0 && <span className="badge badge-m badge-primary indicator-item ml-3">{incomingFriends.length === 0 ? "" : incomingFriends.length}</span>}
                    </div>
                    <dialog id="my_modal_2" className="modal">
                        <form method="dialog" className="modal-box">
                            <h3 className="font-bold text-lg">Start Conversation</h3>
                            <input type="text" placeholder="Type Email" className="input input-bordered w-full mt-3" onClick={() => onSubmit} value={addUser} onChange={(e) => setAddUser(e.target.value)} />
                            <div className="modal-action">
                                <button className="btn btn-outline btn-secondary" onClick={() => onSubmit(addUser)}>Add User</button>
                                <button className="btn">Close</button>
                            </div>
                        </form>
                    </dialog>
                </div>
                <div>
                    <button className="btn btn-error btn-outline" onClick={() => window.my_modal_1.showModal()}>{logOutText}</button>
                    <dialog id="my_modal_1" className="modal">
                        <form method="dialog" className="modal-box">
                            <h3 className="font-bold text-lg">Log Out?</h3>
                            <p className="py-4">Are you sure you want to log out?</p>
                            <div className="modal-action">
                                <button className="btn btn-error btn-outline" onClick={() => signOutUser()}>Log Out</button>
                                <button className="btn">Close</button>
                            </div>
                        </form>
                    </dialog>
                </div>
            </div>
            <div className='w-4/5 h-screen'>
                {tabSelected === "Chat" && <Chat />}
                {tabSelected === "Account" && <Account />}
                {tabSelected === "Friend Request" && <FriendRequest />}
                {/* {tabSelected === "Add Friends" && <Conversation />} */}
                {/* {errors.email && <p className='text-red-600'>{errors.email?.message}</p>}
                {showSuccess ? <p className='text-green-600'>Friend Request Sent</p> : null} */}
            </div>
        </div>
    )
}