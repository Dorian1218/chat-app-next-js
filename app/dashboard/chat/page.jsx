"use client"

import React, { useEffect, useState } from 'react'
import { pusherClient } from '../../libs/pusherclient';
import { useSession } from 'next-auth/react';
import { toPusherKey } from '@/app/libs/utils';
import { AiOutlineSend, AiOutlinePlus } from "react-icons/ai"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Chat() {

    const [incomingFriends, setIncomingFriends] = useState([])
    const [userId, setUserId] = useState("")
    const [friends, setFriends] = useState([])
    const [isGroup, setIsGroup] = useState(false)
    const [name, setName] = useState("")
    const [conversations, setConversations] = useState([])
    const [user, setUser] = useState()
    var selected = []
    const [select, setSelect] = useState([])
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        const getFriends = async () => {
            console.log(status)
            if (status === "authenticated") {
                await axios.post("/api/user/getuserid", { email: session?.user?.email }).then(async (response) => {
                    setUserId(response.data.id)
                    setUser(response.data)
                    console.log()
                    await axios.post("/api/user/getfriends", { userId: response.data.id }).then((response) => {
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
        const getConversations = async () => {
            await axios.post("/api/conversation/get").then((response) => {
                setConversations(response.data)
            })
        }

        getConversations()
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

    useEffect(() => {
        console.log(select)
    }, [select])

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
                <input type="checkbox" className='checkbox' value={friend} onChange={async (e) => {
                    if (e.target.checked === true) {
                        await axios.post("/api/user/getuserbyid", { id: friend.combinedId.replace(userId, "") }).then((response) => {
                            selected.push(response.data)
                            // console.log(selected)
                            // console.log(selected.length)
                            setSelect((prev) => [...prev, response.data])
                        })
                    }
                    else {
                        setSelect((prev) => prev.filter((item) => item.id !== friend.combinedId.replace(userId, "")))
                    }
                }} />
            </div>
        )
    })

    const handleNewChat = async () => {
        if (select.length > 1) {
            setIsGroup(true)
        }
        setSelect((prev) => [...prev, user])
        console.log(select)
        await axios.post("/api/conversation", { members: select, isGroup: isGroup, name: name }).then(() => {
            toast.success("Conversation Created", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            })
        })
    }


    return (
        <div className='h-screen flex w-full'>
            <div className='h-screen w-1/4 bg-slate-700 p-3'>
                <div className='flex justify-between items-center'>
                    <p className='text-2xl'>Chat</p>
                    <button onClick={() => window.my_modal_3.showModal()}>
                        <AiOutlinePlus size={24} />
                    </button>
                    <dialog id="my_modal_3" className="modal">
                        <form method="dialog" className="modal-box">
                            <h3 className="font-bold text-lg mb-3">Start a Chat!</h3>
                            <div className=''>
                                {select.length > 1 && <input type="text" placeholder="Type Groupchat Name" className="input input-bordered w-full mb-3" value={name} onChange={(e) => setName(e.target.value)} />}
                                {listFriends}
                                <div className='flex mr-1'>
                                    {select.map((item, index) => {
                                        if (select.length === 1 || index === select.length - 1) {
                                            return (
                                                <p className='mr-1'>{item.name}</p>
                                            )
                                        }

                                        else {
                                            return (
                                                <p className='mr-1'>{item.name + ","}</p>
                                            )
                                        }
                                    })}
                                </div>
                                {listFriends.length === 0 && <p>No friends</p>}
                            </div>
                            <div className="modal-action">
                                {/* if there is a button in form, it will close the modal */}
                                <button className='btn' onClick={handleNewChat}>Start Chat</button>
                                <button className="btn">Close</button>
                            </div>
                        </form>
                    </dialog>
                </div>
                {conversations.map((conversation) => {
                    return (
                        <div className='mt-1 flex select-none cursor-pointer'>
                            <div className='avatar-group -space-x-5 flex items-center'>
                                {conversation.userImage.map((image, index) => {
                                    if (conversation.userImage.length <= 2) {
                                        return (
                                            <div className='avatar'>
                                                <div className="w-12">
                                                    <img src={image} />
                                                </div>
                                            </div>
                                        )
                                    }

                                    if (conversation.userImage.length > 2 && index < conversation.userImage.length - 1) {
                                        return (
                                            <div className='avatar'>
                                                <div className="w-12">
                                                    <img src={image} />
                                                </div>
                                            </div>
                                        )
                                    }

                                    else {
                                        return (
                                            <div className="avatar placeholder">
                                                <div className="w-12 bg-neutral-focus text-neutral-content">
                                                    <span>+{conversation.userImage.length - 2}</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                            <div className='overflow-hidden overflow-ellipsis mt-1'>
                                {conversation.name}
                                <div className='flex'>
                                    {conversation.userNames.map((name, index) => {
                                        if (index === conversation.userNames.length - 1) {
                                            return (
                                                <p className='mr-1'>{name}</p>
                                            )
                                        }

                                        else {
                                            return (
                                                <p className='mr-1'>{name + ","}</p>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className='h-screen w-3/4 flex flex-col justify-between items-center p-3'>
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