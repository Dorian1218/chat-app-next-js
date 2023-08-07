"use client"

import React, { useEffect, useState } from 'react'
import { pusherClient } from '../../libs/pusherclient';
import { useSession } from 'next-auth/react';
import { toPusherKey } from '@/app/libs/utils';
import {AiOutlineSend} from "react-icons/ai"

export default function Chat() {

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
    <div className='h-screen flex w-full'>
      <div className='h-screen w-1/5 bg-slate-700 p-3'>
        <div>
          <p className='text-2xl'>Chat</p>
        </div>
      </div>
      <div className='h-screen w-4/5 flex flex-col justify-between items-center p-3'>
        <div className='w-full'>
          <p>Chat With:</p>
        </div>
        <div className='w-full'></div>
        <div className='flex w-full'>
          <input type="text" placeholder="Type here" className="input input-bordered input-secondary w-full mr-3" />
          <button className="btn btn-info"><AiOutlineSend size={20}/></button>
        </div>
      </div>
    </div>
  )
}