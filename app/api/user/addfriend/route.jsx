"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { toPusherKey } from "@/app/libs/utils"
import { pusherServer } from "@/app/libs/pusherserver"

export async function POST(request) {
    const prisma = new PrismaClient()
    const body = await request.json()
    const { name } = body
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized Request", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: {
            name: name
        }
    })

    if (!user) {
        console.log("true")
        return new NextResponse("User does not exist", { status: 404 })
    }

    const personMakingRequest = await prisma.user.findUnique({
        where: {
            email: session?.user?.email
        }
    })

    if (user.id === personMakingRequest.id) {
        return new NextResponse("You cannot start a conversation with yourself", { status: 400 })
    }

    const otherSentRequest = await prisma.friendReq.findMany({
        where: {
            userMakingRequestEmail: user.email,
            requestGoingtoEmail: session?.user?.email
        }
    })

    if (otherSentRequest.length > 0) {
        return new NextResponse("This user has already sent a friend request to you", { status: 400 })
    }

    const requestExist = prisma.friendReq.findMany({
        where: {
            userMakingRequestEmail: session?.user?.email,
            requestGoingtoEmail: user.email
        }
    })

    if ((await requestExist).length > 0) {
        return new NextResponse("You already sent a friend request to this user", { status: 400 })
    }

    const friendRequest = await prisma.friendReq.create({
        data: {
            userMakingRequestEmail: session?.user?.email,
            userMakingRequestName: personMakingRequest.name,
            userMakingRequestId: personMakingRequest.id,
            userMakingRequestPhoto: personMakingRequest.image,
            requestGoingtoEmail: user.email,
            requestGoingtoId: user.id
        }
    })

    console.log("USER BEING ADDED " + user?.email)

    await pusherServer.trigger(toPusherKey(`user:${user.email}:incomingfriendreq`), "incomingfriendreq", {
        userMakingRequestEmail: session?.user?.email,
        userMakingRequestName: personMakingRequest.name,
        userMakingRequestId: personMakingRequest.id,
        userMakingRequestPhoto: personMakingRequest.image,
        requestGoingtoEmail: user.email,
        requestGoingtoId: user.id
    })

    return NextResponse.json(friendRequest)
}