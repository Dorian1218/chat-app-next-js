"use client"

import React, { useEffect, useState } from 'react'
import { pusherClient } from '../../libs/pusherclient';
import { useSession } from 'next-auth/react';
import { toPusherKey } from '@/app/libs/utils';
import { AiOutlineSend, AiOutlinePlus } from "react-icons/ai"
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Chat() {

    const [incomingFriends, setIncomingFriends] = useState([])
    const [userId, setUserId] = useState("")
    const [friends, setFriends] = useState([])
    var selected = []
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        const getFriends = async () => {
            console.log(status)
            if (status === "authenticated") {
                await axios.post("/api/user/getuserid", { email: session?.user?.email }).then(async (response) => {
                    setUserId(response.data)
                    await axios.post("/api/user/getfriends", { userId: response.data }).then((response) => {
                        console.log(response.data)
                        setFriends(response.data)
                    })
                })

            }

            else {
                router.push('/')
            }
        }

        getFriends()
    }, [])

    useEffect(() => {

        pusherClient.subscribe(toPusherKey(`user:${session?.user?.email}:incomingfriendreq`))
        pusherClient.subscribe(toPusherKey(`user:${session?.user?.email}:deletefriendreq`))

        const friendRequestHandler = () => {
            console.log("friend request")
            setIncomingFriends((prev) => prev + 1)
        }

        const deleteRequestHandler = () => {
            setIncomingFriends((prev) => prev - 1)
            console.log(incomingFriends)
        }

        pusherClient.bind("incomingfriendreq", friendRequestHandler)
        pusherClient.bind("deletefriendreq", deleteRequestHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${session?.user?.email}:incomingfriendreq`))
            pusherClient.unbind("incomingfriendreq", friendRequestHandler)
            pusherClient.unsubscribe(toPusherKey(`user:${session?.user?.email}:deletefriendreq`))
            pusherClient.unbind("deletefriendreq", deleteRequestHandler)
        }

    }, [])

    const listFriends = friends.map((friend) => {
        return (
            <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center'>
                    <img src={friend?.combinedImg?.replace(session?.user.image, "") === "null" ? "/profilepic.png" : friend.combinedImg.replace(session?.user.image, "")} className='w-11 h-11 rounded-full' />
                    <div className='flex flex-col ml-2'>
                        <p>{friend?.combinedName?.replace(session?.user?.name, "")}</p>
                        <p className='opacity-50'>{friend?.combinedEmail?.replace(session?.user?.email, "")}</p>
                    </div>
                </div>
                <input type="checkbox" className='checkbox' value={friend} onChange={(e) => {
                    if (e.target.checked === true) {
                        selected.push({ friend })
                        console.log(selected)
                    }

                    else {
                        selected = selected.filter((item) => { return item.friend.combinedId !== friend.combinedId })
                        console.log(selected)
                    }
                }} />
            </div>
        )
    })

    const handleNewChat = async () => {
        await axios.post("/api/conversation")
    }


    return (
        <div className='h-screen flex w-full'>
            <div className='h-screen w-1/5 bg-slate-700 p-3'>
                <div className='flex justify-between items-center'>
                    <p className='text-2xl'>Chat</p>
                    <button onClick={() => window.my_modal_3.showModal()}>
                        <AiOutlinePlus size={24} />
                    </button>
                    <dialog id="my_modal_3" className="modal">
                        <form method="dialog" className="modal-box">
                            <h3 className="font-bold text-lg mb-3">Start a Chat!</h3>
                            <div className='h-24 max-h-24 overflow-y-scroll'>
                                {listFriends}
                            </div>
                            <div className="modal-action">
                                {/* if there is a button in form, it will close the modal */}
                                <button className='btn'>Start Chat</button>
                                <button className="btn">Close</button>
                            </div>
                        </form>
                    </dialog>
                </div>
            </div>
            <div className='h-screen w-4/5 flex flex-col justify-between items-center p-3'>
                <div className='w-full'>
                    <p>Chat With:</p>
                </div>
                <div className='w-full'></div>
                <div className='flex w-full'>
                    <input type="text" placeholder="Type here" className="input input-bordered input-secondary w-full mr-3" />
                    <button className="btn btn-info"><AiOutlineSend size={20} /></button>
                </div>
            </div>
        </div>
    )
}