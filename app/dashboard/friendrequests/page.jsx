"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react';
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import { toPusherKey } from '../../libs/utils';
import { pusherClient } from '../../libs/pusherclient';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FriendRequest() {
    const [incomingFriends, setIncomingFriends] = useState([])
    const [friendReq, setFriendReq] = useState("")
    const [userId, setUserId] = useState("")
    const defaultProfilePic = "/profilepic.png"

    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        const getFriends = async () => {
            await axios.post("/api/user/getfriendrequest", { email: session?.user?.email }).then((response) => {
                console.log(response.data)
                setIncomingFriends(response.data)
            })

        }
        getFriends()
    }, [])

    useEffect(() => {

        pusherClient.subscribe(toPusherKey(`user:${session?.user?.email}:incomingfriendreq`))
        pusherClient.subscribe(toPusherKey(`user:${session?.user?.email}:deletefriendreq`))

        const friendRequestHandler = async ({ userMakingRequestEmail, userMakingRequestName, userMakingRequestId, userMakingRequestPhoto, requestGoingtoEmail, requestGoingtoId }) => {
            console.log("friend request")
            setIncomingFriends((prev) => [...prev, { userMakingRequestEmail, userMakingRequestName, userMakingRequestId, userMakingRequestPhoto, requestGoingtoEmail, requestGoingtoId }])
            console.log(incomingFriends)
        }

        const deleteFriendHandler = async ({userMakingRequestEmail}) => {
            setIncomingFriends((prev) => prev.filter((req) => req.userMakingRequestEmail !== userMakingRequestEmail))
        }

        pusherClient.bind("incomingfriendreq", friendRequestHandler)
        pusherClient.bind("deletefriendreq", deleteFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${session?.user?.email}:incomingfriendreq`))
            pusherClient.unbind("incomingfriendreq", friendRequestHandler)
            pusherClient.unsubscribe(toPusherKey(`user:${session?.user?.email}:deletefriendreq`))
            pusherClient.unbind("deletefriendreq", deleteFriendHandler)
        }
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
                            <button onClick={async () => {
                                await axios.delete(`/api/user/deletefriendrequest/${friend.userMakingRequestEmail}`).then(async () => {
                                    console.log("deleted")
                                    setIncomingFriends((prev) => prev.filter((req) => req.userMakingRequestEmail !== friend.userMakingRequestEmail))
                                    await axios.post("/api/user/getuserbyemail", {email: friend.userMakingRequestEmail}).then(async (response) => {
                                        await axios.post("/api/user/acceptfriendreq", {friendId: response.data.id, friendEmail: response.data.email, friendName: response.data.name, friendImage: response.data.image})
                                    })
                                })
                            }} className="btn btn-circle ml-3 btn-primary">
                                <AiOutlineCheck />
                            </button>
                            <button className="btn btn-circle ml-3 btn-error" onClick={async () => {
                                // setFriendReq(friend.userMakingRequestEmail)
                                // deleteFriendRequest()
                                console.log(friend.userMakingRequestEmail)
                                await axios.delete(`/api/user/deletefriendrequest/${friend.userMakingRequestEmail}`)
                                setIncomingFriends((prev) => prev.filter((req) => req.userMakingRequestEmail !== friend.userMakingRequestEmail))
                                toast.success("Friend Request Deleted", {
                                    style: {
                                        borderRadius: '10px',
                                        background: '#333',
                                        color: '#fff',
                                    }
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