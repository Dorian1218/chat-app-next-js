"use client"

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import User from '../components/user';
import { BsFillChatDotsFill } from "react-icons/bs"
import { MdAccountCircle } from "react-icons/md"
import { AiOutlineUserAdd } from 'react-icons/ai';
import Chat from '../components/Chat';
import Account from '../components/Account';
import axios from 'axios';

export default function Dashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [logOutText, setLogOutText] = useState("Log Out")
    const [tabSelected, setTabSelected] = useState("")
    const [addUser, setAddUser] = useState("")
    const [users, setUsers] = useState()
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
    })


    const onSubmit = async () => {
        console.log(addUser)
        axios.post("/api/user/getid", {email: addUser}).then((response) => console.log(response.data.id))
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
                <div>
                    <p className='text-xl'>Chat App</p>
                </div>
                <div className='flex flex-col items-start w-full '>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none flex items-center tab-container' onClick={() => setTabSelected("Chat")}>
                        <BsFillChatDotsFill size={24} />
                        <p className='ml-5 tab-text'>Chat</p>
                    </div>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none flex items-center tab-container' onClick={() => setTabSelected("Account")}>
                        <MdAccountCircle size={24} />
                        <p className='ml-5 tab-text'>Account</p>
                    </div>
                    <div className='flex bg-inherit hover:bg-slate-600 p-3 w-full cursor-pointer select-none flex items-center tab-container' onClick={() => {
                        window.my_modal_2.showModal()
                        setTabSelected("")
                    }}>
                        <AiOutlineUserAdd size={24} />
                        <p className='ml-5 tab-text'>Start Conversations</p>
                    </div>
                    <dialog id="my_modal_2" className="modal">
                        <form method="dialog" className="modal-box">
                            <h3 className="font-bold text-lg">Start Conversation</h3>
                                <input type="text" placeholder="Type Email" className="input input-bordered w-full mt-3" value={addUser} onChange={(e) => setAddUser(e.target.value)}/>
                            <div className="modal-action">
                                <button className="btn btn-outline btn-secondary" onClick={() => onSubmit()}>Add User</button>
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
                {/* {tabSelected === "Add Friends" && <Conversation />} */}
            </div>
        </div>
    )
}