"use client"

import React, { useEffect, useState } from 'react'
import { pusherClient } from '../../libs/pusherclient';
import { useSession } from 'next-auth/react';
import { toPusherKey } from '@/app/libs/utils';
import { AiOutlineSend, AiOutlinePlus } from "react-icons/ai"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format, getDay } from "date-fns"

export default function Chat() {

    const [incomingFriends, setIncomingFriends] = useState([])
    const [userId, setUserId] = useState("")
    const [friends, setFriends] = useState([])
    const [isGroup, setIsGroup] = useState(false)
    const [name, setName] = useState("")
    const [conversations, setConversations] = useState([])
    const [user, setUser] = useState()
    const [select, setSelect] = useState([])
    const { data: session, status } = useSession()
    const [selectedConvo, setSelectedConvo] = useState([])
    const [chatMsg, setChatMsg] = useState("")
    const [messages, setMessages] = useState([])
    const router = useRouter()

    useEffect(() => {
        const getFriends = async () => {
            console.log(status)
            if (status === "authenticated") {
                await axios.post("/api/user/getuserid", { email: session?.user?.email }).then(async (response) => {
                    setUserId(response.data.id)
                    await axios.post("/api/user/getfriends", { userId: response.data.id }).then((response) => {
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
                console.log(response.data)
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

    useEffect(() => {
        pusherClient.subscribe(`user_newconversation`)

        const newConversation = (conversation) => {
            console.log("new convo")
            setConversations((prev) => [...prev, conversation])
            console.log(conversations)
        }

        pusherClient.bind("newconversation", newConversation)

        return () => {
            pusherClient.unsubscribe(`user_newconversation`)
            pusherClient.unbind("newconversation", newConversation)
        }
    }, [])

    useEffect(() => {
        pusherClient.subscribe(`user_sendmessage`)

        const newMessage = (newMessage) => {
            console.log("new message")
            setMessages((prev) => [...prev, newMessage])
            console.log(messages)
        }

        pusherClient.bind("sendmessage", newMessage)

        return () => {
            pusherClient.unsubscribe(`user_sendmessage`)
            pusherClient.unbind("sendmessage", newMessage)
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
                <input type="checkbox" className='checkbox' value={friend} onChange={async (e) => {
                    if (e.target.checked === true) {
                        await axios.post("/api/user/getuserbyid", { id: friend.combinedId.replace(userId, "") }).then((response) => {
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

    const handleChooseConvo = async (id) => {
        await axios.post("/api/conversation/getbyid", { id: id }).then(async (response) => {
            setSelectedConvo(response.data)
            console.log(response.data)
            await axios.post("/api/message/getbyid", { conversationId: id }).then((response) => {
                setMessages(response.data)
                console.log(response.data)
            })
        })
    }

    const sendMessage = async () => {
        console.log("Message")
        await axios.post("/api/message", { message: chatMsg, conversationId: selectedConvo.id }).then(() => {
            toast.success("Message sent succesfully", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            })
            setChatMsg("")
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
                    if (conversation.users.length > 2) {
                        return (
                            <div className='mt-1 flex select-none cursor-pointer' onClick={() => handleChooseConvo(conversation.id)}>
                                <div className='avatar-group -space-x-5 flex items-center'>
                                    {conversation.users.filter((user) => user.name !== session?.user?.name).map((users, index) => {
                                        if (users.image === session?.user?.image && users.name === session?.user?.name) {
                                            return
                                        }

                                        if (conversation.users.filter((user) => user.name !== session?.user?.name).length <= 2) {
                                            return (
                                                <div className='avatar'>
                                                    <div className="w-12">
                                                        <img src={users.image !== null ? users.image : "/profilepic.png"} />
                                                    </div>
                                                </div>
                                            )
                                        }

                                        if (conversation.users.filter((user) => user.name !== session?.user?.name).length > 2 && index < conversation.users.filter((user) => user.name !== session?.user?.name).length - 1) {
                                            return (
                                                <div className='avatar'>
                                                    <div className="w-12">
                                                        <img src={users.image !== null ? users.image : "/profilepic.png"} />
                                                    </div>
                                                </div>
                                            )
                                        }

                                        else {
                                            return (
                                                <div className="avatar placeholder">
                                                    <div className="w-12 bg-neutral-focus text-neutral-content">
                                                        <span>+{conversation.users.length - 2}</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                                <div className='overflow-hidden overflow-ellipsis mt-1'>
                                    <p className='font-medium'>{conversation.name}</p>
                                    <div className='flex mr-1'>
                                        {conversation.users.filter((user) => user.name !== session?.user?.name).map((users, index) => {
                                            if (index === conversation.users.filter((user) => user.name !== session?.user?.name).length - 1) {
                                                return (
                                                    <p className='mr-1 whitespace-nowrap text-xs'>{users.name}</p>
                                                )
                                            }

                                            if (users.name === session?.user?.name) {
                                                return
                                            }

                                            else {
                                                return (
                                                    <p className='mr-1 whitespace-nowrap text-xs'>{users.name + ","}</p>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    else {
                        return (
                            <div className='mt-1 flex select-none cursor-pointer' onClick={() => handleChooseConvo(conversation.id)}>
                                <div className='avatar-group flex items-center'>
                                    {conversation.users.filter((user) => user.name !== session?.user?.name).map((users, index) => {
                                        if (users.image === session?.user?.image) {
                                            return
                                        }

                                        if (conversation.users.filter((user) => user.name !== session?.user?.name).length <= 2) {
                                            return (
                                                <div className='avatar'>
                                                    <div className="w-12">
                                                        <img src={users.image !== null ? users.image : "/profilepic.png"} />
                                                    </div>
                                                </div>
                                            )
                                        }

                                        if (conversation.users.filter((user) => user.name !== session?.user?.name).length > 2 && index < conversation.users.filter((user) => user.name !== session?.user?.name).length - 1) {
                                            return (
                                                <div className='avatar'>
                                                    <div className="w-12">
                                                        <img src={users.image !== null ? users.image : "/profilepic.png"} />
                                                    </div>
                                                </div>
                                            )
                                        }

                                        else {
                                            return (
                                                <div className="avatar placeholder">
                                                    <div className="w-12 bg-neutral-focus text-neutral-content">
                                                        <span>+{conversation.users.filter((user) => user.name !== session?.user?.name).length - 2}</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                                <div className='overflow-hidden overflow-ellipsis mt-1 flex items-center ml-1'>
                                    <div className='flex'>
                                        {conversation.users.filter((user) => user.name !== session?.user?.name).map((user, index) => {
                                            if (index === conversation.users.filter((user) => user.name !== session?.user?.name).length - 1) {
                                                return (
                                                    <p className='mr-1 mr-1 whitespace-nowrap'>{user.name}</p>
                                                )
                                            }

                                            if (user.name === session?.user?.name) {
                                                return
                                            }

                                            else {
                                                return (
                                                    <p className='mr-1 mr-1 whitespace-nowrap'>{user.name + ","}</p>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
            <div className='h-screen w-3/4 flex flex-col justify-between items-center p-3 h-screen'>
                <div className='w-full h-1/6'>
                    <p>Chat With: {selectedConvo?.users?.filter((user) => user.name !== session?.user?.name).map((user, index) => {
                        if (selectedConvo?.users?.filter((user) => user.name !== session?.user?.name).length === 1) {
                            return user.name
                        }

                        if (index === selectedConvo?.users?.filter((user) => user.name !== session?.user?.name).length - 1) {
                            return user.name
                        }

                        else {
                            return user.name + ", "
                        }
                    })}</p>
                </div>
                <div className='w-full overflow-y-auto h-4/6'>
                    {messages.map((message) => {
                        if (message.senderId !== userId) {
                            return (
                                // <div className="chat chat-start">
                                //     <div className="chat-bubble">{message.body}</div>
                                // </div>
                                <div className="chat chat-start">
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                            <img src={message.sender.image ? message.sender.image : "/profilepic.png"} />
                                        </div>
                                    </div>
                                    <div className="chat-header">
                                        {message.sender.name}
                                        {format(new Date(), "P") === format(new Date(message.createdAt), "P") && <time className="text-xs opacity-50"> {format(new Date(message.createdAt), "p")}</time>}
                                        {format(new Date(), "P") !== format(new Date(message.createdAt), "P") && (new Date(message.createdAt).getTime() - Date.now()) / 604800000 < 1 && <time className="text-xs opacity-50"> {format(new Date(message.createdAt), "eee")} At {format(new Date(message.createdAt), "p")}</time>}
                                        {(new Date(message.createdAt).getTime() - Date.now()) / 604800000 >= 1 && <time className="text-xs opacity-50"> {format(new Date(message.createdAt), "P")} At {format(new Date(message.createdAt), "p")}</time>}
                                    </div>
                                    <div className="chat-bubble">{message.body}</div>
                                    <div className="chat-footer opacity-50">
                                        Delivered
                                    </div>
                                </div>
                            )
                        }

                        else {
                            return (
                                // <div className="chat chat-end">
                                //     <div className="chat-bubble chat-bubble-info">{message.body}</div>
                                // </div>
                                <div className="chat chat-end">
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                            <img src={message.sender.image ? message.sender.image : "/profilepic.png"} />
                                        </div>
                                    </div>
                                    <div className="chat-header">
                                        {message.sender.name}
                                        {format(new Date(), "P") === format(new Date(message.createdAt), "P") && <time className="text-xs opacity-50"> {format(new Date(message.createdAt), "p")}</time>}
                                        {format(new Date(), "P") !== format(new Date(message.createdAt), "P") && (new Date(message.createdAt).getTime() - Date.now()) / 604800000 < 1 && <time className="text-xs opacity-50"> {format(new Date(message.createdAt), "eee")} At {format(new Date(message.createdAt), "p")}</time>}
                                        {(new Date(message.createdAt).getTime() - Date.now()) / 604800000 >= 1 && <time className="text-xs opacity-50"> {format(new Date(message.createdAt), "P")} At {format(new Date(message.createdAt), "p")}</time>}

                                    </div>
                                    <div className="chat-bubble chat-bubble-info">{message.body}</div>
                                    <div className="chat-footer opacity-50">
                                        Delivered
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className='flex w-full h-1/6 justify-end items-end'>
                    <input type="text" placeholder="Type here" className="input input-bordered input-secondary w-full mr-3" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} />
                    <button className="btn btn-info"><AiOutlineSend size={20} onClick={sendMessage} /></button>
                </div>
            </div>
        </div>
    )
}