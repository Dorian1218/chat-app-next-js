"use client"

import React, { useEffect, useState } from 'react'
import { pusherClient } from '../../libs/pusherclient';
import { useSession } from 'next-auth/react';
import { toPusherKey } from '@/app/libs/utils';
import axios from 'axios';

export default function Account() {

  const [incomingFriends, setIncomingFriends] = useState([])
  const { data: session, status } = useSession()
  const [user, setUser] = useState([])

  useEffect(() => {

      console.log(session?.user?.email)

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
  }, [incomingFriends, session?.user])

  useEffect(() => {
    if (status === "authenticated") {
      const getUserInfo = async () => {
        await axios.post("/api/user/getuserbyemail", {email: session?.user?.email}).then((response) => {
          setUser(response.data)
          console.log(response.data)
        })
      }

      getUserInfo()
    }

  }, [status, session?.user?.email])

  return (
    <div className='h-screen p-3'>
      <p className='text-2xl'>Account</p>
      <p className='mt-3 text-xl'>Email: {user.email}</p>
      <p className='mt-3 text-xl'>Name: {user.name}</p>
    </div>
  )
}
