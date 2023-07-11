import React from 'react'
import {AiOutlineSend} from "react-icons/ai"

export default function Chat() {
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
