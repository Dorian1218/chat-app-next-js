"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react';
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"

export default function FriendRequest() {
    const [incomingFriends, setIncomingFriends] = useState([])
    const [friendReq, setFriendReq] = useState("")
    const defaultProfilePic = "profilepic.png"

    const { data: session } = useSession()

    useEffect(() => {
        const getFriends = async () => {
            await axios.post("/api/user/getfriendrequest", { email: session?.user?.email }).then((response) => {
                console.log(response.data)
                setIncomingFriends(response.data)
            })
        }
        getFriends()
    }, [])

    return (
        <div className='h-screen w-full flex flex-col p-3'>
            <p className='text-xl'>Friend Requests: </p>
            {incomingFriends.length > 0 && incomingFriends.map(friend => {
                return (
                    <div className='mt-3 flex items-center'>
                        <img src={friend.userMakingRequestPhoto ? friend.userMakingRequestPhoto : defaultProfilePic} className='w-12 h-12 mr-3 rounded-full' />
                        <div>
                            <p>{friend.userMakingRequestName}</p>
                            <p>{friend.userMakingRequestEmail}</p>
                        </div>
                        <div>
                            <button onClick={() => console.log(friend.userMakingRequestName)} className="btn btn-circle ml-3 btn-primary">
                                <AiOutlineCheck />
                            </button>
                            <button className="btn btn-circle ml-3 btn-error" onClick={async () => {
                                // setFriendReq(friend.userMakingRequestEmail)
                                // deleteFriendRequest()
                                console.log(friend.userMakingRequestEmail)
                                await axios.delete(`/api/user/deletefriendrequest/${friend.userMakingRequestEmail}`)
                                axios.post("/api/user/getfriendrequest", { email: session?.user?.email }).then((response) => {
                                    console.log(response.data)
                                    setIncomingFriends(response.data)
                                })
                            }
                            }>
                                <AiOutlineClose />
                            </button>
                        </div>
                    </div>
                )
            })}
            {incomingFriends.length === 0 && <p className='mt-3'>No friend request... </p>}
        </div>
    )
}
