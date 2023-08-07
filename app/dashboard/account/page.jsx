"use client"

import React, { useEffect, useState } from 'react'
import { pusherClient } from '../../libs/pusherclient';
import { useSession } from 'next-auth/react';
import { toPusherKey } from '@/app/libs/utils';

export default function Account() {

  const [incomingFriends, setIncomingFriends] = useState([])
  const { data: session } = useSession()

  useEffect(() => {

      console.log(session?.user?.email)

      pusherClient.subscribe(toPusherKey(`user:${session?.user?.email}:incomingfriendreq`))
      pusherClient.subscribe(toPusherKey(`user:${session?.user?.email}:deletefriendreq`))

      const friendRequestHandler = async () => {
          console.log("friend request")
          setIncomingFriends((prev) => prev + 1)
      }

      const deleteRequestHandler = async () => {
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

  return (
    <div className='h-screen p-3'>
      <p className='text-2xl'>Account</p>
    </div>
  )
}
