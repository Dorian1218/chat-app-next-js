"use client"

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BsFillChatDotsFill, BsFillPeopleFill } from "react-icons/bs"
import { MdAccountCircle } from "react-icons/md"
import { AiOutlineUserAdd } from 'react-icons/ai';
import Chat from '../components/Chat';
import Account from '../components/Account';
import axios, { AxiosError } from 'axios';
import { addFriendValidator } from '../components/addFriendValidator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from 'react-hot-toast';
import FriendRequest from '../components/FriendRequest';
import { pusherClient } from '../libs/pusherclient';
import { toPusherKey } from '../libs/utils';

export default function Dashboard() {
    
}